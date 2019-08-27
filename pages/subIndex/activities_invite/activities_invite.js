// pages/subIndex/activities_invite/activities_invite.js
const app = getApp()
const util = require('../../../common/util.js')
var countDown;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: app.globalData.baseUrl,
    winScale: util.sysInfo().windowWidth / 750,
    windowHeight: util.sysInfo().windowHeight,
    windowWidth: util.sysInfo().windowWidth,
    offsetTop: 0,
    list: [],
    poster: {},
    popupShow: false,
    painting: {
      canvasId: 'playbill',
      playbillWidth: 560,
      playbillHeight: 700,
      playbill_bg: '',
      qrcode: {},
      avatar: {},
      nickName: {}

    },
    rankList:[],
    countdown:'00天00时00分00秒',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //海报高度+盒子高度>windowHeight情况 海报高度?????
    // 海报尺寸 750x814
    const gap = (814 + 388) * this.data.winScale > this.data.windowHeight
    if (gap) {
      this.setData({
        offsetTop: parseInt(this.data.windowHeight - 388 * this.data.winScale)
      })
    }
    wx.setNavigationBarTitle({ title: '邀请有礼' })
    this.getTheCharts()
    this.getPoster()
    this.invitedList()
    this.getdrawPosterSettingSetting()


  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    console.log(res)
    // if (res.from === 'button') {
    //   // 来自页面内转发按钮
    //   console.log(res)
    // }
    return {
      title: app.globalData.comment,
      imageUrl: `${this.data.baseUrl}/${this.data.poster2.IMG_URL}`,
      path: `pages/subIndex/activities_redBao/activities_redBao?scene=${app.globalData.userInfo.USERLIST_ID}`
    }
  },
  handleButtonShare() {
    if (this.data.playbillPath) {
      this.setData({
        popupShow: true
      })
    } else {
      this.begainDrawShareImage()
    }
  },
  getPoster() {
    util.request(app.globalData._server + '/weixin/guimi/getPoster', { TYPE: '0' }, 'POST')
      .then(res => {
        this.setData({
          poster: res.poster  // 邀请有礼海报
        })
      }) 
      util.request(app.globalData._server + '/weixin/guimi/getPoster', { TYPE: '11' }, 'POST')
        .then(res => {
          this.setData({
            poster2: res.poster  // 邀请有礼领取页海报
          })
        }) 
  },
  invitedList() {
    util.request(app.globalData._server + '/weixin/guimi/invitedList', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {
        this.setData({
          list: res.list
        })
      })
  },
  getdrawPosterSettingSetting() {
    wx.showLoading({ title: '加载中', mask: true })
    const api_getDrawPosterSetting = util.request(app.globalData._server + '/weixin/guimi/getDrawPosterSetting', { TYPE: '0', GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
    const api_getInviteMiniCode = util.request(app.globalData._server + '/weixin/guimi/getInviteMiniCode', {
      appId: app.globalData.appid,
      page: 'pages/subIndex/activities_redBao/activities_redBao',
      scene: app.globalData.userInfo.USERLIST_ID,
      type: 0,
    }, 'POST')
    Promise.all([api_getDrawPosterSetting, api_getInviteMiniCode])
      .then(res => {
        this.setData({
          drawPosterSetting: res[0].drawPosterSetting,
          REMARK: res[0].drawPosterSetting.REMARK,
          qrcodePath: res[1].path
        })
        wx.hideLoading()
      })
  },
  begainDrawShareImage() {
    wx.showLoading({ title: '绘制中', mask: true })
    const drawPosterSetting = this.data.drawPosterSetting
    this.setData({
      [`painting.playbill_bg`]: `${this.data.baseUrl}/${this.data.drawPosterSetting.IMG_URL}`,
      [`painting.playbillWidth`]: Number(drawPosterSetting.POSTER_WIDTH),
      [`painting.playbillHeight`]: Number(drawPosterSetting.POSTER_HEIGHT),
      [`painting.qrcode`]: {
        path: `${this.data.baseUrl}/${this.data.qrcodePath}`,
        width: Number(drawPosterSetting.CODE_WIDTH),
        height: Number(drawPosterSetting.CODE_HEIGHT),
        offsetLeft: Number(drawPosterSetting.POINT_WIDTH),
        offsetTop: Number(drawPosterSetting.POINT_HEIGHT),
      },
      [`painting.avatar`]: {
        path: app.globalData.userInfo.AVATARURL,
        width: Number(drawPosterSetting.AVA_WIDTH),
        height: Number(drawPosterSetting.AVA_HEIGHT),
        offsetLeft: Number(drawPosterSetting.AVA_POINT_WIDTH),
        offsetTop: Number(drawPosterSetting.AVA_POINT_HEIGHT),
      },
      [`painting.nickName`]: {
        maxWidth: Number(drawPosterSetting.NICKNAME_WIDTH),
        lineHeight: Number(drawPosterSetting.NICKNAME_HEIGHT),
        content: `${app.globalData.userInfo.NICKNAME}`,
        fontSize: Number(drawPosterSetting.NICKNAME_FONTSIZE),
        color: drawPosterSetting.NICKNAME_COLOR,
        textAlign: 'left',
        offsetLeft: Number(drawPosterSetting.NICKNAME_POINT_WIDTH),
        offsetTop: Number(drawPosterSetting.NICKNAME_POINT_HEIGHT)
      }

    })
    const painting = this.data.painting
    // console.log(painting)
    // 使用 wx.createContext 获取绘图上下文 context
    var ctx = wx.createCanvasContext(painting.canvasId)
    // 海报设计尺寸 560*700 图片宽高取整数
    // 换算不同设备下画布大下(不用缩放,固定尺寸)
    // const scale = this.data.windowWidth / 750
    this.setData({
      canvasWidth: painting.playbillWidth,
      canvasHeight: painting.playbillHeight
    })
    // getImageInfo Promise化
    function getImageInfo(url) {
      return new Promise(function (resolve, reject) {
        wx.getImageInfo({
          src: url,
          success: res => {
            // console.log(res) 
            resolve(res.path)
          },
          fail: err => {
            console.error(err)
            reject(err)
          }
        })
      })
    }
    // getImageList 图片列表
    const promiseImgList = [painting.playbill_bg, painting.qrcode.path, painting.avatar.path].map(item => getImageInfo(item))
    Promise.all(promiseImgList)
      .then(paths => {
        // getImageList
          console.log(paths)
          const [playbill_bg, qrcode_path, avatar_path] = paths
          // 背景  
          ctx.drawImage(playbill_bg, 0, 0, this.data.painting.canvasWidth, this.data.painting.canvasHeight)
          // 头像
          this.circleImg(ctx, avatar_path, painting.avatar.offsetLeft, painting.avatar.offsetTop, painting.avatar.width / 2)
          // 昵称
          ctx.setFontSize(painting.nickName.fontSize)
          ctx.setFillStyle(painting.nickName.color)
          this.canvasTextAutoLine(ctx, painting.nickName.content, painting.nickName.offsetLeft, painting.nickName.offsetTop, painting.nickName.lineHeight, painting.nickName.maxWidth, 2)
          // 小程序码
          ctx.drawImage(qrcode_path, painting.qrcode.offsetLeft, painting.qrcode.offsetTop, painting.qrcode.width, painting.qrcode.height)
          // 绘制结束,关闭loading等待中 
          ctx.draw(true, () => {
            // 延时处理
            setTimeout(() => {
              // wx.hideLoading()
              this.canvasToImage()
            }, 150) 
          })
        })
      .catch(err => {
        wx.hideLoading()
        console.log(err)
        wx.showModal({
          // title: '提示',
          content: `wx.getImageInfo失败,${err.errMsg}`,
          showCancel: false,
          confirmColor: '#5CAE32',
          // confirmText: '去吃一顿',
          success: res => {
            if (res.confirm) {
              wx.reLaunch({
                url: '/pages/tab/index/index',
              })
            }
          }
        })
      })
  },
  /*
  *  绘制多行文本，自动换行，超出添加...
  *
  str:要绘制的字符串
  canvas:canvas对象
  initX:绘制字符串起始x坐标
  initY:绘制字符串起始y坐标
  lineHeight:字行高，自己定义个值即可
  maxWidth: 文本最大宽度
  row: 最大行数
  */
  canvasTextAutoLine: function (ctx, str, initX, initY, lineHeight, maxWidth, row = 1) {
    var lineWidth = 0;
    var lastSubStrIndex = 0;
    var currentRow = 1;
    for (let i = 0; i < str.length; i++) {
      lineWidth += ctx.measureText(str[i]).width;
      if (lineWidth > maxWidth) {
        currentRow++;
        let newStr = str.substring(lastSubStrIndex, i)
        if (currentRow > row && str.length > i) {
          newStr = str.substring(lastSubStrIndex, i - 2) + '...'
        }
        ctx.fillText(newStr, initX, initY);
        initY += lineHeight;
        lineWidth = 0;
        lastSubStrIndex = i;

        if (currentRow > row) {
          break;
        }
      }
      if (i == str.length - 1) {
        ctx.fillText(str.substring(lastSubStrIndex, i + 1), initX, initY);
      }
    }
  },
  // 裁剪圆形图片
  circleImg: function (ctx, img, x, y, r) {
    ctx.save();
    var d = 2 * r;
    var cx = x + r;
    var cy = y + r;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(img, x, y, d, d);
    ctx.restore()
  },
  canvasToImage() {
    wx.hideLoading()
    wx.canvasToTempFilePath({
      width: this.data.canvasWidth,
      height: this.data.canvasHeight,
      destWidth: this.data.canvasWidth * 2,
      destHeight: this.data.canvasHeight * 2,
      canvasId: this.data.painting.canvasId,
      success: res => {
        // this.saveImageToPhotos(res.tempFilePath)
        // wx.previewImage({
        //   current: res.tempFilePath, // 当前显示图片的http链接
        //   urls: [res.tempFilePath], // 需要预览的图片http链接列表
        //   complete: () => {
        //     wx.hideLoading()
        //   }
        // })
        console.log('wx.canvasToTempFilePath', res.tempFilePath)
        this.setData({
          playbillPath: res.tempFilePath,
          popupShow: true
        })
      },
      fail: err => {
        wx.showToast({
          title: '图片生成失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  countdownInit() {
    countDown = setTimeout(() => {
      this.countdownTimer()
    }, 1000)
  },
  countdownTimer() {
    const formatNumber = n => {
      n = n.toString()
      return n[1] ? n : '0' + n
    }
    const endTime = this.data.endTime // 活动结束时间
    let time = '00:00:00'
    let day = '00'
    const gapTime = Math.ceil(((new Date(endTime).getTime()) - new Date().getTime()) / 1000)
    if (gapTime > 0) {
      let lastTime = gapTime % 86400;
      day = formatNumber(parseInt(gapTime / 86400))
      const hour = formatNumber(parseInt(lastTime / 3600))
      lastTime = lastTime % 3600;
      const minute = formatNumber(parseInt(lastTime / 60));
      const second = formatNumber(lastTime % 60);
      const countdown = `${day}天${hour}时${minute}分${second}秒`
      this.countdownInit()
      this.setData({
        countdown: countdown
      })
    } else {
      // 倒计时结束
      this.setData({
        countdown: '等待下期活动开始'
      })
    }

  },
  getTheCharts() {
    // 排行榜
    // app.globalData._server+ '/weixin/guimi/getTheCharts'
    util.request(app.globalData._server + '/weixin/getTheCharts', {}, 'POST')
      .then(res => {
        this.setData({
          endTime: res.endTime.replace(/-/g, '/'),
          rankList: res.data
        })
        this.countdownInit()
      })
  },
  handlePosterSave() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.writePhotosAlbum'] !== false) {
          wx.saveImageToPhotosAlbum({
            filePath: this.data.playbillPath,
            success: res => {
              this.setData({
                popupShow: false
              })
              wx.showToast({
                title: '保存图片成功，从相册中分享吧',
                icon: 'none',
                duration: 2000
              })
            },
            fail: err => {
              wx.showToast({
                title: '图片保存失败',
                icon: 'none',
                duration: 2000
              })
            }
          })
        } else {
          wx.showModal({
            title: '授权',
            content: '如需正常使用保存功能，请按确定并在授权管理中选中“保存到相册”，然后点按确定返回。即可正常使用。',
            showCancel: false,
            success: res => {
              if (res.confirm) {
                wx.openSetting({
                  success: function success(res) {
                    console.log('openSetting success', res)
                  },
                  fail: err => {
                    console.log('openSetting fail', err)
                  }
                })
              }
            }
          })

        }
      }
    })
  }
})
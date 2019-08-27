// pages/subUser/myOrder/orderDetail.js
const app = getApp();
const util = require('../../../common/util.js');
const wxpay = require('../../../common/pay.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: app.globalData.baseUrl,
    winScale: util.sysInfo().windowWidth / 750,
    windowHeight: util.sysInfo().windowHeight,
    windowWidth: util.sysInfo().windowWidth,
    visible:false,
    starIndex:0,
    popupShow:true,
    redshare:false,
    popupShowimg:false,
    // painting: {
    //   canvasId: 'playbill',
    //   playbillWidth: '560',
    //   playbillHeight: '700',
    //   playbill_bg: '',
    //   qrcode: {
    //     path: '',
    //     width: 200,
    //     height: 200,
    //     offsetLeft: 200,
    //     offsetTop: 200
    //   }
      
    // },
    painting: {
      canvasId: 'playbill',
      playbillWidth: 560,
      playbillHeight: 700,
      playbill_bg: '',
      qrcode: {},
      avatar: {},
      nickName: {}

    },

    xiadan:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
    this.setData({
      GUIMI_ORDER_ID:options.orderid,
      status:options.status,
      cation: options.cation,
      xiadan: options.status == 0?false:true
      // GUIMI_ORDER_ID: 'ba9ebc7a5409480bbc96ed63d273f63e',
      // status:1,
      // cation:1
    })
    

    if (app.globalData.employId == 1) {
      if (!app.globalData.userInfo.USERLIST_ID) {
        console.log('首次进入小程序无app.globalData.userInfo.USERLIST_ID')
        return false
      }
      this.orderDetails();
      // this.getInvitePosterSetting();
      // this.getInviteMiniCode();


      this.getdrawPosterSettingSetting();
    } else {
      app.employIdCallback = () => {
        if (!app.globalData.userInfo.USERLIST_ID) {
          console.log('首次进入小程序无app.globalData.userInfo.USERLIST_ID')
          return false
        }
        this.orderDetails();
        // this.getInvitePosterSetting();
        // this.getInviteMiniCode();


        this.getdrawPosterSettingSetting();
      }
    }
   
  },
  // 关闭蒙城
  handlePopupHide(){

  },
  // 点击广告图跳转邀请有礼
  InviteCourtesy(e){
      // wx.navigateTo({
      //   url: '/pages/subIndex/activities_invite/activities_invite',
      // })

    const { url } = e.currentTarget.dataset
    if (url.includes('index') || url.includes('menu') || url.includes('shopCart') || url.includes('user')) {
      wx.reLaunch({
        url: `${url}`,
      })
    } else {
      wx.navigateTo({
        url: `${url}`,
      })
    } 
  },
 
  // 获取订单详情的接口   /weixin/wxfindorderitem
  orderDetails(){
    util.request(app.globalData._server + '/weixin/guimi/getOrderDetailById', { 
      GUIMI_ORDER_ID:this.data.GUIMI_ORDER_ID
      }, 'POST')
      .then(res => {
       
          this.setData({
            orderList: res.items,
            orderidDetail: res.order
          })
      })
  },
// 弹出框关闭
  handleRedbaoClose() {
    this.setData({
      popupShow: false,
      xiadan:true
    })
  },
// 图片点击显示下单
  xiadan(){
    this.setData({
      redshare:true,
      xiadan:true
    })
  },

// 申请售后按钮    STATUS: 5
  application(){
    util.request(app.globalData._server + '/weixin/saveguimirefund', {
      GUIMI_ORDER_ID: this.data.GUIMI_ORDER_ID
    }, 'POST')
      .then(res => {
        if(res.msg == 'success'){
          // wx.showToast({
          //   title: '请在售后单查看',
          //   icon:'success'
          // })
          // setTimeout(function(){
          //   wx.navigateBack({})
          // },1000)
        }else{
          // wx.showToast({
          //   title: '申请失败',
          //   icon: 'none'
          // })
        }
      })
  },


  handleContact(e) {
    // this.application();
   
  },

  // 点击在来一单
  agin(){
    util.request(app.globalData._server + '/weixin/wxsaveshoppingcart', {
      GUIMI_ORDER_ID: this.data.GUIMI_ORDER_ID
    }, 'POST')
      .then(res => {
        if(res.msg == 'success'){
          wx.switchTab({
            url: '../../tab/shopCart/shopCart'
          })
        }else{
          wx.showToast({
            title: '订单失败',
            icon:'none'
          })
        }
      })
  },

  // 点击确认收货按钮
  confirmReceipt(){
    util.request(app.globalData._server + '/weixin/wxeditOrderStatusById', {
      GUIMI_ORDER_ID: this.data.GUIMI_ORDER_ID,
      STATUS:3
    }, 'POST')
      .then(res => {
        if (res.msg == 'success') {
          wx.showToast({
            title: '收货成功',
            icon: 'success'
          })
          setTimeout(function () {
            wx.navigateBack({})
          }, 1000)
        } else {
          wx.showToast({
            title: '收货失败',
            icon: 'none'
          })
        }
      })
  },

  // 点击立即付款
  payMent() {
    let that = this;
    wx.showActionSheet({
      itemList: ['余额', '微信支付'],
      success(res) {
        wx.showLoading({
          title: '等待支付',
        })
        if (res.tapIndex == 0){
          var money = that.data.money;
          var totalPrice = Number(that.data.orderidDetail.PAYMENT);
          console.log(money, totalPrice,'价格')
          if (money < totalPrice){
            wx.showToast({
              title: '余额不足',
              icon:'none'
            })
          }else{
            setTimeout(function () {
              util.request(app.globalData._server + '/weixin/guimi/payOrderByBalance', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID, GUIMI_ORDER_ID: that.data.GUIMI_ORDER_ID, PAY_TYPE: 0 }, 'POST')
                .then(res => {
                  if (res.msg == 'success') {
                    wx.hideLoading();
                    wx.showModal({
                      title: '',
                      content: '支付成功',
                      showCancel: false,
                      confirmColor: '#5CAE32',
                      success: res => {
                      
                          that.setData({
                            popupShow: true,
                            cation: 1,
                            xiadan:true
                          })
                      }
                    })
                    
                  } else {
                    wx.hideLoading();
                    wx.showToast({
                      title: '支付失败',
                      icon:'none'
                    })
                  }
                })
            }, 1500)
          }
        }else{
        
          wxpay.wxpay({ orderId:that.data.GUIMI_ORDER_ID, orderType: '0' }).then(res => {
            wx.hideLoading()
            wx.showModal({
              title: '',
              content: '支付成功',
              showCancel: false,
              confirmColor: '#5CAE32',
              success: res => {
                
                that.setData({
                  popupShow: true,
                  cation: 1,
                  xiadan: true
                })
              }
            })

          }).catch(err => {
            wx.hideLoading()
            // this.totalShopCartNum()
            wx.showModal({
              title: '',
              content: '支付失败',
              showCancel: false,
              confirmColor: '#5CAE32',
              success: res => {
                if (res.confirm) {
                  setTimeout(function () {
                    wx.navigateBack({})
                  }, 1000)
                }
              }
            })

          })
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },

  // 获取余额的钱
  getMoney() {
    util.request(app.globalData._server + '/weixin/wxfindusermoney', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {
        this.setData({
          money: res.data.BALANCE
        })
      })
  },
  // 取消订单
  cancelOrder(){
    util.request(app.globalData._server + '/weixin/wxremoveorder', {
      GUIMI_ORDER_ID: this.data.GUIMI_ORDER_ID
    }, 'POST')
      .then(res => {
        if (res.msg == 'success') {
          wx.showToast({
            title: '取消成功',
            icon: 'success'
          })
          setTimeout(function () {
            wx.navigateBack({})
          }, 1000)
        } else {
          wx.showToast({
            title: '取消失败',
            icon: 'none'
          })
        }
      })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getMoney();
    this.getpohot();
    this.listAdvertisement();
  },

  // 获取海报图片
  getpohot(){
    util.request(app.globalData._server + '/weixin/guimi/getPoster', {
      TYPE:14
    }, 'POST')
      .then(res => {
        this.setData({
          imgURL:res.poster.IMG_URL
        })
      })

    util.request(app.globalData._server + '/weixin/guimi/getPoster', {
      TYPE: 6
    }, 'POST')
      .then(res => {
        this.setData({
          imgURLfenx: res.poster.IMG_URL
        })
      })

    util.request(app.globalData._server + '/weixin/guimi/getPoster', {
      TYPE: 10
    }, 'POST')
      .then(res => {
        this.setData({
          imgURLxiadan: res.poster.IMG_URL
        })
      })

    util.request(app.globalData._server + '/weixin/guimi/getPoster', {
      TYPE: 11
    }, 'POST')
      .then(res => {
        this.setData({
          imgURLyaoqin: res.poster.IMG_URL
        })
      })


      
  },

  showshare(){
    this.setData({
      redshare:true,
      popupShow:false,
     
    })
  },


  handleButtonShare() {
    if (this.data.playbillPath) {
      this.setData({
        popupShowimg: true,
        popupShow:false,
        redshare:false
      })
    } else {
      this.begainDrawShareImage(this.data.painting)
    }
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
          // wx.hideLoading()
            // this.canvasToImage()

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
  // begainDrawShareImage(painting) {  吳雪勤
  //   wx.showLoading({ title: '绘制中', mask: true })
   

  //   // 使用 wx.createContext 获取绘图上下文 context
  //   var ctx = wx.createCanvasContext(painting.canvasId)
  //   // 海报设计尺寸 560*700 图片宽高取整数
  //   // 换算不同设备下画布大下
  //   const scale = this.data.windowWidth / 750
  //   this.setData({
  //     canvasWidth: Math.floor(painting.playbillWidth * scale),
  //     canvasHeight: Math.floor(painting.playbillHeight * scale),
  //     popupShow: false,
  //     redshare: false
  //   })
  //   wx.getImageInfo({
  //     src: painting.playbill_bg,
  //     success: res => {
       
  //       // 绘制背景  
  //       ctx.drawImage(res.path, 0, 0, this.data.canvasWidth, this.data.canvasHeight)
  //       ctx.draw()
  //       wx.getImageInfo({
  //         src: painting.qrcode.path,
  //         success: res => {
  //           const width = parseInt(painting.qrcode.width * scale)
  //           const height = parseInt(painting.qrcode.height * scale)
  //           ctx.drawImage(res.path, painting.qrcode.offsetLeft * scale, painting.qrcode.offsetTop * scale, width, height)
  //           // 绘制结束,关闭loading等待中 
  //           ctx.draw(true, () => {
  //             wx.hideLoading()
  //             this.canvasToImage()
  //           })
  //         },
  //         fail: err => {
  //           console.error(err)
  //         }
  //       })
  //     }
  //   })
  // },

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
      width: this.data.painting.playbillWidth,
      height: this.data.painting.playbillHeight,
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
     
        this.setData({
          playbillPath: res.tempFilePath,
          popupShowimg: true,
          popupShow:false,
          redshare:false
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
  // 广告图
  listAdvertisement() {
    util.request(app.globalData._server + '/weixin/guimi/listAdvertisement', { POSITION: '0' }, 'POST')
      .then(res => {
        this.setData({
          adList: res.adList
        })
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
                popupShowimg: false
              })
              wx.showToast({
                title: '保存图片成功',
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
            confirmColor: '#5CAE32',
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
  },


  getdrawPosterSettingSetting() {
    wx.showLoading({ title: '加载中', mask: true })
    const api_getDrawPosterSetting = util.request(app.globalData._server + '/weixin/guimi/getDrawPosterSetting', { TYPE: '6', GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
    const api_getInviteMiniCode = util.request(app.globalData._server + '/weixin/guimi/getInviteMiniCode', {
      appId: app.globalData.appid,
      page: 'pages/takeRedbao/takeRedbao',
      type:1,
      scene: this.data.GUIMI_ORDER_ID
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




// 获取海报图 吳雪勤
  // getInvitePosterSetting() {
  //   wx.showLoading({ title: '加载中', mask: true })
  //   util.request(app.globalData._server + '/weixin/guimi/getDrawPosterSetting', { TYPE:6}, 'POST')
  //     .then(res => {
        
  //       // const invitePoster = res.invitePoster
  //       const invitePoster = res.drawPosterSetting
  //       this.setData({
  //         [`painting.playbill_bg`]: `${this.data.baseUrl}/${invitePoster.IMG_URL}`,
  //         [`painting.qrcode.width`]: invitePoster.CODE_WIDTH,
  //         [`painting.qrcode.height`]: invitePoster.CODE_HEIGHT,
  //         [`painting.qrcode.offsetLeft`]: invitePoster.POINT_WIDTH,
  //         [`painting.qrcode.offsetTop`]: invitePoster.POINT_HEIGHT,
  //       })
  //       wx.hideLoading()
  //     })
  // },

  // // 获取二维码 吳雪勤
  // getInviteMiniCode() {
  //   wx.showLoading({ title: '加载中', mask: true })
  //   util.request(app.globalData._server + '/weixin/guimi/getInviteMiniCode', {
  //     appId: app.globalData.appid,
  //     page: 'pages/takeRedbao/takeRedbao',
  //     type:1,
  //     scene: this.data.GUIMI_ORDER_ID
  //   }, 'POST')
  //     .then(res => {
  //       if (res.msg == 'success') {
  //         this.setData({
  //           qrcodePath: res.path,
  //           [`painting.qrcode.path`]: `${this.data.baseUrl}/${res.path}`
  //         })
  //         wx.hideLoading()
  //       } else {
  //         util.toast(res.more || res.msg)
  //       }
  //     })
  // },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  preventTouchMove() {

  },
  handleRateClick(){
    this.setData({
      visible: true
    })
  },
  
  handleStarClick(e){
    const index = e.currentTarget.dataset.index
    this.setData({
      starIndex: index + 1
    })
  },
  handlePopupShow(){
    this.setData({
      visible: true
    })
  },
  handlePopupHide(){
    this.setData({
      visible: false,
      redshare:false
    })
  },
  formRateSubmit(e){
    const name = e.detail.value.name;
    const supp = e.detail.value.supp;
    if (!supp){
   
      wx.showToast({
        title: '请选择五星内容',
        icon:'none'
      })
      return;
    } else if (!name){
    
      wx.showToast({
        title: '请填写评论内容',
        icon: 'none'
      })
      return;
    }else{
     
      util.request(app.globalData._server + '/weixin/wxsaveorderappraise', { STAR_NUM: name, FEEDBACK: supp, GUIMI_ORDER_ID: this.data.GUIMI_ORDER_ID, USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
        .then(res => {
          if (res.msg == 'success') {
            util.request(app.globalData._server + '/weixin/wxeditOrderStatusById', {
              GUIMI_ORDER_ID: this.data.GUIMI_ORDER_ID,
              STATUS: 7
            }, 'POST')
              .then(res => {
                if(res.msg == 'success'){
                  wx.showToast({
                    title: '评论成功',
                    icon: 'cuccess'
                  })
                 setTimeout(function(){
                     wx.navigateBack({})
                 },1000)
                }
              })
            this.setData({
              visible: false,
            })
          } else {
            wx.showToast({
              title: '评论失败',
              icon: 'none'
            })
            this.setData({
              visible: false
            })
          }
        })
    }
  
  },
  
onShareAppMessage:function(res){
  
  if(res.from == 'button'){
    
     this.setData({
        popupShow: false,
        cation: 2
      })
  }
  return {
    title:'分享好友领取红包',
    path: 'pages/takeRedbao/takeRedbao?orderId=' + this.data.GUIMI_ORDER_ID,
    imageUrl: `${this.data.baseUrl}/${this.data.imgURLfenx}`
  }
  
},

// 取消分享按钮
  redcanle(){
   this.setData({
     redshare: false,
     xiadan:true
   })
  }


})
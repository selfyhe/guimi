// pages/subIndex/activities_invite/activities_invite.js
const app = getApp()
const util = require('../../common/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: app.globalData.baseUrl,
    visible: false,
    winScale: util.sysInfo().windowWidth / 750,
    windowHeight: util.sysInfo().windowHeight,
    offsetTop: 0,
    poster:{},
    adList:[],
    redbaoList:{},
    popupShow: false,
    listredbao:[],
    rule: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(this.route,options,'转发进入的路径跟参数')
    //海报高度+盒子高度>windowHeight情况 海报高度?????
    // 海报尺寸 750x814
    const gap = (814 + 240) * this.data.winScale > this.data.windowHeight
    if (gap) {
      this.setData({
        offsetTop: parseInt(this.data.windowHeight - 388 * this.data.winScale)
      })
    }
    this.setData({
       INVITED_ID: decodeURIComponent(options.scene),
       orderId: options.orderId || decodeURIComponent(options.scene),
      // orderId: '5e8f5ba6a90c4a899d182737db052a48 '
      })
  },
// 获取活动规则
  getInvitePosterSetting() {
    wx.showLoading({ title: '加载中', mask: true })
    util.request(app.globalData._server + '/weixin/guimi/getDrawPosterSetting', { TYPE: 6 }, 'POST')
      .then(res => {
        wx.hideLoading()
        this.setData({
          enen: res.drawPosterSetting.REMARK.slice(0, res.drawPosterSetting.REMARK.length - 1)
        })
        var rule = []
        rule = this.data.enen.split("\r\n");
        for(var i=0;i<rule.length;i++){
          if (rule[i] == ''){
            rule.splice(i,1)
            this.setData({
              rule: rule
            })
          }else{
            this.setData({
              rule: rule
            })
          }
        }
        var ruleList = this.data.rule;
        var ruleIndex = []
        var one = {};
        for (var i = 0; i < ruleList.length;i++){
          var resultrule = ruleList[i].replace(/(^\s*)|(\s*$)/g, "").substr(1);
          ruleIndex.push({ item: resultrule, index: ruleList[i].replace(/(^\s*)|(\s*$)/g, "").slice(0, 1)});
        }
        this.setData({
          ruleIndex: ruleIndex
        })
      })
  },

  // 弹出框关闭
  handleRedbaoClose() {
    this.setData({
      popupShow: false
    })
    this.viewRedbao();
  },

  // 立即使用按钮跳转菜单页面
  immediately(){
    wx.switchTab({
      url: '/pages/tab/menu/menu',
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
    
    if (app.globalData.employId == 1) {
      if (!app.globalData.userInfo.USERLIST_ID) {
        console.log('首次进入小程序无app.globalData.userInfo.USERLIST_ID')
        return false
      }
      this.getPoster()
      this.getUserInfo()
      this.listAdvertisement()

      this.getpohot()
      this.viewRedbao()//查看红包详情的
      this.getInvitePosterSetting()
    } else {
      app.employIdCallback = () => {
        if (!app.globalData.userInfo.USERLIST_ID) {
          console.log('首次进入小程序无app.globalData.userInfo.USERLIST_ID')
          return false
        }
        this.getPoster()
        this.getUserInfo()
        this.listAdvertisement()


        this.getpohot()
        this.viewRedbao()//查看红包详情的
        this.getInvitePosterSetting()
      }
    }
  },

  // 获取海报图片
  getpohot() {
    util.request(app.globalData._server + '/weixin/guimi/getPoster', {
      TYPE: 6
    }, 'POST')
      .then(res => {
      
        this.setData({
          imgURL: res.poster.IMG_URL
        })
      })
    util.request(app.globalData._server + '/weixin/guimi/getPoster', {
      TYPE: 7
    }, 'POST')
      .then(res => {
        this.setData({
          imgURLxiadan: res.poster.IMG_URL
        })
      })
  },
 
// 查看红包情况
viewRedbao(){
  util.request(app.globalData._server + '/weixin/guimi/findOrderCouponList', {
    GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID,
    GUIMI_ORDER_ID: this.data.orderId
  }, 'POST')
    .then(res => {
        this.setData({
          redbaodState:res
        })
      // 过滤把自己的不显示
      const list = this.data.redbaodState.list
      
      for (var i = 0; i < list.length;i++){
        
          if (app.globalData.userInfo.USERLIST_ID == list[i].GUIMI_USER_ID) {
            this.setData({
              redList: list[i]
            })
            
            // list.splice(i, 1)
            // this.setData({
            //   listredbao: list
            // })
          } else {
            this.setData({
              listredbao: list
            })
          }
       
      }
     

    })
},


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
  handleNavigator(e) {
    const { url } = e.currentTarget.dataset
    // tab页,wx.navigateTo失效
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
  bindKeyInput(e) {
    const { value } = e.currentTarget.dataset
    this.setData({
      [value]: e.detail.value
    })
  },
  handleDialogOpen() {
    this.setData({
      visible: true
    })
  },
  handleDialogClose() {
    this.setData({
      visible: false
    })
  },
  handleOk() {
    this.handleDialogClose()
    wx.reLaunch({
      url: '/pages/tab/index/index',
    })
  },
  getUserInfo() {
    util.request(app.globalData._server + '/weixin/guimi/getUserInfo', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {
        this.setData({
          userInfo: res.userInfo
        })
      })
  }, 


  handleRedbaoGet() {

    console.log(this.data.redbaodState.robedFlag == false ? '新人' : '旧用户')
    const that = this;
    if (this.data.redbaodState.robedFlag == true){
      util.toast('您已经抢过此红包了')
      return false
    }

    // 抢分享的红包接口
    util.request(app.globalData._server + '/weixin/guimi/robOrderCoupon', {
      GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID,
      GUIMI_ORDER_ID: this.data.orderId
      }, 'POST')
      .then(res => {
      
        if (res.msg == 'success') {
          this.viewRedbao()
          this.setData({
            popupShow:true
          })

        } else {
          util.toast('抢红包失败')
        }
      })

  },
  getPoster() {
    util.request(app.globalData._server + '/weixin/guimi/getPoster', { TYPE: '0' }, 'POST')
      .then(res => {
        this.setData({
          poster: res.poster
        })
      })
  },
  listAdvertisement() {
    util.request(app.globalData._server + '/weixin/guimi/listAdvertisement', { POSITION: '1' }, 'POST')
      .then(res => {
        this.setData({
          adList: res.adList
        })
      })
  },


  onShareAppMessage: function (res) {

    if (res.from == 'button') {

      this.setData({
        popupShow: false,
        cation: 2
      })
    }
    return {
      title: '分享好友领取红包',
      path: 'pages/takeRedbao/takeRedbao?orderId=' + this.data.orderId,
      imageUrl: `${this.data.baseUrl}/${this.data.imgURL}`
    }

  },
})
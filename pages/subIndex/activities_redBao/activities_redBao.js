// pages/subIndex/activities_invite/activities_invite.js
const app = getApp()
const util = require('../../../common/util.js')
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(this.route,options)
    //海报高度+盒子高度>windowHeight情况
    // 海报尺寸 750x814
    const gap = (814 + 240) * this.data.winScale > this.data.windowHeight
    if (gap) {
      this.setData({
        offsetTop: parseInt(this.data.windowHeight - 388 * this.data.winScale)
      })
    }
    this.setData({ INVITED_ID: decodeURIComponent(options.scene) })
    if (!app.globalData.userInfo.USERLIST_ID) {
      console.log('首次进入小程序无app.globalData.userInfo.USERLIST_ID')
      return false
    }
    this.getPoster()
    this.getUserInfo()
    this.listAdvertisement()
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


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    console.log(res)
    // if (res.from === 'button') {
    //   // 来自页面内转发按钮
    //   console.log(res)
    // }
    // this.setData({
    //   visible:false
    // })
    return {
      title: app.globalData.comment,
      imageUrl: `${this.data.baseUrl}/${this.data.poster.IMG_URL}`,
      path: `pages/subIndex/activities_redBao/activities_redBao?scene=${app.globalData.userInfo.USERLIST_ID}`
    }
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
  handleMypopupClose(e) {
    this.setData({
      visible: false
    })
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
      url: '/pages/tab/menu/menu',
    })
  },
  handleCancel(){

  },
  getUserInfo() {
    wx.showLoading({ title: '加载中', mask: true })
    util.request(app.globalData._server + '/weixin/guimi/getUserInfo', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {
        wx.hideLoading()
        this.setData({
          userInfo: res.userInfo
        })
      })
  }, 
  handleRedbaoGet() {  
    console.log(this.data.userInfo.ISNEW == '1' ? '新人' : '旧用户')
    wx.showLoading({ title: '加载中', mask: true })
    if (!this.data.INVITED_ID){
      util.toast('this.data.INVITED_ID不存在')
      return false
    }
    // 领取优惠
    util.request(app.globalData._server + '/weixin/guimi/inviteNewUser', { BE_INVITED_ID: app.globalData.userInfo.USERLIST_ID, INVITED_ID: this.data.INVITED_ID }, 'POST')
      .then(res => {
        wx.hideLoading()
        if (res.msg == 'success') {
          // 领取成功
          this.handleDialogOpen()
          const worth = res.couponList.reduce((total, item) => total + item.WORTH, 0)
          this.setData({
            'userInfo.ISNEW':'0',
            couponList: res.couponList,
            worth: worth,
            visible:true
          })
          
          // wx.showModal({
          //   title: '提示',
          //   content: `恭喜您成功领取,${worth}元新人大礼包`,
          //   showCancel: false,
          //   confirmText: '去吃一顿',
          //   success: res => {
          //     if (res.confirm) {
          //       wx.reLaunch({
          //         url: '/pages/tab/menu/menu',
          //       })
          //     }
          //   }
          // })
        } else {
          // util.toast(res.more || res.msg)
          // util.toast('您已领取过')
          wx.showModal({
            // title: '提示',
            content: '您已经是鲑蜜SUSHI的会员了\r\n再来一单吧',
            showCancel: false,
            confirmText: '再来一单',
            confirmColor:'#5CAE32',
            success: res => {
              if (res.confirm) {
                wx.reLaunch({
                  url: '/pages/tab/menu/menu',
                })
              }
            }
          })
        }
      })

  },
  getPoster() {
    util.request(app.globalData._server + '/weixin/guimi/getPoster', { TYPE: '11' }, 'POST')
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
})
const app = getApp()
const util = require('../../../common/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: app.globalData.baseUrl,
    userCount: { BALANCE: 0, couponCount: 0, productCouponCount: 0, integral: 0, unpayOrderCount: 0 },// 用户统计
    adList: [], // 广告位
    userInfo: {},
    orderItems: [{ title: '待付款', icon: 'icon_zc' }, { title: '待发货', icon: 'icon_zc' }, { title: '配送中', icon: 'icon_zc' }, { title: '待评价', icon: 'icon_zc' }, { title: '售后', icon: 'icon_zc' }]

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    if (!app.globalData.userInfo.USERLIST_ID) {
      console.log('首次进入小程序无app.globalData.userInfo.USERLIST_ID')
      return false
    }
    this.getUserInfo()
    // this.getMoney()
    this.listAdvertisement()
    this.getUserCount() // 用户统计
    this.totalShopCartNum()
  },

  // 获取余额的钱
  // getMoney(){
  //   // util.request(app.globalData._server + '/weixin/wxfindusermoney', { GUIMI_USER_ID: "a5735fb21438454eb02c62da4136b46f"}, 'POST')
  //   util.request(app.globalData._server + '/weixin/wxfindusermoney', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
  //     .then(res => {
  //       // console.log(res,'余额')
  //       this.setData({
  //         money: res.data.BALANCE
  //       })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

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
  getUserCount() {
    util.request(app.globalData._server + '/weixin/guimi/getUserCount', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {
        this.setData({
          userCount: Object.assign(this.data.userCount, res.count)
        })
      })
  },
  listAdvertisement() {
    util.request(app.globalData._server + '/weixin/guimi/listAdvertisement', { POSITION: '2' }, 'POST')
      .then(res => {
        this.setData({
          adList: res.adList
        })
      })
  },
  totalShopCartNum() {
    // 购物车badge 在tabbar页面中才会生效
    util.request(app.globalData._server + '/weixin/guimi/findUserShoppingcart', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {
        if (res.cartList.length) {
          let total = 0
          res.cartList.forEach(item => total += item.NUM)
          wx.setTabBarBadge({ index: 2, text: `${total}` })
        } else {
          wx.removeTabBarBadge({ index: 2 })
        }
      })
  },
  getPhoneNumber(e) {
    console.log(e.detail)
    const { url } = e.currentTarget.dataset
    if (e.detail.encryptedData) {
      // 允许授权成功
      wx.showLoading({ title: '加载中', mask: true })
      util.request(app.globalData._server + '/weixin/guimi/getWxLexPhone', {
        GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID,
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
        session_key: app.globalData.session_key
      }, 'POST')
        .then(res => {
          wx.hideLoading()
          if (res.msg == 'success') {
            console.log('绑定手机号码成功')
            this.setData({
              'userInfo.MOBILE': '绑定手机号码成功'
            })
            wx.navigateTo({
              url: url,
            })
          } else {
            util.toast(res.more || res.msg)
          }
        })
    } else {
      // 拒绝授权fail
      wx.showModal({
        title: '授权失败',
        showCancel: false,
        content: '授权失败，你可能部份功能无法使用'
      })
    }
  },
  getUserInfo() {
    util.request(app.globalData._server + '/weixin/guimi/getUserInfo', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {
        this.setData({
          userInfo: res.userInfo
        })
      })
  },
  // 点击查看订单全部页面
  handleNavigator1(e) {
    const { url } = e.currentTarget.dataset
    wx.navigateTo({
      url: url + '?STATUS=' + 0,
    })
  },

  // 点击订单分类查看订单
  goMyorder(e) {
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({
      url: url,
    })
  }

})
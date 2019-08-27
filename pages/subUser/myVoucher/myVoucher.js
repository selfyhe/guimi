const app = getApp();
const util = require('../../../common/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: app.globalData.baseUrl,
    pageTitle: '我的卡券',
    voucherCurrent: 0,
    voucherItems: ['优惠券', '红包劵', '商品劵'],
    types: ['寿司', '饭','全部'],
    list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      voucherCurrent: Number(options.voucherCurrent) || this.data.voucherCurrent
    })
    // wx.setNavigationBarTitle({
    //   title: `${this.data.pageTitle}-${this.data.voucherItems[this.data.voucherCurrent]}`,
    // })
    wx.setNavigationBarTitle({
      title: `${this.data.pageTitle}`,
    })
    switch (this.data.voucherCurrent) {
      case 0:
        this.coupons();
        break;
      case 1:
        this.redBages()
        break;
      case 2:
        this.proudctCoupons()
        break;
    }
  }, 
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  handleItemsClick(e) {
    const {
      index
    } = e.currentTarget.dataset
    this.setData({
      voucherCurrent: index
    })
    switch (index) {
      case 0:
        this.coupons();
        break;
      case 1:
        this.redBages()
        break;
      case 2:
        this.proudctCoupons()
        break;
    }
  },
  // 获取优惠券
  coupons() {
    this.setData({
      list: []
    })
    util.request(app.globalData._server + '/weixin/guimi/listUserCoupons', {
        GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID
      }, 'POST')
      .then(res => {
        console.log(res.userCoupons, '优惠券')
        res.userCoupons.forEach(item => {
          //优惠券可用于全部商品
          item.PRODUCT_TYPE && (item.PRODUCT_TYPE = this.data.types[Number(2)])
          item.CREATE_DATE && (item.CREATE_DATE = item.CREATE_DATE.slice(0, 10))
          item.EXPRIE_DATE && (item.EXPRIE_DATE = item.EXPRIE_DATE.slice(0, 10))
        }) 
        this.setData({
          list: res.userCoupons
        })
      })
  },
  // 获取红包
  redBages() {
    this.setData({
      list: []
    })
    util.request(app.globalData._server + '/weixin/guimi/listUserRedbags', {
        GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID,
      // PRODUCT_TYPE: this.data.voucherCurrent
      }, 'POST')
      .then(res => {
        res.userCoupons.forEach(item => {
          item.PRODUCT_TYPE && (item.PRODUCT_TYPE = this.data.types[Number(item.PRODUCT_TYPE)])
          item.CREATE_DATE && (item.CREATE_DATE = item.CREATE_DATE.slice(0, 10))
          item.EXPRIE_DATE && (item.EXPRIE_DATE = item.EXPRIE_DATE.slice(0, 10))
        }) 
        this.setData({
          list: res.userCoupons
        })
      })
  },
  // 获取商品券
  proudctCoupons() {
    this.setData({
      list: []
    })
    util.request(app.globalData._server + '/weixin/guimi/listUserProductCoupons', {
        GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID
      }, 'POST')
      .then(res => {
        // this.data.productCoupons.push(res.productCoupons)
        res.productCoupons.forEach(item => {
          item.TYPE && (item.TYPE = this.data.types[Number(item.TYPE)])
          item.CREATE_DATE && (item.CREATE_DATE = item.CREATE_DATE.slice(0, 10))
          item.EXPRIE_DATE && (item.EXPRIE_DATE = item.EXPRIE_DATE.slice(0, 10))
        }) 
        this.setData({
          list: res.productCoupons
        })
      })
  },
})
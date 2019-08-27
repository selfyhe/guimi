// pages/tab/sushiKu/sushiKu.js
const app = getApp()
const util = require('../../../common/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: app.globalData.baseUrl,
    PRODUCT_TYPE: '0',
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
    if (app.globalData.employId == 1) {
      this.listUserRedbags()
      this.productCouponTimeLimit()
      this.wxfindBanner()
    } else {
      app.employIdCallback = () => {
        this.listUserRedbags()
        this.productCouponTimeLimit()
        this.wxfindBanner()
      }
    }
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
  handleGoodsAdd(e){
    const { index} = e.currentTarget.dataset
    this.setData({
      GUIMI_USER_COUPON_ID: this.data.list[index].GUIMI_USER_COUPON_ID
    })
    this.addProductCoupon2Cart()
  },
  listUserRedbags() {
    // 寿司类商品
    util.request(app.globalData._server + '/weixin/guimi/listUserRedbags', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID, PRODUCT_TYPE: this.data.PRODUCT_TYPE }, 'POST')
      .then(res => {
        // res.userCoupons.forEach(item => {
        //   item.CREATE_DATE && (item.CREATE_DATE = item.CREATE_DATE.slice(0, 10))
        //   item.EXPRIE_DATE && (item.EXPRIE_DATE = item.EXPRIE_DATE.slice(0, 10))
        // })
        // this.setData({
        //   list: res.userCoupons
        // })
        this.setData({
          userCoupons: res.userCoupons
        })
      })
  },
  addProductCoupon2Cart(){
    wx.showLoading({ title: '加载中', mask: true })
    util.request(app.globalData._server + '/weixin/guimi/addProductCoupon2Cart', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID, GUIMI_USER_COUPON_ID: this.data.GUIMI_USER_COUPON_ID }, 'POST')
      .then(res => {
        if (res.msg == 'success'){
          this.productCouponTimeLimit()
          util.toast('加入购物车成功')
        }else{
          util.toast(res.msg)
        }
      })
  },
  productCouponTimeLimit() {
    wx.showLoading({ title: '加载中', mask: true })
    util.request(app.globalData._server + '/weixin/guimi/productCouponTimeLimit', { GUIMI_USER_ID:app.globalData.userInfo.USERLIST_ID}, 'POST')
      .then(res => { 
        this.setData({
          list: res.list
        },()=>{
          wx.hideLoading()
        })
      })
  },
  wxfindBanner() {
    // 0首页1菜单2寿司库
    util.request(app.globalData._server + '/weixin/guimi/banner/list', { POSITION: '2' }, 'POST')
      .then(res => {
        this.setData({
          imgUrls: res.bannerList
        })
      })
  },
})
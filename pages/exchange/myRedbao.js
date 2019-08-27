// pages/exchange/myRedbao.js
const app = getApp()
const util = require('../../common/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    PRODUCT_TYPE:'0', //0:寿司1：饭2：全部
    GUIMI_USER_COUPON_ID:'',
    GUIMI_EXCHANGE_ID:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      GUIMI_EXCHANGE_ID: options.GUIMI_EXCHANGE_ID
    })
    this.listUserRedbags()
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
  handleCardClick(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      GUIMI_USER_COUPON_ID: this.data.list[index].GUIMI_USER_COUPON_ID
    })
    this.wxredbag2Product()
  },
  handleDialogOpen(){
    this.setData({
      visible: true
    })
  },
  handleDialogClose() { 
    this.setData({
      visible: false
    })
  },
  handleOk(e) {
    console.log(e)
    this.handleDialogClose()
    wx.reLaunch({
      url:'/pages/tab/sushiKu/sushiKu'
    })
  },
  listUserRedbags(){
    util.request(app.globalData._server + '/weixin/guimi/listUserRedbags', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID, PRODUCT_TYPE: this.data.PRODUCT_TYPE }, 'POST')
      .then(res => {
        res.userCoupons.forEach(item => {
          item.CREATE_DATE && (item.CREATE_DATE = item.CREATE_DATE.slice(0, 10))
          item.EXPRIE_DATE && (item.EXPRIE_DATE = item.EXPRIE_DATE.slice(0, 10))
        }) 
        this.setData({
          list: res.userCoupons
        })
      })
  },
  wxredbag2Product() { 
    wx.showLoading({ title: '加载中', mask: true })
    util.request(app.globalData._server + '/weixin/guimi/redbag2Product', { GUIMI_USER_COUPON_ID: this.data.GUIMI_USER_COUPON_ID, GUIMI_EXCHANGE_ID: this.data.GUIMI_EXCHANGE_ID}, 'POST')
      .then(res => {
        if(res.msg == 'success'){
          wx.hideLoading()
          this.handleDialogOpen()
          this.listUserRedbags()
        }else{
          util.toast(res.more)
        }
      })
  },
})
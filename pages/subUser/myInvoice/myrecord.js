// pages/subUser/myInvoice/myrecord.js
const app = getApp()
const util = require('../../../common/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      type: options.type
    })
  },
// 获取开票记录 开具发票传0 开票记录传1
  invoiceRecording(type){
    util.request(app.globalData._server + '/weixin/guimi/listInvoiceRecord', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID, ISBILLING: type}, 'POST')
      .then(res => {
        this.setData({
          invoiceList: res.invoiceList
        })
      })
  },

// 点击跳转开具发票页面 
  billDetails(e){
    let price = e.currentTarget.dataset.price;
    let invoiceid = e.currentTarget.dataset.invoiceid;
    wx.navigateTo({
      url: '/pages/subUser/myInvoice/billdetails?invoiceid=' + invoiceid + '&price=' + price+'&type='+this.data.type,
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
    this.invoiceRecording(this.data.type);
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
})
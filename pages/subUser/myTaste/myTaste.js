// pages/subUser/myTaste/myTaste.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageTitle: '订单备注',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({ title: this.data.pageTitle })
    this.setData({
      REMARKS: options.REMARKS
    })
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
  bindKeyInput(e) {
    const {
      value
    } = e.currentTarget.dataset
    this.setData({
      [value]: e.detail.value
    })
  },
  handleTasteSave() {
    let prevPage = getCurrentPages()[getCurrentPages().length - 2]; //上一个页面 
    prevPage.setData({
      REMARKS: this.data.REMARKS
    })
    wx.navigateBack({})
  }
})
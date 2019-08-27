// pages/subIndex/community/community.js
const app = getApp()
const util = require('../../../common/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: app.globalData.baseUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.wxfindImage()
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
  handlePreview(){
    wx.previewImage({
      current: `${this.data.baseUrl}/${this.data.poster.IMG_URL}`,
      urls: [`${this.data.baseUrl}/${this.data.poster.IMG_URL}`],
    })
  },
  wxfindImage() {
    util.request(app.globalData._server + '/weixin/guimi/getPoster', { TYPE: '3' }, 'POST')
      .then(res => {
        this.setData({
          poster: res.poster
        }) 
      })
  }
})
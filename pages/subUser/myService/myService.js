// pages/subUser/myService/myService.js
const app = getApp();
const util = require('../../../common/util.js');
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
    util.request(app.globalData._server + '/weixin/guimi/serverType', {}, 'POST')
      .then(res => {
        this.setData({
          serviceList: res.typeList
        })
      })
    
  },

  // 点击服务列表跳转服务详情
  viewService(e){
    const title = e.currentTarget.dataset.title;
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/subUser/myService/serviceDetial?title=' + title + '&id=' + id,
    })
  },
  // 点击意见反馈跳转意见反馈页面
  viewFeeldback(){
    wx.navigateTo({
      url: '/pages/subUser/feedback/feedback',
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
  handleContact(e) {
    console.log(e.path)
    console.log(e.query)
  },
})
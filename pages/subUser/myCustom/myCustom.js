// pages/subUser/myCustom/myCustom.js
const app = getApp();
const util = require("../../../common/util.js");
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
    // 定制列表
    util.request(app.globalData._server + '/weixin/guimi/customerOrder/list', {
      GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID
    }, 'POST')
      .then(res => {
        this.setData({
          dingzhiStatus: res.orderList
        })
        res.orderList.forEach(item => item.toggle = true)
        res.orderList.forEach(key =>{
          // this.setData({
          //   dingzhiStatus: key.STATUS
          // })
          if (key.itemList == ''){
            key.toggle = !key.toggle;
            this.setData({
              orderList: res.orderList,
            })
          }else{
            this.setData({
              orderList: res.orderList,
            })
          }
        })
      })
  },

  // 点击购买跳转确认订单页面
  gopay(){
    wx.navigateTo({
      url: '/pages/orderConfirm/orderConfirm',
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
  handleOrderClick(e) {
    var orderId = e.currentTarget.dataset.orderid;
    var status = e.currentTarget.dataset.status;
    var dingzhiStatus = this.data.dingzhiStatus ==''?0:1
    console.log(dingzhiStatus)
    wx.navigateTo({
      url: '/pages/subUser/myCustom/customDetail?orderId=' + orderId + '&status=' + status + '&dingzhiStatus=' + dingzhiStatus,
    })
  }
})
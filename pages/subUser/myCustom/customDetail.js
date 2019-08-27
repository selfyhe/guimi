// pages/subUser/myCustom/customDetail.js
const app = getApp();
const util = require("../../../common/util.js");
const wxpay = require('../../../common/pay.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    price:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      status:options.status,
      dingzhiStatus: options.dingzhiStatus
    })
    console.log(options.dingzhiStatus,'定制的内容')
    // 列表详情
    const orderId = options.orderId;
    util.request(app.globalData._server + '/weixin/guimi/customerOrder/info', {
      GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID,
      GUIMI_CUSTOMIZED_ORDER_ID: orderId
    }, 'POST')
      .then(res => {
        
        res.itemList.forEach(key =>{
          this.setData({
            inforList: res.itemList,
            orderid: key.GUIMI_CUSTOMIZED_ORDER_ID
          })
        })
        this.setData({
          dataLength: res.itemList,
          totalPrice: res.orderInfo.PRICE
        })
    })
   
  },

  // 获取余额的钱
  getMoney() {
    util.request(app.globalData._server + '/weixin/wxfindusermoney', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {
        this.setData({
          money: res.data.BALANCE
        })
      })
  },
 
  // 点击支付按钮
  payMent(){
    let that = this;
      wx.showActionSheet({
        itemList: ['余额','微信支付'],
        success(res) {
         
          if (res.tapIndex == 0){
            wx.showLoading({
              title: '等待支付',
            })
            var money = that.data.money;
            var totalPrice = that.data.totalPrice;
            if (money < totalPrice){
              wx.hideLoading();
              wx.showToast({
                title: '余额不足',
                icon:'none'
              })
            }else{
              setTimeout(function(){
                util.request(app.globalData._server + '/weixin/guimi/customerOrder/agreeAndSubmit', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID, GUIMI_CUSTOMIZED_ORDER_ID: that.data.orderid, PAY_TYPE: 0 }, 'POST')
                  .then(res => {
                    if (res.msg == 'success') {
                      wx.hideLoading();
                      wx.showToast({
                        title: '支付成功',
                        icon: 'success'
                      })
                      setTimeout(function(){
                        wx.navigateBack({})
                      },1500)
                    } else {
                      wx.hideLoading();
                      wx.showToast({
                        title: '支付失败',
                      })
                    }
                  })
              },1500)
            }
          }else{
            wx.showLoading({
              title: '等待支付',
            })
            wxpay.wxpay({ orderId: that.data.orderid, orderType: '1' }).then(res => {
              console.log(res, '定制')
              wx.hideLoading()
              // this.totalShopCartNum()
              wx.showModal({
                title: '',
                content: '支付成功',
                showCancel: false,
                confirmColor: '#5CAE32',
                success: res => {
                  if (res.confirm) {
                    wx.navigateBack({})
                  }
                }
              })

            }).catch(err => {
              wx.hideLoading()
              wx.showModal({
                title: '',
                content: '支付失败',
                showCancel: false,
                confirmColor: '#5CAE32',
                success: res => {
                  if (res.confirm) {
                    wx.navigateBack({})
                  }
                }
              })
            })

          }
        },
        fail(res) {
          console.log(res.errMsg)
        }
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
    this.getMoney();
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
// pages/subUser/myInvoice/mybillheader.js
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
    // this.getInvoice();
  },

  // 获取发票抬头列表
  getInvoice(){
    util.request(app.globalData._server + '/weixin/guimi/listInvoiceTitle', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID}, 'POST')
      .then(res => { 
        this.setData({
          invoiceTitleList: res.invoiceTitleList
        })
      })
  },

// 删除发票抬头
  detailInvoice(e){
    let that = this;
    var titleid = e.currentTarget.dataset.titleid;
    wx.showModal({
      // title: '提示',
      content: '确认删除发票抬头吗?',
      cancelColor: '#5CAE32',
      confirmColor: '#5CAE32',
      success(res) {
        if (res.confirm) {
          util.request(app.globalData._server + '/weixin/guimi/deleteInvoiceTitle', { GUIMI_INVOICE_TITLE_ID: titleid}, 'POST')
            .then(res => {
              console.log(res.msg,'什么鬼')
              if(res.msg == 'success'){
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                that.getInvoice();
              }else{
                wx.showToast({
                  title: '删除失败',
                  icon: 'none'
                })
              }
            })
        } else if (res.cancel) {
         wx.showToast({
           title: '您点击了取消按钮',
           icon:'none'
         })
        }
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
    this.getInvoice();
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
  goEditbill(e){
    let titleid = e.currentTarget.dataset.titleid ? e.currentTarget.dataset.titleid:'';
    console.log(1,'这是什么')
    wx.navigateTo({
      url: '/pages/subUser/myInvoice/editbill?titleid=' + titleid
    })
  },
  togoHead(){
    console.log(2)
    wx.navigateTo({
      url: '/pages/subUser/myInvoice/editbill?titleid='+''
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
})
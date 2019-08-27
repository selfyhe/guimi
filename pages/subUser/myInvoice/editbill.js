// pages/subUser/myInvoice/editbill.js
const app = getApp()
const util = require('../../../common/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    setdefault:false,
    ISDEFAULT:0
  },
  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    console.log(options,'开票的id')
    this.setData({
      GUIMI_INVOICE_TITLE_ID: options.titleid
    })
    if (options.titleid) {
      this.inoviceDetials(options.titleid);
    }
  },
  Changedefuailt(e){
    // 是否设置为默认抬头
    this.setData({
      ISDEFAULT: e.detail.value[0]?1:0
    })
  },
  
  saveData(e){
    const billName = e.detail.value.billName;
    const billNUM = e.detail.value.billNUM;
    const email = e.detail.value.email;
    const ADDRESS = e.detail.value.ADDRESS;
    const PHONE = e.detail.value.PHONE;
    const BankNUmADD = e.detail.value.BankNUmADD;
    const BankNUm = e.detail.value.BankNUm;
//     else if(!util.regex.isEmail.test(email)){
//   wx.showToast({
//     title: '请填写正确的邮箱',
//     icon: 'none'
//   })
//   return;
// } else if (!ADDRESS) {
//   wx.showToast({
//     title: '请填写注册地址',
//     icon: 'none'
//   })
//   return;
// } else if (!util.regex.isPhone.test(PHONE)) {
//   wx.showToast({
//     title: '请填写正确的手机号码',
//     icon: 'none'
//   })
//   return;
// }
    if (!billName){
      wx.showToast({
        title: '请填写发票抬头',
        icon:'none'
      })
      return;
    } else if (!billNUM){
      wx.showToast({
        title: '请填写纳税人识别号',
        icon: 'none'
      })
      return;
    } else{
      util.request(app.globalData._server + '/weixin/guimi/saveInvoiceTitle', { 
        GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID,
        TITLE: billName,
        EMAIL: email,
        ISDEFAULT: this.data.ISDEFAULT,
        TAXPAYER_NUM: billNUM,
        REGISTERED_ADDRESS: ADDRESS,
        REGISTERED_PHONE: PHONE,
        BANK: BankNUmADD,
        BANK_CARD_NUM: BankNUm,
        GUIMI_INVOICE_TITLE_ID: this.data.GUIMI_INVOICE_TITLE_ID ? this.data.GUIMI_INVOICE_TITLE_ID :'',
         }, 'POST')
        .then(res => {
          if(res.msg == 'success'){
             wx.showToast({
                title: '保存成功',
                icon:'success'
              })
            setTimeout(function(){
              wx.navigateBack({})
            },1500)
          }
        })
     
    }
  },


  //获取发票抬头详情
  inoviceDetials(GUIMI_INVOICE_TITLE_ID){
    util.request(app.globalData._server + '/weixin/guimi/invoiceTitleInfo', {
      GUIMI_INVOICE_TITLE_ID: GUIMI_INVOICE_TITLE_ID
    }, 'POST')
      .then(res => {
        this.setData({
          invoiceTitle: res.invoiceTitle
        })
       
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
})
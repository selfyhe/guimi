// pages/subUser/myInvoice/billdetails.js
const app = getApp()
const util = require('../../../common/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openType:[
      { name: '0', value: '个人', checked: 'true', disabled:false},
      { name: '1', value: '单位',disabled: false}
    ],
    openMode: [
      { name: '0', value: '商品类型', checked: 'true',disabled:false},
      { name: '1', value: '商品明细', disabled: false}
    ],
    mode:'商品类型',
    type:'个人',
    invoiceTitleList:[],
    zhuti:false,
    invoiceType:'电子发票',
    company:false,
    arrayname:false,
    // array:['公司1','公司2','公司3','公司4','公司5'],
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      GUIMI_INVOICE_ID: options.invoiceid,
      invoiceMoney:options.price,
      typeVoice:options.type
    })
    if (options.type == 1){
      this.invoiceDetails()
    }
   
  },

  // 方式
  ModeChange(e){
    this.setData({
      mode:e.detail.value==0?'商品类型':'商品明细'
    })
  },
  // 抬头
  TypeChange(e) {
    this.setData({
      type: e.detail.value ==0?'个人':'单位',
      zhuti: e.detail.value == 0?false:true
    })
    // console.log(this.data.type, e.detail.value,'个人单位')
  },

  // 获取发票抬头列表
  getInvoice() {
    util.request(app.globalData._server + '/weixin/guimi/listInvoiceTitle', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {
       this.setData({
         invoiceList:res.invoiceTitleList,
         company: res.invoiceTitleList.length>0?true:false
       })
        const array = []
        res.invoiceTitleList.forEach(i=>{
          this.data.invoiceTitleList.push(i.TITLE)
           array.push(i.TITLE)
          this.setData({
            array: array
          })
          if (i.ISDEFAULT==1){
            this.setData({
              name: i.TITLE,
              titleId: i.GUIMI_INVOICE_TITLE_ID
            })
          }
        })
        
      })
  },

  // 获取发票详情
invoiceDetails(){
  util.request(app.globalData._server + '/weixin/guimi/invoiceInfo', { GUIMI_INVOICE_ID: this.data.GUIMI_INVOICE_ID}, 'POST')
    .then(res => {
      console.log(res.invoice)
      // 开票方式
      var index = res.invoice.BILLING_TYPE;
      
      this.data.openMode[index].checked = "true";
      if (index == 1){
        this.data.openMode[0].disabled = true;
        this.setData({
          openMode: this.data.openMode
        })
      }else{
        this.data.openMode[1].disabled = true;
        this.setData({
          openMode: this.data.openMode
        })
      }
      this.data.openType[res.invoice.INVOICE_TITLE].checked = "true";
      if (res.invoice.INVOICE_TITLE == 1) {
        this.data.openType[0].disabled = true;
        this.setData({
          openType: this.data.openType
        })
      } else {
        this.data.openType[1].disabled = true;
        this.setData({
          openType: this.data.openType
        })
      }
      this.setData({
        invoice: res.invoice,
        openMode: this.data.openMode,
        openType: this.data.openType,
        zhuti: res.invoice.INVOICE_TITLE == 1 ?true:false
      })
    })
},


  // 保存开票信息
  formSubmit(e){
    console.log('点击保存按钮')
    const mode = this.data.mode == '商品类型'?0:1;//开票方式
    const email = e.detail.value.email;//电子邮件
    const companyname = e.detail.value.companyname;
    const invoicename = e.detail.value.Invoicename;
  
    // console.log(companyname,'这尼玛的是什么鬼')
    const invoiceTaitou = this.data.type == '个人'?0:1;//单位发票抬头
    const invoiceMoney = this.data.invoiceMoney;//发票金额
    // const invoiceType = this.data.invoiceType;//发票类型
    const invoiceType =0;
    const titleId = this.data.titleId;//发票抬头id
    const invoiceid = this.data.GUIMI_INVOICE_ID//要开发票的id
    if (!util.regex.isEmail.test(email)){
      wx.showToast({
        title: '请输入正确的邮箱地址',
        icon: 'none'
      })
      return;
    } else if (invoiceTaitou == 1) { 
      if (!companyname) {
        wx.showToast({
          title: '请选择发票抬头',
          icon: 'none'
        })
      }else{
        console.log('1', invoicename)
        util.request(app.globalData._server + '/weixin/guimi/editInvoice', {
          GUIMI_INVOICE_ID: invoiceid,
          INVOICE_TYPE: invoiceType,
          BILLING_TYPE: mode,
          INVOICE_TITLE: invoiceTaitou,
          EMAIL: email,
          GUIMI_TITLE_ID: titleId,
        }, 'POST')
          .then(res => {
            if (res.msg == 'success') {
              wx.showToast({
                title: '申请成功',
                icon: 'success'
              })
              setTimeout(function () {
                wx.navigateBack({

                })
              }, 1500)
            } else {
              wx.showToast({
                title: '申请失败',
                icon: 'none'
              })
            }
          })
      }
      return;
    } else if (invoiceTaitou == 0) {
      if (!invoicename) {
        wx.showToast({
          title: '请输入开票人姓名',
          icon: 'none'
        })
      } else {
        console.log('2', invoicename)
        util.request(app.globalData._server + '/weixin/guimi/editInvoice', {
          GUIMI_INVOICE_ID: invoiceid,
          INVOICE_TYPE: invoiceType,
          BILLING_TYPE: mode,
          INVOICE_TITLE: invoiceTaitou,
          EMAIL: email,
          GUIMI_TITLE_ID: titleId,
          TAXPAYER_NUM: invoicename
        }, 'POST')
          .then(res => {
            if (res.msg == 'success') {
              wx.showToast({
                title: '申请成功',
                icon: 'success'
              })
              setTimeout(function () {
                wx.navigateBack({

                })
              }, 1500)
            } else {
              wx.showToast({
                title: '申请失败',
                icon: 'none'
              })
            }
          })
      }
      return;
    }else {
      console.log('保存开票信息接口');
      console.log('3', invoicename)
      util.request(app.globalData._server + '/weixin/guimi/editInvoice', { 
        GUIMI_INVOICE_ID:invoiceid,
        INVOICE_TYPE: invoiceType,
        BILLING_TYPE: mode,
        INVOICE_TITLE: invoiceTaitou,
        EMAIL: email,
        GUIMI_TITLE_ID: titleId,
        TAXPAYER_NUM: invoicename
        }, 'POST')
        .then(res => {
            if(res.msg == 'success'){
              wx.showToast({
                title: '申请成功',
                icon:'success'
              })
              setTimeout(function(){
                wx.navigateBack({
                  
                })
              },1500)
            }else{
              wx.showToast({
                title: '申请失败',
                icon: 'none'
              })
            }
        })
    }
  },
  
  // 点击选择发票抬头
  changgeInvoice(){
      wx.navigateTo({
        url: './editbill',
      })
  },

  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为 wuxueqin', e.detail.value);
    var invoiceList = this.data.invoiceList
    this.setData({
      arrayindex: e.detail.value,
      arrayname:true,
      titleId: invoiceList[e.detail.value].GUIMI_INVOICE_TITLE_ID
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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
})
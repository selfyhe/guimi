// pages/subIndex/customized/customized.js
const dateTimePicker = require("../../../common/libs/dataTimePicker/dataTimePicker.js");
const app = getApp();
const util = require("../../../common/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    toggle:true,
    toggleWx:true,
    region: ['请选择'],
    customItem: '全部',
    // address: [],
    // array: ['标准包装', '寿司船', '专人摆盘'],
    // multiArray: ['1-5元', '5-10元', '10-15元', '15以上'],

    // dateTimeArray: null,
    // dateTime: null,
    // dateTimeArray1: null,
    // dateTime1: null,
    // startYear: 2000,
    // endYear: 2050,

    baseUrl:app.globalData.baseUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取完整的年月日 时分秒，以及默认显示的数组
    // var obj = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    // var obj1 = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    // 精确到分的处理，将数组的秒去掉
    // var lastArray = obj1.dateTimeArray.pop();
    // var lastTime = obj1.dateTime.pop();

    // this.setData({
    //   dateTime: obj.dateTime,
    //   dateTimeArray: obj.dateTimeArray,
    //   dateTimeArray1: obj1.dateTimeArray,
    //   dateTime1: obj1.dateTime
    // });
  },

// 获取头部图片接口
getPhotos(){
  util.request(app.globalData._server + '/weixin/guimi/getPoster', { TYPE: '4' }, 'POST')
    .then(res => {
      this.setData({
        imgUrl: res.poster.IMG_URL
      })
    })
},

  // 获取用餐地址
  getAddress(PARENT_ID) {
    util.request(app.globalData._server + '/weixin/guimi/findCustomerOrderSet', { PARENT_ID: PARENT_ID }, 'POST')
      .then(res => {
        var address=[]
        res.list.forEach(key=>{
            address.push(key.VALUE_NAME)
        })
        this.setData({
          list:res.list,
          address:address
        })
      })
  },


  // 点击填写显示input框
  fillIn(){
    let that = this;
    that.setData({
      toggle:false
    })
  },
  fillInWX() {
    let that = this;
    that.setData({
      toggleWx: false
    })
  },

  // 选择用餐地址
  addressChange(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    util.request(app.globalData._server + '/weixin/guimi/findCustomerOrderSet', { PARENT_ID: this.data.list[e.detail.value].GUIMI_CUSTOMIZED_ORDER_SET_ID }, 'POST')
      .then(res => {
        var array = []
        res.list.forEach(key=>{
          array.push(key.VALUE_NAME)
        })
        this.setData({
          xiabiao: e.detail.value,
          arrayList:res.list,
          array: array,
          addresss: this.data.address[e.detail.value]
        })
      })
    
  },
  // 场景需求
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    util.request(app.globalData._server + '/weixin/guimi/findCustomerOrderSet', { PARENT_ID: this.data.arrayList[e.detail.value].GUIMI_CUSTOMIZED_ORDER_SET_ID }, 'POST')
      .then(res => {
        var multiArray=[];
        res.list.forEach(key=>{
          multiArray.push(key.VALUE_NAME)
        })
        this.setData({
          index:e.detail.value,
          sceneList:res.list,
          multiArray: multiArray,
          scene: this.data.array[e.detail.value],
        })
        if (this.data.duoshe == true){
            this.setData({
              duoshe:false
            })
        }
      })
  },
  pinckerChange(e){
    wx.showToast({
      title: '请先选择用餐地址',
      icon:'none'
    });
  },
  // 用餐预算
 Change: function (e) {
    this.setData({
      ind: e.detail.value,
      budgetary: this.data.multiArray[e.detail.value]
    })
  },
  feiyongChange(){
    wx.showToast({
      title: '请先选择用餐场景',
      icon: 'none'
    });
  },
  // 选择用餐时间
  // changeDateTime1(e) {
    // this.setData({ dateTime1: e.detail.value });
    // var dateTime1 = e.detail.value;
    // var dateTime0 = dateTime1[0]
    // var dateTime2 = dateTime1[1]
    // var dateTime3 = dateTime1[2]
    // var dateTime4 = dateTime1[3]
    // var dateTime5 = dateTime1[4]
    
    // var timer = this.data.dateTimeArray1[0][dateTime0] + "-" + this.data.dateTimeArray1[1][dateTime2] + "-" + this.data.dateTimeArray1[2][dateTime3] + " " + this.data.dateTimeArray1[3][dateTime4] + ":" + this.data.dateTimeArray1[4][dateTime5]
    // this.setData({
    //   timer : timer
    // })
  // },
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  // 点击提交获取内容
  formSubmit(e){
    const addresss = this.data.addresss;
    const scene = this.data.scene;
    const budgetary = this.data.budgetary;
    const date = this.data.date;
    const phone = e.detail.value.phone;
    const wechat = e.detail.value.wechat;
    if (!addresss){
      wx.showToast({
        title: '请选择场用餐地址',
        icon: 'none'
      })
      return;
    }else if (!scene) {
      wx.showToast({
        title: '请选择场景需求',
        icon: 'none'
      })
      return;
    } else if (!budgetary) {
      wx.showToast({
        title: '请选择费用预算',
        icon: 'none'
      })
      return;
    } else if (!date) {
      wx.showToast({
        title: '请选择用餐时间',
        icon: 'none'
      })
      return;
    }else if (!phone) {
      wx.showToast({
        title: '请填写手机号码',
        icon: 'none'
      })
      return;
    }else if(phone){
      
        // /^ 1[345789]\d{ 9 } $ /
      if (!(/^1[0-9]{10}$/.test(phone))) {
        wx.showToast({
          title: '手机号码不正确',
          icon: 'none',
        })
        return;
      } else if (!wechat) {
        wx.showToast({
          title: '请填写微信号',
          icon: 'none'
        })
        return;
      } else {

      // }{
        util.request(app.globalData._server + '/weixin/guimi/customerOrder/save', {
          GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID,
          DINING_ADDRESS: addresss,
          BUDGET: budgetary,
          DINING_TIME: date,
          CONTACT_PHONE: phone,
          WECHAT: wechat,
          REQUIREMENTS: scene
        }, 'POST')
          .then(res => {
            if (res.msg == 'success') {
              wx.showModal({
                // title: '提示',
                content: '提交成功,客服人员会在12小时内联系您',
                cancelColor: '#5CAE32',
                confirmColor:'#5CAE32',
                success(res) {
                  if (res.confirm) {
                    wx.navigateBack({})
                  } else if (res.cancel) {
                    wx.navigateBack({})
                  }
                }
              })
            } else {
              wx.showToast({
                title: '提交失败',
                icon: 'none'
              })
            }
          })
      }
      
      
      
      //  if (!wechat) {
      //   wx.showToast({
      //     title: '请填写微信号',
      //     icon: 'none'
      //   })
      //   return;
      // } else {
      
      // }
    }
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
    this.getPhotos();
    this.getAddress(0);
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
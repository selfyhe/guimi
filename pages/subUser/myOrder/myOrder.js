// pages/subUser/myOrder/myOrder.js
const app = getApp();
const util = require('../../../common/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageTitle:'我的订单',
    status:0,
    orderItems: ['待付款', '待发货', '配送中', '待评价', '售后']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      status: Number(options.STATUS) || this.data.status
    })
    wx.setNavigationBarTitle({
      title: `${this.data.pageTitle}`,
    })
   
  },

  testTime(dateTimeStamp) {
    // var getDateDiff = function (dateTimeStamp) {
    var result;
    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var halfamonth = day * 15;
    var month = day * 30;
    // var now = getDate();//有些特殊 不能使用  new Date()
    var now = new Date().getTime();
    var diffValue = now - dateTimeStamp;
    if (diffValue < 0) { return; }
    var monthC = diffValue / month;
    var weekC = diffValue / (7 * day);
    var dayC = diffValue / day;
    var hourC = diffValue / hour;
    var minC = diffValue / minute;
    // if (monthC >= 1) {
    //   result = "" + parseInt(monthC) + "月前";
    // }
    // else if (weekC >= 1) {
    //   result = "" + parseInt(weekC) + "周前";
    // }
    // else 
    if (dayC >= 1) {
      // result = "" + parseInt(dayC) + "天前";
      result = "" + this.format(dateTimeStamp)
    }
    else if (hourC >= 1) {
      result = "" + parseInt(hourC) + "小时前";
    }
    else if (minC >= 1) {
      result = "" + parseInt(minC) + "分钟前";
    } else{
      result = "刚刚";
    }
    return result;
    // };//时间戳转化为几天前，几小时前，几分钟前
   
  },

add0(m){ return m < 10 ? '0' + m : m },
format(shijianchuo) {
    //shijianchuo是整数，否则要parseInt转换
    var time = new Date(shijianchuo);
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    return y + '-' + this.add0(m) + '-' + this.add0(d) + ' ' + this.add0(h) + ':' + this.add0(mm) + ':' + this.add0(s);
  },

  // 获取订单的接口
  orderList(STATUS){
     util.request(app.globalData._server + '/weixin/wxfindorder', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID, STATUS: STATUS }, 'POST')
      .then(res => {
        // var dingzhi={},
        if (res.data == ''){
          this.setData({
            orderList: res.data
          })
        } else{
          res.data.forEach(item => item.xianshi = true)
          res.data.forEach(item => item.totalPrice ='')
          res.data.forEach(item => item.num = '')
          res.data.forEach(item => item.dingzhi =[])
          res.data.forEach(item => item.timestamp = [])

          var isTimestamp = []
          res.data.forEach(key => {
           
            var isTime = new Date(key.CREATE_DATE.replace(/-/g, "/")).getTime();
            // console.log(isTime,'转化后的时间戳')
            isTimestamp.push(isTime);
            this.setData({
              isTimestamp: isTimestamp
            })
           this.data.isTimestamp.forEach(time => {
              var rusltTime = this.testTime(time);
          
             key.timestamp = rusltTime
           })
         
            if (key.wxfindorderitemDatas == '') {
              key.xianshi = !key.xianshi;
              this.setData({
                orderList: res.data
              })
            }else{
              if (key.wxfindorderitemDatas.length>3){
                // 截取数组前面三条数据
                var wxfindorderitemDatas = key.wxfindorderitemDatas.slice(1, 4);
                key.dingzhi = wxfindorderitemDatas
              }else{
                key.dingzhi = key.wxfindorderitemDatas
              }
              key.xianshi = key.xianshi;
              var num = 0;
              key.num = key.wxfindorderitemDatas.length
              this.setData({
                orderList: res.data
              })
            }
            // 将支付方式传到订单详情页面
            // this.setData({
            //   paytype: key.PAY_TYPE,
            // })
            // console.log(key.PAY_TYPE,'zhifu支付的方式')
          })
        }
      })
  },
  // 获取订单详情的接口
  orderDetails() {
    util.request(app.globalData._server + '/weixin/wxfindorderitem', {
      GUIMI_ORDER_ID: this.data.GUIMI_ORDER_ID
    }, 'POST')
      .then(res => {
        var totalPrice = 0;
        // 商品详情里计算实付金额
        res.data.forEach(key => {
          totalPrice += key.NUM * key.PRICE
        })
        this.setData({
          orderList: res.data,
          totalPrice: totalPrice
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
    this.orderList(this.data.status);
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
  handleItemsClick(e){
    const index  = e.currentTarget.dataset.index;
    this.setData({
      status:index,
    })
    this.orderList(index)
  },
  handleOrderClick(e){
    const orderid = e.currentTarget.dataset.orderid;
    const storid = e.currentTarget.dataset.storid;
    const index = e.currentTarget.dataset.index;
    const payment = e.currentTarget.dataset.payment
    const statusOrder = e.currentTarget.dataset.status;
    const discount = e.currentTarget.dataset.discount;
    const paytype = this.data.orderList[index].PAY_TYPE;
    const DELIVERY_FEE = this.data.orderList[index].DELIVERY_FEE;
    wx.navigateTo({
      url: '/pages/subUser/myOrder/orderDetail?orderid=' + orderid + '&storid=' + storid + '&status=' + statusOrder + '&paytype=' + paytype + '&payment=' + payment + '&discount=' + discount + '&delivery=' + DELIVERY_FEE +'&cation='+2,
    })
  }
})
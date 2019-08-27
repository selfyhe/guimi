// pages/subUser/myWallet/myWallet.js
var MD5Util = require('../../../common/md5')
const app = getApp();
const util = require('../../../common/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    visible:false,
    popupShow:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMoney();
    util.request(app.globalData._server + '/weixin/wxfindrechargeaction', {}, 'POST')
      .then(res => {
        console.log(res,'充值活动中心')
        this.setData({
          activeList: res.data
        })
      })
  },
  // 获取余额的钱
  getMoney() {
     util.request(app.globalData._server + '/weixin/wxfindusermoney', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID}, 'POST')
      .then(res => {
        this.setData({
          money: res.data.BALANCE
        })
      })
  },
  // 活动规则
  activeRule () {
    util.request(app.globalData._server + '/weixin/guimi/getActivityDescriptByType', {TYPE: "0"}, 'POST')
      .then(res => {
        console.log(res.data.CONTENT,'活动规则')
        this.setData({
          activeRule: res.data.CONTENT.slice(0, res.data.CONTENT.length - 1)
        })
        var rule = []
        rule = this.data.activeRule.split("\r\n");
        for (var i = 0; i < rule.length; i++) {
          if (rule[i] == '') {
            rule.splice(i, 1)
            this.setData({
              rule: rule
            })
          } else {
            this.setData({
              rule: rule
            })
          }
        }

        var ruleList = this.data.rule;
        var ruleIndex = []
        var one = {};
        for (var i = 0; i < ruleList.length; i++) {
          var resultrule = ruleList[i].replace(/(^\s*)|(\s*$)/g, "").substr(1);
          ruleIndex.push({ item: resultrule, index: ruleList[i].replace(/(^\s*)|(\s*$)/g, "").slice(0, 1) });
        }
        this.setData({
          ruleIndex: ruleIndex
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
    this.activeRule();
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
  handleNavigator(e) {
    const { url } = e.currentTarget.dataset
    // tab页,wx.navigateTo失效
    if (url.includes('index') || url.includes('menu') || url.includes('shopCart') || url.includes('user')) {
      wx.reLaunch({
        url: `${url}`,
      })
    } else {
      wx.navigateTo({
        url: `${url}`,
      })
    } 
  },
  handleRulesClick(){
    this.setData({
      popupShow:true,
    })
  },
  // handleClose(){
  //   this.setData({
  //     visible: false,
  //   })
  // },
  handleRedbaoClose(){
    this.setData({
      popupShow: false,
    })
  },
  handleCardTopup(e){
    const index = e.currentTarget.dataset.index;
    const BALANCE = this.data.activeList[index].REACH_AMOUNT
    const GUIMI_RECHARGE_ACTION_ID = this.data.activeList[index].GUIMI_RECHARGE_ACTION_ID
   
    util.request(app.globalData._server + '/weixin/guimi/getRechargePrepay', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID, GUIMI_RECHARGE_ACTION_ID: GUIMI_RECHARGE_ACTION_ID, openId: app.globalData.openid, appId: app.globalData.appid}, 'POST')
      .then(res => {
        console.log(res,res.msg,'充值的返回')
        if(res.msg == 'success'){
          console.log(res,'返回来的数据')
          // 随机串  数据包
          const { nonceStr, paySign, timeStamp, prepayId } = res.prepay
          // const nonceStr = res.nonceStr;
          // const prepayId = res.prepayId;
         
          // const timestamp = String(Date.parse(new Date()));
          // // 按照字段首字母排序组成新字符串
          // let payDataA = "appId=" + app.globalData.appid + "&nonceStr=" + nonceStr + "&package=prepay_id=" + prepayId + "&signType=MD5&timeStamp=" + timestamp + "&key=" + app.globalData.pay_secret;
          // // 使用MD5加密算法计算加密字符串
          // const paySign = MD5Util.MD5(payDataA).toUpperCase()
          wx.requestPayment({
            timeStamp: timeStamp,
            nonceStr: nonceStr,
            package: `prepay_id=${prepayId}`,
            signType: 'MD5',
            paySign: paySign,
            success: res => {
              console.log('微信支付成功', res)
              wx.showToast({ icon: 'success', title: '支付成功' });
              this.getMoney();
              // resolve(res)
            },
            fail: err => {
              console.log('微信支付失败', err)
              if (err.errMsg === 'requestPayment:fail cancel') {
                wx.showToast({ icon: 'none', title: '手动取消支付' })
              } else {
                wx.showToast({ icon: 'none', title: err.err_desc || err.errMsg })
              }
              // reject(err)
            }
          })
        }else{
         wx.showToast({
           title: '支付失败',
           icon:'none'
         })
        }
      })
      .catch(err => {
        console.log('微信预支付', err)
      })
  },
})
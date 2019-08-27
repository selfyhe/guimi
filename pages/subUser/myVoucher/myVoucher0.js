const app = getApp();
const util = require('../../../common/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: app.globalData.baseUrl, 
    types: ['寿司', '饭类', '产品'],
    origTypes: ['优惠券', '红包券', '新人礼包', '邀请奖励', '下单分享', '充值赠送'],  // 来源类型（0优惠券1红包券2新人红包3邀请红包4下单裂变红包5充值赠送红包） 
    list: [],
    pageTitle: '我的优惠券',
    checked:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const prevRoute = getCurrentPages().length > 1 ? getCurrentPages()[getCurrentPages().length - 2].route : ''
    this.setData({
      isChoose: prevRoute.includes('orderConfirm/orderConfirm')
    })
    if (this.data.isChoose){
      this.findUsableCoupon()
    }else{
      this.coupons()
    }
  }, 
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  findUsableCoupon() {
    // 获取可用于当前订单的商品券
    util.request(app.globalData._server + '/weixin/guimi/findUsableCoupon', {
      GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID
    }, 'POST')
      .then(res => {
        wx.setNavigationBarTitle({ title: `可用优惠券`, })
        res.couponList.forEach(item =>item.checked = false)
        // 高亮选中的优惠券
        const prevPage = getCurrentPages()[getCurrentPages().length - 2];  //上一个页面
        prevPage.data.userCoupon.GUIMI_USER_COUPON_ID && res.couponList.forEach((coupon, index) => {
          if (coupon.GUIMI_USER_COUPON_ID == prevPage.data.userCoupon.GUIMI_USER_COUPON_ID) {
            coupon.checked = true
          }
        })
        this.setData({
          list: res.couponList
        })
      })
  },
  coupons() { 
    // 获取优惠券
    util.request(app.globalData._server + '/weixin/guimi/listUserCoupons', {
        GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID
      }, 'POST')
      .then(res => { 
        wx.setNavigationBarTitle({ title: `${this.data.pageTitle}`, })
        this.setData({
          list: res.userCoupons
        }) 
      })
  },
  handleCardClick(e){
    const index = e.currentTarget.dataset.index
    const currentCoupon = this.data.list[index]
    let prevPage = getCurrentPages()[getCurrentPages().length - 2];  //上一个页面
    const money = parseFloat(prevPage.data.goodsMoney + prevPage.data.packageMoney) // 原价(优惠券需要用到)
    console.log('原价', money)
    if (money < Number(currentCoupon.REACH_PRICE)){
      wx.showToast({icon: 'none',title: '金额未达到满减条件',})
      return false
    }
    // this.data.list.forEach(item=> item.checked = false)
    this.data.list.forEach((item,idx) => {
      if (idx === index){
        this.data.list[idx].checked = !this.data.list[idx].checked
      }else{
        this.data.list[idx].checked = false
      }
    })
    this.setData({
      list: this.data.list
    })
  },
  handleVoucherSave() { 
    const prevPage = getCurrentPages()[getCurrentPages().length - 2];  //上一个页面
    const currentCoupon = this.data.list.find(item => item.checked) || {}
    // youhuijine: currentCoupon.WORTH 
    prevPage.setData({
      userCoupon: currentCoupon
    })
    prevPage.totalPrice()
    wx.navigateBack({})
  },
  handleEmptyClick(e) {

  },
  bindRadioChange() {
    this.setData({
      checked: !this.data.checked
    })
  },
  
})
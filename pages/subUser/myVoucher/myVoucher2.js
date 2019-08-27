const app = getApp();
const util = require('../../../common/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: app.globalData.baseUrl,
    pageTitle: '我的商品劵',
    voucherCurrent: 0,
    voucherItems: ['优惠券', '红包劵', '商品劵'],
    types: ['寿司', '饭', '全部'],
    list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // const prevRoute = getCurrentPages().length>1 ? getCurrentPages()[getCurrentPages().length - 2].route : ''
    // this.setData({
    //   isChoose: prevRoute.includes('orderConfirm/orderConfirm')
    // })
    wx.setNavigationBarTitle({ title: `${this.data.pageTitle}` })
    this.proudctCoupons()
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
  handleCardClick(e) {
    const index = e.currentTarget.dataset.index
    if (!app.globalData.store.GUIMI_STORE_ID) {
      wx.showModal({
        // title: '提示',
        content: '请先前往菜单页，确认配送门店',
        showCancel: false,
        confirmText: '立即前往',
        confirmColor: '#5CAE32',
        success: res => {
          if (res.confirm) {
            wx.reLaunch({
              url: '/pages/tab/menu/menu',
            })
          }
        }
      })
      return false
    }
    this.data.list.forEach((item, idx) => {
      if (idx === index) {
        this.setData({
          [`list[${idx}].checked`]: this.data.list[idx].checked ? 0 : 1
        })
      } else {
        this.setData({
          [`list[${idx}].checked`]: 0
        })
      }
    })
    this.updateProductCouponCheck(this.data.list[index].GUIMI_USER_COUPON_ID, this.data.list[index].checked)
  },
  handleEmptyClick(e) {

  },
  handleVoucherSave() {
    // const goodsCoups = this.data.list.filter(item => item.checked)
    // const PRODUCT_COUPONS = goodsCoups.map(item => item.GUIMI_USER_COUPON_ID).join(',')
    // const PRODUCT_COUPONS = this.data.list.find(item => item.checked) || {} 
    // 从确认订单页来添加到订单 else 打开商品券页面添加到购物车 
    const prevRoute = getCurrentPages().length > 1 ? getCurrentPages()[getCurrentPages().length - 2].route : ''
    if (prevRoute.includes('orderConfirm/orderConfirm')) {
      const prevPage = getCurrentPages()[getCurrentPages().length - 2];  //上一个页面 
      prevPage.findUserShoppingcart(() => {
        prevPage.calcGoodsMoney()
        prevPage.calcPackageMoney()
        prevPage.calcDeliveryMoney()
        prevPage.calcDiscountMoney()
        prevPage.totalPrice()
        wx.navigateBack({})
      })
    } else {
      // util.toast('加入购物车成功')
      wx.reLaunch({
        url: '/pages/tab/shopCart/shopCart',
      })
    }
  },
  updateProductCouponCheck(couponId, checked, callback) {
    wx.showLoading({ title: '加载中', mask: true })
    util.request(app.globalData._server + '/weixin/guimi/updateProductCouponCheck', {
      GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID,
      GUIMI_USER_COUPON_ID: couponId,
      checked: checked
    }, 'POST')
      .then(res => {
        if (res.msg == 'success') {
          wx.hideLoading()
        } else {
          util.toast(res.more || res.msg)
        }
      })
  },
  proudctCoupons() {
    // 获取商品券 
    util.request(app.globalData._server + '/weixin/guimi/listUserProductCoupons', {
      GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID
    }, 'POST')
      .then(res => {
        this.setData({
          list: res.productCoupons
        })
        // if (res.productCoupons.length){
        //   // res.productCoupons.forEach(item => item.checked = false )
        //   // 高亮选中的商品券
        //   // const prevRoute = getCurrentPages().length > 1 ? getCurrentPages()[getCurrentPages().length - 2].route : ''
        //   // if (prevRoute.includes('orderConfirm/orderConfirm')) {
        //   //   const prevPage = getCurrentPages()[getCurrentPages().length - 2];  //上一个页面
        //   //   prevPage.data.productCoupon.GUIMI_USER_COUPON_ID && res.userCoupons.forEach((coupon, index) => {
        //   //     if (coupon.GUIMI_USER_COUPON_ID == prevPage.data.productCoupon.GUIMI_USER_COUPON_ID) {
        //   //       coupon.checked = true
        //   //     }
        //   //   })
        //   // }
        //   this.setData({
        //     list: res.productCoupons
        //   })
        // }

      })
  },
})
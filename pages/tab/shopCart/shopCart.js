// pages/tab/shopCart/shopCart.js
const app = getApp()
const util = require('../../../common/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: app.globalData.baseUrl,
    delBtnWidth: 180,
    startX: 0,
    list: [],
    store: {},
    deliveryFee: {}
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
    if (!app.globalData.userInfo.USERLIST_ID) {
      console.log('首次进入小程序无app.globalData.userInfo.USERLIST_ID')
      return false
    }
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
    // getStoreByPosition
    const store = app.globalData.store
    this.setData({
      store: store,
      deliveryFee: { ...store.areaDetail }
    })
    this.uncheckProducts(store.areaDetail.GUIMI_ORDER_SET_ID, () => {
      this.findUserShoppingcart()
    })
    this.getUserInfo()

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
  totalPrice() {
    // 包装费,配送费不计入合计
    console.log('计算价格')
    let list = this.data.list
    let totalPrice = 0, packageMoney = 0, goodsMoney = 0
    list.forEach(item => { item.checked && (packageMoney += parseFloat(item.PACKAGE_PRICE)) })  // 包装费
    list.forEach(item => { item.checked && (goodsMoney += parseFloat(item.PRICE) * item.NUM) }) // 商品总价
    packageMoney = parseFloat(packageMoney.toFixed(2)); //js浮点计算bug，取两位小数精度
    goodsMoney = parseFloat(goodsMoney.toFixed(2)); //js浮点计算bug，取两位小数精度
    this.setData({
      packageMoney: packageMoney,
      goodsMoney: goodsMoney,
      totalPrice: goodsMoney,
    })
    this.calcDeliveryMoney()
  },
  calcDeliveryMoney() {
    console.log('计算配送费')
    // 计算配送费
    // this.data.deliveryFee
    let goodsMoney = this.data.goodsMoney
    let deliveryMoneydiff = 0, deliveryMoney = Number(this.data.deliveryFee.DISTRIBUTION_FEE), deliveryPrice = Number(this.data.deliveryFee.DELIVERY_PRICE)
    if (goodsMoney < deliveryPrice) {
      deliveryMoneydiff = deliveryPrice - goodsMoney
      deliveryMoneydiff = parseFloat(deliveryMoneydiff.toFixed(2)); //js浮点计算bug，取两位小数精度
      this.setData({
        deliveryMoney: deliveryMoney,
        deliveryMoneydiff: deliveryMoneydiff
      })
    } else {
      // 免运费
      this.setData({
        deliveryMoney: 0,
        deliveryMoneydiff: 0
      })
    }
  },
  touchS(e) {
    if (e.touches.length == 1) {
      this.setData({
        //设置触摸起始点水平方向位置
        startX: e.touches[0].clientX
      });
    }
  },
  touchM: function (e) {
    if (e.touches.length == 1) {
      //手指移动时水平方向位置
      var moveX = e.touches[0].clientX;
      //手指起始点位置与移动期间的差值
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var txtStyle = "";
      if (disX == 0 || disX < 0) {//如果移动距离小于等于0，说明向右滑动，文本层位置不变
        txtStyle = "left:0px";
      } else if (disX > 0) {//移动距离大于0，文本层left值等于手指移动距离
        txtStyle = "left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          //控制手指移动距离最大值为删除按钮的宽度
          txtStyle = "left:-" + delBtnWidth + "px";
        }
      } else if (90 > disX > 0) {//移动距离大于0小于删除按钮宽度，文本层left值等于钮宽度
        txtStyle = "left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          //控制手指移动距离最大值为删除按钮的宽度
          txtStyle = "left:-" + 90 + "px";
        }
      }
      //获取手指触摸的是哪一项
      var index = e.currentTarget.dataset.index;
      var list = this.data.list;
      list[index].txtStyle = txtStyle;
      //更新列表的状态
      this.setData({
        list: list
      });
    }
  },
  touchE: function (e) {
    if (e.changedTouches.length == 1) {
      //手指移动结束后水平位置
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var txtStyle = disX > delBtnWidth / 2 ? "left:-" + 90 + "px" : "left:0px";
      //获取手指触摸的是哪一项
      var index = e.currentTarget.dataset.index;
      var list = this.data.list;
      list[index].txtStyle = txtStyle;
      //更新列表的状态
      this.setData({
        list: list
      });
    }
  },
  handleGoodDel(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ goodsCurrent: index })

    if (this.data.list[index].TYPE == 0) {
      this.wxdelShoppingcart()
    } else {
      wx.showLoading({ title: '加载中', mask: true })
      util.request(app.globalData._server + '/weixin/guimi/updateProductCouponCheck', {
        GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID,
        GUIMI_USER_COUPON_ID: this.data.list[index].GUIMI_USER_COUPON_ID,
        checked: 0
      }, 'POST')
        .then(res => {
          if (res.msg == 'success') {
            wx.hideLoading()
            this.data.list.splice(index, 1)
            this.setData({
              list: this.data.list
            })
            this.totalPrice()
            this.totalShopCartNum()
          } else {
            util.toast(res.more || res.msg)
          }
        })
    }
  },
  handleNumberChange(e) {
    const index = e.currentTarget.dataset.index
    const num = e.detail.value
    this.setData({ goodsCurrent: index })
    console.log('handleNumberChange', num)
    if (num == 0) {
      this.handleDialogOpen()
    } else {
      this.setData({
        [`list[${index}].NUM`]: num
      })
      this.totalPrice()
      this.wxeditShoppingcart(this.data.list[index].GUIMI_SHOPPINGCART_ID, num)
      this.totalShopCartNum()
    }


  },
  handleDialogGoodDel() {
    this.wxdelShoppingcart()
  },
  handleDialogClose() {
    this.setData({
      visible: false
    })
  },
  handleDialogOpen() {
    this.setData({
      visible: true
    })
  },
  handleCheckedClick(e) {
    const index = e.currentTarget.dataset.index
    const checked = this.data.list[index].checked ? 0 : 1
    this.setData({
      [`list[${index}].checked`]: checked
    })
    this.updateShoppingcartChecked(this.data.list[index].GUIMI_SHOPPINGCART_ID, checked)
    this.totalPrice()
  },
  handlePayClick(e) {
    wx.navigateTo({
      url: `/pages/orderConfirm/orderConfirm`,
    })
  },
  totalShopCartNum() {
    // 购物车badge 在tabbar页面中才会生效
    if (this.data.list.length) {
      let total = 0
      this.data.list.forEach(item => total += item.NUM)
      wx.setTabBarBadge({ index: 2, text: `${total}` })
    } else {
      wx.removeTabBarBadge({ index: 2 })
    }
  },
  updateShoppingcartChecked(GUIMI_SHOPPINGCART_ID, checked) {
    wx.showLoading({ title: '加载中', mask: true })
    util.request(app.globalData._server + '/weixin/guimi/updateShoppingcartChecked', { GUIMI_SHOPPINGCART_ID, checked }, 'POST')
      .then(res => {
        if (res.msg == 'success') {
          wx.hideLoading()
        } else {
          util.toast(res.more)
        }
      })
  },
  wxeditShoppingcart(GUIMI_SHOPPINGCART_ID, NUM) {
    wx.showLoading({ title: '加载中', mask: true })
    util.request(app.globalData._server + '/weixin/guimi/editShoppingcart', { GUIMI_SHOPPINGCART_ID, NUM }, 'POST')
      .then(res => {
        if (res.msg == 'success') {
          wx.hideLoading()
        } else {
          util.toast(res.more)
        }
      })
  },
  wxdelShoppingcart() {
    const index = this.data.goodsCurrent
    const GUIMI_SHOPPINGCART_ID = this.data.list[index].GUIMI_SHOPPINGCART_ID
    util.request(app.globalData._server + '/weixin/guimi/delShoppingcart', { GUIMI_SHOPPINGCART_ID }, 'POST')
      .then(res => {
        if (res.msg == 'success') {
          this.handleDialogClose()
          this.data.list.splice(index, 1)
          this.setData({
            list: this.data.list
          })
          this.totalPrice()
          this.totalShopCartNum()
        } else {
          util.toast(res.more)
        }
      })
  },
  findUserShoppingcart() {
    util.request(app.globalData._server + '/weixin/guimi/findUserShoppingcart', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {
        const list = res.cartList
        const checkProductCoupon = res.checkProductCoupon
        checkProductCoupon && list.unshift(checkProductCoupon)
        this.setData({
          list: list,
        })
        this.totalShopCartNum()
        this.totalPrice()
      })
  },
  getUserInfo() {
    util.request(app.globalData._server + '/weixin/guimi/getUserInfo', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {
        this.setData({
          userInfo: res.userInfo
        })
      })
  },
  getPhoneNumber(e) {
    if (e.detail.encryptedData) {
      // 允许授权成功
      wx.showLoading({ title: '加载中', mask: true })
      util.request(app.globalData._server + '/weixin/guimi/getWxLexPhone', {
        GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID,
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
        session_key: app.globalData.session_key
      }, 'POST')
        .then(res => {
          wx.hideLoading()
          if (res.msg == 'success') {
            console.log('绑定手机号码成功')
            this.setData({
              'userInfo.MOBILE': '绑定手机号码成功'
            })
            this.handlePayClick()
          } else {
            util.toast(res.more || res.msg)
          }
        })
    } else {
      // 拒绝授权fail
      wx.showModal({
        title: '授权失败',
        showCancel: false,
        content: '授权失败，你可能部份功能无法使用'
      })
    }
  },
  uncheckProducts(GUIMI_ORDER_SET_ID, callback) {
    // 检查不能配送的商品(饭类),删掉
    util.request(app.globalData._server + '/weixin/guimi/uncheckProducts', { GUIMI_ORDER_SET_ID: GUIMI_ORDER_SET_ID, GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {
        if (res.msg == 'success') {
          // util.toast('Loading')
        } else {
          util.toast(res.more || res.msg)
        }
        callback()
      })
  },
})
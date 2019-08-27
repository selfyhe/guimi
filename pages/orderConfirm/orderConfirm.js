// pages/orderConfirm/orderConfirm.js
const app = getApp()
const util = require('../../common/util.js')
const wxpay = require('../../common/pay.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: app.globalData.baseUrl,
    serviceTimeArray: [[],[]],
    serviceTimeCurrent:[0,0],
    address:{},
    list:[],
    REMARKS:'',
    PAY_TYPE: 1, // 默认微信支付
    checked:false, // 默认微信支付
    youhuijine:0,
    money:0, // 余额
    balanceMoney:0, // 余额支付  
    userCoupon: {},  // 当前优惠券
    userCoupons: [], // 获取可用优惠券列表
    productCoupon: {}, // 当前优惠券
    productCoupons: [], // 商品券列表 
    guimiOrderId:'',
    deliveryTime:{
      title: '请选择送达时间',
      time: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(this.route, options)
    this.getMoney()
    this.findMyAddress()
    this.findUserShoppingcart(()=>{
      this.findUserOrder(()=>{
        this.calcGoodsMoney()
        this.calcPackageMoney()
        this.calcDeliveryMoney() // 计算配送费
        this.calcDiscountMoney() // 计算优惠折扣金额
        this.totalPrice() // 合计
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
  onShow: function (options) { 
    
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
  handleCoupsExchange(){
    wx.navigateTo({
      url: '/pages/subUser/myVoucher/myVoucher0',
    })
  },
  handleGoodsCoupsExchange(){
    wx.navigateTo({
      url: '/pages/subUser/myVoucher/myVoucher2',
    })
  },
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      serviceTimeCurrent: e.detail.value
    })
    this.setDeliveryTime() 
  },
  bindMultiPickerColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    const data = {
      serviceTimeArray: this.data.serviceTimeArray,
      serviceTimeCurrent: this.data.serviceTimeCurrent,
    } 
    data.serviceTimeCurrent[e.detail.column] = e.detail.value
    switch (e.detail.column) {
      case 0: 
        if (data.serviceTimeCurrent[0] == 0) {
          data.serviceTimeArray[1] = this.data.serviceTimeArray0
          
        } else {
          data.serviceTimeArray[1] = this.data.timeArray
        }
        break
      case 1:
        if (data.serviceTimeCurrent[0] == 0){
          data.serviceTimeArray[1] = this.data.serviceTimeArray0
        }else{
          data.serviceTimeArray[1] = this.data.timeArray
        }
        break
    }
    this.setData(data)
    this.setDeliveryTime()
  },
  getDay(day){
    let today = new Date()
    let targetday = today.getTime() + 1000 * 60 * 60 * 24 * day
    return targetday
  },
  getHours(hour) {
    // timestamp
    let today = new Date()
    let targehour = today.setHours(12,0) + 1000 * 60 * 30 * hour
    return targehour
  },
  setDeliveryTime(){
    // 'yyyy-MM-dd hh:mm'
    const date = this.data.serviceTimeArray[0][this.data.serviceTimeCurrent[0]].title
    const hour = `${new Date(this.data.serviceTimeArray[1][this.data.serviceTimeCurrent[1]].timestamp).format('hh:mm')}`
    const deliveryTime = {
      title:'请选择送达时间',
      time: `${date} ${hour}`
    }
    this.setData({
      deliveryTime: deliveryTime
    })
  },
  getServiceTime(){
    const dayArray = Array.from({ length: 7 }, (v, i) => ({ title: new Date(this.getDay(i)).format('yyyy-MM-dd'), timestamp: this.getDay(i) }))
      const timeArray = Array.from({ length: 19 }, (v, i) => ({ title: `${new Date(this.getHours(i)).format('hh:mm')}前送达`, timestamp: this.getHours(i) }))
      const time = Array.from({ length: 19 }, (v, i) => ({ title: `${new Date(this.getHours(i)).format('hh:mm')}前送达`, timestamp: this.getHours(i) }))
      const nowDate = new Date()
    // 早上10点 晚上7点
    // const nowDate = new Date('2019-06-27 19:01:00')
      // const arrivalTimestamp = nowDate.getTime() + 1000 * 60 * 60 // 送达时间
      // this.data.store.areaDetail.SERVICE_TIME 门店配送时间
    // const shouwsi = this.data.list.findIndex(item => item.PRODUCT_TYPE == 0) // 0寿司1饭
    const SERVICE_TIME = Math.floor(this.data.store.areaDetail.SERVICE_TIME * 60 * 1000)  //毫秒
    const arrivalTimestamp = nowDate.getTime() + SERVICE_TIME // 送达时间
      let min, current = 0, min2, current2 = 0, flag = true
      current = dayArray.findIndex(item => item.title == nowDate.format('yyyy-MM-dd'))
      // 配送时间不在timeArray范围,处理
      arrivalTimestamp <= time[0].timestamp && (current2 = 0, current = current, flag = false)
    arrivalTimestamp >= time[time.length - 1].timestamp && (current2 = 0, current = current, flag = false, dayArray.splice(0, 1))
      // 配送时间在timeArray范围,处理
      if(flag) {
      for (let i = 0; i < time.length; i++) {
        if (arrivalTimestamp < time[i].timestamp && arrivalTimestamp > time[i - 1].timestamp) {
          time.splice(i, 0, { title: `尽快送达(大约${new Date(arrivalTimestamp).format('hh:mm')}送达)`, timestamp: arrivalTimestamp })
          time.splice(0, i)
          current2 = 0, current = current
        }
      }
    }

      // if (current2 === undefined){
      //   // 配送时间不在timeArray范围,未作处理
      //   wx.showModal({
      //     title: '提示',
      //     content: '门店还未开始营业或已经打烊',
      //     showCancel:false,
      //     success: res => {
      //       if (res.confirm) {
      //         wx.reLaunch({
      //           url: '/pages/tab/index/index',
      //         })
      //       }
      //     }
      //   })
      //   return false
      // }
      // console.log(day, time) //送达时间日期,时间数据
      this.setData({
      serviceTimeArray0: time,
      dayArray: dayArray,
      timeArray: timeArray,
      serviceTimeArray: [dayArray, time],
      serviceTimeCurrent: [current, current2]
    })
  },
  calcGoodsMoney(){
    // 计算商品金额
    let list = this.data.list
    let goodsMoney = 0
    list.forEach(item => { goodsMoney += parseFloat(item.PRICE) * item.NUM })
    goodsMoney = parseFloat(goodsMoney.toFixed(2)); //js浮点计算bug，取两位小数精度
    this.setData({
      goodsMoney: goodsMoney
    })
  },
  calcPackageMoney(){
    // 计算包装费
    let list = this.data.list
    let packageMoney = 0
    list.forEach(item => { packageMoney += parseFloat(item.PACKAGE_PRICE) * item.NUM })
    packageMoney = parseFloat(packageMoney.toFixed(2)); // js浮点计算bug，取两位小数精度
    this.setData({
      packageMoney: packageMoney
    })
  },
  calcDeliveryMoney() {
    console.log('计算配送费')
    // 计算配送费
    // 与购物车保持一致
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
  calcDiscountMoney() {
    // 计算优惠券满减金额
    if (this.data.userCoupons.length) {
      this.setData({
        userCoupon: this.data.userCoupons[0]
      })
    }
  },
  totalPrice() { 
    console.log('计算totalPrice')
    // 等待配送费,优惠金额查询请求完成
    let totalPrice = 0 
    // this.setData({ youhuijine: this.data.userCoupon.WORTH || 0 })// 优惠券减少金额
    let youhuijine = this.data.userCoupon.WORTH || 0 // 优惠金额
    totalPrice = this.data.goodsMoney + this.data.packageMoney + this.data.deliveryMoney - youhuijine
    totalPrice = parseFloat(totalPrice.toFixed(2)); //js浮点计算bug，取两位小数精度
    this.setData({
      totalPrice: totalPrice > 0 ? totalPrice : 0,
    })
  },
  handlePayTypeChange(e){ 
    console.log('支付类型', e.detail.value ? 0 : 1)
    if (this.data.money < this.data.totalPrice){
      wx.showToast({
        title: '余额不足',
        icon: 'none'
      })
      this.setData({
        checked: false,
        PAY_TYPE: 1
      })
      return false
    }
    this.setData({
      checked: e.detail.value,
      PAY_TYPE: e.detail.value ? 0 : 1
    }) 
    // 计算余额支付费用 this.calcbalanceMoney()
    this.setData({
      balanceMoney: (this.data.checked && this.data.money >= this.data.totalPrice) ? this.data.totalPrice : 0
    })
  },
  handleRemakeAdd(e){
    wx.navigateTo({
      url: `/pages/subUser/myTaste/myTaste?REMARKS=${this.data.REMARKS}`,
    })
  },
  handleAddressChoose(){
    wx.navigateTo({
      url: `/pages/subUser/myAddress/myAddress`,
    })
  },
  wxsaveWeappFormid() {
    // 上传推送码
    let formIds = app.globalData.gloabalFomIds
    console.log('app.globalData.gloabalFomIds', formIds)
    if (formIds.length && formIds[0].formId !== 'the formId is a mock one') {
      app.globalData.gloabalFomIds = []  // 清空当前的gloabalFomIds
      util.request(app.globalData._server + '/weixin/guimi/wxsaveWeappFormid', {
        OPEN_ID: app.globalData.openid,
        formIdList: formIds,
      }, 'POST')
        .then(res => {
          console.log('wxsaveWeappFormid', res)
        })
    }
  },
  handlePayClick(e) {
    // 确认下单
    const CARTS = this.data.list.filter(item => item.GUIMI_SHOPPINGCART_ID).map(item => item.GUIMI_SHOPPINGCART_ID).join(',')
    if (!CARTS) {
      wx.showModal({
        // title: '提示',
        content: '兑换商品不可单独下单,请前往菜单页添加商品',
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
    if (!this.data.address.GUIMI_ADDRESS_ID) {
      util.toast('请填写收货地址')
      return false
    } 
    if (!this.data.deliveryTime.time){
      util.toast('请选择送达时间')
      return false
    }
    // 条件满足提交订单
    // const SERVICE_TIME = `${new Date(this.data.serviceTimeArray[1][this.data.serviceTimeCurrent[1]].timestamp).format('yyyy-MM-dd hh:mm')}`
    const params = {
      GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID,
      GUIMI_ADDRESS_ID: this.data.address.GUIMI_ADDRESS_ID,
      PAY_TYPE: this.data.PAY_TYPE, // 支付类型（0余额1微信）
      CARTS: CARTS, // 购物车商品ID集合
      GUIMI_STORE_ID: app.globalData.store.GUIMI_STORE_ID, // 门店ID
      REMARKS: this.data.REMARKS,
      SERVICE_TIME: this.data.deliveryTime.time, // 送达时间
      GUIMI_USER_COUPON_ID: this.data.userCoupon.GUIMI_USER_COUPON_ID, // 优惠券id
      PRODUCT_COUPONS: this.data.productCoupon.GUIMI_USER_COUPON_ID, // 商品券id集合  
      openId: app.globalData.openid, appId: app.globalData.appid,
      GUIMI_ORDER_SET_ID: this.data.deliveryFee.GUIMI_ORDER_SET_ID
    }
    wx.showLoading({ title: '等待支付', mask: true })
    util.request(app.globalData._server + '/weixin/guimi/submitOrder', params, 'POST')
      .then(res => {
        this.wxsaveWeappFormid()
        const guimiOrderId = res.orderId
        if (res.msg == 'success') { 
          // 余额结算 || 微信支付
          this.setData({
            guimiOrderId: res.orderId
          })
          console.log(res.orderId,'确认订单页面下单成功的res.orderId')
          
          if (this.data.PAY_TYPE == 0) {
            util.request(app.globalData._server + '/weixin/guimi/payOrderByBalance', { GUIMI_ORDER_ID: res.orderId, PAY_TYPE: '0' }, 'POST')
              .then(res => {
                wx.hideLoading()
                wx.showModal({
                  // title: '提示',
                  content: '支付成功',
                  showCancel: false,
                
                  confirmColor: '#5CAE32',
                  success: res => {
                    // this.sendredbao();
                    // url: `/pages/subUser/myOrder/orderDetail?GUIMI_ORDER_ID=${res.orderId}`,
                    // var discount = this.data.userCoupon.WORTH ? this.data.userCoupon.WORTH:0
                    if (res.confirm) {
                      // delivery 配送费  discount优惠金额  PAYMENT实付金额 paytype支付方式
                      // + '&cation=' + 1 + '&delivery=' + this.data.deliveryMoney + '&discount=' + discount + '&payment=' + this.data.totalPrice + '&paytype=' + this.data.PAY_TYPE + '&status=' + 10
                      wx.redirectTo({
                        url: '/pages/subUser/myOrder/orderDetail?orderid=' + this.data.guimiOrderId + '&cation=' + 1
                      })
                    }
                  }
                })
              })
          } else {
            this.setData({
              guimiOrderId: res.orderId
            })
           
            console.log(res.orderId, '确认订单页面下单成功的res.orderId 22');
            // url: `/pages/subUser/myOrder/orderDetail?GUIMI_ORDER_ID=${res.orderId}`,
            wxpay.wxpay({ orderId: res.orderId, orderType: '0' }).then(res => {
              wx.hideLoading() 
              wx.showModal({
                // title: '提示',
                content: '支付成功',
                showCancel: false,
                confirmColor: '#5CAE32',
                success: res => {
                  // this.sendredbao();
                  // + '&cation=' + 1 + '&delivery=' + this.data.deliveryMoney + '&discount=' + discount + '&payment=' + this.data.totalPrice + '&paytype=' + this.data.PAY_TYPE + '&status=' + 10

                  if (res.confirm) {
                    wx.redirectTo({
                      url: '/pages/subUser/myOrder/orderDetail?orderid=' + this.data.guimiOrderId + '&cation=' + 1
                      // url: '/pages/subUser/myOrder/orderDetail?orderid=' + this.data.guimiOrderId
                    })
                  }
                }
              })

            }).catch(err => {
              // console.log('err', err)
              // util.toast('支付失败')
              wx.hideLoading() 
              wx.showModal({
                // title: '提示',
                content: '支付失败',
                showCancel: false,
                confirmColor: '#5CAE32',
                success: res => {
                  if (res.confirm) {
                    wx.redirectTo({
                      url: '/pages/subUser/myOrder/myOrder?status=0',
                    })
                  }
                }
              })

            })
          }
        } else {
          util.toast(res.more || res.msg)
        }
      })
  },
  // 下单成功 发送  生成红包给后台
  // sendredbao(){
  //   util.request(app.globalData._server + '/weixin/guimi/generateOrderCoupon', { GUIMI_ORDER_ID: this.data.guimiOrderId}, 'POST')
  //     .then(res => {
  //       if(res.msg == 'success'){
  //         console.log('下单成功  生成红包成功', res)
  //       }else{
  //         console.log('下单成功  生成红包shibai', res)
  //       }
  //     })
  // },

  findUserShoppingcart(callback){
    // 用户勾选过商品
    if (!app.globalData.store.GUIMI_STORE_ID) {
      wx.showModal({
        // title: '提示',
        content: '请先前往菜单页，确认配送门店',
        showCancel: false,
        confirmText:'立即前往',
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
    util.request(app.globalData._server + '/weixin/guimi/findUserShoppingcart', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {
        // let productCoupon = {}
        // list.forEach(item => item.TYPE == 1 && (productCoupon = { GUIMI_USER_COUPON_ID: '已使用' }))
        const list = res.cartList.filter(item => item.checked)
        const checkProductCoupon = res.checkProductCoupon
        checkProductCoupon && list.unshift(checkProductCoupon)
        this.setData({
          list: list,
          productCoupon: checkProductCoupon || {}
        })
        this.getServiceTime()  // 送达时间
        callback()
      })
  },
  findUserOrder(callbak){
    // Promise.all
    const findUserShoppingcart = util.request(app.globalData._server + '/weixin/guimi/findUserShoppingcart', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
    const findUsableCoupon = util.request(app.globalData._server + '/weixin/guimi/findUsableCoupon', {
      GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID
    }, 'POST')
    const listUserProductCoupons = util.request(app.globalData._server + '/weixin/guimi/listUserProductCoupons', {
      GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID
    }, 'POST')
    // 
    Promise.all([findUserShoppingcart, findUsableCoupon, listUserProductCoupons])
      .then(resultList =>{
        console.log(resultList)
        for (let i = 0; i < resultList.length;i++){
          if (i == 0) {
            // this.setData({
            //   address: resultList[0].address
            // })
            // 应该是查找定位坐标最近的地址
            // this.setData({
            //   address: {}
            // })
            
          }
          if (i == 1) { 
            this.setData({
              userCoupons: resultList[1].couponList
            })
          }
          if (i == 2) {
            this.setData({
              productCoupons: resultList[2].productCoupons
            })
          }
          // 
          callbak()
        }
    }) 
  },
  getMoney() {
    // 获取该用户账户余额
    util.request(app.globalData._server + '/weixin/wxfindusermoney', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {
        if (res.data) {
          this.setData({
            money: res.data.BALANCE
          }) 
        }
      })
  },
  findMyAddress(){
    // 地址 
    this.setData({
      address: app.globalData.myAddress ? app.globalData.myAddress : {}
    })
  },
})
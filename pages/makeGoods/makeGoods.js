// pages/makeGoods.js
const app = getApp()
const util = require('../../common/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageTitle: '凑单找好物',
    baseUrl: app.globalData.baseUrl, 
    windowHeight: util.sysInfo().windowHeight,
    winScale: util.sysInfo().windowWidth / 750,
    goodImgsHeight: parseInt(util.sysInfo().windowHeight * 0.82),
    imgUrls: [],
    category: [],
    goodsList: [],
    active: 0,
    scrollLeft: 0,
    guideCurrent: 0,
    currentGoodsNumer: 1,// 当前打开弹层商品数量
    location: {}, //当前位置
    popupShow: false,
    popupShow2: false, 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: this.data.pageTitle })
    const prevPage = getCurrentPages()[getCurrentPages().length - 2];  //上一个页面
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
    this.setData({
      deliveryMoneydiff: prevPage.data.deliveryMoneydiff
    })
    this.wxproductclassify()
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
  handleGoodClick(e) {
    const { src } = e.currentTarget.dataset
    this.setData({
      popupShow2: true,
      imgSrc: src
    })
  },
  handleGoodPopup(e) {
    const { index, idx } = e.currentTarget.dataset
    const currentGoodsInfo = this.data.goodsList[index].productAllData[idx]
    // console.log(currentGoodsInfo.productguigeData[0].PRICE, currentGoodsInfo.productguigeData[0].GUIMI_PRODUCT_SPEC_ID)
    currentGoodsInfo.PRICE = currentGoodsInfo.productguigeData[0].PRICE
    currentGoodsInfo.GUIMI_SPEC_ID = currentGoodsInfo.productguigeData[0].GUIMI_PRODUCT_SPEC_ID
    // if 多个规格 else 无规格||一个规格 
    if (currentGoodsInfo.productguigeData && currentGoodsInfo.productguigeData.length === 1) {
      this.setData({
        currentGoodsInfo: currentGoodsInfo,
        // guideCurrent: 0,
      })
      this.handleShopCarAdd()
    } else {
      this.setData({
        popupShow: true,
        currentGoodsInfo: currentGoodsInfo,
        guideCurrent: 0,
      })
    }
  },
  handleGuideChecked(e) {
    const { index } = e.currentTarget.dataset
    const currentGoodsInfo = this.data.currentGoodsInfo
    currentGoodsInfo.PRICE = currentGoodsInfo.productguigeData[index].PRICE
    currentGoodsInfo.GUIMI_SPEC_ID = currentGoodsInfo.productguigeData[index].GUIMI_PRODUCT_SPEC_ID
    this.setData({
      currentGoodsInfo: currentGoodsInfo,
      guideCurrent: index,
    })
  },
  handleNumberChange(e) {
    const { index } = e.currentTarget.dataset
    this.setData({
      currentGoodsNumer: e.detail.value
    })
  },
  handleShopCarAdd() {
    // 加入购物车  
    const currentGoodsInfo = this.data.currentGoodsInfo
    // const GUIMI_PRODUCT_ID = currentGoodsInfo.GUIMI_PRODUCT_ID
    // const PRICE = this.data.PRICE
    // const GUIMI_SPEC_ID = this.data.GUIMI_SPEC_ID
    const NUM = this.data.currentGoodsNumer
    // 库存判断
    if (Number(currentGoodsInfo.NUM) <= 0) {
      // util.alert('提示', `${currentGoodsInfo.PRODUCT_NAME}库存不足，请重新购买`)
      // 售罄
      return false
    }
    this.wxsaveshoppingcart({ ...currentGoodsInfo, NUM })
    this.setData({
      popupShow: false
    })
  },
  handleIMgClose() {
    this.setData({
      popupShow2: false
    })
  },
  wxsaveshoppingcart({ GUIMI_PRODUCT_ID, PRICE, GUIMI_SPEC_ID, NUM}) {
    const params = {
      GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID,
      GUIMI_PRODUCT_ID, PRICE, GUIMI_SPEC_ID, NUM
    }
    util.request(app.globalData._server + '/weixin/guimi/saveProduct2Shoppingcart', params, 'POST')
      .then(res => {
        if (res.msg == 'success') {
          util.toast('加入购物车成功')
        } else {
          util.toast(res.more)
        }
      })
  },
  wxproductclassify() {
    // 全部商品 全部分类
    util.request(app.globalData._server + '/weixin/wxproductclassify', {}, 'POST')
      .then(res => {
        const data = res.data
        const category = data.map(item => ({ TYPE_NAME: item.TYPE_NAME, GUIMI_PRODUCT_TYPE_ID: item.GUIMI_PRODUCT_TYPE_ID }))
        data.forEach(category => category.productAllData = category.productAllData.filter(good => good.ISSALING == '1'))
        this.setData({
          // category: category,
          goodsList: data,
        })
      })
  },
})
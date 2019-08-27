// pages/tab/menu/menu.js
const app = getApp()
const util = require('../../../common/util.js')
const QQMapWX = require('../../../common/libs/qqmap-wx-jssdk/qqmap-wx-jssdk.js')  // 引入SDK核心类
// 实例化API核心类
var qqmapAPI = new QQMapWX({
  key: 'GXCBZ-6QD34-X5RUO-XF2FA-G66G7-C5BVL'
});
var authDeniedFlag=false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageTitle: '菜单',
    baseUrl: app.globalData.baseUrl,
    windowHeight: util.sysInfo().windowHeight,
    winScale: util.sysInfo().windowWidth / 750,
    goodImgsHeight: parseInt(util.sysInfo().windowHeight * 0.82),
    imgUrls: [],
    category: [],
    goodsList: [],
    active: 0,
    scrollLeft: 0,
    currentGoodsInfo: {},
    guideCurrent: 0,  //多规格商品下,选中规格current
    location: {}, //当前位置
    popupShow: false,
    popupShow2: false,
    scrollTop:0,
    authorizeWezhi:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const meunOffest = Math.floor(265 * this.data.winScale)
    // goodsListHeight: this.data.windowHeight+300,
    this.setData({
      pageHeight: this.data.windowHeight,
      goodsListHeight: this.data.windowHeight - 168 * this.data.winScale,
      meunOffest: meunOffest,
      authorizeWezhi: app.globalData.authorizeWezhi
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
    if (app.globalData.myAddress.GUIMI_ADDRESS_ID) {
      const myAddress = app.globalData.myAddress
      // request
      this.getStoreByPosition(myAddress.ADDRESS, myAddress.LONGITUDE, myAddress.LATITUDE)
      this.wxfindlunboList()
      this.totalShopCartNum()
    } else if (app.globalData.myLocation.placeTitle) { 
      const location = app.globalData.myLocation
      // request
      this.getStoreByPosition(location.placeTitle, location.longitude, location.latitude)
      this.wxfindlunboList()
      this.totalShopCartNum()
    }else{
      this.getLocation()
      // request
      this.wxfindlunboList()
      this.totalShopCartNum()
    }
    
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      guideCurrent: 0,
      currentGoodsInfo:{}
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // onPageScroll: util.throttle(function (e) {
  //   console.log(e.scrollTop) 
  //   this.setData({
  //     scrollTop: e.scrollTop
  //   })
  // }, 30),
  bindMainScroll: util.throttle(function(e){
    console.log('bindMainScroll', e.detail.scrollTop)
    const listHeight = this.data.listHeight
    let current = 0;
    // 
    for (let i = 0; i < listHeight.length; i++) {
      let height1 = listHeight[i]
      let height2 = listHeight[i + 1]
      if (e.detail.scrollTop < height1){
        current = 0
        break;
      }
      if (!height2 || (e.detail.scrollTop >= height1 && e.detail.scrollTop < height2)) {
        current = i
        break;
      }
    } 
    // 滚动高亮分类名字
    // console.log('tabCurrent', listHeight,current)
    const scrollLeft = this.setScrollLeft(this.data.tabRects, current)
    this.setData({
      scrollTop: e.detail.scrollTop,
      scrollLeft: scrollLeft,
      active: current,
    })
  },50),
  handleItemClick(e) {
    const index = e.currentTarget.dataset.index
    const scrollLeft = this.setScrollLeft(this.data.tabRects, index)
    console.log('handleItemClick', index)
    this.setData({
      scrollTop: 270 * this.data.winScale+2,
      scrollLeft: scrollLeft,
      listScrollTop: this.data.listHeight[index]
    })
  },
  arrTotal(arr,index){
    let array = arr.slice(0, index)
    let total = array.reduce((total, item, index) => total + item, 0)
    return total
  },
  setScrollLeft(tabRects, current){ 
    // 设置tab左移距离
    const offsetLeft = tabRects.slice(0, current).reduce((prev, curr) => prev + curr.width, 0)
    const tabWidth = this.data.tabRects[current].width
    const navWidth = 710 * this.data.winScale
    const scrollLeft = parseInt((offsetLeft - (navWidth - tabWidth) / 2))
    return scrollLeft
  },
  handleNavigator(e) {
    const { url } = e.currentTarget.dataset
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
  handleGoodClick(e) {
    const { src } = e.currentTarget.dataset
    this.setData({
      popupShow2: true,
      imgSrc: src
    })
  },
  handleGoodPopup(e) {
    // 有规格的弹窗
    wx.showModal({
      // title: '提示',
      content: `待开发`,
      showCancel: false,
      confirmColor: '#5CAE32',
      // confirmText: '去吃一顿',
      success: res => {
        if (res.confirm) {
          wx.reLaunch({
            url: '/pages/tab/index/index',
          })
        }
      }
    })
    return false;
    const { index, idx } = e.currentTarget.dataset
    const currentGoodsInfo = this.data.goodsList[index].productAllData[idx]
    currentGoodsInfo.index = index
    currentGoodsInfo.idx = idx
    // currentGoodsInfo.PRICE = currentGoodsInfo.productguigeData[0].PRICE
    // currentGoodsInfo.GUIMI_SPEC_ID = currentGoodsInfo.productguigeData[0].GUIMI_PRODUCT_SPEC_ID
    console.log('currentGoodsInfo', currentGoodsInfo)
    this.setData({
      currentGoodsInfo: currentGoodsInfo,
      popupShow: true,
    })
  },
  handleGuideChecked(e) {
    const { index } = e.currentTarget.dataset
    const currentGoodsInfo = this.data.currentGoodsInfo
    // currentGoodsInfo.PRICE = currentGoodsInfo.productguigeData[index].PRICE
    // currentGoodsInfo.GUIMI_SPEC_ID = currentGoodsInfo.productguigeData[index].GUIMI_PRODUCT_SPEC_ID
    this.setData({
      currentGoodsInfo: currentGoodsInfo,
      guideCurrent: index,
    })
  },
  handleShopCarAdd() {
    // 加入购物车   
    // 库存判断
    // if (Number(currentGoodsInfo.NUM) <= 0) {
      // util.alert('提示', `${currentGoodsInfo.PRODUCT_NAME}库存不足，请重新购买`)
      // 售罄
      // return false
    // } 
    
    const currentGoodsInfo = this.data.currentGoodsInfo
    const GUIMI_PRODUCT_ID = currentGoodsInfo.GUIMI_PRODUCT_ID
    const PRICE = currentGoodsInfo.productguigeData[this.data.guideCurrent].PRICE
    const GUIMI_SPEC_ID = currentGoodsInfo.productguigeData[this.data.guideCurrent].GUIMI_PRODUCT_SPEC_ID
    const cartNum = currentGoodsInfo.productguigeData[0].cartNum
    // this.wxsaveshoppingcart({ GUIMI_PRODUCT_ID, PRICE, GUIMI_SPEC_ID, NUM })
    this.setData({
      popupShow: false,
      [`goodsList[${index}].productAllData[${idx}].productguigeData[0].cartNum`]: cartNum - 1
    })
  },
  handleNumberChange(e) {
    console.log(e.detail.value)
    const cartNum = e.detail.value
    if (cartNum){
      this.setData({
        [`goodsList[${index}].productAllData[${idx}].productguigeData[0].cartNum`]: e.detail.value,
        [`currentGoodsInfo.productguigeData[0].cartNum`]: e.detail.value
      })

    }else{
      console.log('handleNumberChange为0',)
    }
    
  },
  bindGoodNumChange(e) {
    const { index, idx ,type} = e.currentTarget.dataset 
    console.log('bindGoodNumChange', type)
    const currentGoodsInfo = this.data.goodsList[index].productAllData[idx]
    const GUIMI_PRODUCT_ID = currentGoodsInfo.GUIMI_PRODUCT_ID
    const PRICE = currentGoodsInfo.productguigeData[0].PRICE
    const GUIMI_SPEC_ID = currentGoodsInfo.productguigeData[0].GUIMI_PRODUCT_SPEC_ID
    const cartNum = currentGoodsInfo.productguigeData[0].cartNum || 0
    const cartNumEdit = type === 'plus' ? cartNum + 1 : cartNum - 1
    if (currentGoodsInfo.productguigeData[0].GUIMI_SHOPPINGCART_ID) {
      // if (type === 'minus'&&cartNum<1){
      //       return;
      //     }
      // 有购物车ID
      this.setData({
        [`goodsList[${index}].productAllData[${idx}].productguigeData[0].cartNum`]: cartNumEdit,
      })
      this.editShoppingcart(currentGoodsInfo.productguigeData[0].GUIMI_SHOPPINGCART_ID, cartNumEdit, index, idx)
    } else {
      this.setData({
        [`goodsList[${index}].productAllData[${idx}].productguigeData[0].cartNum`]: cartNumEdit,
      })
      this.wxaddshoppingcart(GUIMI_PRODUCT_ID, PRICE, GUIMI_SPEC_ID, cartNumEdit,index,idx)
    }
  },
  handleIMgClose() {
    this.setData({
      popupShow2: false
    })
  },
  editShoppingcart(GUIMI_SHOPPINGCART_ID, NUM, index, idx) {
    wx.showLoading({ title: '加载中', mask: true })
    util.request(app.globalData._server + '/weixin/guimi/editShoppingcart', { GUIMI_SHOPPINGCART_ID, NUM }, 'POST')
      .then(res => {
        if (res.msg == 'success') {
          wx.hideLoading()
          if (NUM<1){
            this.setData({
              [`goodsList[${index}].productAllData[${idx}].productguigeData[0].GUIMI_SHOPPINGCART_ID`]: ''
            })
          }
          this.totalShopCartNum()
        } else {
          util.toast(res.more)
        }
      })
  },
  getLocation() {
    wx.getLocation({
      type: 'wgs84',
      success: ress => {
        this.setData({
          authorizeWezhi: true
        })
        app.globalData.authorizeWezhi = true
        console.log('wx.getLocation', ress)
        const latitude = ress.latitude
        const longitude = ress.longitude
        // 逆地址解析(坐标位置描述)
        qqmapAPI.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          get_poi: 0,//返回周边POI列表(1.返回；0不返回(默认))
          success: result => {
            console.log('qqmapAPI.reverseGeocoder', result)
            const placeTitle = result.result.address
            this.getStoreByPosition(placeTitle, longitude, latitude)
          },
          fail: err => {
            console.error(err)
            wx.showToast({
              icon: 'none',
              title: '请重新进入本页',
            })
          }
        });
      },
      fail: err => {
        console.log(err)
        // errMsg === "getLocation:fail auth deny"
        // errMsg === "getLocation:fail:system permission denied"
        if (authDeniedFlag){
          return;
        }
        authDeniedFlag = true
        this.setData({
          authorizeWezhi: false
        })
        app.globalData.authorizeWezhi = false
        if (err.errMsg === "getLocation:fail auth deny"){
        wx.showModal({
          title: '授权',
          content: '定位需要开始位置授权',
          showCancel: false,
          success: res => {
            if (res.confirm) {
              wx.openSetting({
                success: res => {
                  console.log('openSetting success', res)
                  // setTimeout(()=>{
                  //   this.getLocation()
                  // },150)
                },
                fail: err => {
                  console.log('openSetting fail', err)
                }
              })
            }
          }
        })
        }else{
          wx.showModal({
            title: '获取当前位置失败',
            content: '1.请确认开启手机定位服务;\r\n2.请确认给微信开启定位权限;\r\n3.请确认给本小程序获取定位权限',
            showCancel: false,
            success: res => {
              if (res.confirm) {
                 
              }
            }
          })
        }
        
      }
    })
  },
  preventTouchMove() {

  },
  getStoreByPosition(placeTitle, longitude, latitude) {
    // 确认坐标,查询门店
    const location = { placeTitle, latitude, longitude }
    console.log('当前位置',location)
    this.setData({
      location: location
    })
    app.globalData.myLocation = location
    // 查询当前位置是否在门店范围
    util.request(app.globalData._server + '/weixin/guimi/getStoreByPosition', { LATITUDE: latitude, LONGITUDE: longitude }, 'POST')
      .then(res => {
        if (res.store) {
          // this.data.store.areaDetail.SERVICE_TIME 门店配送时间
          const nowDate = new Date().getTime()
          // const nowDate = 1552393839125
          const doStart = new Date(nowDate).setHours(10, 30)
          const doEnd = new Date(nowDate).setHours(21, 30)
          const SERVICE_TIME = Math.floor(res.store.areaDetail.SERVICE_TIME * 60 * 1000)  //毫秒
          const serviceTime = nowDate + SERVICE_TIME
          app.globalData.store = res.store
          // 判断当前时间在10:30~21:30营业时间内
          // console.log(new Date(nowDate), new Date(doStart), new Date(doEnd), new Date(serviceTime))
          if (serviceTime < doStart){
            this.setData({
              store: res.store,
              serviceTime: `最快10:30到达`
            })
          } else if (serviceTime > doEnd){
            this.setData({
              store: res.store,
              serviceTime: `最快明日10:30到达`
            })
          }else{
            this.setData({
              store: res.store,
              serviceTime: `最快${new Date(serviceTime).format('hh:mm')}到达`
            })
          }
          
          // 检查商品是否可配送 {{store.areaDetail.TYPE == 2 || itm.PRODUCT_TYPE == store.areaDetail.TYPE}}
          wx.setNavigationBarTitle({ title: res.store.STORE_NAME })
          this.wxproductclassify()
        } else {
          app.globalData.store = {}
          this.setData({
            store: {},
            serviceTime: `无门店`
          })
          wx.setNavigationBarTitle({ title: '当前位置不在配送范围' })
          this.wxproductclassify()
        }
      })
  },
  handleChooseAddress() {
    wx.navigateTo({
      url: `/pages/location/location`,
    })
  },
  wxfindlunboList() {
    util.request(app.globalData._server + '/weixin/wxfindlunboList', { POSITION: 1 }, 'POST')
      .then(res => {
        this.setData({
          imgUrls: res.data
        })
      })
  },
  wxsaveshoppingcart({ GUIMI_PRODUCT_ID, PRICE, GUIMI_SPEC_ID, NUM }) {
    const params = {
      GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID,
      GUIMI_PRODUCT_ID, PRICE, GUIMI_SPEC_ID, NUM
    }
    util.request(app.globalData._server + '/weixin/guimi/saveProduct2Shoppingcart', params, 'POST')
      .then(res => {
        if (res.msg == 'success') {
          util.toast('加入购物车成功')
          this.totalShopCartNum()
        } else {
          util.toast(res.more || res.msg)
        }
      })
  },
  wxaddshoppingcart( GUIMI_PRODUCT_ID, PRICE, GUIMI_SPEC_ID, NUM,index,idx ){
    // 无规格添加购物车
    wx.showLoading({ title: '加载中', mask: true })
    const params = {
      GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID,
      GUIMI_PRODUCT_ID, PRICE, GUIMI_SPEC_ID, NUM
    }
    util.request(app.globalData._server + '/weixin/guimi/saveProduct2Shoppingcart', params, 'POST')
      .then(res => {
        wx.hideLoading()
        if (res.msg == 'success') {
          // util.toast('加入购物车成功')
          console.log(res)
          this.setData({
            [`goodsList[${index}].productAllData[${idx}].productguigeData[0].GUIMI_SHOPPINGCART_ID`]: res.cartPageData.GUIMI_SHOPPINGCART_ID
          })
          this.totalShopCartNum()
        } else {
          util.toast(res.more || res.msg)
        }
      })
  },
  totalShopCartNum() {
    // 购物车badge 在tabbar页面中才会生效
    util.request(app.globalData._server + '/weixin/guimi/findUserShoppingcart', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {
        if (res.cartList.length) {
          let total = 0
          res.cartList.forEach(item => total += item.NUM)
          wx.setTabBarBadge({ index: 2, text: `${total}` })
        } else {
          wx.removeTabBarBadge({ index: 2 })
        }
      })
  },
  wxproductclassify() {
    // 全部商品 全部分类
    let GUIMI_ORDER_SET_ID;
    if (this.data.store.areaDetail){
      GUIMI_ORDER_SET_ID = this.data.store.areaDetail.GUIMI_ORDER_SET_ID
    }
    util.request(app.globalData._server + '/weixin/wxproductclassify', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID,GUIMI_ORDER_SET_ID: GUIMI_ORDER_SET_ID}, 'POST')
      .then(res => {
        const data = res.data
        const category = data.map(item => ({ TYPE_NAME: item.TYPE_NAME, GUIMI_PRODUCT_TYPE_ID: item.GUIMI_PRODUCT_TYPE_ID }))
        data.forEach(category => category.productAllData = category.productAllData.filter(good => good.ISSALING == '1'))
        this.setData({
          category: category,
          goodsList: data,
        }, () => {
          // 商品列表Dom
          wx.createSelectorQuery().selectAll('.list').boundingClientRect(listRects => {

            let listHeight = []
            listHeight = listRects.map(item => item.height)
            listHeight = listHeight.map((item, index, arr) => item = Math.ceil(this.arrTotal(arr, index) + 20 * index * this.data.winScale + 280*this.data.winScale))
            this.setData({
              // listRects: listRects,
              listHeight: listHeight,
            })
          }).exec()
          // 菜单分类Dom
          wx.createSelectorQuery().selectAll('.tab-menu-item').boundingClientRect(tabRects => {
            this.setData({
              tabRects: tabRects,
            })
          }).exec()
        })
      })
  },
})
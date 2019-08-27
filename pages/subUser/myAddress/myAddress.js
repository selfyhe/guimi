// pages/subUser/MyAddress/myAddress.js
const app = getApp()
const util = require('../../../common/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList:[],
    // cannotList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(this.route,options)
    const prevRoute = getCurrentPages().length>1 ? getCurrentPages()[getCurrentPages().length - 2].route : ''
    this.setData({
      isChoose: prevRoute.includes('orderConfirm/orderConfirm')
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
    this.wxfindAddressList()
    // this.listDeliveryAddress()
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
  handleAddressAdd(){
    wx.navigateTo({
      url: `/pages/subUser/myAddress/addressEdit?pageTitle=增加地址`,
    })
  },
  handleAddressChecked(e){
    const index = e.currentTarget.dataset.index
    let prevPage = getCurrentPages()[getCurrentPages().length - 2]; //上一个页面 
    this.setData({
      currentAddress: this.data.addressList[index]
    })
    // myAddress
    // app.globalData.myAddress = this.data.addressList[index]
    // prevPage.setData({
    //   address: this.data.addressList[index]
    // })
    
    this.data.isChoose && this.getStoreByPosition(this.data.addressList[index].LONGITUDE, this.data.addressList[index].LATITUDE)
    
  },
  getStoreByPosition( longitude, latitude ) {
    // 查询当前位置是否在门店范围
    util.request(app.globalData._server + '/weixin/guimi/getStoreByPosition', { LATITUDE: latitude, LONGITUDE: longitude }, 'POST')
      .then(res => {
        console.log('查询当前位置是否在门店范围', res.store)
        const resultStore = res.store
        const globalStore = app.globalData.store
        const prevPage = getCurrentPages()[getCurrentPages().length - 2]; //上一个页面 
        if (!resultStore.GUIMI_STORE_ID) { util.toast('无门店,服务器出错!');return false; }
        if (!globalStore.GUIMI_STORE_ID) { util.toast('未选择门店,重新下单!'); return false; }
        // 当前门店&&配送区域内
        if (globalStore.GUIMI_STORE_ID && (globalStore.areaDetail.GUIMI_ORDER_SET_ID == resultStore.areaDetail.GUIMI_ORDER_SET_ID)) {
          app.globalData.myAddress = this.data.currentAddress  // 更新下单地址
          prevPage.setData({
            address: this.data.currentAddress
          })
          prevPage.getServiceTime()
          wx.navigateBack({}) 
        }else{
          wx.showModal({
            // title: '提示',
            content: '服务门店变更,请重新确认商品',
            cancelText: '取消',
            confirmText: '去确认',
            confirmColor: '#5CAE32',
            success: ress => {
              if (ress.confirm) {
                console.log('用户点击确定')
                app.globalData.myAddress = this.data.currentAddress  // 更新下单地址
                app.globalData.store = resultStore  // 更新门店
                // 回到购物车,确认商品
                wx.reLaunch({
                  url: '/pages/tab/shopCart/shopCart',
                })
              } else if (ress.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      })
  },
  handleAddressEdit(e){
    const index = e.currentTarget.dataset.index
    let ADDRESS_ID = this.data.addressList[index].GUIMI_ADDRESS_ID;
    wx.navigateTo({
      url: `/pages/subUser/myAddress/addressEdit?pageTitle=修改地址&GUIMI_ADDRESS_ID=` + ADDRESS_ID +'&edit='+1,
    })
  },
  // 删除按钮
  detailInvoice(e){
    let that = this;
    var GUIMI_ADDRESS_ID = e.currentTarget.dataset.addressid;
    wx.showModal({
      // title: '提示',
      content: '确认删除地址吗?',
      cancelColor: '#5CAE32',
      confirmColor: '#5CAE32',
      success(res) {
        if (res.confirm) {
          util.request(app.globalData._server + '/weixin/guimi/deleteAddress', { GUIMI_ADDRESS_ID: GUIMI_ADDRESS_ID }, 'POST')
            .then(res => {
              if (res.msg == 'success') {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                that.wxfindAddressList();
              } else {
                wx.showToast({
                  title: '删除失败',
                  icon: 'none'
                })
              }
            })
        } else if (res.cancel) {
          // wx.showToast({
          //   title: '您点击了取消按钮',
          //   icon: 'none'
          // })
        }
      }
    })
  },
  wxfindAddressList() {
    util.request(app.globalData._server + '/weixin/guimi/listAddress', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {
        this.setData({
          addressList: res.addressList
        })
      })
  },
})
// pages/location/location.js
const app = getApp()
const util = require('../../common/util.js')
const QQMapWX = require('../../common/libs/qqmap-wx-jssdk/qqmap-wx-jssdk.js')  // 引入SDK核心类
// 实例化API核心类
var qqmapAPI = new QQMapWX({
  key: 'GXCBZ-6QD34-X5RUO-XF2FA-G66G7-C5BVL'
});
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList:[],
    adjoinList:[],
    location:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(this.route,options)
    this.setData({
      location:app.globalData.myLocation
    })
    this.wxfindAddressList()
    this.adjoinList()
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
  handleLocationClick(){
    app.globalData.myAddress = {}
    app.globalData.myLocation = {}
    wx.navigateBack({})
  },
  handleAddressClick(e){
    const { index } = e.currentTarget.dataset  
    // myAddress
    app.globalData.myAddress = this.data.addressList[index]
    wx.navigateBack({})
  },
  handleLocationChoose(e){
    const { index } = e.currentTarget.dataset
    const location = {
      placeTitle: this.data.adjoinList[index].title,
      latitude: this.data.adjoinList[index].location.lat,
      longitude: this.data.adjoinList[index].location.lng
    }
    // myAddress
    app.globalData.myAddress = {}
    app.globalData.myLocation = location
    wx.navigateBack({})
  },
  handleLocationSearch(){
    util.getUserAuthSetting('scope.userLocation','定位需要开始位置授权')
      .then(()=>{
        wx.chooseLocation({
          success: res => {
            console.log('handleLocationSearch', res)
            const location = {
              placeTitle: res.name,
              latitude: res.latitude,
              longitude: res.longitude
            }
            // myAddress
            app.globalData.myAddress = {}
            app.globalData.myLocation = location
            wx.navigateBack({})
          }
        })
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
  adjoinList(){
    // 输入坐标返回地理位置信息和附近poi列表
    qqmapAPI.reverseGeocoder({
      location: { latitude: app.globalData.myLocation.latitude, longitude: app.globalData.myLocation.longitude },
      get_poi: 1, // 返回周边POI列表
      poi_options: 'page_index=1;page_size=20',
      success: res => {
        console.log('reverseGeocoder', res);
        this.setData({
          adjoinList: res.result.pois
        })
      },
      fail: err => {
        console.error(err)
        wx.showToast({
          icon: 'none',
          title: '请重新进入本页',
        })
      }
    })
  }
})
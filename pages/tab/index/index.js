// pages/tab/index/index.js
const app = getApp()
const util = require('../../../common/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: { 
    baseUrl:app.globalData.baseUrl,
    cells:[
      { title: '现在下单', enTitle: 'ORDER NOW', path: '/pages/tab/menu/menu', img:'/images/icon_zc.png'},
      { title: '下午茶 团建定制', enTitle: 'CUSTOMIZED', path: '/pages/subIndex/customized/customized', img: '/images/icon_zc.png' },
      { title: '邀请有礼', enTitle: 'INVITE COURTESY', path: '/pages/subIndex/activities_invite/activities_invite', img: '/images/icon_zc.png' },
      { title: '福利社群', enTitle: 'COMMUNITY', path: '/pages/subIndex/community/community', img: '/images/icon_zc.png' }
    ],
    imgUrls:[],
    popupShow:false,
    poster:{},
    visible:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function(options) {
    console.log(this.route,options)
    // 扫携带标签小程序码进入,关联 
    options.scene && this.setData({ tagScene: decodeURIComponent(options.scene) })
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
      if (!app.globalData.userInfo.USERLIST_ID){
        console.log('首次进入小程序无app.globalData.userInfo.USERLIST_ID',)
        return false;
      }
      wx.setNavigationBarTitle({ title: app.globalData.comment }) 
      app.globalData.onLaunchFlag && this.getUserInfo(()=>{
        // 0：不是新人，1：是新人 
        if (this.data.userInfo.ISNEW == 1) {
          this.getNewFishCoupon()
        } else {
          this.productCouponsTips()
        } 
      }) 
      this.wxfindBanner()
      this.listAdvertisement()
      this.data.tagScene && this.tagUserSign()
      this.totalShopCartNum() 
  
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.wxsaveWeappFormid()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    this.wxsaveWeappFormid()
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  handleNavigator(e) {
    const { url } = e.currentTarget.dataset
    if (url){
      if (url.includes('index') || url.includes('menu') || url.includes('shopCart') || url.includes('user')) {
        wx.reLaunch({
          url: `${url}`,
        })
      } else {
        wx.navigateTo({
          url: `${url}`,
        })
      } 
    }
  },
  handleNavigator2(e){
    const { url } = e.currentTarget.dataset
    this.handleMypopupClose()
    wx.reLaunch({
      url: `${url}`,
    })
  },
  handleMypopupClose(e) {
    this.setData({ 
      visible: false 
    })
  },
  handleCellClick(e) {
    const index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: this.data.cells[index].path,
    })
    if (index == 0) {
      wx.switchTab({
        url: this.data.cells[index].path,
      })
    }
  },
  handlePopupClose() {
    app.globalData.onLaunchFlag = false  // 标记小程序首页不再弹窗
    this.setData({
      popupShow: false
    })
  },
  handlePosterClick(e){  
    const action = Number(e.currentTarget.dataset.action)
    switch (action) {
      case 1:
        console.log('新人礼包') // 派送多张优惠券
        // this.addCoupon()
        // wx.reLaunch({
        //   url: '/pages/tab/menu/menu',
        // })
        this.handlePopupClose()
        this.setData({
          visible:true
        })
        // const worth = this.data.coupons.reduce((total, item) => total + item.WORTH, 0)
        // wx.showModal({
        //   title: '提示',
        //   content: `恭喜您成功领取,${worth}元新人大礼包`,
        //   showCancel: false,
        //   confirmText: '去吃一顿',
        //   success: res => {
        //     if (res.confirm) {
        //       wx.reLaunch({
        //         url: '/pages/tab/menu/menu',
        //       })
        //     }
        //   }
        // })
        break
      case 2:
        console.log('商品券海报')
        wx.navigateTo({
          url: '/pages/subUser/myVoucher/myVoucher2',
        })
        this.handlePopupClose()
        break
      case 3:
        console.log('优惠券海报')
        wx.reLaunch({
          url: '/pages/tab/menu/menu',
        })
        this.handlePopupClose()
        break 
    }
  },
  getNewFishCoupon() {
    // 新人红包 进入首页领取
    util.request(app.globalData._server + '/weixin/guimi/coupon/getNewFishCoupon', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {
        if (res.msg == 'success' && res.coupons.length) {
          util.request(app.globalData._server + '/weixin/guimi/getPoster', { TYPE: '9' }, 'POST')
            .then(resss => {
              const worth = res.coupons.reduce((total, item) => total + item.WORTH, 0)
              this.setData({
                coupons: res.coupons,
                worth: worth,
                poster: resss.poster,
                popupShow: true,
                posterAction: 1
              })
              this.addCoupon()
            })

        } else {
          util.toast(res.more || res.msg)
        }
      })
  },
  addCoupon() {
    // 领取新人红包
    util.request(app.globalData._server + '/weixin/guimi/coupon/addCoupon', {
      GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID
    }, 'POST')
      .then(res => {
        if (res.msg == 'success') {
          console.log('领取新人红包成功')
          // this.setData({
          // popupinShow:true,
          // receiveNum: res.RECEIVE_NUM
          // })
          // util.alert('提示', '领取成功,可在我的卡券中查看')
          // wx.showModal({
          //   title: '提示',
          //   content: '领取成功,可在我的-卡券中查看',
          //   showCancel: false,
          //   success(res) {
          //     if (res.confirm) {
          //       wx.reLaunch({
          //         url: '/pages/tab/user/user'
          //       })
          //     }
          //   }
          // })
        } else {
          util.toast(res.more || res.msg)
        }
      })
  },   
  productCouponsTips() {
    util.request(app.globalData._server + '/weixin/guimi/getUserCount', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {
        // 提示使用商品券(优先)
        if (res.count && res.count.productCouponCount) {
          // 弹出海报
          util.request(app.globalData._server + '/weixin/guimi/getPoster', { TYPE: '5' }, 'POST')
            .then(res => {
              this.setData({
                poster: res.poster,
                popupShow: true,
                posterAction: 2
              })
            })
            return false
        }
        // 提示使用优惠券
        if (res.count && res.count.couponCount) {
          util.request(app.globalData._server + '/weixin/guimi/getPoster', { TYPE: '8' }, 'POST')
            .then(res => {
              this.setData({
                poster: res.poster,
                popupShow: true,
                posterAction: 3
              })
            })
        }

      })
  },
  handlePhoneClick(){
    // console.log('空函数大爷')
  },
  getPhoneNumber(e){
    const index = e.currentTarget.dataset.index
    if(e.detail.encryptedData) {
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
            util.toast('绑定成功')
            this.setData({
              'userInfo.MOBILE':'绑定成功'
            })
            this.handleCellClick(e)
          } else {
            util.toast(res.more || res.msg)
          }
          // this.handleCellClick(e)
        })
    } else { 
      // 拒绝授权fail
      // this.handleCellClick(e) 
      wx.showModal({
        title: '授权失败',
        showCancel: false,
        content: '授权失败，你可能部份功能无法使用'
      })
    }
  },
  wxfindLexMapList(){
    util.request(app.globalData._server + '/weixin/wxfindLexMapList', { STATE: 1 }, 'POST')
      .then(res=>{
        this.setData({
          imgUrls: res.mapList
        })
      })
  },
  getUserInfo(callback){
    util.request(app.globalData._server + '/weixin/guimi/getUserInfo', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {  
        this.setData({
          userInfo: res.userInfo
        })
        callback()
      })
  }, 
  wxfindBanner(){
    // 0首页1菜单2寿司库
    util.request(app.globalData._server + '/weixin/guimi/banner/list', { POSITION:'0'}, 'POST')
      .then(res => {
        this.setData({
          imgUrls: res.bannerList
        })
      })
  },
  listAdvertisement() {
    util.request(app.globalData._server + '/weixin/guimi/listAdvertisement', { POSITION: '0' }, 'POST')
      .then(res => {
        this.setData({
          adList: res.adList
        })
      })
  },
  tagUserSign() { 
    util.request(app.globalData._server + '/weixin/guimi/tagUserSign', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID, GUIMI_SIGN_ID: this.data.tagScene }, 'POST')
      .then(res => {
        if(res.msg =='success'){
          console.log('扫码标签关联用户成功', res)
          console.log('扫码标签关联用户成功', this.data.tagScene)
        }else{
          util.toast(res.more || res.msg)
        }
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
  totalShopCartNum() {
    // 购物车badge 在tabbar页面中才会生效
    util.request(app.globalData._server + '/weixin/guimi/findUserShoppingcart', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID }, 'POST')
      .then(res => {
        if (res.msg == 'success') {
          if (res.cartList.length) {
            let total = 0
            res.cartList.forEach(item => total += item.NUM)
            wx.setTabBarBadge({ index: 2, text: `${total}` })
          } else {
            wx.removeTabBarBadge({ index: 2 })
          }
        } else {
          util.toast(res.more || res.msg)
        }
        
      })
  },
})
// page/authorize/authorize.js
const app = getApp()
const util = require('../../common/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.wxlogin()
  },
  wxlogin(){
    wx.showLoading({
      title: '登录中...',
      mask: true,
    })
    wx.login({
      success: res => {
        if (res.code) {
          this.setData({
            code: res.code
          })
        } else {
          console.log('登录失败！' + res.errMsg)
          // 登录错误 
          wx.showModal({
            title: '登录失败，请重试',
            content: '微信登录失败！' + res.errMsg,
            showCancel: false
          })
        }
      },
      fail: err => {
        wx.showModal({
          title: '提示',
          content: 'wx.login[' + res.errMsg + ']微信登录失败',
          showCancel: false,
          confirmText: '再试一次',
          success: function (res) {
            if (res.confirm) {
              this.wxlogin()
            }
          }
        })
      },
      complete() {
        wx.hideLoading()
      }
    })
  },
  getUserInfo(e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮 
      console.log('用户按了授权按钮')
      // 用户信息保存至服务器
      this.login(()=>{
        util.request(app.globalData._server + '/weixin/saveWeiXinUser', {
          USER_ID: app.globalData.user_id,
          APPID: app.globalData.appid,
          OPENID: app.globalData.openid,
          GENDER: String(e.detail.userInfo.gender),  // 性别 0：未知、1：男、2：女
          NICKNAME: e.detail.userInfo.nickName || '未知用户',
          AVATARURL: e.detail.userInfo.avatarUrl || 'http://wx.easyli.com.cn/group1/M00/00/4E/rBL4Ilwi3FCAXJ5JAAAKc54lNy4827.jpg',
          MOBILE: ''
        }, 'POST')
          .then(res => {
            console.log('用户信息保存至服务器', res)
            app.globalData.userInfo = res
            const path = app.globalData.options.path
            const query = app.globalData.options.query
            util.request(app.globalData._server + '/weixin/getUserInfoByOpenId', { OPENID: app.globalData.openid }, 'POST')
              .then(res=>{
                app.globalData.userInfo = res
                wx.setStorageSync('userInfo', res)
                // 传递参数到下个页面
                let params = Object.keys(query).map(key => key + "=" + query[key]).join("&")
                console.log('跳转页面路径', `/${path}?${params}`)
                wx.reLaunch({
                  url: `/${path}?${params}`,
                })
                // wx.reLaunch({
                //   url: `/pages/tab/index/index`,
                // })
              })
            
          })
      })
      
    } else {
      //用户按了拒绝按钮
      console.log('用户按了拒绝按钮')
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '小程序需要您的微信授权才能正常使用'
      })
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
  login(callback){
      wx.showLoading({
        title: '加载中',
        mask: true,
      })
      // 获取 code(临时登录凭证)
      const code = this.data.code
      // 获取 appId(小程序ID)
      const appId = app.globalData.appid
      // 获取 AppSecret(小程序秘钥)
      util.request(app.globalData._server + '/weixin/getweixinapp', {
        APPID: appId
      }, 'POST')
        .then(res => {
          const secret = res.SECRET
          app.globalData.secret = res.SECRET
          app.globalData.pay_no = res.PAY_NO
          app.globalData.pay_secret = res.PAY_SECRET
          app.globalData.user_id = res.USER_ID
          app.globalData.comment = res.COMMENT
          // 获取 openid（用户唯一标识）和 sessionkey（会话密钥）
          return util.request(app.globalData._server + '/weixin/getOpenID', { appid: appId, secret, code }, 'POST')
        })
        .then(res => {
          app.globalData.openid = res.openid
          app.globalData.session_key = res.session_key
          wx.setStorageSync('session_key', res.session_key)
          app.globalData.navigateToLogin = true  //标记一下,已经走过登录流程
          wx.hideLoading()
          callback()
          // return util.request(app.globalData._server + '/weixin/getUserInfoByOpenId', { OPENID: res.openid }, 'POST')
        })
        // .then(res => {
          
          // if (res.status == 1) {
            // 授权过,用户信息已存入服务端
            // app.globalData.userInfo = res
          // } else {
            // 没有用户信息,跳转授权页面
          // }
          // 标记用户进入小程序
          // app.globalData.onLaunchFlag = true
          // if (res.status == 1) {
          //   console.log('授权过,用户信息已存入服务端') 
          //   app.globalData.userInfo = res
          // }else{
          //   console.log('没有用户信息,跳转授权页面')
          //   wx.reLaunch({
          //     url: '/pages/authorize/authorize',
          //   }) 
          // 处理 onLaunch 内请求可能会在 Page.onLoad 之后才返回 
          // 所以此处加入 callback 以防止这种情况
          // app.globalData.employId = 1
          // console.log('onLaunch异步请求回调', app.globalData.employId)
          // if (this.employIdCallback) {
          //   console.log(`onLaunch异步请求回调`, this.employIdCallback)
          //   this.employIdCallback()
          // }
        // })
  }
})
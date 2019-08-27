//app.js
const util = require('common/util.js')
App({
  onLaunch: function (options) { 
    this.globalData.options = options
    console.log('miniProgram version', this.globalData.version)  
    console.log(`miniProgram【${options.scene}】`, options)
    console.log(util.sysInfo())
    
    // 回调维持现状
    this.globalData.employId = 1 
    // 标记用户进入小程序
    this.globalData.onLaunchFlag = true
    // 是否打印调试信息
    // util.debug(true)
    // 检查小程序是否有新版本
    // util.checkUpdate()
  },
  onShow: function (options){
    // 判断是否登录
    if (this.globalData.navigateToLogin) {
      return;
    }
    let userInfo = wx.getStorageSync('userInfo')
    let session_key = wx.getStorageSync('session_key')
    if (userInfo && session_key) {
      this.globalData.session_key = session_key
      this.globalData.userInfo = userInfo
      this.globalData.openid = userInfo.OPENID
      this.globalData.comment = '鲑蜜精品寿司'
      // 检查 session_key 是否过期
      wx.checkSession({
        success: res => {
          // session_key 未过期，并且在本生命周期一直有效
        },
        fail: err => {
          // session_key 已经失效，需要重新执行登录流程
          this.goLoginPageTimeOut()

        }
      })
    } else {
      // 本地无userInfo,作为新用户登录
      this.goLoginPageTimeOut()

    }
  },
  goLoginPageTimeOut(){
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/authorize/authorize',
      })
    }, 500)
  },
  globalData: {
    version: '1.5.2',
    navigateToLogin:false,
    onLaunchFlag:false,
    authorizeWezhi:true,
    options:'',
    // appid: 'wxc6ae7cac79338f11',
    appid:'wx9fe088f499c08bd0',
    comment: '',
    pay_no: '',
    pay_secret: '',
    secret:'',
    user_id:'', 
    userInfo: {},
    openid: '', 
    myLocation: {},  // 当前位置
    myAddress: {},  // 下单地址
    store: {},  // 下单门店
    gloabalFomIds: [],  // 全局推送码formId
    // _server: 'https://www.easyli.com.cn',
    _server: 'https://www.88sdcy.com',
    // _server: 'http://192.168.1.34/shop',
    //  _server:'http://112.74.171.225:8888',
    // _server: 'http://192.168.1.35:8080',
    baseUrl: 'https://www.88sdcy.com',
    // baseUrl: 'http://192.168.1.101',
  }
})
// pages/exchange/exchange.js
const app = getApp()
const util = require('../../common/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: app.globalData.baseUrl,
    tabsCurrent:0,
    tabs:[],
    disabled:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.wxlistExchangeScene()
    this.getPoster()
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
  handleNavigator(e) {
    const { url } = e.currentTarget.dataset
    // tab页,wx.navigateTo失效
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
  handleShousiMake(e){ 
    this.setData({
      GUIMI_EXCHANGE_SCENE_ID: this.data.tabs[this.data.tabsCurrent].GUIMI_EXCHANGE_SCENE_ID
    })
    // this.appointExchangeScene()
    this.appointOrNot()
  },
  formSubmit(e){ 
    console.log('form发生了submit事件，携带数据为：', e.detail.value, 'formId', e.detail.formId)
    this.setData({
      GUIMI_EXCHANGE_SCENE_ID: this.data.tabs[this.data.tabsCurrent].GUIMI_EXCHANGE_SCENE_ID,
      formId: e.detail.formId
    }) 
    this.appointOrNot()
  },
  handleButtonExchange(e){
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/exchange/myRedbao?GUIMI_EXCHANGE_ID=${id}`,
    })
  },
  handleItemClick(e){
    const index = e.currentTarget.dataset.index
    this.setData({
      tabsCurrent:index
    })
  },
  appointOrNot(){
    wx.showLoading({ title: '加载中', mask: true })
    // 是否预约过场次
    util.request(app.globalData._server + '/weixin/guimi/appointOrNot', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID, GUIMI_EXCHANGE_SCENE_ID: this.data.GUIMI_EXCHANGE_SCENE_ID }, 'POST')
      .then(res => {
        wx.hideLoading()
        if (res.msg == 'success') {
          if (res.appoint){
            util.toast('已经预约过了')
          }else{
            this.appointExchangeScene()
            this.saveSendwxAobaoTemplate(formId)
          }
          
        } else {
          util.toast(res.more)
        }
      }).catch(err => {
        util.toast(err)
      })
  },
  appointExchangeScene() {
    // 预约场次
    util.request(app.globalData._server + '/weixin/guimi/appointExchangeScene', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID, GUIMI_EXCHANGE_SCENE_ID: this.data.GUIMI_EXCHANGE_SCENE_ID}, 'POST')
      .then(res => {
        if (res.msg == 'success') {
          util.toast('预约成功')
        } else {
          util.toast(res.more)
        }
      }).catch(err => {
        util.toast(err)
      })
      
  },
  wxlistExchangeScene(){
    util.request(app.globalData._server + '/weixin/guimi/listExchangeScene', {}, 'POST')
      .then(res => {
        const sceneList = res.sceneList
        // const nowDate = new Date()
        const nowTime = +new Date()
        let min, current;
        sceneList.forEach((item, index) => {
          let startTime = new Date(item.START_TIME.replace(/-/g, '/')).getTime()
          let endTime = new Date(item.END_TIME.replace(/-/g, '/')).getTime()
          // let hour = item.NAME.split(':')
          // let sceneTime = nowDate.setHours(hour[0], hour[1])
          // item.sub = '可预约明日'
          console.log(item.START_TIME, startTime, item.END_TIME, endTime, util.formatTime(new Date()),nowTime)
          //  
          if (startTime < nowTime && nowTime < endTime){
            item.sub = '正在兑换' 
            current=index  
            item.productList.forEach(item => {
              item.exchangeTxt = '兑换'
              item.exchange = true
              if (item.NUM < 1){
                item.exchangeTxt = '兑完'
                item.exchange = false
              }
            })
          }else{ 
            item.sub = '可预约明日' 
            current = current 
            item.productList.forEach(item => {
              item.exchangeTxt = '兑换'
              item.exchange = false
            })
          } 
          this.setData({
            tabs: sceneList,
            tabsCurrent: current
          })
        })
       

      })
      .catch(err=> { 
        util.toast(err)
      })
  },
  // wxlistExchangeScene() {
  //   // 预约场次 (可预约明日,正在兑换,即将开始)
  //   util.request(app.globalData._server + '/weixin/guimi/listExchangeScene', {}, 'POST')
  //     .then(res => { 
  //       const sceneList = res.sceneList
  //       const nowDate = new Date()
  //       let min,current;
  //       sceneList.forEach((item,index)=>{
  //         // let startTime = new Date(item.START_TIME.replace(/-/g, '/')).getTime()
  //         // let endTime = new Date(item.END_TIME.replace(/-/g, '/')).getTime()
  //         let hour = item.NAME.split(':')
  //         let sceneTime = nowDate.setHours(hour[0], hour[1])
  //         let diff = Math.abs(+new Date()) 
  //         if (sceneTime > nowDate){
  //           item.sub = '即将开始'
  //         }else{
  //           item.sub = '可预约明日'
  //         } 
  //         console.log(diff)
  //         if (min){
  //           min = diff > min ? min : diff, current = diff > min ? current : index
  //         }else{
  //           min = diff, current=index
  //         } 
  //       })
  //       console.log(min, current) 
  //       sceneList[current].sub = '正在兑换' 
  //       this.setData({
  //         tabs: sceneList,
  //         tabsCurrent: current
  //       })
        
  //     })
  // },
  getPoster() {
    util.request(app.globalData._server + '/weixin/guimi/getPoster', { TYPE: '0' }, 'POST')
      .then(res => {
        this.setData({
          poster: res.poster
        })
      }).catch(err => {
        util.toast(err)
      })
  },
  saveSendwxAobaoTemplate(){
    if (this.data.formId == 'the formId is a mock one'){
      console.log('模拟器下不走模板消息接口')
      return false
    } 
    console.log('发送了板消息接口')
    util.request(app.globalData._server + '/weixin/guimi/saveSendwxGuimiTemplate', { OPEN_ID: app.globalData.openid, PAGE: 'pages/exchange/exchange',form_id:this.data.formId }, 'POST')
      .then(res => {
        if (res.msg == 'success') {
          // util.toast('成功')
        } else {
          util.toast(res.more)
        }
      })
      .catch(err => {
        util.toast(err)
      })
  }
})
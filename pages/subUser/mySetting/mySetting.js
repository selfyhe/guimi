// pages/subUser/mySetting/mySetting.js
const app = getApp();
const util = require('../../../common/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUserInfo()
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
  bindKeyInput(e) {
    const { value } = e.currentTarget.dataset
    this.setData({
      [value]: e.detail.value
    })
  },
  radioChange(e) {
    const { value } = e.currentTarget.dataset
    this.setData({
      ['userInfo.GENDER']: value
    })
  },
  handleUserInfoSave(){
    this.editUserInfo()
  },
  handleChooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res =>  {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        this.uploadImage(tempFilePaths)
      }
    }) 
  },
  getUserInfo(){
    util.request(app.globalData._server + '/weixin/guimi/getUserInfo', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID}, 'POST')
      .then(res => {
        this.setData({
          userInfo: res.userInfo
        })
      })
  },
  editUserInfo() {
    // if (!util.regex.isPhone.test(this.data.userInfo.MOBILE)) {
    //   wx.showToast({
    //     icon: 'none',
    //     title: '手机号码格式有误',
    //   })
    //   return false
    // }
    util.request(app.globalData._server + '/weixin/guimi/editUserInfo', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID,...this.data.userInfo}, 'POST')
      .then(res => {
        if(res.msg == 'success'){
          wx.navigateBack({})
        }else{
          util.toast(res.more)
        }
      })
  },
  uploadImage(tempFilePaths){
    wx.showLoading({ title: '上传中', mask: true })
    wx.uploadFile({
      url: app.globalData._server + '/weixin/guimi/uploadImage',
      filePath: tempFilePaths[0],
      name: 'image',
      header: {
        'content-type': 'multipart/form-data'
      },
      success: res => {
        console.log(res)
        if (res.statusCode == 200) {
          wx.hideLoading()
          const data = JSON.parse(res.data)
          this.setData({
            ['userInfo.AVATARURL']: `${app.globalData.baseUrl}/${data.imgUrl}`
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '上传失败',
          })
        }
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '上传失败',
        })
      }
    }) 
  }
})
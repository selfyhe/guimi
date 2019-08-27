// pages/subUser/feedback/feedback.js
const app = getApp();
const util = require('../../../common/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ImgArr:[],
    leImage:[],
    baseUrl: app.globalData.baseUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  // form表单获取反馈内容
  formSubmit(e){
    const IMGS = this.data.ImgArr.join(",");
    const feedbackContent = e.detail.value.feedbackContent;
    if (!feedbackContent){
     wx.showToast({
       title: '请填写反馈内容',
       icon:'none'
     })
     return;
    }else{
      util.request(app.globalData._server + '/weixin/guimi/submitSuggestion', { GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID, SUGGESTION: feedbackContent, IMGS: IMGS}, 'POST')
        .then(res => {
          if(res.msg == 'success'){
            wx.showToast({
              title: '反馈成功',
              icon:'success'
            })
            setTimeout(function(){
              wx.navigateBack({})
            },1500)
          }else{
            wx.showToast({
              title: '反馈成功',
              icon: 'none'
            })
          }
        })
    }
  },

  choosePhoto(){
    const that = this;
    wx.chooseImage({
      count:9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePaths = res.tempFilePaths
        for (let i = 0; i < res.tempFilePaths.length; i++) {
          wx.uploadFile({
            url: app.globalData._server + '/weixin/guimi/uploadImage',
            header: {
              'content-type': 'multipart/form-data'
            },
            method:'POST',
            name: 'image',
            filePath: res.tempFilePaths[i],
            success(res) {
              const data = JSON.parse(res.data)
              that.data.ImgArr.push(data.imgUrl);
              that.data.leImage.push({
                imgSrc: data.imgUrl
              })
              that.setData({
                leImage:that.data.leImage
              })
            }
          })
        }
      }
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
})
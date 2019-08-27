// pages/subUser/myAddress/addressEdit.js
const app = getApp()
const util = require('../../../common/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageTitle: '修改地址',
    checked: false,
    sex: 1,
    status: 0,
    edit: 0,
    add: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var GUIMI_ADDRESS_ID = options.GUIMI_ADDRESS_ID;
    if (options.edit == 1) {
      this.setData({
        edit: 1,
        GUIMI_ADDRESS_ID: GUIMI_ADDRESS_ID
      })
      this.getEditDetails(GUIMI_ADDRESS_ID)
    } else {
      this.setData({
        add: 0
      })
    }
    wx.setNavigationBarTitle({
      title: options.pageTitle || this.data.pageTitle,
    })

  },

  // 获取编辑详情内容
  getEditDetails(GUIMI_ADDRESS_ID) {
    util.request(app.globalData._server + '/weixin/guimi/addressInfo', { GUIMI_ADDRESS_ID: GUIMI_ADDRESS_ID }, 'POST')
      .then(res => {
        console.log(res, '详情内容')
        this.setData({
          addressDetails: res.address,
          checked: res.address.STATUS == 0 ? false : true,
          sex: res.address.GENDER == '女' ? '0' : '1',
          latitude: res.address.LATITUDE,
          longitude: res.address.LONGITUDE
        })
        console.log(res.address.LATITUDE, res.address.LONGITUDE, '进入编辑页面的经纬度')
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
  chooseLocation() {
    util.getUserAuthSetting('scope.userLocation', '定位需要开始位置授权')
      .then(() => {
        wx.chooseLocation({
          success: res => {
            wx.setStorageSync('longitude', res.longitude);
            wx.setStorageSync('latitude', res.latitude);
            const locationInfo = res
            // 添加地址前做验证
            // 添加地址时检查是否在门店配送距离内 -->
            // 查询当前位置是否在门店范围
            util.request(app.globalData._server + '/weixin/guimi/getStoreByPosition', { LATITUDE: locationInfo.latitude, LONGITUDE: locationInfo.longitude }, 'POST')
              .then(res => {
                console.log('查询当前位置是否在门店范围', res.store)
                if (res.msg == 'success' && res.store) {
                  //
                  this.setData({
                    location: locationInfo.name,
                    latitude: locationInfo.latitude,
                    longitude: locationInfo.longitude
                  })
                } else {
                  // content: '地址不在配送范围'
                  wx.showModal({
                    // title: '提示',
                    content: '该区域外送功能即将开通',
                    showCancel: false,
                    confirmText: '我知道了',
                    confirmColor: '#5CAE32',
                    success: res => {
                      if (res.confirm) {
                        // wx.reLaunch({
                        //   url: '/pages/tab/menu/menu',
                        // })
                      }
                    }
                  })
                }
              })
          },
        })
      })
   
  },
  handleAddressSave() {
    wx.navigateBack({

    })
  },
  radioChange(e) {
    const { value } = e.currentTarget.dataset
    this.setData({
      sex: value
    })
  },
  handleDefaultChecked(e) {
    this.setData({
      checked: !this.data.checked,
      status: this.data.checked ? '0' : '1'
    })
  },
  formSubmit(e) {
    const name = e.detail.value.name;
    const sex = e.detail.value.sex == '1' ? '男' : '女';
    const number = e.detail.value.number;
    const sss = e.detail.value.sss;

    const location = this.data.edit == '1' ? (this.data.location ? this.data.location : this.data.addressDetails.ADDRESS) : this.data.location;

    // const location = this.data.location ?this.data.location:this.data.addressDetails.ADDRESS;

    const longitude = this.data.longitude;
    const latitude = this.data.latitude;
    const status = this.data.status;
    console.log(longitude, latitude, '点击保存获取到的经纬度')
    if (!name) {
      wx.showToast({
        title: '请填写联系人',
        icon: 'none'
      })
      return;
    } else if (!sex) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      })
      return;
    } else if (!number) {
      wx.showToast({
        title: '请填写手机号码',
        icon: 'none'
      })
      return;
    } else if (number) {
      if (!(/^1[0-9]{10}$/.test(number))) {
        wx.showToast({
          title: '手机号码不正确',
          icon: 'none',
        })
        return;
      } else if (!location) {
        wx.showToast({
          title: '请选择地址',
          icon: 'none',
        })
        return;
      } else if (!sss) {
        wx.showToast({
          title: '请填写门牌号',
          icon: 'none',
        })
        return;
      } else {
        util.request(app.globalData._server + '/weixin/guimi/saveAddress', {
          GUIMI_USER_ID: app.globalData.userInfo.USERLIST_ID,
          CONTACT: name,
          GENDER: sex,
          CONTACT_PHONE: number,
          ADDRESS: location,
          HOUSE_NUM: sss,
          STATUS: status,
          GUIMI_ADDRESS_ID: this.data.GUIMI_ADDRESS_ID ? this.data.GUIMI_ADDRESS_ID : '',
          LATITUDE: latitude,
          LONGITUDE: longitude
        }, 'POST')
          .then(res => {
            if (res.msg == 'success') {
              wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 1500,
                success: function () {
                  setTimeout(function () {
                    wx.navigateBack({})
                  }, 1500)
                }
              })
            } else {
              wx.showToast({
                title: '保存失败',
                icon: 'none',
              })
            }
          })
      }
    }
  }
})
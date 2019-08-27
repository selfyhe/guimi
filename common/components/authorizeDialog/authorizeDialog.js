// page/common/components/authorizeDialog/authorizeDialog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    authorize:{
      type:String,
      value:'userInfo'
    },
    content:{
      type:String,
      value:'需要获取您的公开信息(昵称、头像等)'
      // 需要获取您的公开信息(昵称、头像等)
      // 需要获取您的通讯地址
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    hideDialog() {
      this.setData({
        isShow: false
      })
    },
    showDialog() {
      this.setData({
        isShow: true
      })
    },
    confirmEvent() {
      this.triggerEvent("confirmEvent");
    },
    getUserInfo(e) {
      this.triggerEvent('getUserInfo', e.detail)
    },
    openSetting(e) {
      this.triggerEvent('openSetting', e.detail)
    }
  }
})

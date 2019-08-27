// common/components/popup.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visible: {
      type: Boolean,
      vale: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    mask: true,
    // visible:false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleShow() {
      this.setData({
        visible: true,
      })
    },
    handleHide() {
      this.setData({
        visible: false,
      })
    },
    preventTouchMove() {

    }
  }
})
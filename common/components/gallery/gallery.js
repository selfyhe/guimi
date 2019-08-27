// page/common/components/gallery/gallery.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    img:{
      type:String,
      value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    galleryShow:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    openGallery() {
      this.setData({
        galleryShow: true
      })
    },
    closeGallery() {
      this.setData({
        galleryShow: false
      })
    },
    delImg() {
      this.triggerEvent('delImg')
    }
  }
})

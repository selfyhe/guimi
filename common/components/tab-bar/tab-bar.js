// common/components/tab-bar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    current: {
      type: String,
      value: 'index'
    },
    tabs: {
      type: Array,
      value: [{
          path: 'index',
          title: '首页',
          img:'index'
        },
        {
          path: 'menu',
          title: '菜单',
          img:'menu'
        },
        {
          path: 'sushiKu',
          title: '寿司库',
          img:'sushiKu'
        },
        {
          path: 'shopCart',
          title: '购物车',
          img:'shopCart'
        },
        {
          path: 'user',
          title: '我的',
          img:'user'
        },
      ]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow:false
  },

  /**
   * 组件的方法列表
   */
  methods: { 
    handleNavigator(e){
      const { path } = e.currentTarget.dataset
      wx.reLaunch({
        url: `/pages/tab/${path}/${path}`,
      })
    }
  }
})
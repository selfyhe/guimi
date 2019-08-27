const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: { 
    formIdSubmit(e) {
      // 将formIds 存到全局
      console.log('form发生了submit事件，携带数据为：', e.detail.formId)
      let formIds = app.globalData.gloabalFomIds || [] // 获取全局推送码数组
      let data = {
        formId: e.detail.formId,
        expire: parseInt(new Date().getTime() / 1000) + 604800    ////计算7天后的过期时间时间戳(秒)
      }
      formIds.push(data)
      app.globalData.gloabalFomIds = formIds
      console.log('gloabalFomIds',app.globalData.gloabalFomIds)
    },
    // wxsaveWeappFormid() {
    //   // 上传推送码
    //   let formIds = app.globalData.gloabalFomIds
    //   console.log('app.globalData.gloabalFomIds', formIds)
    //   if (formIds.length && formIds[0].formId !== 'the formId is a mock one') {
    //     app.globalData.gloabalFomIds = []  // 清空当前的gloabalFomIds
    //     util.request(app.globalData._server + '/weixin/guimi/wxsaveWeappFormid', {
    //       OPEN_ID: app.globalData.openid,
    //       formIdList: formIds,
    //     }, 'POST')
    //       .then(res => {
    //         console.log('wxsaveWeappFormid', res)
    //       })
    //   }
    // },
  }
})

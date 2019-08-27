// var MD5Util = require('md5')
const app = getApp()
const util = require('util')
/**
 * 微信支付
 */
function wxpay({ orderId, orderType}) {
  // 微信预支付
  return new Promise(function (resolve, reject) {
    util.request(app.globalData._server + '/weixin/guimi/getPrepayId', { openId: app.globalData.openid, appId: app.globalData.appid, orderId, orderType }, 'POST')
      .then(res => {
        if (res.prepay){
          // 发起微信支付
          const { nonceStr, paySign, timeStamp, prepayId} = res.prepay
          // const timestamp = String(Date.parse(new Date()))
          // // 按照字段首字母排序组成新字符串
          // let payDataA = "appId=" + app.globalData.appid + "&nonceStr=" + nonceStr + "&package=prepay_id=" + prepayId + "&signType=MD5&timeStamp=" + timestamp + "&key=" + app.globalData.pay_secret
          // // 使用MD5加密算法计算加密字符串
          // const paySign = MD5Util.MD5(payDataA).toUpperCase()
          wx.requestPayment({
            timeStamp: timeStamp,
            nonceStr: nonceStr,
            package: `prepay_id=${prepayId}`,
            signType: 'MD5',
            paySign: paySign, // 签名
            success: res=> {
              console.log('微信支付成功', res)
              wx.showToast({ icon: 'none', title: '微信支付成功' })
              resolve(res)
             },
            fail: err =>{
              console.log('微信支付失败', err)
              if (err.errMsg === 'requestPayment:fail cancel') {
                wx.showToast({ icon: 'none', title: '手动取消支付' })
              } else {
                wx.showToast({ icon: 'none', title: err.err_desc || err.errMsg })
              }
              reject(err)
             }
          })
        }else{
          wx.showToast({ icon: 'none', title: '系统繁忙,请稍后再试' })
        }
      })
      .catch(err=>{
        console.log('微信预支付接口err',err) 
      })
  })
}
// function wxpay(app, money, orderId, order_number, caption, callback = {success:function(){},fail:function(){}}) {
//   wx.showLoading({
//     title: '加载中',
//     mask:true
//   })
//   //发起网络请求,发起的是HTTPS请求，向服务端请求预支付
//   wx.request({
//     url: app.globalData._server + '/weixin/prePay',
//     data: {
//       OPENID: app.globalData.openid,
//       NOTIFY_URL: app.globalData._server + '/weixin/payResult',
//       APPID: app.globalData.appid,
//       PAY_NO: app.globalData.pay_no,
//       PAY_SECRET: app.globalData.pay_secret,  
//       ORDER_NUMBER: order_number,
//       MONEY: money
//     },
//     method: 'POST',
//     success: function (res) {
//       if (res.data.PREPAYID) {
//         var timestamp = String(Date.parse(new Date()))   //时间戳
//         var nonceStr = ''   //随机字符串，后台返回
//         var prepayId = ''    //预支付id，后台返回
//         var paySign = ''     //加密字符串
//         var paymentId = ''     
//         nonceStr = res.data.NONCESTR;
//         prepayId = res.data.PREPAYID;
//         var tradeNo = res.data.out_trade_no;
//         console.log(res);
//         wx.request({
//           url: app.globalData._server + '/weixin/createPaymentRecord',
//           method: 'POST',
//           data: {
//             USER_ID: app.globalData.user_id,
//             OPENID: app.globalData.openid,
//             ORDER_NUMBER: orderId,
//             TOTAL_FEE: money,
//             STATUS:0,
//             OUT_TRADE_NO:tradeNo
//           },
//           success: (res) => {
//             // wx.hideLoading()
//             console.log(res.data);
//             paymentId=res.data.PAYMENT_RECORD_ID
//           }
//         });
//         // 按照字段首字母排序组成新字符串
//         var payDataA = "appId=" + app.globalData.appid + "&nonceStr=" + res.data.NONCESTR + "&package=prepay_id=" + res.data.PREPAYID + "&signType=MD5&timeStamp=" + timestamp;
//         var payDataB = payDataA + "&key=" + app.globalData.pay_secret;
//         // 使用MD5加密算法计算加密字符串
//         paySign = MD5Util.MD5(payDataB).toUpperCase();
//         // 发起微信支付
//         wx.requestPayment({
//           'timeStamp': timestamp,
//           'nonceStr': nonceStr,
//           'package': 'prepay_id=' + prepayId,
//           'signType': 'MD5',
//           'paySign': paySign,
//           success: function (res) {
//             wx.showToast({ icon: 'none', title: '支付成功' })
//             console.log('微信支付成功完成', res)
//             const params = {
//               USER_ID: app.globalData.user_id,
//               ORDER_ID: tradeNo,
//               OPEN_ID: app.globalData.openid,
//               ORDER_NAME: caption,
//               ACCOUNT_NAME: '商户名称',
//               ACCOUNT: app.globalData.pay_no,
//               PAY_TYP: '支付类型',
//               AMOUNT: money,
//               session_key: app.globalData.session_key
//             } 
//             wx.request({
//               url: app.globalData._server + '/weixin/wxAddLexOrderRecord',
//               method: 'POST',
//               data: params,
//               success: res => {
//                 console.log('支付回调...')
//                 // wx.reLaunch({
//                 //   url: redirectUrl
//                 // })
//                 callback.success(res.data)
//               },
//               fail: err => {
//                 console.log('支付回调请求失败')
//               }
//             })


//           },
//           fail: function (err) {
//             wx.showToast({ icon: 'none', title: err.errMsg })
//             console.log('微信支付失败',err)
//             callback.fail()
//           }
//         })
//       }
//     },
//     fail: function(err){
//       wx.showToast({
//         icon:'none',
//         title: '请重新支付',
//       })
//     }
//   }//end of wx.request
//   )////end of //发起网络请求,发起的是HTTPS请求，向服务端请求预支付
//  /* wx.request({
//     url: 'https://api.it120.cc/' + app.globalData.subDomain + '/pay/wxapp/get-pay-data',
//     data: {
//       token:app.globalData.token,
//       money:money,
//       remark:"支付订单 ：" + orderId,
//       payName:"在线支付",
//       nextAction:{type:0, id:orderId}
//     },
//     //method:'POST',
//     success: function(res){
//       console.log('api result:');
//       console.log(res.data);
//       if(res.data.code == 0){
//         // 发起支付
//         wx.requestPayment({
//           timeStamp:res.data.data.timeStamp,
//           nonceStr:res.data.data.nonceStr,
//           package:'prepay_id=' + res.data.data.prepayId,
//           signType:'MD5',
//           paySign:res.data.data.sign,
//           fail:function (aaa) {
//             wx.showToast({title: '支付失败:' + aaa})
//           },
//           success:function () {
//             wx.showToast({title: '支付成功'})
//             wx.reLaunch({
//               url: redirectUrl
//             });
//           }
//         })
//       } else {
//         wx.showToast({title: '服务器忙' + res.data.code})
//       }
//     }
//   })*/
// }

module.exports = {
  wxpay: wxpay
}
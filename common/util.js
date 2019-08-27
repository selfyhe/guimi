const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
/**
 * 小程序的promise没有finally方法，自己扩展下
 */
Promise.prototype.finally = function (callback) {
  var Promise = this.constructor;
  return this.then(
    function (value) {
      Promise.resolve(callback()).then(
        function () {
          return value;
        }
      );
    },
    function (reason) {
      Promise.resolve(callback()).then(
        function () {
          throw reason;
        }
      );
    }
  );
}
// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).format('yyyy-MM-dd hh:mm:ss.S') ==> 2006-07-02 08:09:04.423
// (new Date()).format('yyyy-M-d h:m:s.S')      ==> 2006-7-2 8:9:4.18
Date.prototype.format = function(fmt) {
  let o = {
    'M+': this.getMonth() + 1,
    'd+': this.getDate(),
    'h+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'q+': Math.floor((this.getMonth() + 3) / 3),
    'S': this.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    }
  }
  return fmt;
}
const request = (url, data = {}, method = "GET") => {
  wx.showNavigationBarLoading()
  return new Promise(function(resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        // console.log("request ok")
        if (res.statusCode == 200) {
          resolve(res.data)
          wx.hideNavigationBarLoading()
        } else {
          reject(res.errMsg)
        }
      },
      fail: function(err) {
        console.log("request failed")
        wx.showToast({
          icon: 'none',
          title: '哎呦，网络开小差了≧﹏≦!',
          duration: 3000
        })
        // 好像哪里出了小问题~请再试一次~
        reject(err)
      }
    })
  })
}
// 数据格式效验
const regex = {
  isNumber: /^[0-9]+$/, // 只能输入数字
  isPhone: /^1[0-9]{10}$/,
  isEmail: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
  isTel: /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/,
  isIdCard: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
  isName: /^[\u4E00-\u9FA5]{2,4}$/,
  isMoney: /^(([0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/,
  isWeixin: /[1-9][0-9]{5,19}|^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$/, // 微信号
  isLicenceNo: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/,
}
// 字符串指定位置插入值
const insert = (str, flg, sn) => {
  let start = str.substr(0, sn);
  let end = str.substr(sn, str.length);
  let newstr = start + flg + end;
  return newstr;
}
/**
 * 判断对象是否是空对象
 * @method isEmptyObject
 * @param {object} 对象
 * @return {boolean}
 */
const isEmptyObject = (obj) => {
  return JSON.stringify(obj) === '{}'
}
/**
 * 比较日期时间差
 * @method getDateDiff
 * @param {String} startDate 开始日期
 * @param {String} endDate 参考版本
 * @return {number} 返回日期时间差
 */
let getDateDiff = (startDate, endDate) => {
  let startTime = new Date(Date.parse(startDate.replace(/-/g, '/'))).getTime();
  let endTime = new Date(Date.parse(endDate.replace(/-/g, '/'))).getTime();
  return (endTime - startTime) / (1000 * 60 * 60 * 24);
};
// 从对象中删除属性
const cleanObj = (obj, keysToKeep = [], childIndicator) => {
  Object.keys(obj).forEach(key => {
    if (key === childIndicator) {
      cleanObj(obj[key], keysToKeep, childIndicator);
    } else if (!keysToKeep.includes(key)) {
      delete obj[key];
    }
  });
  return obj;
}
// 同toString,对象转成字符串 勿用
const toString = (object) => {
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      const value = object[key]
      object[key] = value + ''
    }
  }
} 
/**
 * json转url参数
 * @method parseParams
 * @param {Object} json对象
 * @return {String} 解码后url参数
 */
const parseParams = json => {
  return Object.keys(json).map(key => encodeURIComponent(key) + "=" + encodeURIComponent(json[key])).join("&")
}
/*
 * 获取链接某个参数
 * @method getUrlParam
 * @param {String} url 链接地址
 * @param {String} name 参数名称 
 * @return {String} 返回参数值
 */
const getUrlParam = (url, name) => {
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)")
  let r = url.split('?')[1].match(reg)
  if (r != null) return unescape(r[2])
  return null
}
// 调用接口wx.login() 获取临时登录凭证（code）
const login = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: function(res) {
        if (res.code) {
          resolve(res)
        } else {
          console.log('登录失败！' + res.errMsg)
          // 登录错误 
          wx.showModal({ 
            title: '登录失败，请重试',
            content: '微信登录失败！' + res.errMsg,
            showCancel: false
          })
          reject(res)
        }
      },
      fail: function(err) {
        wx.showModal({
          title: '提示',
          content: 'wx.login[' + res.errMsg + ']微信登录失败',
          showCancel: false,
          confirmText: '再试一次',
          success: function (res) {
            if (res.confirm) {
              login()
            }
          }
        })
        reject(err)
      }
    })

  })
}
// 在线上环境下禁用调试语句
const debug = (isDebug) => {
  if (!isDebug) {
    console.log = console.error = console.info = function() {}
  }
}

// 函数防抖 debounce
// const debounce = (fun, delay) => {
//   let timeout
//   return function() {
//     let context = this
//     let _args = arguments
//     clearTimeout(timeout)
//     timeout = setTimeout(function() {
//       fun.call(context, _args)
//     }, delay)
//   }
// }
// 函数防抖 debounce (立即调用版)
// {immediate} 是否立即调用
const debounce = (func, wait, immediate) => {
  let timeout, result;

  return function () {
    let context = this;
    let args = arguments;

    if (timeout) clearTimeout(timeout);
    if (immediate) {
      // 如果已经执行过，不再执行
      let callNow = !timeout;
      timeout = setTimeout(function () {
        timeout = null;
      }, wait);
      if (callNow) result = func.apply(context, args);
    } else {
      timeout = setTimeout(function () {
        result = func.apply(context, args);
      }, wait);
    }
    return result;
  };
};
// 函数节流 throttle
const throttle = (fn, gapTime) => {
  let _lastTime = 0
  return function () {
    let _nowTime = + new Date()
    if (_nowTime - _lastTime > gapTime) {
      fn.apply(this, arguments)
      _lastTime = _nowTime
    }
  }
}
/**
 * toast提示
 * @method toast
 * @param {string} title 提示文字.
 * @param {Number} duration 提示显示时间.
 * @param {string} icon 显示图标，有三个值可选success/loading/none.
 */
const toast = (title, duration = 1500, icon = 'none') => {
  wx.showToast({
    title: title,
    icon: icon,
    duration: duration
  });
};

/**
 * 有按钮的提示
 * @method alert
 * @param {string} title 提示标题.
 * @param {string} content 提示内容.
 * @param {boolean} showCancel 是否显示取消按钮.
 */
const alert = (title = '提示', content = defaultAlertMsg, showCancel = false) => {
  if (typeof content === 'object') {
    content = JSON.stringify(content) || defaultAlertMsg;
  }
  wx.showModal({
    title: title,
    content: content,
    showCancel: showCancel
  });
};
// 获取设备系统信息
const sysInfo = ()=>{
  return wx.getSystemInfoSync()
}
// 小程序更新
const checkUpdate = () => {
  if (wx.canIUse('getUpdateManager')) {
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function(res) {
      // 请求完新版本信息的回调
      console.log('小程序是否有新版本：', res.hasUpdate);
    })

    updateManager.onUpdateReady(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(function() {
      // 新版本下载失败
      console.log('新的版本下载失败')
      wx.showModal({
        title: '已经有新版本了哟~',
        content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
      })
    })
  }
}
// 地理位置授权检查
// https://developers.weixin.qq.com/miniprogram/dev/api/wx.openSetting.html
// 注意：2.3.0 版本开始，用户发生点击行为后，才可以跳转打开设置页，管理授权信息
/**
 * 'scope.userLocation'
 * '定位需要开始位置授权'
 */
const getUserAuthSetting = (scope,content)=>{
  return new Promise(function (resolve, reject) {
    wx.getSetting({
      success(res) {
        console.log(`检查${scope}授权`)
        console.log(res.authSetting)
        if (res.authSetting[scope] !== false){
          resolve()
        }else{
          // reject()
          wx.showModal({
            title: '授权',
            content: content,
            showCancel: false,
            success: res => {
              if (res.confirm) {
                wx.openSetting({
                  success(res) {
                    console.log(res.authSetting)
                    // res.authSetting = {
                    //   "scope.userInfo": true,
                    //   "scope.userLocation": true
                    // }
                  }
                })
              }
            }
          })
        }
      }
    })
  })
}
module.exports = {
  formatTime,
  formatNumber,
  regex,
  request,
  insert,
  isEmptyObject,
  parseParams,
  getUrlParam,
  cleanObj,
  login,
  debug,
  debounce,
  throttle,
  toast,
  alert,
  sysInfo,
  checkUpdate,
  getUserAuthSetting
}
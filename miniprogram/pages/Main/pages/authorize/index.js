// miniprogram/pages/Main/pages/authorize/index.js
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    btnType:1,
    datas: ''
  },

  // 只有提升新用户才会走到这里来
  onLoad(options){
    
    if (options.datas){
      this.setData({
        datas: JSON.parse(decodeURIComponent(options.datas))
      })
    }

    this.setData({
      btnType: options.authType
    })

  },

  // 授权用户信息
  getUserInfo(e) {
    
    var that = this;
    var ency = e.detail.encryptedData;
    var iv = e.detail.iv;

    if (iv == null || ency == null) {
      wx.showToast({
        title: "为确保能正常访问商城，需要授权您的用户信息，感谢您的配合",
        icon: 'none',
      })
      return false
    }

    app.ajax('/ffkj-main/api/user/miniapp/auth2', {
      userId: app.data.userid,
      sessionKey: app.data.sessionKey,
      encryptedData: ency,
      ivStr: iv
    },'get',res=>{
      if( res.code == 0 ){
        if ( !res.data.userHasPhone ){
          that.setData({
            btnType: 2
          })
        }
        else{
          that.goInto()
        }
      }
      else{
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },

  // 授权手机号
  getPhoneNumber(e) {

    var that = this
    var ency = e.detail.encryptedData;
    var iv = e.detail.iv;
    var errMsg = e.detail.errMsg

    if (iv == null || ency == null) {
      wx.showToast({
        title: "亲，绑定手机号后达人及以上身份才可以享受返利补贴，提现等更多小程序的服务哦",
        icon: 'none',
      })
      return false
    }

    app.ajax('/ffkj-main/api/user/miniapp/auth3',{
      userId: app.data.userid,
      sessionKey: app.data.sessionKey,
      encryptedData: ency,
      ivStr: iv
    },'get',res=>{
      if( res.code == 0 ){
        that.goInto()
      }
      else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    }) 
  },


  // 回到绑定关系页面
  goInto(){
    let that = this
    wx.redirectTo({
      url: '/pages/Main/pages/bindUserPage/index?sceneLx=' + encodeURIComponent(JSON.stringify(that.data.datas))
    })
    return false;
  }

})
// miniprogram/pages/test/index.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,

    userTypes: app.globalData.userTypes,

    showNickAlert: false,
    user: {},

    eve: 'nick',
    tel: '',

    phoneState: 0,

    phones:{}
  },
  
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.myinfo2()
    // this.fnPhone()
    
    this.setData({
      phoneState: app.data.phoneState,
      user: app.globalData.users
    })

  },

  // 获取手机号状态
  fnPhone(){
    app.ajax('/ffkj-main/user/phoneStatus', {}, 'get', (res) => {
      console.log(res)
      if (res.code == 0) {
        this.setData({
          phones: res.data
        })
      }
    })
  },

  // 点击验证手机号
  regPhoneNumber(e) {
    var that = this
    var ency = e.detail.encryptedData;
    var iv = e.detail.iv;
    var errMsg = e.detail.errMsg
    if (iv == null || ency == null) {
      wx.showToast({
        title: "为确保能正常访问商城，需要授权您的手机号码，感谢您的配合",
        icon: 'none',
      })
      return false
    }
    app.ajax('/ffkj-main/user/authPhone', {
      userId: app.data.userid,
      sessionKey: app.data.sessionKey,
      encryptedData: ency,
      ivStr: iv
    }, 'get', res => {
      if (res.code == 0) {
        // that.fnPhone()
        that.myinfo2()
        that.setData({
          phoneState: 1
        })
      }
    })
  },

  // 同步账号
  synchronizeSamePhone(){
    let that = this
    app.ajax('/ffkj-main/user/synchronizeSamePhone', {
      phone: that.data.phones.phone
    }, 'get', (res) => {
      if (res.code == 0) {
        // that.fnPhone()
        that.myinfo2()
        that.setData({
          phoneState: 1
        })
      }
    })
  },


  // 手机号码授权
  fnGetPhoneNumber(e) {
    let that = this
    app.getPhoneNumber(e, res => {
      if (res.code == 0) {
        that.setData({
          phoneState: 1
        })
        // that.fnPhone()
        that.myinfo2()
      }
    })
  },

  navBack() {
    wx.navigateBack({})
  },


  // 我的个人信息
  myinfo2() {
    app.ajax('/ffkj-main/user/queryUserInfoById', {}, 'get', (res) => {
      if (res.code == 0) {
        app.globalData.users = res.data
        this.setData({
          user: res.data
        })
      }
    })
  },
  

  fnShowNickAlert(e) {
    // console.log(e)
    this.setData({
      showNickAlert: true,
      eve: e.currentTarget.dataset.eve
    })
  },


  fnclose(){
    this.setData({
      showNickAlert: false
    })
  },

  

  // 修改昵称
  fnEdit(e) {
    if (e.detail.value.userName.trim() == '' ){
      wx.showToast({
        title: '输入不能为空',
        icon: 'none'
      })
      return false;
    }
    app.ajax('/ffkj-main/user/editMyInfo?userName=' + e.detail.value.userName, {}, 'put', res => {
      if (res.code == 0) {
        app.globalData.users.userName = e.detail.value.userName
        this.setData({
          showNickAlert: false,
          user: app.globalData.users
        })
        wx.showToast({
          title: '昵称修改成功',
          icon: 'none'
        })
        this.myinfo()
      }
    })
  },

  // 我的个人信息
  myinfo() {
    this.setData({
      user: app.globalData.users
    })
  },

})
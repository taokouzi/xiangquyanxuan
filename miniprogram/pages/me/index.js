// pages/me/index.js
let app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    winWidth: 0,
    winHeight: 0,
    isSK:true,

    userTypes: app.globalData.userTypes,

    kf: '',
    showKefu: false,

    showRedTips: false,


    user: {},
    userState:0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    
    if (app.globalData.config.kf == '') {
      app.fnConfig(res => {
        app.globalData.config = {
          kf: res.data['24'],
          weChat: res.data['22'],
          daRenMiJi: res.data['21']
        }
        this.setData({
          kf: res.data['24']
        })
      })
    }
    else {
      this.setData({
        kf: app.globalData.config.kf
      })
    }


    if (app.globalData.users.headImg == ''){
      that.myinfo2()
    }

    
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth*.5+'px'
        });
      }
    });


  },

  toggleShowRedTips(e){
    if ( !e.currentTarget.dataset.fansflag ){
      this.setData({
        showRedTips: !this.data.showRedTips
      })
    }
  },

  alignUserInfo(e){
    let that = this
    app.getUserInfo(e, res => {
      if (res.code == 0) {
        that.myinfo2()
        that.setData({
          userState: 1
        })
        // wx.showToast({
        //   title: '资料已更新',
        //   icon: 'none'
        // })
        app.globalData.Toast.success({
          message: '资料已更新',
          selector: '#custom-selector'
        })
      }
    })
  },

  onShow: function () {
    this.setData({
      userState: app.data.userState
    })
    this.myinfo()
    this.myProfit()
  },

  // 用户授权个人信息
  fnGetUserInfo(e) {
    let that = this
    app.getUserInfo(e, res => {
      if (res.code == 0 ) {
        that.myinfo2()
        that.setData({
          userState: 1
        })
      }
    })
  },

  fnKefu(){
    this.setData({
      showKefu:true
    })
  },

  onClose(){
    this.setData({
      showKefu: false
    })
  },

  fnphone(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.tel
    })
  },

  // 联系电话
  callService(e){
    wx.makePhoneCall({
      phoneNumber: e.target.dataset.tel
    })
  },


  myinfo2(){
    app.ajax('/ffkj-main/user/queryUserInfoById', {}, 'get', (res) => {
      if (res.code == 0) {
        this.setData({
          user: res.data,
          userState: res.data.headImg ? 1 : 0,
          isSK: false
        })
        app.globalData.users = res.data
      }
    }, () => { }, '', 'notloading')
  },
  
  // 我的个人信息
  myinfo() {
    this.setData({
      user: app.globalData.users,
      isSK: false
    })
  },
  
  // 授权用户信息
  getUserInfo(){
    // 必须是在用户已经授权的情况下调用
    wx.getUserInfo({
      success: function (res) {
        var userInfo = res.userInfo
        var nickName = userInfo.nickName
        var avatarUrl = userInfo.avatarUrl
        var gender = userInfo.gender //性别 0：未知、1：男、2：女
        var province = userInfo.province
        var city = userInfo.city
        var country = userInfo.country
      }
    })
  },
  
  // 我的收益
  myProfit() {
    app.ajax('/ffkj-main/user/profit', {
      'my-zone': 'fangfang'
    }, 'get', res => {
      // console.log(res)
      if (res.code == 0) {
        this.setData({
          profit: res.data
        })
      }
    }, () => { }, '', 'notloading')
  },
  


})
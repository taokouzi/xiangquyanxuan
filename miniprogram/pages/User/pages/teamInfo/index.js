// miniprogram/pages/test/index.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,


    showNickAlert: false,
    showLevelAlert: false,
    showRemarkAlert: false,
    user: {},

    eve: 'nick',
    tel: '',
    type:'',
    id: ''
  },
  
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      type: options.type,
      id: options.id
    })
    
  },
  onShow(){
    this.userInfo()
  },

  navBack() {
    wx.navigateBack({})
  },
  

  // 用户信息
  userInfo() {
    let that = this
    app.ajax('/ffkj-main/user/queryUserInfoById', {
      subordinateUserId: that.data.id
    }, 'get', (res) => {
      if (res.code == 0) {
        this.setData({
          user: res.data
        })
      }
    })
  },

  // 修改名称
  fnShowNickAlert(e) {
    this.setData({
      showNickAlert: true,
      eve: e.currentTarget.dataset.eve
    })
  },

  // 修改等级
  fnShowLevelAlert(){
    this.setData({
      showLevelAlert: true
    })
  },

  // 修改备注
  fnShowRemarkAlert(){
    this.setData({
      showRemarkAlert: true
    })
  },

  // 关闭
  fnclose(){
    this.setData({
      showRemarkAlert: false,
      showLevelAlert: false
    })
  },



  // 修改 等级/备注
  fnEdit(e) {
    let ty = e.currentTarget.dataset.type;
    let type = this.data.type;
    
    let that = this, subordinateType, level, remark;

    if (type == 'tz' ){
      level = (ty == 'lv' ? e.detail.value.level : this.data.user.level)
      remark = (ty == 'rk' ? e.detail.value.remark : this.data.user.remark)
    }
    else{
      level = (ty == 'lv' ? e.detail.value.level : this.data.user.levelTop)
      remark = (ty == 'rk' ? e.detail.value.remark : this.data.user.remarkTop)
    }

    if( this.data.type == 'tz' ){
      subordinateType = 'SMART'
    }
    else{
      subordinateType = 'SMARTLEADER'
    }

    app.ajax('/ffkj-main/userRule/subordinateInfo/' + that.data.id + '?subordinateType=' + subordinateType + '&level=' + (level || '') + '&remark=' + (remark || ''), {}, 'put', res => {
      if (res.code == 0) {
        that.userInfo()
        that.fnclose()
        wx.showToast({
          title: '修改成功',
          icon: 'none'
        })
      }
    })
  },


})
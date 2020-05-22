// miniprogram/pages/Other/pages/rule/index.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,

    container: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    if (app.globalData.config.daRenMiJi == '') {
      app.fnConfig(res => {
        app.globalData.config = {
          kf: res.data['24'],
          weChat: res.data['22'],
          daRenMiJi: res.data['21']
        }
        this.setData({
          container: res.data['21']
        })
      })
    }
    else {
      this.setData({
        container: app.globalData.config.daRenMiJi
      })
    }
   
  },


  navBack() {
    wx.navigateBack({})
  },


})
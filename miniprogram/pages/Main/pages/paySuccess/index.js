// miniprogram/pages/Main/pages/paySuccess/index.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,
    isSK: true,
    
    orders: null,
    type: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      type: options.type
    })
    this.orderInfo(options.id)
  },

  // 支付订单轮询
  orderInfo(id) {
    app.ajax('/ffkj-order/order/getOrderDetails/' + id, {}, 'post',res => {
      if (res.code == 0) {
        this.setData({
          orders: res.data
        })
      }
      else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },
  
  // 查看订单
  goOrder(){
    wx.redirectTo({
      url: '/pages/Main/pages/orderDetails/index?type=' + this.data.type +'&id=' + this.data.orders.id
    })
  },

  // 商城首页
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },



})
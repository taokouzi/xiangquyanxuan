// miniprogram/pages/Main/pages/expressList/index.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,
    orstatus: [
      {
        id: 0,
        src: "",
        title: '待支付',
        text: ''
      },
      {
        id: 1,
        src: '/images/or1.png',
        title: '已支付',
        text: '您的包裹正在打包，请耐心等待哦'
      },
      {
        id: 2,
        src: '/images/or2.png',
        title: '已发货',
        text: '商品正在向您飞奔'
      },
      {
        id: 3,
        src: '/images/or3.png',
        title: '交易完成',
        text: '祝您天天好心情'
      },
      {
        id: 4,
        src: "",
        title: '交易关闭',
        text: ''
      }
    ],

    showNav: false,
    or:{},
    express: []
  },

  // 滚动页面改变顶部状态栏样式
  onPageScroll(e) {
    if (e.scrollTop > 100) {
      this.setData({
        showNav: true
      })
    }
    else {
      this.setData({
        showNav: false
      })
    }
  },
  // 复制物流单号
  copyWLCode(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.code,
      success() {
        wx.showToast({
          title: '物流单号已复制',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.order(options.id)
    this.setData({
      express: (JSON.parse(options.wls)).reverse()
    })
  },
  
  navBack() {
    wx.navigateBack({})
  },
  
  
  order(orderid) {
    app.ajax('/ffkj-order/order/' + orderid, {}, 'get',res => {
      if (res.code == 0) {
        this.setData({
          or: res.data
        })
      }
    })
  },
})
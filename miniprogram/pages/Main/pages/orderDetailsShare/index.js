let app = getApp()
Page({
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,

    or:{},

    orderId: '',
  },


  // 绑定关系（分享订单）
  fnBindShareGoods(sharerId, commodityId) {
    app.ajax('/ffkj-main/api/user/auth1_3', {
      sharerId: sharerId,
      commodityId: commodityId
    }, 'get', res => {
      if (res.code == 0) {
        app.data.isNewUser = false
        console.log('订单分享 新用户绑定成功')
      }
    })
  },

  onLoad: function (options) {
    console.log(options)
    let that = this
    if(app.data.userid == '') {
      app.getCode(() => {
        that.bind(options)
      })
    }
    else {
        that.bind(options)
    }
  },

  bind(options){
    if (options.orderId) {
      app.myinfo()
      this.setData({
        orderId: options.orderId
      })
      this.showOrderInfo(options.orderId)
    }
  },
  
  
  showOrderInfo(orderId){
    app.ajax('/ffkj-order/order/shareOrder/' + orderId, {}, 'get', res => {
      if (res.code == 0 ) {
        console.log(res)
        // 直接分享者id
        app.globalData.buyerId = res.data.userId || ''
        // 上级身份者id
        app.globalData.shareId = res.data.shareUserid || ''

        // 绑定关系
        if (app.data.isNewUser && res.data.shareUserid ) {
          this.fnBindShareGoods(res.data.shareUserid, res.data.commodityId)
        }
        

        this.setData({
          or: res.data,
          shareId: res.data.shareUserid || '',
          time: new Date().getTime()
        })
      }
    })
  },
  
  // 回首页
  fnhome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  

})
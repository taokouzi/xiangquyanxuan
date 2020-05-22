// miniprogram/pages/test/index.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,
    com: '',
    page: 0,
    addrs: [],
    isSK: true,
    wx: wx.getSystemInfoSync(),
    isIphoneFullScreen: app.globalData.isIphoneFullScreen,

    showDixian:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.com ){
      this.setData({
        com: options.com
      })
    }
  },
  navBack() {
    wx.navigateBack({})
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.fn()
  },


  fn(){
    this.setData({
      page: 0
    })
    this.fnlist()
  },

  // 地址列表回显
  fnlist() {
    let addrs = []
    if (this.data.page == 0) {
      this.data.addrs = []
    }
    this.data.page++;
    app.ajax('/ffkj-main/userAddress/getUserAddressList', {
      userId: app.data.userid,
      pageNum: this.data.page,
      pageSize: 10
    }, 'get', res => {
      if (res.code == 0) {
        if (res.data.list.length == 0) {
          this.setData({
            showDixian: 1,
            isSK:false
          })
          return false
        }
        else {
          this.data.addrs = this.data.addrs.concat(res.data.list)
          this.setData({
            addrs: this.data.addrs,
            showDixian: res.data.list.length<10?1:0,
            isSK: false
          })
        }
      }
    })
  },


  // 删除地址
  deleteAddr(e) {
    let vm = this
    wx.showModal({
      title: '',
      content: '确定要删除该地址吗？',
      success(res) {
        if (res.confirm) {
          app.ajax('/ffkj-main/userAddress/deletteUserRecAddress?ids=' + e.currentTarget.dataset.id, {}, 'delete', res => {
            if (res.code == 0) {
              wx.showToast({
                title: '已删除',
                icon: 'none'
              })
              vm.fn()
            }
            else {
              wx.showToast({
                title: res.message,
                icon: 'none'
              })
            }
          })
        }
        else if (res.cancel) {}
      }
    })
  },
  
  // 设置默认地址
  setMrAddr(e) {
    app.ajax('/ffkj-main/userAddress/setDefaultUserAddress?id=' + e.currentTarget.dataset.id, {}, 'put', res => {
      if (res.code == 0) {
        this.fn()
        if (this.data.com) {
          wx.navigateBack({})
        }
        else {
          wx.showToast({ title: '默认地址设置成功', icon: 'none' })
        }
      }
      else {
        wx.showToast({ title: res.message, icon: 'none' })
      }
    })
  },


  fnAddrEdit(){
    wx.navigateTo({
      url: '../addrEdit/index',
    })
  }
})
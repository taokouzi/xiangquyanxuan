// miniprogram/pages/test/index.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,

    lists: [],
    page: 0,
    finished: false,
    showDixian: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.txList()
  },

  navBack() {
    wx.navigateBack({})
  },

  txList() {
    if (this.data.page == 0) {
      this.data.lists = []
    }
    this.data.page++;

    app.ajax('/ffkj-main/withdrawal/query', {
      userId: app.globalData.userid,
      pageNum: this.data.page,
      pageSize: 10
    }, 'get',res => {
      if (res.code == 0) {
        if (res.data.list.length == 0) {
          this.setData({
            finished: true,
            showDixian: 1
          })
        }
        else {
          for (let i in res.data.list) {
            this.data.lists.push(res.data.list[i])
          }
          this.setData({
            lists: this.data.lists,
            showDixian: res.data.list.length < 10 ?1:0
          })
        }
      }
    })
  },


})
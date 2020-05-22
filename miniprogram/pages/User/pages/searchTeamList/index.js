let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,
    wx: wx.getSystemInfoSync(),
    list: [],
    page:0,
    type:'',
    userName: '',
    showDixian:0,

    urlFrom:'',

    value: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      type: options.type,
      urlFrom: options.comfrom
    })
  },


  searchScrollLower(){
    let that = this
    if (this.data.page == 0) {
      this.data.list = []
    }
    // 我的客户
    if (this.data.urlFrom == 'myCustom' ){
      this.fnCustomList({ detail: { value: that.data.value, more: true}})
    }
    else{
      this.fnTeamList({ detail: { value: that.data.value, more: true} })
    }
  },
  // 团长查看达人列表
  fnTeamList(e) {
    if (e.detail.value == '' ){
      this.setData({
        list: []
      })
      return;
    }
    
    let url;
    // 团长查看下属达人
    if (this.data.type == 'tz') {
      url = 'getSmartList'
    }
    // 推广员查看下属团长
    else {
      url = 'getTeamLeaderList'
    }
    
    let list = []
    if (e.detail.more) {
      this.data.page++;
    }
    this.setData({
      value: e.detail.value
    })
    app.ajax('/ffkj-main/user/' + url, {
      pageNum: e.detail.more ? this.data.page : 1,
      pageSize: 10,
      userName: e.detail.value
    }, 'post', res => {
      if (res.code == 0) {
        if (res.data.data.length == 0) {
          this.setData({
            showDixian: 1
          })
          if (!e.detail.more) {
            this.setData({
              list: res.data.data
            })
          }
          return false
        }
        else {
          this.data.list = e.detail.more ? this.data.list.concat(res.data.data) : res.data.data
          this.setData({
            list: this.data.list,
            showDixian: res.data.data.length < 10 ? 1 : 0
          })
        }
      }
    }, () => { }, '', 'notloading')
  },

  // 我的客户列表
  fnCustomList(e) {
    if (e.detail.value == '') {
      this.setData({
        list: []
      })
      return;
    }
    let list = []
    if (e.detail.more){
      this.data.page++;
    }
    this.setData({
      value: e.detail.value
    })
    app.ajax('/ffkj-main/user/getCustomerList', {
      pageNum: e.detail.more ? this.data.page : 1,
      pageSize: 10,
      userName: e.detail.value
    }, 'post', res => {
      if (res.code == 0) {
        if (res.data.data.length == 0) {
          this.setData({
            showDixian: 1
          })
          if (!e.detail.more ){
            this.setData({
              list: res.data.data
            })
          }
          return false
        }
        else {
          this.data.list = e.detail.more ? this.data.list.concat(res.data.data) : res.data.data
          this.setData({
            list: this.data.list,
            showDixian: res.data.data.length < 10 ? 1 : 0
          })
        }
      }
    }, () => { }, '', 'notloading')
  },

  
  navBack() {
    wx.navigateBack({})
  },
})
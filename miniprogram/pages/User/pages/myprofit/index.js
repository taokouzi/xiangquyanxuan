let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,

    isSK: true,
    florder: [],
    userType: '',
    profit: {
      canWithdraw: 0,
      hasWithdraw: 0,
      directIncome: 0,
      headIncome: 0
    },

    page: 0,
    finished: false,

    showNav: false,

    showDixian: 0,

    userMessage:'',

    phoneState: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.myinfo()
    this.florderLists()
    
  },
  onShow(){
    this.setData({
      phoneState: app.data.phoneState
    })
    this.myProfit()
  },


  // 手机号码授权
  fnGetPhoneNumber(e) {
    app.getPhoneNumber(e, res => {
      // console.log(res)
      if (res.code == 0) {
        this.setData({
          phoneState: 1
        })
      }
    })
  },





  navBack() {
    wx.navigateBack({})
  },
  

  // 手机号码授权
  fnGetPhoneNumber(e) {
    app.getPhoneNumber(e, res => {
      console.log(res)
      if (res.code == 1) {
        this.setData({
          phoneState: 1
        })
      }
    })
  },


  // 收益
  myProfit() {
    app.ajax('/ffkj-main/user/profit', {}, 'get', (res) => {
      if (res.code == 0) {
        this.setData({
          profit: res.data
        })
      }
    })
  },

  // 我的个人信息
  myinfo() {
    app.ajax('/ffkj-main/user/queryUserInfoById', {},'get',res => {
      if (res.code == 0) {
        this.setData({
          userType: res.data.userType
        })
      }
    })
  },
  // 返利订单列表
  florderLists() {
    wx.showLoading({
      title: '数据加载中',
    })
    if (this.data.page == 0) {
      this.data.florder = []
    }
    this.data.page++;
    app.ajax('/ffkj-order/order/page/rebate', {
      pageNum: this.data.page,
      pageSize: 10
    }, 'get',res => {
      if (res.code == 0) {
        if (res.data.list.length == 0) {
          this.setData({
            finished: true,
            showDixian: 1,
          })
        }
        else{
          for (let i in res.data.list) {
            this.data.florder.push(res.data.list[i])
          }
          this.setData({
            florder: this.data.florder,
            showDixian: res.data.list.length < 10 ? 1 : 0,
            isSK: false
          })
          wx.hideLoading()
        }
      }
    })
  },


  // 滚动页面改变顶部状态栏样式
  pageScroll(e) {
    if (e.detail.scrollTop > 100) {
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


})

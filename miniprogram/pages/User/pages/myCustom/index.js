let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,

    list: [],
    page:0,

    // 总收益和人数
    num:{
      members: 0,
      totalIncome: 0,
      totalContribution: 0
    },

    showDixian:0,
    showNav: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /*onPageScroll(e) {
    console.log(e)
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
  },*/
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      page: 0
    })
    this.fnNum()
    this.fnList()
  },
  //滚动到底部触发事件  
  searchScrollLower: function (e) {
    this.fnList()
  },


  // 收益和人数
  fnNum(){
    app.ajax('/ffkj-main/user/getSmartProfit',{},'get',res=>{
      if( res.code == 0 ){
        this.setData({
          num: {
            members: res.data.members,
            totalIncome: res.data.totalIncome,
            totalContribution: res.data.totalContribution
          }
        })
      }
    })
  },
  // 我的客户列表
  fnList(){
    let list = []
    if (this.data.page == 0) {
      this.data.list = []
    }
    this.data.page++;

    app.ajax('/ffkj-main/user/getCustomerList', {
      pageNum: this.data.page,
      pageSize: 10,
      userName: ""
    }, 'post', res => {
      if (res.code == 0) {
        if (res.data.data.length == 0) {
          this.setData({
            showDixian: 1
          })
          return false
        }
        else {
          this.data.list = this.data.list.concat(res.data.data)
          this.setData({
            list: this.data.list,
            showDixian: res.data.data.length < 10 ? 1 : 0
          })
        }
      }
    })
  },

  navBack() {
    wx.navigateBack({})
  },
})
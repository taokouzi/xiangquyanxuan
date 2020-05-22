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
      totalIncome: 0
    },
    type:'',

    showDixian:0,
    showNav: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    // options.type = 'tz'
    this.setData({
      type: options.type
    })
    
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
    
    // this.setData({
    //   list: [],
    //   num: {
    //     members: 0,
    //     totalIncome: 0
    //   },
    //   type:''
    // })
  },
  //滚动到底部触发事件  
  searchScrollLower: function () {
    this.fnList()
  },


  // 收益和人数
  fnNum(){
    let url;
    // 团长查看下属达人
    if (this.data.type == 'tz' ){
      url = 'getTeamLeaderProfit'
    }
    // 推广员查看下属团长
    else{
      url = 'getTopSmartProfit'
    }
    app.ajax('/ffkj-main/user/' + url,{},'get',res=>{
      if( res.code == 0 ){
        this.setData({
          num: {
            members: res.data.members,
            totalIncome: res.data.totalIncome
          }
        })
      }
    })
  },
  // 团长查看达人列表
  fnList(){
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
    if (this.data.page == 0) {
      this.data.list = []
    }
    this.data.page++;

    app.ajax('/ffkj-main/user/' + url, {
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
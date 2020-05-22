// miniprogram/pages/User/pages/news/index.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,
    isSK:true,
    news:[],
    page: 0,
    showDixian: 0,
    
    wx: wx.getSystemInfoSync()
  },



  onLoad(){
    // let that = this
    // wx.getSystemInfo({
    //   success(res){
    //     console.log(res)
    //     that.setData({
    //       wx:res
    //     })
    //   }
    // })
  },


  navBack() {
    wx.navigateBack({})
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.fnnews()
  },

  // 回显
  fnnews() {
    let news = []
    if (this.data.page == 0) {
      this.data.news = []
    }
    this.data.page++;
    app.ajax('/ffkj-main/userMessage/getUserSysInfoByUserId', {
      pageNum: this.data.page,
      pageSize: 10
    }, 'get',res => {
      if (res.code == 0) {
        if (res.data.list.length == 0) {
          this.setData({
            showDixian: 1,
            isSK: false
          })
          return false
        }
        else{
          let arr=[]
          for (let i in res.data.list) {
            res.data.list[i].show = false
            arr.push(res.data.list[i])
          }
          this.data.news = this.data.news.concat(arr)
          this.setData({
            news: this.data.news,
            showDixian: res.data.list.length < 10 ? 1:0
          })
        }
        this.setData({
          isSK: false
        })
      }
    })
  },


  // 切换
  showItem(e){
    this.data.news[e.currentTarget.dataset.index].show = !e.currentTarget.dataset.item
    this.setData({
      news: this.data.news
    })
  }


})
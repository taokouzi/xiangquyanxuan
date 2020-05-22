// miniprogram/pages/Other/pages/city/index.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,

    showList: false,

    hotCity: [
      '北京市',
      '上海市',
      '广州市',
      '深圳市',
      '成都市',
      '杭州市',
      '武汉市',
      '重庆市',
      '天津市'
    ],

    nowCity: app.globalData.nowCity,
    cityList: app.globalData.cityList
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.list()
  },

  navBack() {
    wx.navigateBack({})
  },

  fnSelectCity(e) {
    let item = e.currentTarget.dataset.item

    app.globalData.selectCityObj = {
      city: item.option ? item.option[0].c : item.c,
      cityId: item.option ? item.option[0].cid : item.cid
    }
    app.data.appid = item.option ? item.option[0].aid : item.aid


    // 返回更新站点商品列表
    /*let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]; 
    prevPage.fnLoad()
    wx.navigateBack({
      delta: 1  // 返回上一级页面。
    })*/

    // 返回首页再重新渲染一次
    app.globalData.isShuaxinIndex = true
    wx.navigateBack({})

  },


  list(){

    if (this.data.cityList == '' || this.data.nowCity.cityId == '') {
      let cityIdx = [], citys = []
      app.ajax('/ffkj-main/region/opened',{},'get', res => {
        if (res.code == 0) {
          // 按汉字拼音排序
          res.data.sort(
            (a, b) => {
              a = a.cityName
              b = b.cityName
              return a.localeCompare(b, "zh");
            }
          )
          // 遍历重组列表
          for (let t in res.data) {
            if (app.data.appid == res.data[t].appId) {
              this.setData({
                nowCity: {
                  c: res.data[t].cityName,
                  cid: res.data[t].cityId,
                  aid: res.data[t].appId
                }
              })
            }

            cityIdx.push( app.fngetPy(res.data[t].cityName)[0])

            citys.push({
              w: app.fngetPy(res.data[t].cityName)[0],
              option: [{
                c: res.data[t].cityName,
                cid: res.data[t].cityId,
                aid: res.data[t].appId
              }]
            })
          }

          this.setData({
            cityList: {
              cityIdx: cityIdx,
              citys: citys
            },
            showList:true
          })
        }
      })

    }
    else {
      this.setData({
        showList: true
      })
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  
})
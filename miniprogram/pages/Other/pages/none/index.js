// miniprogram/pages/Other/pages/none/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 该文件夹不能删除！！！！
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 该文件夹不能删除！！！！
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
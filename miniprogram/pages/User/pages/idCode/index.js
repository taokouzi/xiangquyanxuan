// miniprogram/pages/test/index.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,

    userTypes: app.globalData.userTypes,

    showNickAlert: false,
    user: {},

    eve: 'nick',
    tel: '',

    phoneState: 0,

    showPosterLayer: false,
    ewmsrc:'',
    ewmTime: '',
    userType: 2,
    type: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      type: options.type,
      userType: options.type=='tz'? 2: 4,
      users: app.globalData.users
    })

    this.showEwmInfo()
  },
  navBack() {
    wx.navigateBack({})
  },

  // 我的二维码
  showEwmInfo() {
    let that = this;
    wx.showLoading({
      title: '二维码加载中...',
    })
    // 团长生成的二维码
    if (this.data.type == 'tz') {
      this.setData({
        ewmsrc: app.data.url + '/ffkj-main/userRule/miniapp/qrcode?promoteType=NORMAL_TO_SMART&userId=' + app.data.userid + '&appId=' + app.data.appid + '&page=pages/Main/pages/bindUserPage/index&scene=' + encodeURIComponent(JSON.stringify(that.fndata(''))),
        ewmTime: app.timestampToTime(new Date().getTime())
      })
    }
    // 推广员生成的二维码
    else{
      this.setData({
        ewmsrc: app.data.url + '/ffkj-main/userRule/miniapp/qrcode?promoteType=SMART_TO_LEADER&userId=' + app.data.userid + '&appId=' + app.data.appid + '&page=pages/Main/pages/bindUserPage/index&scene=' + encodeURIComponent(JSON.stringify(that.fndata('big'))),
        ewmTime: app.timestampToTime(new Date().getTime())
      })
    }
  },

  // 判断海报是否加载完成
  posterLoad(e) {
    wx.hideLoading();
  },
  // 关闭海报弹窗
  onCloseShowPosterLayer() {
    wx.hideLoading();
    this.setData({
      showPosterLayer: false
    })
  },

  // 封装
  fndata(ut) {
    return {
      url: 'idCode-bindUserPage',
      leaderId: app.data.userid,
      shareId: app.data.userid,
      ut: ut,
      time: new Date().getTime()
    }
  },

  savePosterLayer(){

    let that = this;

    wx.showLoading({
      title: '海报渲染中...',
    })
    
    // 团长生成海报
    if (this.data.type == 'tz' ){
      that.setData({
        showPosterLayer: true,
        posterImg: app.data.url + '/ffkj-main/userRule/miniapp/pullPeoplePoster?promoteType=NORMAL_TO_SMART&userId=' + app.data.userid + '&appId=' + app.data.appid + '&page=pages/Main/pages/bindUserPage/index&scene=' + encodeURIComponent(JSON.stringify(that.fndata('')))
      })
    }
    // 推广员生成海报
    else{
      that.setData({
        showPosterLayer: true,
        posterImg: app.data.url + '/ffkj-main/userRule/miniapp/pullPeoplePoster?promoteType=SMART_TO_LEADER&userId=' + app.data.userid + '&appId=' + app.data.appid + '&page=pages/Main/pages/bindUserPage/index&scene=' + encodeURIComponent(JSON.stringify(that.fndata('big')))
      })
    }
  },

  // 保存团长/推广员海报到相册
  savePoster() {
    let that = this
    wx.showLoading({
      title: '保存中...',
    })
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.writePhotosAlbum']) {
          that.saveImg();
        }
        else if (res.authSetting['scope.writePhotosAlbum'] === undefined) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              that.saveImg();
            },
            fail() {
              that.authConfirm()
            }
          })
        }
        else {
          that.authConfirm()
        }
      }
    })
  },

  // 授权拒绝后，再次授权提示弹窗
  authConfirm() {
    let that = this
    wx.showModal({
      content: '检测到您没打开保存图片权限，是否去设置打开？',
      confirmText: "确认",
      cancelText: "取消",
      success: function (res) {
        if (res.confirm) {
          wx.openSetting({
            success(res) {
              if (res.authSetting['scope.writePhotosAlbum']) {
                that.saveImg();
              }
              else {
                wx.showToast({
                  title: '您没有授权，无法保存到相册',
                  icon: 'none'
                })
              }
            }
          })
        } else {
          wx.showToast({
            title: '您没有授权，无法保存到相册',
            icon: 'none'
          })
        }
      }
    });
  },
  // 图片保存到本地
  saveImg() {
    let that = this
    wx.downloadFile({
      url: that.data.posterImg,
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (data) {
            that.onCloseShowPosterLayer()
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            })
          }
        })
      }
    })
  },
 
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

    // 直接转发sceneLx不需要接口解析，和海报不一样
    if (app.globalData.users.userType == 2 || app.globalData.users.userType == 4) {
      let that = this
    
      // 团长提升
      if (that.data.type == 'tz') {
        console.log(encodeURIComponent(JSON.stringify(that.fndata(''))))
        return app.configShare(app.globalData.users.userName + '邀请你升级成为达人', '/pages/Main/pages/bindUserPage/index?sceneLx=' + encodeURIComponent(JSON.stringify(that.fndata(''))), '/images/s.png', re => { }, res => { })
      }
      // 推广员提升
      else {
        return app.configShare(app.globalData.users.userName + '邀请你升级成为团长', '/pages/Main/pages/bindUserPage/index?sceneLx=' + encodeURIComponent(JSON.stringify(that.fndata('big'))), '/images/s.png', re => { }, res => { })
      }

    }
    else {
      return app.configShare('', '', '', re => { }, res => { })
    }
  },

})
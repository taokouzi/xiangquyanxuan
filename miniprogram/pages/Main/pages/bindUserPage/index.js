// miniprogram/pages/Main/pages/bindUserPage/index.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,

    isSK: true,

    // options0:'',

    // options: '',
    
    status:{
      reg: 'err',
      text: ''
    }
  },

  onLoad: function (options) {
    let that = this 
    that.setData({ isSK: true })
    // 
    if (options){
      if (app.data.userid == '') {
        app.getCode(() => {
          that.bind(options)
        })
        return false
      }
      else {
        that.bind(options)
      }
    }
    // 异常情况
    else{
      that.navBack()
    }
  },

  
  bind(options){
    let that = this

    // 海报拉新
    if (options.scene) {
      console.log('海报拉新==' + options.scene)
      app.ajax('/ffkj-main/miniappScene/' + options.scene, {}, 'get', res => {
        console.log('海报拉新--解析scene')
        console.log(res)
        if (res.code == 0) {
          that.bindLead(JSON.parse(decodeURIComponent(res.data)))
        }
      })
    }
    // 转发拉新
    else if (options.sceneLx){
      console.log('分享拉新==' + options.sceneLx)
      that.bindLead(JSON.parse(decodeURIComponent(options.sceneLx)))
    }
    // 异常情况
    else{
      that.navBack()
    }
  },


  bindLead(options) {
    let that = this
    if (options.leaderId != '') {
      app.ajax('/ffkj-main/user/info', {}, 'get', (res) => {
        if (res.data.phone) {
          // 用户为普通身份
          if (res.data.userType == 0) {
            if (options.ut == 'big') {
              that.fnStatus('err', '普通用户身份不能直接提升为团长哦')
            }
            else {
              that.fnBindShareLX(options,0, true)
            }
          }

          // 用户为达人身份
          else if (res.data.userType == 1) {
            if (options.ut == 'big') {
              that.fnBindShareLX(options, 1, true)
            }
            else {
              that.fnStatus('repeat', '你当前已经是达人身份啦')
            }
          }

          // 用户为团长身份
          else if (res.data.userType == 2){
            that.fnStatus('repeat', '你当前已经是团长身份啦')
          }

          // 用户为游客身份
          else if (res.data.userType == 3) {
            if (options.ut == 'big') {
              that.fnStatus('err', '游客用户身份不能直接提升为团长哦')
            }
            else{
              that.fnStatus('err', '游客用户身份不能直接提升为达人哦')
            }
          }

          // 用户为推广员身份
          else if (res.data.userType == 4){
            that.fnStatus('repeat', '你当前已经是推广员身份啦')
          }
        }
        else {
          
          if (res.data.userType == 3){
            that.fnBindShareLX(options, 3, false)
          }

          console.log('无手机号'+encodeURIComponent(JSON.stringify(options)))
          // 无手机号（跳转到授权页面）
          wx.redirectTo({
            url: '/pages/Main/pages/authorize/index?authType=' + (app.data.userState == 1 ? 2 : 1)+'&datas=' + encodeURIComponent(JSON.stringify(options))
          })
        }
        
      })
    }
  },

  // 文本
  fnStatus(reg, text){
    this.setData({
      isSK: false,
      status: {
        reg: reg,
        text: text
      }
    })
  },
  
  onShow(){
    this.setData({ isSK: true })
  },

  // 绑定关系（拉新/提升身份）
  fnBindShareLX(options, userType, bool){
    console.log(options)
    let that = this
    app.ajax('/ffkj-main/api/user/auth1_2', {
      isNewUser: app.data.isNewUser,
      teamLeaderId: options.leaderId,
      promoteType: options.ut == 'big' ? 'SMART_TO_LEADER' : 'NORMAL_TO_SMART'
    }, 'get', res => {
      if (bool ){
        if (res.code == 0) {
          app.data.isNewUser = false
          that.fnStatus('ok', userType == 0 ? '已升级为“享趣严选商城”分享达人啦' : userType == 1 ? '已升级为“享趣严选商城”分享达人团长啦' : '')
        }
        else {
          that.fnStatus('repeat', res.message + ' -' + res.code)
        }
      }
      else{
        if (res.code == 0) {
          app.data.isNewUser = false
        }
      }
    })
  },


  navBack() {
    app.globalData.isShuaxinIndex = true
    wx.switchTab({
      url: '/pages/index/index'
    })
  }

 
})
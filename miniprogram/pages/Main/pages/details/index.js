// pages/order/index.js
let app = getApp()
let timer,mm
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,
    showLayerShare: false,
    showLayerPhone: false,
    details:[],
    nodes: '',

    showGoTopBtn: false,
    
    isSK:true,

    showNav: false,

    // 海报弹窗
    showPosterLayer: false,

    state: '',
    nowState: '加载中...',

    serviceType: 1,  //1到家 2到店
    storeAddress: [], // 门店地址

    posterImg: '',

    showKefu: false,
    kf: '',

    // 分享相关
    newId: '',  //商品id
    shareTitle: '',
    shareImgUrl: '',

    shareUserId: '',  //分享者id
    shareType: '', //0，微信公众号链接/右上角分享，1，微信公众号海报分享，2，微信小程序链接分享，3，微信小程序海报分享，4，文案内嵌微信小程序链接分享
    shareTime: '',

    idx:0,
    tempFileURL: '',
    
    align: false,
    buyNum: 1,
    isOver: true,
    maxNum: 1,

    nowSwpIdxActive:1,

    isIphoneFullScreen: app.globalData.isIphoneFullScreen,

    // 渠道商城分享出来的链接带参，支付的时候需要用（公众号商城、小程序商城支付时用）
    agentId: '',
    
    userState: 0,

    phoneState: 0,

    options: '',

    isthome: false
  },
  
  // 预览图片
  previewImg(e) {
    let that = this
    wx.previewImage({
      current: that.data.details.picUrls[e.currentTarget.dataset.idx], // 当前显示图片的http链接
      urls: that.data.details.picUrls // 需要预览的图片http链接列表
    })
  },

  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    if (app.globalData.config.kf ==''){
      app.fnConfig(res=>{
        app.globalData.config = {
          kf: res.data['24'],
          weChat: res.data['22'],
          daRenMiJi: res.data['21']
        }
        this.setData({
          kf: res.data['24']
        })
      })
    }
    else{
      this.setData({
        kf: app.globalData.config.kf
      })
    }
    

    if (app.data.userid == '' || (app.data.phoneState == 0 && ( options.scene || options.sceneFx ))) {
      app.getCode(() => {
        that.bind(options)
      })
      return false
    }
    else {
      that.bind(options)
    }

  },


  bind(options){
    let that = this
    // 海报进入
    if (options.scene) {
      console.log('details.js----海报进入-商品详情页')
      app.ajax('/ffkj-main/miniappScene/' + options.scene, {}, 'get', res => {
        console.log('商品详情-海报-解析scene=' + options.scene)
        console.log(res)
        if (res.code == 0) {
            that.fnOptions(JSON.parse(decodeURIComponent(res.data)))
        }
      })
    }
    // 转发商品详情进入
    else if (options.sceneFx){
      console.log('details.js----转发进入-商品详情页')
      that.fnOptions(JSON.parse(decodeURIComponent(options.sceneFx)))
    }
    // 列表进入
    else{
      that.fnOptions(options)
    }
  },
  
  
  // 接受页面跳转参数
  fnOptions(options){
    // 新用户&通过分享进入
    if (app.data.isNewUser && options.shareId){
      this.fnBindShareGoods(options.shareId, options.id)
    }
    if (options.shareId) {
      // 存储全局分享者id
      app.globalData.shareId = options.shareId
      
      this.setData({
        shareUserId: options.shareId || app.globalData.shareId
      })
    }
    if (options.type) {
      this.setData({
        shareType: options.type
      })
    }
    if (options.time) {
      this.setData({
        shareTime: options.time
      })
    }

    // 通过分享进入，显示左上角回到首页图标
    if (options.com && options.com == 'details' ){
      this.setData({
        isthome: true
      })
    }
    
    this.setData({
      newId: options.id,
      agentId: options.agentId || '', //渠道商后台过来的
      options: options,
      userState: app.data.userState,
      phoneState: app.data.phoneState,
    })
    
    this.fndetails(options.id)
    this.fndetails2(options.id)

  },


  // 绑定关系（分享商品）
  fnBindShareGoods(sharerId, commodityId) {
    app.ajax('/ffkj-main/api/user/auth1_3', {
      sharerId: sharerId,
      commodityId: commodityId
    }, 'get', res => {
      if (res.code == 0) {
        app.data.isNewUser = false
        console.log('商品分享 新用户绑定成功')
      }
    })
  },
  

  // 轮播图切换
  detailsSwperChange(e){
    this.setData({
      nowSwpIdxActive: e.detail.current+1
    })
  },
  onShow(){
    this.setData({
      userState: app.data.userState,
      phoneState: app.data.phoneState,
      buyNum: 1,
      // tempFileURL: 'https://online.silaixiangqu.com/details?i=' + app.data.appid
      tempFileURL: 'https://online.fangfangypdj.com/details'
    })
  },

  navBack(){
    wx.navigateBack({})
  },
  navHome(){
    this.fnhome()
  },
  

  // 复制链接
  copyPath(){
    var that = this;
    let commoditySpecses = that.data.details.commoditySpecses[that.data.idx];

    let pathScene = {
      id: that.data.newId,
      s: app.data.userid,
      t: 0,
      tm: new Date().getTime()
    }
    
    // let nowUrl = that.data.tempFileURL + '?id=' + that.data.newId + '&s=' + app.data.userid+'&t=0&tm=' + new Date().getTime()
    let nowUrl = that.data.tempFileURL + '?cp=' + encodeURIComponent(JSON.stringify(pathScene))
    wx.setClipboardData({
      data: that.data.details.title + "\n\n点击购买👇\n" + nowUrl,
      success() {
        that.setData({
          showLayerShare: false
        })
        wx.showToast({
          title: '复制成功，赶紧发给你的好友吧~',
          icon: 'none'
        })
      }
    })
  },
  
  // 判断海报是否加载完成
  posterLoad(e){
    // console.log('海报加载完成')
    wx.hideLoading();
  },
  // 点击生成海报
  fnShowPosterLayer(){
    let that = this
    let data = {
      url: 'details',
      agentId: '',  //渠道商id（渠道商后台跳转到小程序商品详情）
      id: this.data.newId,
      shareId: app.data.userid,
      type: 3,
      time: new Date().getTime(),
      com: 'details'
    }
    this.setData({
      posterImg: app.data.url + '/ffkj-main/commodity/miniapp/poster/' + that.data.newId + '?userId=' + app.data.userid +'&appId=' + app.data.appid + '&page=pages/Main/pages/details/index&scene=' + encodeURIComponent(JSON.stringify(data)),
    })
    
    if (this.data.posterImg==''){
      wx.showToast({
        title: '当前繁忙，请稍后再试',
        icon: 'none'
      })
      return false
    }
    else{
      wx.showLoading({
        title: '海报渲染中...',
      })
      this.fncloseLayerShare()
      this.setData({
        showPosterLayer: true
      })
    }
    
  },
  // 保存海报到相册
  savePoster(){
    let that = this
    wx.showLoading({
      title: '正在保存...',
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
  authConfirm(){
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
                  title: '您没有授权，无法保存到本地',
                  icon: 'none'
                })
              }
            }
          })
        } else {
          wx.showToast({
            title: '您没有授权，无法保存到本地',
            icon: 'none'
          })
        }
      }
    });
  },
  // 图片保存到本地
  saveImg(){
    let that = this
    if (this.data.posterImg == '' ){
      wx.showToast({
        title: '当前繁忙，请稍后再试',
        icon: 'none'
      })
      return false
    }
    wx.downloadFile({
      url: this.data.posterImg,
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
  

  // 回到顶部
  goTop(){
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },

  // 拨打客服电话
  calPhone(e){
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.tel
    })
  },

  // 关闭海报弹窗
  onCloseShowPosterLayer(){
    wx.hideLoading();
    this.setData({
      showPosterLayer: false
    })
  },

  // 
  goBuy(e) {
    if (this.data.maxNum <= 0 && this.data.maxNum != -1) {
      wx.showToast({
        title: '该商品已达购买数量限制，看看其他的吧',
        icon: 'none'
      })
      return false
    }
    if (this.data.details.commoditySpecses.length == 1){
      let sp = JSON.stringify({
        details: e.currentTarget.dataset.details,
        title: e.currentTarget.dataset.title,
        firstPic: e.currentTarget.dataset.pic,
        shareId: this.data.shareUserId,
        type: this.data.serviceType,
        id: e.currentTarget.dataset.id,
        maxNum: this.data.maxNum == '-1' ? e.currentTarget.dataset.details.currentStock : this.data.maxNum,
        buyNum: this.data.buyNum
      })

      wx.navigateTo({
        url: '../orderPay/index?sp=' + encodeURIComponent(sp) + '&agentId=' + this.data.agentId
      }) 
    }
    else{
      this.setData({
        align: true
      })
    }

  },
  // 点击立即购买
  goBuySure(e){
    let sp = JSON.stringify({ 
      details: e.currentTarget.dataset.details, 
      title: e.currentTarget.dataset.title, 
      firstPic: e.currentTarget.dataset.pic, 
      shareId: this.data.shareUserId, 
      type: this.data.serviceType,
      id: e.currentTarget.dataset.id, 
      maxNum: this.data.maxNum == '-1' ? e.currentTarget.dataset.details.currentStock : this.data.maxNum,
      buyNum: this.data.buyNum })

    this.setData({
      align: false
    })
    wx.navigateTo({
      url: '../orderPay/index?sp=' + encodeURIComponent(sp) + '&agentId=' + this.data.agentId
    }) 
  },
  
  // 倒计时
  fntimer(xiaTime, timer) {
    const leftTime = xiaTime - (new Date()).getTime();
    if (leftTime >= 0) {
      let d = Math.floor(leftTime / 1000 / 60 / 60 / 24);
      let h = Math.floor(leftTime / 1000 / 60 / 60 % 24);
      let m = Math.floor(leftTime / 1000 / 60 % 60);
      let s = Math.floor(leftTime / 1000 % 60);
      return {
        h: h < 10 ? '0' + h : h,
        m: m < 10 ? '0' + m : m,
        s: s < 10 ? '0' + s : s
      }
    }
    else {
      // 倒计时结束，状态已下架
      clearInterval(timer)
      return 0
    }
  },
  

  // 商品详情
  fndetails(id) {
    app.ajax('/ffkj-main/commodity/'+id, {
      shareUserId: this.data.shareUserId || app.globalData.shareId,
      shareType: this.data.shareType,
      shareTime: this.data.shareTime
    }, 'get', (res) => {
      // console.log('fndetails')
      // console.log(res)
      if (res.code == 0 && res.data) {
        // 门店地址
        if (res.data.branchVOS) {
          this.setData({
            storeAddress: res.data.branchVOS
          })
        }
        this.setData({
          details: res.data,
          idx:0,
          maxNum: res.data.maxNum,
          serviceType: res.data.serviceType,
          isSK: false,
          shareTitle: res.data.shareTitle || res.data.title,
          shareImgUrl: res.data.sharePic || res.data.picUrls[0]
        })
        if (res.data.commoditySpecses.length > 0 && res.data.picUrls.length > 0) {
          this.changeSpecs({
            target:{
              dataset:{
                idx: 0
              }
            }
          }) 
        }
      }
      else{
        wx.showModal({
          title: '',
          content: res.message+' -'+res.code,
          showCancel: false,
          confirmText: '回首页',
          success(res) {
            if (res.confirm) {
              app.globalData.isShuaxinIndex = true
              wx.switchTab({
                url: '/pages/index/index'
              })
            }
          }
        })
      }
    })
  },


  // 商品详情图
  fndetails2(id) {
    app.ajax('/ffkj-main/commodity/detail/' + id, {}, 'get', (res) => {
      // console.log('fndetails2')
      // console.log(res)
      if (res.code == 0) {
        // 当前时间
        let nowTime = (new Date()).getTime()
        // 预计下架时间
        let xiaTime = res.data.planLowerShelfDate || 0
        // 上架时间
        let shangTime = res.data.upperShelfDate || 0
        // 抢购时间段（如：在下架前1小时内开始倒计时）
        let qgTime = 24 * 60 * 60 * 1000;
        let nowState = '', state2='',time=""

        state2 = res.data.commodityState;
        
        if (res.data.commodityState == '4') {
          // 待抢购
          if (shangTime > nowTime) {
            nowState = '待抢购'
            state2 = 5.5;
          }
          else {
            // 当前时间大于等于下架时间，状态为已下架/已售罄
            if (nowTime >= xiaTime) {
              nowState = '已售罄'
              state2 = 5;
            }
            else {
              if (xiaTime - nowTime <= 0) {
                nowState = '已售罄'
                state2 = 5;
              }
              else if (xiaTime - nowTime > 0 && xiaTime - nowTime <= qgTime) {
                state2 = 4.5;
                nowState = '立即抢购'
                time = this.fntimer(xiaTime, timer)
                timer = setInterval(function () {
                  time = this.fntimer(xiaTime, timer)
                  if (time == 0 ){
                    this.setData({
                      nowState: '已售罄',
                      state: 5
                    })
                  }
                  else{
                    this.setData({
                      time: time
                    })
                  }
                }.bind(this), 1000)
              }
              else {
                nowState = '抢购中'
                state2 = 4;
              }
            }
          }
        }
        else if (res.data.commodityState == '5') {
          nowState = '已售罄'
          state2 = 5;
        }
        else if (res.data.commodityState == '6') {
          nowState = '已下架'
          state2 = 6;
        }
        
        let nodes;
        if (res.data.details) {
          nodes = this.formatRichText(res.data.details)
        }
        else{
          nodes = '<span class="ivu2"></span><p class="fs13 hui">加载中...</p>'
        }

        this.setData({
          time: time,
          nowState: nowState,
          state: state2,
          nodes: nodes
        })
      }
    })
  },
  // 详情图片太宽
  formatRichText(html){
// /<img[^>]*>/gi
      // / <img [^>] * src=['"]([^'"]+)[^>]*>/gi
    let newContent = html.replace(/<img[^>]*>/gi, function (match, capture) {
      match = match.replace(/style="[^"]+"/gi, '').replace(/style='[^']+'/gi, '');
      match = match.replace(/width="[^"]+"/gi, '').replace(/width='[^']+'/gi, '');
      match = match.replace(/height="[^"]+"/gi, '').replace(/height='[^']+'/gi, '');
      // let a = match.match(/src="(\S*)"/)[1];
      // match = match.replace(/(?<=src=").*?(?=")"/gi, 'https://images.weserv.nl/?url=' + a+'"');
      // console.log(capture)
      // console.log(match)
      return match;
    });
    newContent = newContent.replace(/style="[^"]+"/gi, function (match, capture) {
      match = match.replace(/width:[^;]+;/gi, 'max-width:100%!important;').replace(/width:[^;]+;/gi, 'max-width:100%!important;');
      return match;
    });
    
    newContent = newContent.replace(/<br[^>]*\/>/gi, '');
    newContent = newContent.replace(/\<img/gi, '<img style="max-width:100%!important;height:auto!important;display:block;margin-top:0;margin-bottom:0;"');
    newContent = newContent.replace(/style=""/gi, 'style="max-width:100%!important;height:auto!important;"');
    // newContent = newContent.replace(/max-max-max-/gi, 'max-');
    // newContent = newContent.replace(/max-max-/gi, 'max-');
    // newContent = newContent.replace(/border-max-/gi, 'max-');
    // newContent = newContent.replace(/border-bottom-max-/gi, 'max-');
    // newContent = newContent.replace(/border-left-max-/gi, 'max-');
    // newContent = newContent.replace(/min-max-/gi, 'max-');
    return newContent;
  },



  formatRichText2(html){
    let newContent = html.replace(/<img[^>]*>/gi, function (match, capture) {
      match = match.replace(/style="[^"]+"/gi, '').replace(/style='[^']+'/gi, '');
      match = match.replace(/width="[^"]+"/gi, '').replace(/width='[^']+'/gi, '');
      match = match.replace(/height="[^"]+"/gi, '').replace(/height='[^']+'/gi, '');
      return match;
    });
    newContent = newContent.replace(/style="[^"]+"/gi, function (match, capture) {
      match = match.replace(/width:[^;]+;/gi, 'width:100%!important;').replace(/width:[^;]+;/gi, 'width:100%!important;');
      return match;
    });
    newContent = newContent.replace(/<br[^>]*\/>/gi, '');
    newContent = newContent.replace(/\<img/gi, '<img style="width:100%!important;height:auto!important;"');
    return newContent;
  },

  // 切换规格
  changeSpecs(e){
    let idx = e.target.dataset.idx
    this.setData({
      idx: idx,
      // maxNum: this.data.maxNum == '-1' ? this.data.details.commoditySpecses[idx].currentStock : this.data.maxNum
      maxNum: this.data.details.commoditySpecses[idx].currentStock || -1
    })
  },
  
  
  // 回首页
  fnhome(){
    // 详情页跳转到首页
    if (this.data.shareUserId){
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
    // 返回首页
    else{
      wx.switchTab({
        url: '../../../index/index'
      })
    }
  },

  // 客服
  fnKefu() {
    this.setData({
      showKefu: true
    })
  },

  onClose() {
    this.setData({
      showKefu: false
    })
  },

  // 咨询客服/打电话
  fnphone(e){
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.tel
    })
  },

  // 用户授权个人信息
  fnGetUserInfo(e){
    app.getUserInfo(e,res=>{
      if (res.code == 0){
        this.setData({
          userState:1,
          showLayerShare: true
        })
      }
    })
  },

  // 手机号码授权
  fnGetPhoneNumber(e) {
    let that = this
    app.getPhoneNumber(e, res => {
      if (res.code == 0) {
        that.setData({
          phoneState: 1,
          align: true
        })
      }
    })
  },

  // 显示分享弹窗
  fnshowLayerShare() {
    // 判断该用户是否授权过
    this.setData({
      showLayerShare: true
    })
  },
  // 关闭分享弹窗
  fncloseLayerShare() {
    this.setData({
      showLayerShare: false
    })
  },

  // 显示咨询弹窗
  fnshowLayerPhone(){
    this.setData({
      showLayerPhone: true
    })
  },
  // 关闭咨询弹窗
  fncloseLayerPhone() {
    this.setData({
      showLayerPhone: false
    })
  },

  // 滚动页面改变顶部状态栏样式
  onPageScroll(e) {
    let that = this
    if (e.scrollTop > 120 ){
      this.setData({
        showNav: true
      })
    }
    else{
      this.setData({
        showNav: false
      })
    }

    if (e.scrollTop > 600 ){
      this.setData({
        oldtop: e.scrollTop
      })
      clearTimeout(mm)
      mm = setTimeout(()=>{
        if (that.data.oldtop == e.scrollTop ){
          that.setData({
            showGoTopBtn: true
          })
        }
      },20)
      this.setData({
        showGoTopBtn: false
      })
    }
    else {
      this.setData({
        showGoTopBtn: false
      })
    }
  },


  // 门店地址地图
  fnOpenLocation(e){
    let item = e.currentTarget.dataset.item
    wx.openLocation({
      latitude: parseFloat(item.latitude),
      longitude: parseFloat(item.longitude),
      name: item.branchName,
      address: item.address,
      scale: 14
    })
  },
  
  // 门店地址展开收起
  toggleStoreAddress(){
    this.setData({
      showAddressMore: !this.data.showAddressMore
    })
  },

  // 数量-
  reduceNum(e) {
    if (e.currentTarget.dataset.num <= 1) {
      this.setData({
        isOver: true
      })
      return false
    }
    this.setData({
      buyNum: --e.currentTarget.dataset.num,
      isOver: false,
      isOver2: false
    })
  },

  // 数量+
  addNum(e) {
    if (e.currentTarget.dataset.num >= this.data.maxNum) {
      this.setData({
        isOver2: true
      })
      return false
    }
    this.setData({
      buyNum: ++e.currentTarget.dataset.num,
      isOver: false,
      isOver2: false
    })
  },

  closeBuySure(){
    this.setData({
      align: false
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    this.setData({
      showLayerShare: false
    })
    
    let data = {
      url: 'details',
      agentId: '',  //渠道商id（渠道商后台跳转到小程序商品详情）
      id: this.data.newId,
      shareId: app.data.userid,
      type: 2,
      time: new Date().getTime(),
      com: 'details'
    }
    // console.log(encodeURIComponent(JSON.stringify(data)))
    return app.configShare(this.data.shareTitle, '/pages/Main/pages/details/index?sceneFx='+encodeURIComponent(JSON.stringify(data)), this.data.shareImgUrl, res => {
    }, res => {})

  },

})
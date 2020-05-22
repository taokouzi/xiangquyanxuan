let app = getApp()
let leftHeight = 0, rightHeight = 0; //分别定义左右两边的高度
let query;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,
    
    isSK: true,
    orstatus: [
      {
        id: 0,
        src: "",
        title: '待支付',
        text: ''
      },
      {
        id: 1,
        src: '/images/or1.png',
        title: '已支付',
        text: '您的包裹正在打包，请耐心等待哦'
      },
      {
        id: 2,
        src: '/images/or2.png',
        title: '已发货',
        text: '商品正在向您飞奔'
      },
      {
        id: 3,
        src: '/images/or3.png',
        title: '交易完成',
        text: '祝您天天好心情'
      },
      {
        id: 4,
        src: "",
        title: '交易关闭',
        text: ''
      }
    ],

    or: {},

    expressNow:{},
    maxRefundAmount: 0,

    id: '',
    ecode: '',
    ecodeVOS: [],  //电子码
    bookRecordVOS: [],  //预约记录

    showBook: false, //是否显示立即预约按钮
    type: 0,  //1到家  2到店
    complaintRecordStatus: '',
    wls: [],  //物流信息


    showQrCode: false,
    active: 0,  //this.$store.state.orderIdx ||
    swpIdx: 0,
    dzCodes: [], //电子码

    goods: [],
    // commodityId:'',
    showNav: false,

    userState:0,
    phoneState:0,

    leftList: [],
    rightList: []
  },

  // 滚动页面改变顶部状态栏样式
  onPageScroll(e) {
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
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.type == 1) {
      this.order(options.id)
    }
    else {
      this.order2(options.id)
    }
    this.setData({
      type: options.type,
      id: options.id
    })
  },

  onShow(){
    this.setData({
      userState: app.data.userState,
      phoneState: app.data.phoneState
    })
    if (this.data.type == 1 ){
      this.order(this.data.id)
    }
    else if(this.data.type == 2){
      this.order2(this.data.id)
    }
  },
  // 复制物流单号
  copyWLCode(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.code,
      success() {
        wx.showToast({
          title: '物流单号已复制',
          icon: 'none'
        })
      }
    })
  },
  navBack() {
    wx.navigateBack({})
  },


  // 用户授权个人信息
  fnGetUserInfo(e) {
    app.getUserInfo(e, res => {
      if (res.code == 0) {
        this.setData({
          userState: 1
        })
      }
    })
  },
  

  // 手机号码授权
  fnGetPhoneNumber(e){
    app.getPhoneNumber(e, res => {
      console.log(res)
      if( res.code == 0 ){
        this.setData({
          phoneState: 1
        })
      }
    })
  },

  // 查看电子码
  fnScan(e) {
    // console.log(e)
    this.setData({
      swpIdx: e.currentTarget.dataset.index,
      showQrCode: true
    })
  },

  // 订单查询（到家）
  order(orderid) {
    app.ajax('/ffkj-order/order/' + orderid, {}, 'get', (res) => {
      if (res.code == 0) {
        // console.log(res )
        this.setData({
          or: res.data,
          isSK: false,
          // commodityId: res.data.commodityId,
          complaintRecordStatus: res.data.complaintRecordStatus == undefined ? '-99' : res.data.complaintRecordStatus,
          maxRefundAmount: res.data.maxRefundAmount
        })
        this.DoYouLikeMe(res.data.commodityId)
        if (res.data.courierNum) {
          this.expressInfo(res.data.courierNum)
        }
      }
    }, () => { }, '', 'notloading')
  },

  // 订单查询（到店）
  order2(orderid) {
    app.ajax('/ffkj-order/order/toshop/' + orderid, {}, 'get', res => {
      if (res.code == 0) {
        for (var i = 0; i < res.data.ecodeVOS.length; i++) {
          res.data.ecodeVOS[i].codeSrc = app.data.url + '/ffkj-main/user/qrcode?url=' + '%7B"ret":1,"source":"minpro","id":"' + app.base64_encode(res.data.ecodeVOS[i].code) + '"%7D'
          res.data.ecodeVOS[i].nowTime = (new Date()).getTime()
        }
        this.setData({
          ecodeVOS: res.data.ecodeVOS,
          showBook: res.data.showBook, // 显示隐藏立即预约按钮
          bookRecordVOS: res.data.bookRecordVOS,
          or: res.data,
          // commodityId: res.data.commodityId,
          maxRefundAmount: res.data.maxRefundAmount,
          complaintRecordStatus: res.data.complaintRecordStatus == undefined ? '-99' : res.data.complaintRecordStatus,
          isSK: false
        })
        this.DoYouLikeMe(res.data.commodityId)
        if (res.data.courierNum) {
          this.expressInfo(res.data.courierNum)
        }
      }
    }, () => { }, '', 'notloading')
  },

  // 电子码轮播
  changeSwpIdx(e) {
    this.setData({
      swpIdx: e.detail.current
    })
  },
  
  closeBuySure() {
    this.setData({
      showQrCode: false
    })
  },

  // 物流信息查询
  expressInfo(courierCode) {
    app.ajax('/ffkj-main/api/logistics/query?mailNo=' + courierCode,{},'get',(res) => {
      if (res.code == 0) {
        if (res.data.length > 0) {
          this.setData({
            wls: JSON.stringify(res.data),
            expressNow: res.data[res.data.length - 1]
          })
        }
      }
    })
  },
  

  // 猜你喜欢
  DoYouLikeMe(commodityId) {
    app.ajax('/ffkj-main/commodity/orderPage/recommendList', {
      cityId: app.globalData.selectCityObj.cityId,
      nowCommodityId: commodityId
    }, 'get', res => {
      if (res.code == 0 && res.data.length > 0) {
        for (let i in res.data) {
          res.data[i].state = 4
        }
        
        this.setData({
          goods: res.data
        })
        this.isLeft(res.data)
      }
    })
  },

  async isLeft(goods) {
    let list = goods,
      leftList = [],//this.data.leftList,
      rightList = []//this.data.rightList;
    query = wx.createSelectorQuery()
    leftHeight = 0;
    rightHeight = 0;

    for (let i in list) {
      if( i%2==0 ){
        leftList.push(list[i])
      }
      else{
        rightList.push(list[i])
      }
      // leftHeight <= rightHeight ? leftList.push(item) : rightList.push(item); //判断两边高度，来觉得添加到那边
      await this.getBoxHeight(leftList, rightList);
    }
  },
  getBoxHeight(leftList, rightList) { //获取左右两边高度
    return new Promise((resolve, reject) => {
      this.setData({
        leftList,
        rightList
      }, () => {
        query.select('#left').boundingClientRect();
        query.select('#right').boundingClientRect();
        query.exec((res) => {
          if (res[0]) {
            leftHeight = res[0].height; //获取左边列表的高度
            rightHeight = res[1].height; //获取右边列表的高度
          }
          resolve();
        });
      });
    })
  },


  gohome(){
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let shareTitle = '我是' + (app.globalData.users.nickName || app.globalData.users.userName)+'，我在享趣严选上买了这个好物，现在推荐给你哦~';
    let shareImgUrl = this.data.or.firstPic
    // console.log('点击分享')
    // console.log('newId = '+this.data.newId)
    // console.log('shareTitle = '+this.data.shareTitle)
    // console.log('userid = ' + app.data.userid)
    
    return app.configShare(shareTitle, '/pages/Main/pages/orderDetailsShare/index?orderId=' + this.data.or.id + '&shareId=' + app.data.userid + '&type=5&time=' + new Date().getTime(), shareImgUrl, res => {
    }, res => { })

  },


})

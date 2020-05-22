//index.js
//获取应用实例
var app = getApp();

Page({
  data: {
    isSK: true,
    nav: app.globalData.nav,
    winWidth: 0,
    winHeight: 0,
    // tab切换
    currentTab: 0,
    
    // 1显示 0不显示
    showDixian: 0,

    showQrCode: false,
    tabActive: 0,  //this.$store.state.orderIdx ||
    swpIdx: 0,
    dzCodes: [], //电子码

    tabs: [
      {
        id: 0,
        title: '全部订单',
        status: '',
        records: [],
        finished: false,
        loading: false,
        page: 0,
      },
      {
        id: 1,
        title: '已支付',
        status: 'PAID',
        records: [],
        finished: false,
        loading: false,
        page: 0,
      },
      {
        id: 2,
        title: '已发货',
        status: 'DELIVER',
        records: [],
        finished: false,
        loading: false,
        page: 0,
      },
      {
        id: 3,
        title: '已完成',
        status: 'COMPLETE',
        records: [],
        finished: false,
        loading: false,
        page: 0,
      }
    ],
    datas:[],
    orid: 0,


    four:['','','',''],

    wx: wx.getSystemInfoSync()
  },
  onLoad: function () {
  },

  onShow(){
    this.fn()
  },

  fn(){
    this.fnList()
    this.data.tabs[this.data.currentTab].page = 0
  },

  // 电子码轮播
  changeSwpIdx(e){
    this.setData({
      swpIdx:e.detail.current
    })
  },

  // 列表
  fnList(){
    let idx = this.data.currentTab
    let that = this
    if (this.data.tabs[idx].page == 0) {
      this.data.tabs[idx].records = []
    }

    this.data.tabs[idx].page ++;
    
    app.ajax('/ffkj-order/order/page', {
      orderStatus: this.data.tabs[idx].status,
      pageNum: this.data.tabs[idx].page,
      pageSize: 10
    }, 'get', (res) => {
      if (res.code == 0) {
        var result = this.data.tabs[idx].records
        if (res.data.list.length == 0 ){
          this.setData({
            showDixian: 1,
            isSK: false
          })
        }
        else{
          this.data.tabs[idx].records = result.concat(res.data.list)
          this.setData({
            datas: this.data.tabs[idx].records,
            showDixian: res.data.list.length < 10?1:0,
            isSK: false
          })
        }
      }
    })
  },

  closeBuySure(){
    this.setData({
      showQrCode: false
    })
  },
  // 点击电子码
  fnScan(e){
    let id = e.currentTarget.dataset.id;
    app.ajax('/ffkj-order/orderDetails/ecodes/' + id, {}, 'get',res=>{
      if (res.code == 0) {
        for (var i = 0; i < res.data.length;i++ ){
          res.data[i].codeSrc = app.data.url + '/ffkj-main/user/qrcode?url=' + '%7B"ret":1,"source":"minpro","id":"' + app.base64_encode(res.data[i].code) +'"%7D'
          res.data[i].nowTime = (new Date()).getTime()
        }
        this.setData({
          swpIdx:0,
          dzCodes: res.data,
          showQrCode: true
        })
      }
      else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },

  // 确认收货
  confirmSend(e){
    app.ajax('/ffkj-order/order/confirmReceipt/' + e.target.dataset.id, {}, 'get', (res) => {
      if (res.code == 0) {
        this.fn()
      }
      else{
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },

  /**
   * 点击tab切换
   */
  toggleMenu: function (e) {
    var that = this;
    if (this.data.currentTab === e.detail.index) {
      return false;
    }
    else {
      this.data.tabs[e.detail.index].page = 0
      that.setData({
        currentTab: e.detail.index,
        datas: []
      })

      this.fnList()
    }
  },




})
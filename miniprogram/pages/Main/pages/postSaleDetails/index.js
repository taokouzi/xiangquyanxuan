// miniprogram/pages/test/index.js
let app = getApp(), timer 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,

    isIphoneFullScreen: app.globalData.isIphoneFullScreen,

    isSK: true,
    nowStep: 0,
    or: {
      orderStatus: 0,
      details: {}
    },
    datas: [],
    proof: [],
    time: {
      d: '00',
      h: '00',
      m: '00',
      s: '00'
    },

    hideEdit: false,

    id: '',
    complaintId:'',
    type:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id,
      type: options.type
    })
    if (options.type == 1) {
      this.order(options.id)
    }
    else {
      this.order2(options.id)
    }
    this.shouHouDetails(options.id) 
  },
  onShow(){
    if (this.data.id != '') {
      if (this.data.type == 1) {
        this.order(this.data.id)
      }
      else {
        this.order2(this.data.id)
      }
      this.shouHouDetails(this.data.id)
    }
  },
  
  // 到家
  order(orderid) {
    app.ajax('/ffkj-order/order/' + orderid, {}, 'get', res => {
      if (res.code == 0) {
        this.setData({
          or: res.data,
          isSK: false
        })
      }
    })
  },
  // 到店
  order2(orderid) {
    app.ajax('/ffkj-order/order/toshop/' + orderid, {}, 'get', res => {
      if (res.code == 0) {
        this.setData({
          or: res.data,
          isSK: false
        })
      }
    })
  },
  
  navBack() {
    wx.navigateBack({})
  },

  // 撤销申请
  cancelOrder(e) {
    app.ajax('/ffkj-main/complaintRecord/updateComplaintRecord', {
        complaintRecordId: e.currentTarget.dataset.id
    }, 'get', res => {
      if (res.code == 0) {
        wx.showToast({
          title: '已撤销申请',
          icon: 'none'
        })
        this.shouHouDetails(this.data.id)
      }
    })
  },
  // 填写物流订单号
  goWriteOrder() {
    wx.navigateTo({
      url: '/pages/User/pages/writeOrder/index?id=' + this.data.complaintId
    })
  },




  // 倒计时
  fntimer(xiaTime) {
    const leftTime = xiaTime - (new Date()).getTime();
    if (leftTime >= 0) {
      let d = Math.floor(leftTime / 1000 / 60 / 60 / 24);
      let h = Math.floor(leftTime / 1000 / 60 / 60 % 24);
      let m = Math.floor(leftTime / 1000 / 60 % 60);
      let s = Math.floor(leftTime / 1000 % 60);

      this.data.time.d = d < 10 ? ('0' + d) : d;
      this.data.time.h = h < 10 ? ('0' + h) : h;
      this.data.time.m = m < 10 ? ('0' + m) : m;
      this.data.time.s = s < 10 ? ('0' + s) : s;
      
      this.setData({
        time: this.data.time
      })
    }
    else {
      this.setData({
        hideEdit: true
      })
      clearInterval(timer)
    }
  },



  // 售后详情 
  shouHouDetails(id) {
    let that = this
    app.ajax('/ffkj-main/complaintRecord/queryComplainantRecordById', {
      orderId: id
    }, 'get', res => {
      // console.log(res)
      // 处理中
      // 未退货待提交退货物流单号 3
      // 已提交退货物流单号，待商家确认收获。 4
      // 商家已收到退货并确认。含待退款状态  5
      // 已完成  
      // 已完成退款退货 7
      if (res.code == 0) {
        this.setData({
          datas: res.data,
          complaintId: res.data.id
        })
        let nowStep;
        if (res.data.pics) {
          that.setData({
            proof: res.data.pics
          })
        }
        // 已结束
        if (res.data.status == -1 || res.data.status == 7) {
          nowStep = 2
        }
        // 已受理
        else if (res.data.status == 0) {
          nowStep = 0
        }
        // 处理中
        else if (res.data.status == 4) {
          nowStep = 1
        }
        // 处理中
        else if (res.data.status == 3) {
          nowStep = 1
        }
        // 处理中（有倒计时）
        else if (res.data.status == 2) {
          nowStep = 1
          if (res.data.endTime) {
            that.fntimer((new Date(res.data.endTime.replace(/-/g, "/"))).getTime())
            timer = setInterval(() => {
              that.fntimer((new Date(res.data.endTime.replace(/-/g, "/"))).getTime())
            }, 1000)
          }
        }

        that.setData({
          nowStep: nowStep,
          isSK: false
        })
      }
      else {
        // Toast(res.message)
      }
    })
  },
})
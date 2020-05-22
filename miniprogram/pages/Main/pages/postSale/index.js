// miniprogram/pages/test/index.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,

    isSK: true,
    showSHtype: false,
    showSHwhy: false,
    a: 20,
    ht: -600,


    datas:'',
    typeIdx: 0,
    whyIdx: 0,

    serviceTypeId:1,
    serviceTypeReasonId: 0,
    maxRefundAmount: 0,

    isIphoneFullScreen: app.globalData.isIphoneFullScreen,

    shuoMing: '',

    // 前端用的图片地址
    imgs:[],
    // 传给后端用的图片地址
    pics:[],
    id: '',
    type:''
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
    
    this.typeWhyInfo(options.id)
    this.setData({
      id: options.id,
      type: options.type,
      // maxRefundAmount: options.maxRefundAmount
    })
  },

  navBack() {
    wx.navigateBack({})
  },

  fnNum(e) {
    this.setData({
      shuoMing: e.detail.value
    })
  },

  // 上传图片
  uploadImg: function () {
    var that = this, pics = this.data.pics;
    wx.chooseImage({  //从本地相册选择图片或使用相机拍照
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (json) {
        // console.log(json)

        /*let tempFilePaths = res.tempFilePaths;
        for (var i = 0; i < tempFilePaths.length; i++) {
          pics.push(tempFilePaths[i]);
        }
        console.log(pics);
        that.setData({
          pics: pics
        })*/
        
        var tempFilePaths = json.tempFilePaths
        // console.log(tempFilePaths[0])
        wx.uploadFile({
          url: app.data.imgUpdateUrl +'/f/upload/folder/file/upload',
          filePath: tempFilePaths[0],
          name: 'file',
          success: function (res) {
            // console.log(res.data)
            if (res.data) {
              // 给后端用
              that.data.pics.push(res.data)
              that.setData({
                pics: that.data.pics
              })
              // 前端自己用于回显
              that.data.imgs.push(tempFilePaths[0])
              that.setData({
                imgs: that.data.imgs
              })
            }
          }
        })
      }
    })
  },

  // 删除图片
  deleteImg(e){
    let pics = this.data.pics.splice(e.currentTarget.dataset.idx, 1)
    let imgs = this.data.imgs.splice(e.currentTarget.dataset.idx, 1)
    this.setData({
      pics: this.data.pics,
      imgs: this.data.imgs,
    })
  },

  // 预览图片
  previewImg(e){
    let that = this
    wx.previewImage({
      current: that.data.imgs[e.currentTarget.dataset.idx], // 当前显示图片的http链接
      urls: that.data.imgs // 需要预览的图片http链接列表
    })
  },
 
  bb: function () {
    let _that = this; // 一定要先存this，避免在回调中设置data时报错

    setTimeout(function () {
      let query = wx.createSelectorQuery();
      query.select('.content1').boundingClientRect();
      query.exec(function (rect) {
        if (rect[0] === null) {
          return
        } else { // 自定义一个边界高度
          _that.setData({
            ht1: rect[0].height
          })
        }
      })
    }, 100)

    setTimeout(function () {
      let query = wx.createSelectorQuery();
      query.select('.content2').boundingClientRect();
      query.exec(function (rect) {
        if (rect[0] === null) {
          return
        } else { // 自定义一个边界高度
          _that.setData({
            ht2: rect[0].height
          })
        }
      })
    }, 100)
  },


  // 提交申请
  goPostSaleDetails(e) {
    // console.log(e.detail.value.refundAmount,this.data.maxRefundAmount)

    let that = this
    let rmb = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
    let regTel = /^1[3,4,5,6,7,8,9]\d{9}$/;

    if (e.detail.value.refundAmount == '' && this.data.serviceTypeId != 1) {
      wx.showToast({ title: '请输入申请退款金额', icon: 'none' })
      return false
    }
    if (e.detail.value.refundAmount > this.data.maxRefundAmount) {
      wx.showToast({ title: '退款金额不能大于' + this.data.maxRefundAmount + '元', icon: 'none' })
      return false
    }
    if (e.detail.value.phone != '' && !regTel.test(e.detail.value.phone)) {
      wx.showToast({ title: '联系电话格式错误', icon: 'none' })
      return false
    }
    
    // console.log(app.globalData.users.phone, e.detail.value.phone)

    app.ajax('/ffkj-main/complaintRecord/save', {
      orderId: this.data.id,
      serviceTypeId: this.data.serviceTypeId,
      serviceTypeReasonId: this.data.serviceTypeReasonId,
      phone: app.globalData.users.phone,
      contactPhone: e.detail.value.phone,
      refundAmount: e.detail.value.refundAmount,
      contentRecording: e.detail.value.shuoMing.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, ""),
      pics: that.data.pics
    }, 'post', res => {
      // 申请提交成功
      if (res.code == 0) {
        wx.redirectTo({
          url: '/pages/Main/pages/postSaleDetails/index?id=' + that.data.id + '&type=' + that.data.type
        })
      }
      else {
        wx.showToast({ title: res.message, icon: 'none' })
      }
    })
  },

  // 拉起售后类型弹窗
  showLayer1(){
    this.setData({
      showSHtype: true
    })
  },
  // 拉起申请原因弹窗
  showLayer2() {
    this.setData({
      showSHwhy: true
    })
  },

  // 到家
  order(orderid) {
    app.ajax('/ffkj-order/order/' + orderid, {}, 'get',res => {
      // console.log(res)
      if (res.code == 0) {
        this.setData({
          or: res.data,
          maxRefundAmount:Math.floor((res.data.maxRefundAmount || 0) * 100) / 100,
          isSK: false
        })
      }
    })
  },
  // 到店
  order2(orderid) {
    app.ajax('/ffkj-order/order/toshop/' + orderid, {}, 'get', res => {
      // console.log(res)
      if (res.code == 0) {
        this.setData({
          or: res.data,
          maxRefundAmount: Math.floor((res.data.maxRefundAmount || 0) * 100) / 100,
          isSK: false
        })
      }
    })
  },
  // 隐藏弹窗
  fnhideLayer1(e) {
    this.setData({
      showSHtype: false
    })
  },
  // 隐藏弹窗
  fnhideLayer2(e){
    this.setData({
      showSHwhy:false
    })
  },
  // 选择并隐藏弹窗（售后类型）
  fnWhyRadio1(e){
    this.setData({
      showSHtype: false,
      typeIdx: e.currentTarget.dataset.index,
      serviceTypeId: e.currentTarget.dataset.id,
      serviceTypeReasonId: this.data.datas[e.currentTarget.dataset.index].serviceTypeReasonVoList[0].id,
      whyIdx: 0
    })
    this.bb()
  },
  // 选择并隐藏弹窗（申请原因）
  fnWhyRadio2(e) {
    this.setData({
      showSHwhy: false,
      whyIdx: e.currentTarget.dataset.index,
      serviceTypeReasonId: e.currentTarget.dataset.id
    })
    this.bb()
  },

  // 售后类型及原因回显
  typeWhyInfo(orderId) {
    app.ajax('/ffkj-main/complaintRecord/queryServiceType', {
      orderId: orderId
    }, 'get',res => {
      if (res.code == 0) {
        this.setData({
          datas: res.data,
          serviceTypeReasonId: res.data[0].serviceTypeReasonVoList[0].id
        })
        this.bb()
      }
    })
  },



})
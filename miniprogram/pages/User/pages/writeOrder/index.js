// miniprogram/pages/test/index.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,


    wlRadio: -1,
    wlName: '请选择快递公司',
    showPicker: false,
    id:'',
    lists:[],


    fileList:[]
  },
  onLoad( options ){
    this.list()
    this.setData({
      id: options.id
    })

  },
  
  onShowPicker() {
    this.setData({
      showPicker: true
    })
  },
  onCloseShowPicker(){
    this.setData({
      showPicker: false
    })
  },
  
  // 快递公司
  list(){
    app.ajax('/ffkj-main/deliveryCompany/list', {}, 'get', res => {
      if( res.code == 0 ){
        res.data.push({ id: "0", companyName: "其他", abbreviation: "other" })
        for( let i in res.data ){
          this.data.lists.push(res.data[i].companyName)
        }
        this.setData({
          lists: this.data.lists
        })
      }
    })
  },

  onConfirm(e) {
    this.setData({
      wlName: e.detail.value,
      wlRadio: e.detail.index
    })
    this.onCloseShowPicker()
  },
  navBack() {
    wx.navigateBack({})
  },

  // 提交
  fnSubmit(e){
    let fm = e.detail.value

    if (this.data.wlRadio == -1) {
      wx.showToast({
        title: '请选择物流公司',
        icon: 'none'
      })
      return;
    }
    if (this.data.wlName == '其他' && fm.courierName == '') {
      wx.showToast({
        title: '请填写物流公司名称',
        icon: 'none'
      })
      return;
    }
    if (fm.courierNum == '') {
      wx.showToast({
        title: '请填写物流单号',
        icon: 'none'
      })
      return;
    }

    let that = this

    let data = '?complaintId=' + that.data.id + '&courierName=' + (that.data.wlName == '其他' ? fm.courierName : that.data.wlName) + '&courierNum=' + fm.courierNum + '&userMessage=' + fm.userMessage

    app.ajax('/ffkj-main/returnGoodsDetails/save' + data,{},'post',res=>{
      console.log(res)
      if (res.code == 0) {
        wx.showToast({
          title: '已提交',
          icon: 'none'
        })
        that.navBack()
      }
      else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })


  },
  


  inputUserMessage(e){
    this.setData({
      userMessage: e.detail.value
    })
  }
})
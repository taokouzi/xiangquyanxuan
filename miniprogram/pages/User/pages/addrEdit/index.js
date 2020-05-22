// miniprogram/pages/test/index.js
let app = getApp()
let telRag = /^1[3,4,5,6,7,8,9]{1}\d{9}$/;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,
    isSK:true,
    addr: {
      id: '',
      receiver: '',  //收货人姓名
      phone: '',  //电话
      areaId: '110101',  //地区id
      state: '',  //省
      city: '',    //市
      district: '', //区
      address: '',  //详细
      longitude: '',  //经度
      latitude: '',   //维度
      region: ['', '', ''],
      isDefault: false //true默认 false非默认
    },

    region: ['', '', ''],
    checked: false,
    areaId: '',

    isIphoneFullScreen: app.globalData.isIphoneFullScreen,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if ( options.item ){
      options.item = JSON.parse(options.item)
      options.item.region = [options.item.state, options.item.city, options.item.district]
  
      this.setData({
        addr: options.item,
        region: [options.item.state, options.item.city, options.item.district],
        checked: options.item.isDefault
      })
    }
    this.setData({
      isSK: false
    })
  },
  navBack() {
    wx.navigateBack({})
  },

  
  // 保存地址
  saveAddr(e) {
    let addr = e.detail.value
    let vm = this
    if (addr.receiver.trim() == "") {
      wx.showToast({ title: '请输入收货人姓名',icon: 'none'})
      return;
    }
    if (addr.phone == "") {
      wx.showToast({ title: '请输入收货人手机号', icon: 'none' })
      return;
    }
    if (!telRag.test(addr.phone)) {
      wx.showToast({ title: '手机号格式错误', icon: 'none' })
      return;
    }
    if (addr.region[0] == "") {
      wx.showToast({ title: '请选择省市区', icon: 'none' })
      return;
    }
    if (addr.address.trim() == "") {
      wx.showToast({ title: '请输入详细地址', icon: 'none' })
      return;
    }
    // 添加
    if (this.data.addr.id == '') {
      this.addAddr(addr);
    }
    // 编辑
    else {
      let newAddr = this.data.addr
      newAddr.receiver = addr.receiver
      newAddr.phone = addr.phone
      newAddr.region = addr.region
      newAddr.address = addr.address
      newAddr.areaId = this.data.areaId || this.data.addr.areaId
      this.updateAddr(newAddr)
    }

  },


  // 添加地址
  addAddr(addr){
    app.ajax('/ffkj-main/userAddress/addReceiptAddress', {
      address: addr.address.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, ""),
      areaId: this.data.areaId,
      state: addr.region[0],
      city: addr.region[1],
      district: addr.region[2],
      receiver: addr.receiver.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, ""),
      isToDefault: this.data.checked ? 1 : 0,
      latitude: addr.latitude||'',
      longitude: addr.longitude||'',
      phone: addr.phone,
      userId: app.data.userid
    }, 'post',res => {
      if (res.code == 0) {
        wx.showToast({ title: '添加成功', icon: 'none' })
        wx.navigateBack({})
      }
      else {
        wx.showToast({ title: res.message, icon: 'none' })
      }
    })
  },



  // 编辑地址
  updateAddr(addr) {
    app.ajax('/ffkj-main/userAddress/updateAddress?addressId=' + addr.id, {
      address: addr.address.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, ""),
      areaId: addr.areaId,
      state: addr.region[0],
      city: addr.region[1],
      district: addr.region[2],
      receiver: addr.receiver.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, ""),
      isToDefault: this.data.checked ? 1 : 0,
      latitude: addr.latitude || '',
      longitude: addr.longitude || '',
      phone: addr.phone
    }, 'put',res => {
      if (res.code == 0) {
        wx.showToast({ title: '保存成功', icon: 'none' })
        wx.navigateBack({})
      }
      else {
        wx.showToast({ title: res.message, icon: 'none' })
      }
    })
  },


  // 选择省市区
  bindRegionChange(e){
    this.setData({
      region: e.detail.value,
      areaId: e.detail.code[0]
    })
  },

  // 是否设置为默认
  toglleSelectMr(){
    if (this.data.addr.isDefault ){ return false }
    this.setData({
      checked: !this.data.checked
    })
  }
  
})
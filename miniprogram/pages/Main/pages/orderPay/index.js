// miniprogram/pages/test/index.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,

    isSK:true,
    buyNum: 1,
    isOver: true,
    maxNum: 1,

    checked: true,
    isHaveAddr: true,  //默认有收获地址
    
    sp: null,
    shareId: '', //分享者id

    addr: {
      id: '',
      receiver: '',  //收货人姓名
      phone: '',  //电话
      areaId: '110101',  //地区id
      state: '',  //省
      city: '',    //市
      district: '', //区
      region:[],
      address: '',  //详细
      longitude: '',  //经度
      latitude: '',   //维度
      isDefault: false //true默认 false非默认
    },

    isIphoneFullScreen: app.globalData.isIphoneFullScreen,

    provinceCode: '', //省份码
    // freight: 0,  //计算的运费
    js: {  // 计算运费相关
      baseRate: 1,
      effectArea: "",
      incRate: 1,
      isFree: true,
      supportDelivery: true
    },


    agentId:''
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    // options = {
    //   sp: "%7B%22details%22%3A%7B%22specId%22%3A%2255bec192ad49420b91edee3ccb2e445a%22%2C%22specName%22%3A%22%E5%8D%8F%E8%AE%AE%E5%BA%93%E5%AD%98%22%2C%22sellingPrice%22%3A0.03%2C%22originalPrice%22%3A0.05%2C%22salesVolume%22%3A0%2C%22currentStock%22%3A300%2C%22description%22%3A%22%E5%BA%93%E5%AD%98%22%2C%22rebate%22%3A0.01%2C%22specsSuttle%22%3A1000%7D%2C%22title%22%3A%22%E5%8D%8F%E8%AE%AE%E5%BA%93%E5%AD%98%E6%B5%8B%E8%AF%95%E6%B5%8B%E8%AF%95%E6%B5%8B%E8%AF%95%E6%B5%8B%E8%AF%95%E6%B5%8B%E8%AF%95%E6%B5%8B%E8%AF%95%E6%B5%8B%E8%AF%95%E6%B5%8B%E8%AF%95%22%2C%22firstPic%22%3A%22https%3A%2F%2Ffangfang-tec.oss-cn-hangzhou.aliyuncs.com%2Ffang%2Faries%2Fforeign%2F31a48437c2454eaab71bedde23b630c1.jpg%22%2C%22shareId%22%3A%22%22%2C%22type%22%3A1%2C%22id%22%3A%221215570095296872448%22%2C%22maxNum%22%3A300%2C%22buyNum%22%3A1%7D"
    // }

    let sp = JSON.parse(decodeURIComponent(options.sp))
    // console.log(sp)
    this.setData({
      sp: sp,
      maxNum: sp.details.currentStock >= sp.maxNum ? sp.maxNum : sp.details.currentStock,
      buyNum: sp.buyNum,
      isOver: sp.buyNum>1?false:true,
      agentId: options.agentId || ''
    })
  },

  onShow(){
    this.getInfoAddr()
  },
  // 编辑收货人姓名
  changeReceiver(e){
    this.data.addr.receiver = e.detail.value
    this.setData({
      addr: this.data.addr
    })
  },
  // 编辑收货人电话
  changePhone(e) {
    this.data.addr.phone = e.detail.value
    this.setData({
      addr: this.data.addr
    })
  },
  // 编辑收货人详细地址
  changeAddress(e) {
    this.data.addr.address = e.detail.value
    this.setData({
      addr: this.data.addr
    })
  },
  // 获取默认地址
  getInfoAddr() {
    app.ajax('/ffkj-main/userAddress/queryDefaultAddress', {}, 'get', res => {
      if (res.code == 0 && res.data) {
        // console.log('------------------')
        // console.log(res.data)
        res.data.region = [res.data.state, res.data.city, res.data.district];
        // console.log(this.data.sp)
        res.data.type = this.data.sp.type;
        this.setData({
          addr: res.data,
          isHaveAddr: true,
          isSK: false,
          provinceCode: res.data.areaId
        })
        this.fareRule()
      }
      // 没有默认地址，第一次填入的地址设置为默认地址
      else if (res.code == 10022) {
        let addr = this.data.addr
        addr.type = this.data.sp.type
        this.setData({
          isHaveAddr: false,
          addr: addr,
          isSK:false
        })
      }
    })
  },


  pay(e){

    let addr = this.data.addr
    let that = this
    let telRag = /^1[3,4,5,6,7,8,9]{1}\d{9}$/; 
    
    if (e.detail.value.receiver.trim() == "" ){
          wx.showToast({
            title: '请输入收货人姓名',
            icon: 'none'
          })
          return;
      }
    addr.receiver = e.detail.value.receiver

    if (e.detail.value.phone == "" ){
          wx.showToast({
            title: '请输入收货人手机号',
            icon: 'none'
          })
          return;
      }
    if (!telRag.test(e.detail.value.phone) ){
          wx.showToast({
            title: '手机号格式错误',
            icon: 'none'
          })
          return;
      }
    addr.phone = e.detail.value.phone

    if (this.data.sp.type != 2 && (!e.detail.value.region || e.detail.value.region.length == 0)){
        wx.showToast({
          title: '请选择省市区',
          icon: 'none'
        })
        return;
    }
    if (this.data.sp.type != 2){
      addr.region = e.detail.value.region
      addr.state = e.detail.value.region[0]
      addr.city = e.detail.value.region[1]
      addr.district = e.detail.value.region[2]
    }
    else{
      addr.region = ''
      addr.state = ''
      addr.city = ''
      addr.district = ''
      this.data.provinceCode = ''
    }

    if (this.data.sp.type != 2 && e.detail.value.address.trim() == "" ){
          wx.showToast({
            title: '请输入详细地址',
            icon: 'none'
          })
          return;
      }
    addr.address = e.detail.value.address || ''

    if( !this.data.checked ){
          wx.showToast({
            title: '请勾选同意《享趣严选平台用户协议》',
            icon: 'none'
          })
        return;
    }
    
    wx.requestSubscribeMessage({
      tmplIds: app.data.tmplIds,
      success(res) {
        that.wechatPay(that, e, addr)
      },
      fail(res){
        that.wechatPay(that, e, addr)
      }
    })
      
  },



  wechatPay(that,e,addr){
    
    console.log('referenceId  == '+ app.globalData.buyerId ? app.globalData.shareId : (this.data.sp.shareId || app.globalData.shareId) )
    console.log('buyerId == ' + app.globalData.buyerId)
    wx.showLoading({
      title: '正在唤起支付'
    })
    app.ajax('/ffkj-order/order/createOrder', {
      orderSource: '1',  //小程序支付1
      agentId: this.data.agentId || '',
      userId: app.data.userid,
      openId: app.data.openid || wx.getStorageSync('openid'),
      appId: app.data.appid,
      receiver: addr.receiver.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, ""),
      address: addr.address.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, ""),
      phone: addr.phone,
      state: addr.state,
      city: addr.city,
      district: addr.district,
      latitude: addr.latitude,
      longitude: addr.longitude,
      areaId: this.data.provinceCode,//addr.areaId,
      remark: e.detail.value.remarks.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, ""),
      // referenceId: this.data.sp.shareId || app.globalData.shareId,  //////////////////////////////////////////////////////
      referenceId: app.globalData.buyerId ? app.globalData.shareId : (this.data.sp.shareId || app.globalData.shareId),
      buyerId: app.globalData.buyerId || '',
      commoditySpecsId: this.data.sp.details.specId,
      num: this.data.buyNum,
      orderCity: app.globalData.selectCityObj.cityId,  //下单城市
      provinceCode: this.data.provinceCode,  //收货地址的省份码
      freightFromFront: this.data.sp.details.freight,  //计算的运费
    }, 'post', res => {
      if (res.code == 0) {
        wx.requestPayment({
          timeStamp: res.data.timeStamp,
          nonceStr: res.data.nonceStr,
          package: res.data.package,
          signType: res.data.signType,
          paySign: res.data.paySign,
          success(json) {
            wx.redirectTo({
              url: '/pages/Main/pages/paySuccess/index?type=' + that.data.sp.type + '&id=' + res.data.id
            })
          },
          fail(res) { }
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

  
  // 选择省市区
  bindRegionChange(e){
    // console.log('-99999')
    // console.log(e)
    let addr = this.data.addr
    addr.region = e.detail.value
    this.setData({
      addr: addr,
      provinceCode: e.detail.code[0]
    })
    this.fareRule()
  },

  // 运费计算规则
  fareRule() {
    // console.log(this.data.provinceCode)
    this.setData({
      provinceCode: (this.data.provinceCode + '').slice(0, 2) + '0000'
    })
    if (this.data.sp.type == 1) {
      // console.log(this.data.sp.id, this.data.provinceCode)
      app.ajax('/ffkj-main/commodityContractFreightRule?commodityId=' + this.data.sp.id + '&provinceCode=' + this.data.provinceCode, {}, 'get',res => {
        // console.log(res.data)
        if (res.code == 0) {
          this.setData({
            js: res.data
          })
          this.fnFreight()
        }
      })
    }
  },


  // 运费计算
  fnFreight() {
    let sp = this.data.sp
    if (!this.data.js.isFree) {
      let jin = this.data.sp.details.specsSuttle * this.data.buyNum / 500;
      // console.log(jin)
      if (jin <= 2) {
        sp.details.freight = this.data.js.baseRate
        this.setData({
          sp: sp
        })
      }
      else {
        sp.details.freight = this.data.js.baseRate + (Math.ceil(jin) - 2) * this.data.js.incRate
        this.setData({
          sp: sp
        })
      }
    }
    else{
      sp.details.freight = 0
      this.setData({
        sp: sp
      })
    }
  },


  // 授权收货地址
  getWxAddr(){
    let that= this
    wx.getSetting({
      success: (res) => {
        // 未授权收货地址
        if (!res.authSetting['scope.address']) {
          wx.authorize({
            scope: 'scope.address',
            success() {
              wx.chooseAddress({
                success(res) {
                  that.setData({
                    addr:{
                      id: '',
                      region: [res.provinceName, res.cityName, res.countyName],
                      receiver: res.userName,  //收货人姓名
                      phone: res.telNumber,  //电话
                      areaId: res.nationalCode,  //地区id
                      state: res.provinceName,  //省
                      city: res.cityName,    //市
                      district: res.countyName, //区
                      address: res.detailInfo,  //详细
                      longitude: '',  //经度
                      latitude: '',   //维度
                      isDefault: true //true默认 flase非默认
                    }
                  })
                  that.fareRule()
                }
              })
            },
            fail(){
              wx.showModal({
                content: '检测到您没打开收货地址授权，是否去设置打开？',
                confirmText: "确认",
                cancelText: "取消",
                success: function (res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: (res) => { }
                    })
                  }
                }
              });
            }
          })
          
        }
        else{
          wx.chooseAddress({
            success(res) {
              that.setData({
                provinceCode: res.nationalCode,
                addr:{
                  id: '',
                  region: [res.provinceName, res.cityName, res.countyName],
                  receiver: res.userName,  //收货人姓名
                  phone: res.telNumber,  //电话
                  areaId: res.nationalCode,  //地区id
                  state: res.provinceName,  //省
                  city: res.cityName,    //市
                  district: res.countyName, //区
                  address: res.detailInfo,  //详细
                  longitude: '',  //经度
                  latitude: '',   //维度
                  isDefault: true //true默认 flase非默认
                }
              })
              that.fareRule()
            }
          })
        }
      }
    })
    
  },



  navBack() {
    wx.navigateBack({})
  },


  // 切换选择服务协议
  fnXuan() {
    this.setData({
      checked: !this.data.checked
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
    this.fnFreight()
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
    this.fnFreight()
  },



  // 无默认地址用户 直接到了支付页面
  addAddr(addr) {
    app.ajax('/ffkj-main/userAddress/addReceiptAddress', {
      address: addr.address.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, ""),
      receiver: addr.receiver.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, ""),
      phone: addr.phone,
      state: addr.state,
      city: addr.city,
      district: addr.district,
      latitude: addr.latitude,
      longitude: addr.longitude,
      areaId: this.data.provinceCode,//addr.areaId,
      isToDefault: 1,
      userId: app.data.userid
    }, 'post', res => { })
  },


})
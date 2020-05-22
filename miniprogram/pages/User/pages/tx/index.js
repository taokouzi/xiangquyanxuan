// miniprogram/pages/test/index.js
// import Toast from '@vant/weapp/toast/toast'
let app = getApp()

let rmb = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
let regTel = /^1[3,4,5,6,7,8,9]\d{9}$/;
let regCode = /^\d{6}$/;
let timer;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,

    weChat: '',
    showBtn: false,

    showPlaceholder: false,
    money: '',
    cashWithdrawal: 0,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.myProfit()

    if (app.globalData.config.weChat == '') {
      app.fnConfig(res => {
        app.globalData.config = {
          kf: res.data['24'],
          weChat: res.data['22'],
          daRenMiJi: res.data['21']
        }
        this.setData({
          weChat: res.data['22']
        })
      })
    }
    else {
      this.setData({
        weChat: app.globalData.config.weChat
      })
    }
  },

  navBack() {
    wx.navigateBack({})
  },

    
  // 我的收益
  myProfit() {
    app.ajax('/ffkj-main/user/profit',{}, 'get',res => {
      if (res.code == 0) {
        this.setData({
          cashWithdrawal: res.data.canWithdraw || 0
        })
      }
    }, () => { }, '', 'notloading')
  },
  // 复制微信号
  copyCode() {
    wx.setClipboardData({
      data: this.data.weChat,
      success() {
        wx.showToast({
          title: '微信号已复制',
          icon: 'none'
        })
      }
    })
  },

  fnFocus() {
    this.setData({
      showPlaceholder: false
    })
  },
  fnBlur() {
    if (!this.data.money) {
      this.setData({
        showPlaceholder: true
      })
    }
    else {
      this.setData({
        showPlaceholder: false
      })
    }
  },
  fnMoney(e) {
    // 输入时 效验格式
    this.data.money = e.detail.value

    if (e.detail.value.slice(0, 1) == '.') {
      this.setData({
        money: '0' + e.detail.value
      })
      this.data.money = '0' + e.detail.value
    }
    if (!rmb.test(this.data.money)) {
      this.setData({
        showBtn: false
      })
      if (this.data.money[this.data.money.length - 1] != '.') {
        this.setData({
          money: this.data.money.slice(0, this.data.money.length - 1)
        })
      }
      if (rmb.test(this.data.money)) {
        this.setData({
          showBtn: true
        })
      }
    }
    else {
      if (this.data.money > this.data.cashWithdrawal || this.data.money == 0) {
        this.setData({
          showBtn: false
        })
      }
      else {
        this.setData({
          showBtn: true
        })
      }
    }
  },
  fntxAll() {
    this.setData({
      money: this.data.cashWithdrawal
    })
    this.fnBlur()
    if (this.data.money > 0) {
      this.setData({
        showBtn: true
      })
    }
    else {
      this.setData({
        showBtn: false
      })
    }
  },

  // 提现
  fntx() {
    if (this.data.money < 50) {
      wx.showToast({
        title: '提现金额至少为50元',
        icon: 'none'
      })
      return false;
    }
    else {

      let vm = this
      wx.showModal({
        title: '',
        content: '确定申请提现 ' + vm.data.money + '元 吗？',
        success(res) {
          if (res.confirm) {
            app.ajax('/ffkj-main/withdrawal/save', {
              withdrawalAmount: vm.data.money
            }, 'post',res => {
              console.log(res)
              if (res.code == 0) {
                // 正常情况下（有手机号）
                // 提现成功（11.07需求更改）
                /*if (res.data.state == 0) {
                }
                // 没有手机号（非正常情况下）
                else {
                  // 需要授权手机号
                }*/
                // wx.showToast({
                //   title: '提现申请提交成功,请耐心等待',
                //   icon: 'none'
                // })
                app.globalData.Toast.success({
                  selector: '#custom-selector2',
                  message: '提现申请提交成功,请耐心等待'
                });
                vm.setData({
                  showBtn: false,
                  money: ''
                })
                vm.myProfit()
              }
              else {
                wx.showToast({
                  title: res.message,
                  icon: 'none'
                })
              }
            })
          }
          else if (res.cancel) { }
        }
      })
    }
  },

 

})
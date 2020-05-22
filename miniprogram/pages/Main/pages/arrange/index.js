// miniprogram/pages/User/pages/news/index.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,
    isSK: true,


    showMendian: false,
    mdIdx: -1,



    arrangeNum: 1,
    canUseNum: 1,

    // 预约门店
    branchVOS: [],
    branchVOSId: '',

    // ------
    showDaodianTime: false,
    showPicker: false,
    columns: [],
    selectTime: '请选择时间',
    currentDay: '',
    currentMonth: '',
    currentYear: '',
    currentWeek: '',
    days: [],
    thisYear: null,
    thisMonth: null,
    arrDays: [],
    idx: 0,
    d: 0,
    // 预约年月日
    selectDay: {
      year: 'xxxx',
      month: 'xx',
      date: 'xx'
    },


    buyNum: 1,
    isOver: true,
    id:'',
  },


  onLoad(options){
    this.setData({
      id: options.id,
      specsName: options.specsName
    })
    this.info(options.id)
  },
  

  info(orderid) {
    app.ajax('/ffkj-main/merchantBranch/' + orderid, {}, 'get',res => {
      if (res.code == 0) {
        if (res.data.canUseNum <= 0) {
          wx.showModal({
            title: '',
            content: '无可预约项目',
            showCancel: false,
            confirmText: '返回',
            success(res) {
              this.navBack()
            }
          })
          return false;
        }

        let effectTimeEnd = res.data.effectTimeEnd,
          mo = (new Date()).getMonth() + 1,
          year = (new Date()).getFullYear();
        if (new Date(effectTimeEnd).getFullYear() > year && (new Date(effectTimeEnd).getMonth() + 1) > mo) {
          if (mo < 12) {
            effectTimeEnd = new Date((parseInt(year) + 1) + '/' + (mo + 1) + '/1 23:59:59').getTime() - 24 * 60 * 60 * 1000
          }
          else {
            effectTimeEnd = new Date((parseInt(year) + 1) + '/12/31 23:59:59').getTime()
          }
          wx.showToast({
            title: ('最大可预约时间至 ' + app.timestampToTime(effectTimeEnd - 24 * 60 * 60 * 1000).split(" ")[0]),
            icon: 'none'
          })
        }

        this.setData({
          canUseNum: res.data.canUseNum,
          branchVOS: res.data.branchVOS
        })
        if (res.data.branchVOS.length == 1) {
          this.setData({
            branchVOSId: res.data.branchVOS[0].id
          })
          this.fnyuyue()
        }
      }
      else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },


  fnArrange() {
    let bookTimeStamp = this.data.selectDay.year + '/' + this.data.selectDay.month + '/' + this.data.selectDay.date + ' ' + this.data.selectTime;
    bookTimeStamp = new Date(bookTimeStamp).getTime()
    app.ajax('/ffkj-order/orderDetails/bookApply/' + this.data.id + '?bookNum=' + this.data.arrangeNum + '&branchId=' + this.data.branchVOSId + '&bookTimeStamp=' + bookTimeStamp, {}, 'get',res => {
      if (res.code == 0) {
        wx.showToast({
          title: '预约成功',
          icon: 'none'
        })
        this.navBack()
      }
      else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },

  // 选择门店
  fnChangeMd(e) {
    let idx = e.currentTarget.dataset.index
    this.setData({
      mdIdx : idx,
      branchVOSId: this.data.branchVOS[idx].id,
      showMendian: false
    })
    this.fnyuyue()
  },

  // 点击选择到店时间
  fnShowDaodianTime() {
    if (this.data.branchVOSId == '') {
      wx.showToast({
        title: '请先选择预约门店',
        icon: 'none'
      })
      this.setData({
        showMendian: true
      })
      return false
    }

    let nt = new Date()
    this.setData({
      showDaodianTime:true,
      nowTime: nt,
      ny: nt.getFullYear(),
      nm: nt.getMonth(),
      ndy: nt.getDate(),
    })
  },

  fnyuyue() {
    let self = this
    app.ajax('/ffkj-order/orderDetails/yeayBookInfoVO/' + this.data.branchVOSId + '?orderId=' + this.data.id, {}, 'get',res => {
      if (res.code == 0) {
        let datas = res.data.monthsData
        let m = datas[datas.length - 1].daysData.length

        var date = new Date()
        // self.currentDay = date.getDate();
        // self.currentYear = date.getFullYear();
        // self.currentMonth = date.getMonth() + 1;
        // self.currentWeek = date.getDay(); // 1...6,0

        self.setData({
          currentDay: date.getDate(),
          currentYear: date.getFullYear(),
          currentMonth: date.getMonth()+1,
          currentWeek: date.getDay()
        })

        this.data.days = []
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        for (var i = 0; i < datas.length; i++) {
          if (i == 0) {
            this.initData(date, datas[i], i == datas.length - 1 ? m : 0);//获取当前时间
          }
          else {
            if (month > 12) {
              this.initData(this.formatDate(year + 1, month - 12, 1), datas[i], i == datas.length - 1 ? m : 0);
            }
            else {
              this.initData(this.formatDate(year, month, 1), datas[i], i == datas.length - 1 ? m : 0);
            }
          }
          month += 1
        }
      }
    })
  },
  onConfirm(e) {
    this.setData({
      selectTime: e.detail.value,
      showPicker: false
    })
  },
  onCancel(){
    this.setData({
      showPicker: false
    })
  },
  // 点击选择
  fnSelectDay(e) {
    let that = this
    let y = e.currentTarget.dataset.y
    let m = e.currentTarget.dataset.m
    let dy = e.currentTarget.dataset.dy
    let index = e.currentTarget.dataset.index

    this.setData({
      idx: index,
      d: e.currentTarget.dataset.d,
      dy: dy
    })
    let year = y
    let month = m + 1
    let date = dy

    // 当前选择的日期
    this.setData({
      selectDay: {
        year: year,
        month: month,
        date: date
      }
    })

    this.data.columns = [];
    let s;
    if (new Date(year + '/' + month + '/' + date + ' 00:00:00').getTime() == new Date(new Date().toLocaleDateString()).getTime()) {
      s = new Date().getHours() + 1
    }
    else {
      s = 9
    }
    s = s<9?9:s

    for (let i = s; i < 23; i++) {
      that.data.columns.push((i < 10 ? '0' + i : i) + ':00')
    }
    that.setData({
      columns: that.data.columns
    })
  },

  // 点击 请选择时间
  fnShowPicker() {
    if (this.data.columns.length == 0) {
      wx.showToast({
        title: '请选择预约日期',
        icon: 'none'
      })
      return false
    }
    this.setData({
      showPicker: true
    })
  },

  // 确认
  fnSelectDayOK() {
    if (this.data.columns.length == 0) {
      wx.showToast({
        title: '请选择预约日期',
        icon: 'none'
      })
      return false
    }
    if (this.data.selectTime == '请选择时间') {
      wx.showToast({
        title: '请选择预约的时间',
        icon: 'none'
      })
      this.setData({
        showPicker: true
      })
      return false
    }
    this.setData({
      showDaodianTime: false
    })
  },
  addInfo() {
    this.setData({
      isShow: !this.data.isShow
    })
  },
  closeModel() {
    this.setData({
      isShow: !this.data.isShow
    })
  },
  initData(cur, datas, n) {
    var self = this
    var date = new Date(cur);
    var currentDay = date.getDate();
    var currentYear = date.getFullYear();
    var currentMonth = date.getMonth() + 1;
    var currentWeek = date.getDay(); // 1...6,0

    if (currentWeek == 0) {//星期天
      currentWeek = 7;
    }
    var str = this.formatDate(currentYear, currentMonth, currentDay);
    var arr = []

    var str = this.formatDate(currentYear, currentMonth, currentDay);
    this.data.days.length = 0;

    // 今天是周日，放在第一行第7个位置，前面6个（1前面的占位空格）
    for (var i = currentWeek - 1; i >= 0; i--) {
      var d = new Date(str);
      d.setDate(d.getDate() - i);
      if (i != 0) {
        arr.push({
          d: '',
          y: '',
          m:'',
          dy:'',
          canBook: false
        });
      }
    }
    for (var i = 0; i < (42 - n + 1) - currentWeek; i++) {
      var d = new Date(str);
      d.setDate(d.getDate() + i);
      if (currentMonth == (d.getMonth() + 1)) {
        arr.push({
          d: d,
          y: d.getFullYear(),
          m: d.getMonth(),
          dy: d.getDate(),
          canBook: datas.daysData[i] ? datas.daysData[i].canBook : false
        });
      }
    }
    var obj = {}
    obj.moth = currentMonth
    obj.days = arr
    obj.year = currentYear
    // console.log(self.data.arrDays)
    // console.log(obj)

    self.data.arrDays.push(obj)

    self.setData({
      arrDays: self.data.arrDays
    })
    // self.arrDays.push(obj)
    // self.setData({
    //   arrDays: self.data.arrDays.push(obj)
    // })
  },
  formatDate(year, month, day) {
    var y = year;
    var m = month;
    if (m < 10) m = "0" + m;
    var d = day;
    if (d < 10) d = "0" + d;
    return y + "-" + m + "-" + d
  },


  
  fnShowMendian(){
    this.setData({
      showMendian: true
    })
  },

  onCloseShowPicker(){
    this.setData({
      showPicker: false
    })
  },

  onCloseShowMendian() {
    this.setData({
      showMendian: false
    })
  },

  onCloseShowDaodianTime() {
    this.setData({
      showDaodianTime: false
    })
  },




  navBack() {
    wx.navigateBack({})
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
    if (e.currentTarget.dataset.num >= this.data.canUseNum) {
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
  
})
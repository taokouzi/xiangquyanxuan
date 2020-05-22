// pages/order/index.js
// import Toast from '@vant/weapp/toast/toast'

let app = getApp()
let leftHeight = 0, rightHeight = 0; //分别定义左右两边的高度
let query,timers={};
Page({
  /**
   * 页面的初始数据
   */
  data: {
    nav: app.globalData.nav,
    nowState: '',
    state: '',
    page: 0,
    goods: [],
    isSK: true,
    loading: false,
    // 倒计时
    time: {
      h: '00',
      m: '00',
      s: '00'
    },
    datas: [],

    // 1显示 0不显示
    showDixian: 0,
    plType: 2,

    nowCityObj: {},

    leftList: [],
    rightList: [],


    // 广告
    ad: {},

  },

  // 打开调试----------------------------------------
  /*fndebug(){
    wx.setEnableDebug({
      enableDebug: true
    })
  },*/
  clear(){
    app.data.openid = ''
    app.data.userid = ''
    app.data.sessionKey = ''
    wx.setStorageSync('openid', '');
    wx.setStorageSync('userid5', '');
    wx.setStorageSync('sessionKey', '');
    wx.showToast({
      title: '缓存清了',
      icon: 'none'
    })
  },
  // ---------------------------------------------------

  onPullDownRefresh() {
    wx.showNavigationBarLoading()
    this.fnLoad()
  },

  onLoad() {
    let that = this
    let systemInfo = wx.getSystemInfoSync()
    this.setData({
      scrollHeight: systemInfo.windowHeight - app.globalData.nav.navHeight
    })
    
    if (app.data.userid == '') {
      app.getCode(() => {
        that.fnLoad()
      })
    }
    else{
      that.fnLoad()
      // 广告
      that.fnadIndex()
    }
  },

  onShow() {
    app.myinfo()
    // 需要重新渲染首页
    // 账号过期，身份提升，切换站点
    if (app.globalData.isShuaxinIndex) {
      app.globalData.isShuaxinIndex = false
      this.fnLoad()
    }
  },

  // 复位
  fnLoad() {
    let that = this
    app.globalData.selectCityObj.city = app.globalData.selectCityObj.city.replace(/(.*)市/, '$1');
    leftHeight = 0;
    rightHeight = 0;
    that.setData({
      page: 0,
      nowCityObj: app.globalData.selectCityObj,
      datas: [],
      goods: [],
      leftList: [],
      isSK: true,
      loading: true,
      rightList: []
    })
    that.goodsList()
    wx.stopPullDownRefresh()
  },


  // 首页弹窗广告（显示）
  fnadIndex(){
    app.fnad('XCX001',res=>{
      if( res.code == 0 ){
        this.setData({
          ad: res.data
        })
      }
    })
  },

  // 首页弹窗广告（关闭）
  showAdClose(){
    this.setData({
      ad: {
        showAd: false
      }
    })
    app.fnadClose('XCX001', res => {
      if( res.code == 0 ){
        console.log('已关闭广告')
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.configShare('', '', '', re => {

    }, res => {

    })
  },
  //滚动到底部触发事件  
  searchScrollLower: function () {
    this.goodsList()
  },


  

  changePlType() {
    if (this.data.plType == 3) {
      this.setData({
        plType: 2
      })
    } else {
      this.setData({
        plType: 3
      })
    }
    this.fnLoad()
    /*if (this.data.plType >= 3) {
      this.setData({
        plType:1
      })
    }
    else {
      this.setData({
        plType: ++this.data.plType
      })
    }*/
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

  // 商品列表回显
  goodsList() {

    let that = this, page = this.data.page
    if (page == 0) {
      leftHeight = 0;
      rightHeight = 0;
      // 清除所有计时器
      for (var each in timers) {
        clearInterval(timers[each]);
      }
      this.setData({
        datas: [],
        goods: [],
        leftList:[],
        rightList:[]
      })
    }

    this.setData({
      page: ++page,
      loading: true
    })

    app.ajax('/ffkj-main/commodity/page/list', {
      pageNum: page,
      pageSize: 10,
      clientType: 0,
      cityId: this.data.nowCityObj.cityId
    }, 'get', (res) => {
      if (res.code == 0) {
        if (res.data.list.length == 0) {
          this.setData({
            showDixian: 1,
            loading: false,
            isSK: false
          })
          return false;
        }
        else {
          this.setData({
            showDixian: res.data.list.length < 10 ? 1 : 0
          })
          var result = this.data.goods;

          var resArr = [];

          for (let i in res.data.list) {
            let newI = parseFloat((this.data.page - 1) * 10) + parseFloat(i)
            let goods = res.data.list[i]
            // let timer;
            let state = goods.commodityState
            let nowTime = (new Date()).getTime()
            let xiaTime = goods.planLowerShelfDate || 0  //预计下架时间
            let shangTime = goods.upperShelfDate || 0  //上架时间
            let qgTime = 24 * 60 * 60 * 1000;

            let nowState = "", state2 = "", time = ""

            if (state == '4') {
              if (shangTime > nowTime) {
                nowState = '待抢购',
                  state2 = 5.5
              }
              else {
                // 当前时间大于等于下架时间，状态为已下架
                if (nowTime >= xiaTime) {
                  nowState = '已售罄',
                    state2 = 5
                }
                else {
                  if (xiaTime - nowTime <= 0 || goods.specsStockTotal <= 0) {
                    nowState = '已售罄',
                      state2 = 5
                  }
                  else if (xiaTime - nowTime > 0 && xiaTime - nowTime <= qgTime) {
                    state2 = 4.5
                    res.data.list[i]['time'] = this.fntimer(xiaTime, timers[page + '-' + i])
                    timers[page + '-' + i] = setInterval(function () {
                      if (this.fntimer(xiaTime, timers[page + '-' + i]) == 0) {
                        nowState = '已售罄',
                        state2 = 5.55  //倒计时结束后立即改为售罄状态，但为了防止列表结构不改变，需要特殊处理，但仅限于该文件的瀑布流布局
                        res.data.list[i]['nowState'] = nowState
                        res.data.list[i]['state'] = state2
                      }
                      else {
                        res.data.list[i]['time'] = this.fntimer(xiaTime, timers[page + '-' + i])
                      }
                      this.data.datas.splice(newI, 1, res.data.list[i])
                      this.isLeft(this.data.datas,'djs')
                      this.setData({
                        datas: this.data.datas
                      })
                    }.bind(this), 1000)
                  }
                  else {
                    nowState = '抢购中',
                      state2 = 4
                  }
                }
              }
            }
            else if (state == '5') {
              nowState = '已售罄',
                state2 = 5
            }
            else if (state == '6') {
              nowState = '已下架',
                state2 = 6
            }
            res.data.list[i]['nowState'] = nowState
            res.data.list[i]['state'] = state2
            if (that.data.datas.length > 0 && that.data.page == 1) { } else {
              resArr.push(res.data.list[i])
            }
          }

          this.isLeft(resArr, '')
          this.data.goods = result.concat(resArr)

          that.setData({
            datas: this.data.goods, //获取数据数组  
            searchLoading: true,   //把"上拉加载"的变量设为false，显示  
            isSK: false
          });
        }

      }
      else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }

      this.setData({
        loading: false
      })
      })
  },

  async isLeft(goods,dataType) {
    let list = goods,
      leftList = this.data.leftList,
      rightList = this.data.rightList;
    query = wx.createSelectorQuery().in(this)
    
    // 倒计时更新数据列表状态
    if (dataType == 'djs') {
      await this.getBoxHeight(leftList, rightList);
    }
    else{
      for (const item of list) {
        leftHeight <= rightHeight ? leftList.push(item) : rightList.push(item); //判断两边高度，来觉得添加到那边
        await this.getBoxHeight(leftList, rightList);
      }
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
          if (res[0] ){
            leftHeight = res[0].height; //获取左边列表的高度
            rightHeight = res[1].height; //获取右边列表的高度
          }
          resolve();
        });
      });
    })
  }


})




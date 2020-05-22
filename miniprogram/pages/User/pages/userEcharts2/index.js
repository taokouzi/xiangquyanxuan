import * as echarts from '../../../../ec-canvas/echarts';

let app = getApp()

function fnSeries(sData,name,color1,color2){
  return {
    data: sData,
    name: name,
    type: 'bar',
    barWidth: '15%',
    itemStyle: {
      normal: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0,
          color: color1
        }, {
          offset: 1,
            color: color2
        }]),
        barBorderRadius: 12,
        label: {
          show: true,
          position: 'top',
          textStyle: {
            color: '#DDD',
            fontSize: '10'
          }
        }
      },
    },
  }
}

function fnOption(xData,n, sData ){
  let series = []
  if( n==1 ){
    series = [fnSeries(sData, '金额（黄）', '#fccb05', '#f5804d')]
  }
  else if (n == 2){
    series = [fnSeries(sData, '人数（绿）', '#8bd46e', '#09bcb7')]
  }

  return {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '2%',
      right: '4%',
      bottom: '4%',
      top: '10%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      data: xData,
      axisTick: false,
      axisLine: {
        show:false,
        lineStyle: {
          color: "#999"
        }
      },
      axisLabel: {
        fontSize: 9
      }
    }],
    yAxis: [{
      type: 'value',
      splitNumber: 4,
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#585A67'
        }
      },
      axisTick:false,
      axisLine: {
        show: false,
        lineStyle: {
          color: "#999"
        },
      },
      axisLabel: {
        fontSize: 9
      },
      nameTextStyle: {
        color: "#999"
      },
      splitArea: {
        show: false
      }
    }],
    series: series
  };
}


Page({
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,

    id:'',

    gxTotal: 0,
    gxWeekly: 0,
    drTotal: 0,
    drWeekly: 0,
  },
  
  onLoad(options){
    this.setData({
      id: options.id
    })
    this.init_bar1();
  },
  onChange(e){
    if (e.detail.index == 0 ){
      this.init_bar1();
    }
    else{
      this.init_bar2();
    }
  },

  navBack() {
    wx.navigateBack({})
  },
  
  init_bar1(){
    // 团长查看达人贡献数据
    this.selectComponent('#ec1').init((canvas, width, height, dpr)=>{
      let xData = [], sData = []
      app.ajax('/ffkj-main/user/getTopSmartProfitStatistics?teamLeaderId=' + this.data.id, {}, 'get', res => {
        if (res.code == 0) {
          for (var i in res.data.list) {
            xData.push(res.data.list[i].k)
            sData.push(res.data.list[i].v)
          }
          this.setData({
            gxTotal: res.data.totalProfit,
            gxWeekly: res.data.weeklyProfit
          })

          const chart1 = echarts.init(canvas, null, {
            width: width,
            height: height,
            devicePixelRatio: dpr // new
          });
          canvas.setChart(chart1)
          var option = fnOption(xData, 1, sData);
          console.log(option)
          chart1.setOption(option);
          return chart1;
        }
      })
    })
  },
  

  init_bar2(){
    this.selectComponent('#ec2').init((canvas, width, height, dpr)=>{
      let xData = [], sData = []
      app.ajax('/ffkj-main/user/getSmartStatistics?teamLeaderId=' + this.data.id, {}, 'get', res => {
        if (res.code == 0) {
          for (var i in res.data.list) {
            xData.push(res.data.list[i].k)
            sData.push(res.data.list[i].v)
          }
          this.setData({
            drTotal: res.data.total,
            drWeekly: res.data.weekly
          })
          const chart2 = echarts.init(canvas, null, {
            width: width,
            height: height,
            devicePixelRatio: dpr // new
          });
          canvas.setChart(chart2)
          var option = fnOption(xData, 2, sData);
          console.log(option)
          chart2.setOption(option);
          return chart2;
        }
      })
    })
  },

});

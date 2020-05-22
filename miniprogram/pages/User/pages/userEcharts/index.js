import * as echarts from '../../../../ec-canvas/echarts';


let app = getApp()

function fnOption(xData, sData ){
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
    series: [{
      data: sData,
      name: '金额（黄）',
      type: 'bar',
      barWidth: '15%',
      itemStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: '#fccb05'
          }, {
            offset: 1,
            color: '#f5804d'
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
    }]
  };
}

function initChart(canvas, width, height, dpr, xData, sData) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);

  var option = fnOption(xData, sData);

  chart.setOption(option);
  return chart;
}

Page({
  data: {
    nav: app.globalData.nav,
    jiaonang: app.jiaonang,


    weeklyProfit:0,
    totalProfit:0,

    id:'',
  },

  navBack() {
    wx.navigateBack({})
  },
  
  echartsInit(){
    this.selectComponent('#ec').init((canvas, width, height, dpr) => {
      let xData = [], sData = [], that = this
      app.ajax('/ffkj-main/user/getTeamLeaderProfitStatistics?smartId=' + that.data.id, {}, 'get', res => {
        if (res.code == 0) {
          for (var i in res.data.list) {
            xData.push(res.data.list[i].k)
            sData.push(res.data.list[i].v)
          }
          that.setData({
            totalProfit: res.data.totalProfit,
            weeklyProfit: res.data.weeklyProfit,
          })
          initChart(canvas, width, height, dpr, xData, sData)
        }
      })
    })
  },


  onLoad(options){
    this.setData({
      id: options.id
    })
    this.echartsInit()
  }

});

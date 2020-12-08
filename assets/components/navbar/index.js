var app = getApp();
Component({
  properties: {
    parameter:{
      type: Object,
      value:{
        class:'0'
      },
    },
    background: {
      type: String,
      value: "#FFE002"
    },
    titleColor:{type:String,value:""}
  },
  data: {
    navH: "",
    statusBar: "",
  },
  ready: function(){
    var pages = getCurrentPages();
    var currPage = null;
    if (pages.length) {
      currPage = pages[pages.length - 1].route;
    }
    if (pages.length <= 1 || currPage == 'pages/login/index"'){
      this.setData({ 'parameter.return': 0 });
    }else{
      this.setData({ 'parameter.return': 1 });
    }

    if (currPage == 'pages/index/index' || currPage == 'pages/showCode/index' || currPage == 'pages/user/userCenter' || currPage == 'pages/login/index' || currPage == 'pages/goods/checkPrice' || currPage == 'pages/merber/superMerber'){
      this.setData({ 'parameter.home': 0 });
    }else{
      this.setData({ 'parameter.home': 1 });
    }
  },
  attached: function () {
    this.setData({
      navH: app.globalData.navHeight,
      statusBar: app.globalData.statusBar
    });
  },
  methods: {
    return:function(){
      wx.navigateBack({
        delta: 1
      })
    },
    //回主页
    home: function () {
      wx.switchTab({
        url: '/pages/index/index'
      })
    },
    //切换组织单元
  }
})


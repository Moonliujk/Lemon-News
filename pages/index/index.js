//index.js
const typeTrans = {
  'gn': '国内',
  'gj': '国际',
  'cj': '财经',
  'yl': '娱乐',
  'js': '军事',
  'ty': '体育',
  'other': '其他'
}
const typeList = ['gn', 'gj', 'cj', 'yl', 'js', 'ty', 'other']
//获取应用实例
Page({
  data: {
    newsType: 'gn',   // 当前新闻类型
    currentType: '国内',
    newsHeadList: [], // 导航栏处的新闻列表
    newsMainList: [],  // 主体处新闻列表
    willShowBigButton: true,  // 判断是否显示大按钮
    isBigIconCliced: false,   // 大按钮是否被点击
    buttonsName: [],
    buttonWrapperAttr: 'hidden-type-buttons',  // 显示新闻类型选择器容器
    lastY: 0, // 用于判断滑动的方向；向下滑动时，显示选择器，否则不显示
    timeTD: null // 动画时间戳
  },
  onLoad() {
    this.getNewsList();
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.getNewsList(() => {
      wx.stopPullDownRefresh();
    });
  },
  getNewsList(callback) {
    wx.showLoading({
      title: '新闻鲜榨中...'
    })
    wx.request({
      url: 'https://test-miniprogram.com/api/news/list',
      data: {
        type: this.data.newsType
      },
      success: (res) => {
        wx.hideLoading();
        // 获取新闻列表
        let buttonsIcon = [];
        let newsList = res.data.result;
        newsList.forEach(item=>{
          item.date = item.date.substring(0, 10);
          // 添加图片，图片若不存在，则添加默认图片
          item.firstImage = item.firstImage || '../../images/news-bg.png'
        })
        let newsMainList;  // 定义显示在新闻列表中的新闻
        let newsHeadList = newsList.slice(0, 3);  // 定义显示在头部轮播图中的新闻
 
        // 根据新闻数量的不同，进行不同的处理
        if (newsList.length <= 3) {  // 新闻总数少于4时，轮播图中的新闻等于列表中的新闻
          newsMainList = newsHeadList; 
        } else {                     // 否则，将新闻进行划分
          newsMainList = newsList.slice(3);
        }

        // 确定显示的“属性”按钮
        typeList.forEach(item => {
          if (item !== this.data.newsType) {
            buttonsIcon.push(item)
          }
        })

        this.setData({
          newsHeadList: newsHeadList,
          newsMainList: newsMainList,
          currentType: typeTrans[this.data.newsType],
          buttonsIcon: buttonsIcon
        })
      },
      complete: callback && callback()
    })
  },
  // 轮播图单击以及新闻列表单击事件
  showNewsDetail(e) {
    let newsID = e.currentTarget.dataset.id;

    wx.navigateTo({
      url: `/pages/detail/detail?newsid=${newsID}&newstype=${this.data.newsType}`
    })
  },
  // 节流函数，进行touchmove事件消抖
  throttle(e) {
    let timeID = this.data.timeTD;

    if (timeID) {
      clearTimeout(timeID);
    }

    timeID = setTimeout(() => {
      this.touchMoveHandler(e)
    }, 250);

    this.setData({
      timeID: timeID,
    })
  },
  // 滑动事件处理函数；定义向下滑动会显示大按钮
  touchMoveHandler(e) {
    let currentY = e.touches[0].clientY;
    let ty = currentY - this.data.lastY;

    this.setData({
      lastY: currentY,
      willShowBigButton: ty > 0 ? true : false  // 判断滑动方向
    })
    // 当大按钮消失时，初始化大按钮内各个样式
    if (!this.data.willShowBigButton) {
      this.setData({
        isBigIconCliced: false,
        buttonWrapperAttr: 'hidden-type-buttons'
      })
    }
  },
  // 记录滑动开始时的坐标
  touchStartHandler(e) {
    this.setData({
      lastY: e.touches[0].clientY
    })
  },
  clickBigButtonEvent(e) {
    this.setData({
      isBigIconCliced: !this.data.isBigIconCliced,
    })
    this.setData({
      buttonWrapperAttr: this.data.isBigIconCliced ? 'show-type-buttons' : 'hidden-type-buttons'
    })
  },
  // 事件冒泡，点击小图标，大图标也会触发点击事件
  chooseNewsType(e) {
    console.log(e)
    this.setData({
      newsType: e.target.dataset.newstype
    })
    this.getNewsList()
  }
})

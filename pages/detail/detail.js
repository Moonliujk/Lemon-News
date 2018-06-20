const typeTrans = {
  'gn': '国内',
  'gj': '国际',
  'cj': '财经',
  'yl': '娱乐',
  'js': '军事',
  'ty': '体育',
  'other': '其他'
}

// pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    newsid: '',  
    content: [],
    newsTitle: '',
    newsImage: '',
    newsSrc: '',
    newsDate: '',
    newsType: '',
    newsTypeTxt: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      newsid: options.newsid,
      content: [],
      newsType: options.newstype,
      newsTypeTxt: typeTrans[options.newstype]
    })
    this.getNewsDetail()
  },
  // 获取新闻详情
  getNewsDetail() {
    wx.showLoading({
      title: '新闻鲜榨中...',
    })
    wx.request({
      url: 'https://test-miniprogram.com/api/news/detail',
      data: {
        id: this.data.newsid
      },
      success: (res) => {
        wx.hideLoading();
        let result = res.data.result;

        this.setData({
          newsTitle: result.title,
          newsImage: result.firstImage,
          newsSrc: result.source,
          newsDate: result.date.substring(0, 10)
        })
        this.renderPage(result);
      }
    })
  },
  renderPage(result) {
    let htmlTxt = '';
    let content = result.content;
    let length = content.length;
    let isImgCaption;
    console.log(content)
 
    // 处理图注：图后存在段落，且type=image后的第三个标签不为image则标记此image后的p为imag-caption
    content.forEach((item, index, arr)=>{
      if (index < length-3) {
        isImgCaption = item.type == 'image' && arr[index + 1].type == 'p' && arr[index + 2].type != 'image'
      } else {
        isImgCaption = false;
      }
      
      if (isImgCaption) {
        arr[index+1].type = 'image-caption'
        index++;
      }
    })
    console.log(content)
    this.setData({
      content: content
    })
  }
})
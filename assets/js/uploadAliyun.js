const {
  imgNameRome,
  RndNum,
  ossObj,
  getUploadSign
} = require("common.js");

const uploadFile = function (params) {
  if (!params.filePath || params.filePath.length < 9) {
    wx.showModal({
      title: '图片错误',
      content: '请重试',
      showCancel: false,
    })
    wx.hideLoading();
    return;
  }
  getUploadSign({
    "bucket":"hpc-oss",
    "sourceObject": ossObj.dirName,
    "contentSize": ossObj.contentSize
  }).then((date)=>{
    let suffix = "." + params.filePath.split(".")[params.filePath.split(".").length - 1];
    let uid = wx.getStorageSync("uid");
    let aliyunFileKey = ossObj.dirName +'/'+ uid + '/' + RndNum(6) + suffix;
    let formData = {
      'key': aliyunFileKey,
      'policy': date.policy,
      'OSSAccessKeyId': date.accessId,
      'signature': date.signature,
      'success_action_status': '200',
    };
    wx.uploadFile({
      url: date.host,
      filePath: params.filePath,
      name: 'file',
      formData: formData,
      success: function (res) {
        if (res.statusCode != 200) {
          if (params.fail) {
            params.fail(res)
          }
          return;
        }
        if (params.success) {
          var imgUrl = ossObj.url + aliyunFileKey;
          params.success(imgUrl);
        }
      },
      fail: function (err) {
        err.wxaddinfo = ossObj.url;
        if (params.fail) {
          params.fail(err)
        }
      },
      complete: function () {
        params.complete()
      }
    })
  })
}

module.exports = uploadFile;

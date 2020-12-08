import qrcode from './weapp.qrcode.min.js';
import barcode from './barcode';

// 插件内部是根据width, height参数的rpx值来进行绘画
// 把数字转换成条形码
function createBarcode(canvasId, code, width, height) {
  barcode.code128(wx.createCanvasContext(canvasId), code, width, height);
}

// 把数字转换成二维码
function createQrcode(canvasId, code, width, height) {
  qrcode({
    width: width,
    height: height,
    canvasId: canvasId,
    text: code,
    _this: this
  })
}

module.exports = {
  createBarcode,
  createQrcode
}
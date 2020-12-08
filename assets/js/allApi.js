// allApi.js
module.exports.API = {
  getUserInfo: "thirdauth/wx/v1/wxauth/getSmallProgramUserInfo",  //授权登录获取用户信息
  mpLogin:"thirdauth/wx/v1/wxauth/smallProgramLogin",  //小程序登录
  phoneAuth:"thirdauth/wx/v1/wxAuthPlus/phoneAuth",//授权手机
  getAllStores:"basic/v1/app/store/queryAllStores",   //获取所有门店
  queryGoodsByBarcode:"product/api/app/ver1_0/product/getAPPProduct",   //扫一扫查价
  purchaseCardToPay:"member-wx/v1/userMemberCardPurchases/purchaseCardToPay",//小程序购买荟员调用接口
  getMemberByUnionId:"member-wx/v1/userMembers/getMemberByUnionId", //获取用户荟员信息
  queryGroupConfig:"wechatapplet/v1/applets/queryGroupConfig",//查询首页配置列表
  showCouponList:"wechatapplet/v1/applets/showCouponList",//优惠卷列表
  getAllOrderList: "order/api/app/ver1_0/order/queryOrder",  //查询所有订单
  icasFaceQuery: "smartstore/api/icas/v1/person/query",  //人像上传查询
  icasFaceEdit: "smartstore/api/icas/v1/person/edit",   //人像上传修改
  icasFaceAdd: "smartstore/api/icas/v1/person/add",    //人像上传添加
  showCouponList:"wechatapplet/v1/applets/showCouponList",//优惠卷列表
  uploadOssgetSign: "smartstore/api/icas/v1/person/file/postPolicy",//生成上传签名
  isFaceAuth:"wechatapplet/v1/switchConfig/query",  //是否开启人脸
  wxPayOpen:"pay/api/app/ver1_0/offlinePayView/open",  //获取微信支付签名
  queryProductPrice:"wechatapplet/v1/applets/queryProductPrice",//扫一扫查价
  preOrder:"wechatapplet/v1/order/preOrder",//确认订单初始化
  createOrder:"wechatapplet/v1/order/createOrder",//订单生成
  payOrder:"wechatapplet/v1/order/payOrder",//门店订单列表直接支付
  queryShare:'marketing/api/app/v1/promotion/share/ns1/query',//三选一
  productLimit:"wechatapplet/v1/productWhiteList/productLimit"
};

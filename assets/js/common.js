var {
    API
} = require('allApi.js');
var yunlv = {};
//基本配置
yunlv.base = {
    gAppid: "wx55a2d735dcaba645", //【荟品仓】小程序AppID
//   gYunlvServer: "https://api.hpcang.com", //正式
    gYunlvServer: "https://api-dev.hpcang.com", //dev
    isLoding: false,
    ossObj: {
        url: 'https://img.hpcang.com/',
        dirName: 'faceImg',
        contentSize: '10'
    },
    gOrgOID: function () { //获取门店信息
        try {
            var value = wx.getStorageSync('OrgOID');
            if (value) {
                return value;
            } else {
                return "" //荟品仓嘉定店
            }
        } catch (e) {
            return "getStorageSync gOrgOID error";
        }
    },
    gToken: function () { //获取token
        try {
            var value = wx.getStorageSync('token');
            if (value) {
                return value;
            } else {
                return "";
            }
        } catch (e) {
            return "getStorageSync token error";
        }
    },
    //执行用户授权
    doLoginFun: function () {
        let pages = getCurrentPages(); // 保存当前页面
        if (pages.length) {
            let currentPage = pages[pages.length - 1];
            if (currentPage.route == undefined) {
                currentPage.route = "pages/showCode/index";
            }
            "pages/login/index" != currentPage.route && wx.setStorageSync("currentPage", currentPage);
        }
        wx.redirectTo({
            url: "/pages/login/index" // 跳转授权登录页面
        });
    },
    //授权成功 跳转回原页面
    navigateBackFun: function () {
        // wx.navigateBack();
        var pages = getCurrentPages();
        if (pages.length > 1) {
            getCurrentPages()[getCurrentPages().length - 2].onLoad();
        }
        let currentPage = wx.getStorageSync('currentPage');
        if (JSON.stringify(currentPage.options) != '{}') {
            var toUrl = currentPage.route + yunlv.tools.jsonIfyFun(currentPage.options);
        } else {
            var toUrl = currentPage.route
        }
        wx.redirectTo({
            url: '/' + toUrl,
            fail: function () {
                wx.switchTab({
                    url: '/' + toUrl,
                });
            }
        });
    }
};

//后台请求封装
yunlv.httpResource = {
    httpResource: function (service, filter, success, method, error, typeQuset, isError) {
        yunlv.base.isLoding = false;
        let type = null,
            header = {
                'content-type': 'application/json'
            };
        if (typeQuset == 1) {
            filter['source'] = 'hpc_mp';
            filter['hp_token'] = yunlv.base.gToken();
            filter['channel_code'] = 1000;
            filter['decrypt_enable'] = true;
            filter['hp_version'] = 1.0;
            type = "old";
        } else {
            header['source'] = 'hpc_mp'
            header['hp_token'] = yunlv.base.gToken();
            type = "new";
        };
        var timeLoding = setTimeout(() => {
            if (yunlv.base.isLoding) {} else {
                // wx.showLoading({
                //     title: '加载中...',
                //     mask: true
                // });
            }
        }, 500);
        wx.request({
            url: yunlv.base.gYunlvServer + "/" + API[service],
            data: filter,
            method: method || "POST",
            timeout: 6000,
            header: header,
            success: function (data) {
                yunlv.base.isLoding = true;
                let res = data.data;
                if (type == "new") {
                    if (!res.success) { // 失败
                        if (!isError) {
                            wx.showToast({
                                title: res.errorMessage,
                                icon: 'none',
                                duration: 3000,
                                mask: true,
                            })
                        }
                        //登录失效
                        if (res.errorCode == "20000050" || res.code == "20000050") {
                            yunlv.base.navigateBackFun();
                        }
                        error && error(res);
                    } else {
                        success && success(res.data);
                    }
                } else if (type == "old") {
                    if (res.code !== 0) {
                        if (!isError) {
                            wx.showToast({
                                title: res.errorMessage,
                                icon: 'none',
                                duration: 3000,
                                mask: true,
                            })
                        }
                        if (res.errorCode == "20000050" || res.code == "20000050") {
                            yunlv.base.navigateBackFun();
                        }
                        error && error(res);
                    } else {
                        success && success(res.result);
                    }
                }
            },
            fail: function () {
                error && error();
            },
            complete: function (e) {
                clearTimeout(timeLoding);
                // wx.hideLoading({
                //     fail: function () {}
                // });
            }
        })
    }
};
yunlv.tools = {
    // 拨打电话
    callPhone(phoneNumber) {
        wx.makePhoneCall({
            phoneNumber: phoneNumber,
            success: function () {
                console.log("拨打成功！")
            },
            fail: function () {
                console.log("拨打失败！")
            }
        })
    },
    //手机正则校验
    checkPhone(text) {
        return text.match(/((((13[0-9])|(15[^4])|(18[0,1,2,3,5-9])|(17[0-8])|(147))\d{8})|((\d3,4|\d{3,4}-|\s)?\d{7,14}))?/g);
    },

    setOrg(orgid) {
        var newOrgOID = orgid;
        var oldOrgOID = wx.getStorageSync("OrgOID");
        if (oldOrgOID != newOrgOID) {
            wx.setStorageSync("OrgOID", newOrgOID);
            var OrgList = wx.getStorageSync("OrgList");
            var currentOrgObj = yunlv.data.queryObjFromObjArr(OrgList, "OID", newOrgOID);
            wx.setStorageSync("currentOrgName", currentOrgObj[0].OrgName);
        }
    },
    //将http地址转换为https
    httpTohttps: function (url, type) {
        let urls = url;
        if (!url) {
            urls = "";
        } else {
            if (url.indexOf("http://") > -1) {
                urls = url.replace("http:", "https:");
            } else {
                urls = url;
            }
        }
        if (!type) {
            urls = urls + "?x-oss-process=style/width640_mark";
        } else {
            urls = urls + type;
        }
        return urls;
    },

    //倒计时2；
    timeClock: function (endtime, that) {
        var interval = null;
        endtime = endtime.replace(/-/g, "/");
        var totalSecond = (new Date(endtime).getTime() - new Date().getTime()) / 1000;
        var interval = setInterval(function () {
            // 秒数  
            var second = totalSecond;
            // // 天数位  
            var day = Math.floor(second / 3600 / 24);
            var dayStr = day.toString();
            if (dayStr.length == 1) dayStr = '0' + dayStr;
            // 小时位  
            var hr = Math.floor((second - day * 3600 * 24) / (60 * 60));
            var hrStr = hr.toString();
            if (hrStr.length == 1) hrStr = '0' + hrStr;

            // 分钟位  
            // var min = Math.floor((second - hr * 3600) / 60);
            var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
            var minStr = min.toString();
            if (minStr.length == 1) minStr = '0' + minStr;

            // 秒位  
            // var sec = second - hrNew * 3600 - min * 60;
            var sec = Math.floor(second - day * 3600 * 24 - hr * 3600 - min * 60);
            var secStr = sec.toString();
            if (secStr.length == 1) secStr = '0' + secStr;

            that.setData({
                countDownDay: dayStr,
                countDownHour: hrStr,
                countDownMinute: minStr,
                countDownSecond: secStr,
            });
            totalSecond--;
            if (totalSecond <= 0) {
                // wx.showToast({
                //   title: '活动已结束',
                //   icon: 'none',
                //   duration: 2000,
                //   mask: true,
                // })
                that.setData({
                    endState: 1,
                    countDownDay: '00',
                    countDownHour: '00',
                    countDownMinute: '00',
                    countDownSecond: '00',
                });
                clearInterval(interval);
            }
        }.bind(that), 1000);
        that.setData({
            interval: interval
        });
    },

    /**
     * 获取当前时间的日期部分
     */
    getNowFormatDate: function () {
        var date = new Date();
        var year = date.getFullYear(); //完整4位年份， getYear(); //获取当前年份(2位)
        var month = date.getMonth() + 1; //date.getMonth()月份0~11，0代表1月
        var day = date.getDate(); //获取当前日(1-31)

        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (day >= 0 && day <= 9) {
            day = "0" + day;
        }
        return year + "-" + month + "-" + day;

    },
    //日期比较：日期字符串格式2017-10-26 
    compareDate: function (dateStart, dateEnd) {
        var d1 = new Date(dateStart.replace(/\-/g, "\/"));
        var d2 = new Date(dateEnd.replace(/\-/g, "\/"));
        if (d1 > d2) {
            return false;
        } else {
            return true;
        }
    },
    jsonIfyFun(data) {
        if (JSON.stringify(data) != '{}') {
            var q = "?";
            for (var key in data) {
                q = q + key + "=" + data[key] + "&";
            }
            q = q.substr(0, q.length - 1)
            return q
        }
    },
    /**
     * 计算两个时间相差多少秒
     */
    getSecondByTowDate(date1, date2) {
        var dateStart = new Date(date1);
        var dateEnd = new Date(date2);
        var second = (dateEnd.getTime() - dateStart.getTime()) / 1000;
        return second;
    },
    //px转换rpx
    pxTorpx: function (width) {
        let clientWidth = wx.getSystemInfoSync().screenWidth;
        return Math.floor(clientWidth * width / 750);
    },
    add0: function (m) {
        return m < 10 ? "0" + m : m;
    },
    imgNameRome: function () {
        var time = new Date();
        var y = time.getFullYear();
        var m = time.getMonth() + 1;
        var d = time.getDate();
        var h = time.getHours();
        var mm = time.getMinutes();
        var s = time.getSeconds();

        var imgName = y +
            yunlv.tools.add0(m) +
            yunlv.tools.add0(d) +
            yunlv.tools.add0(h) +
            yunlv.tools.add0(mm) +
            yunlv.tools.add0(s);
        return imgName;
    },
    RndNum: function (n) {
        var rnd = "";
        for (var i = 0; i < n; i++)
            rnd += Math.floor(Math.random() * 10);
        return rnd;
    },

    /**
     * 变量不存在
     */
    isNull: function (value) {
        if (value == null || typeof (value) == 'undefined' ||
            (typeof (value) == 'string' && value.trim() === '')) {
            return true
        } else {
            return false
        }
    },
    /**
     * 变量不存在并返回默认值
     */
    isNullOrDefault: function (value, defaultValue) {
        if (value == null || typeof (value) == 'undefined' ||
            (typeof (value) == 'string' && value.trim() === '')) {
            return defaultValue
        } else {
            return value
        }
    }
};

/**
 * 地理位置模块
 */
yunlv.location = {
        /**
         * 计算两个经纬度之间的距离
         */
        GetDistance: function (lat1, lng1, lat2, lng2) {
            var radLat1 = lat1 * Math.PI / 180.0;
            var radLat2 = lat2 * Math.PI / 180.0;
            var a = radLat1 - radLat2;
            var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
            var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
                Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
            s = s * 6378.137; // EARTH_RADIUS;
            s = Math.round(s * 10000) / 10000;
            return s;
        }
    },

    yunlv.business = {
        //小程序登录
        mpLogin: function (code,resolve) {
            yunlv.httpResource.httpResource("mpLogin", {
                code: code,
                appId: yunlv.base.gAppid
            }, function (data) {
                if (data.userName != null && data.nickName != null && data.headImgUrl != null) {
                    wx.setStorageSync("Userbase", data);
                    wx.setStorageSync("token", data.token);
                    wx.setStorageSync("uid", data.uid);
                    wx.setStorageSync("isPayMember", data.isPayMember);
                    wx.setStorageSync("openId", data.wxOpenid);
                    wx.setStorageSync("unionId", data.wxUnionid);
                    resolve()
                } else {
                    yunlv.base.doLoginFun();
                }
            })
        },
        //获取code
        getCode: function () {
            // debugger
            return new Promise((resolve, reject) => {
                wx.login({
                    success(res) {
                        resolve(res.code);
                    },
                    fail(res) {
                        wx.showToast({
                            title: '微信登录错误',
                            duration: 1500,
                            mask: true,
                            icon: "none"
                        })
                        reject(res);
                    }
                })
            });
        },
        //获取门店列表
        getOrganizationList: function (filter, callBack) {
            let data = (filter && filter.longitude && filter.latitude) ? {
                userGeoLng: filter.longitude,
                userGeoLat: filter.latitude
            } : {};
            yunlv.httpResource.httpResource("getAllStores", data, function (data) {
                let OrgList = data;
                let currentOrgObj = wx.getStorageSync("OrgOID");
                if (!currentOrgObj) {
                    wx.setStorageSync("OrgOID", OrgList[0]);
                }
                wx.setStorageSync("OrgList", OrgList);
                callBack && callBack();
            }, "GET")
        },
        //获取位置信息
        getLocationByMP: function () {
            return new Promise((resolve) => {
                wx.getLocation({
                    type: 'gcj02', //返回可以用于wx.openLocation的经纬度
                    success: function (res) {
                        wx.setStorageSync("userLocationInfo", res);
                        resolve(res);
                    },
                    fail: function (res) {
                        resolve(res);
                        console.log('微信定位失败:' + JSON.stringify(res));
                        wx.showToast({
                            title: '微信定位失败',
                        })
                    }
                })
            })
        },
        //判断是否需要人脸识别
        isFace: function () {
            return new Promise((resolve) => {
                yunlv.httpResource.httpResource("isFaceAuth", {
                    "code": "SC001"
                }, function (data) {
                    resolve(data);
                })
            })
        },
        //判断是否需要授权
        isNeedAutho: function () {
            return new Promise((resolve) => {
                // let pages = ["pages/index/index", "pages/login/index"];
                // let length = getCurrentPages().length - 1;
                // let url = pages.indexOf(getCurrentPages()[length].__route__);
                //  let Userbase = wx.getStorageSync('Userbase');
                // if (url < 0) {
                const userUID = wx.getStorageSync("uid");
                if(userUID==""||userUID==undefined||userUID==null){
                    yunlv.business.getCode().then((code) => {
                        yunlv.business.mpLogin(code,resolve)
                    });
                }
                else{
                    resolve();
                }
                // wx.getSetting({
                //     success(res) {
                //         if (res.authSetting['scope.userInfo']) {
                //             resolve();
                //         } else {
                //             yunlv.base.doLoginFun();
                //         }
                //     }
                // });
                // }
                // if (Userbase==""||!Userbase.wxUnionid || !Userbase.headImgUrl || !Userbase.nickName) {
                //   yunlv.base.doLoginFun();
                // } else {
                //   resolve();
                // }
                // } else {
                //   resolve();
                // }
            });

        },
        //获取上传签名
        getUploadSign: function (filter) {
            return new Promise((resolve) => {
                yunlv.httpResource.httpResource("uploadOssgetSign", filter, function (data) {
                    resolve(data);
                })
            });
        }
    };
yunlv.data = {
    sort: function (jsonData, colId, sequence) {
        //对json进行升序排序函数  
        var asc = function (x, y) {
            return (x[colId] > y[colId]) ? 1 : -1
        }
        //对json进行降序排序函数  
        var desc = function (x, y) {
            return (x[colId] < y[colId]) ? 1 : -1
        }
        if (sequence == "asc") {
            return jsonData.sort(asc);
        }
        if (sequence == "desc") {
            return jsonData.sort(desc);
        } else {
            return jsonData.sort(asc); //默认升序
        }
    },
    //从对象数组中【查找】指定属性名值的对象数组,这个方法有问题item.attrKey无效
    queryObjFromObjArr: function (jsonObjArr, attrKey, attrVal) {
        if (jsonObjArr.length) {
            var newArr = [];
            jsonObjArr.forEach((item, index) => {
                if (item[attrKey] == attrVal) {
                    newArr.push(item);
                }
            })
            return newArr;
        }
    },
    //从对象数组中【移除】指定属性名值的对象数组
    removeObjFromObjArr: function (jsonObjArr, attrKey, attrVal) {
        for (var i = 0; i < jsonObjArr.length; i++) {
            for (var n in jsonObjArr[i]) {
                if (n == attrKey && jsonObjArr[i][n] == attrVal) {
                    jsonObjArr.splice(i, 1);
                }
            }
        }
        return jsonObjArr;
    },
    makeTreeData: function (jsonData, StartID) {
        var children = [];
        for (var i = 0; i < jsonData.length; i++) {
            if (jsonData[i].PID == StartID) {
                children.push(jsonData[i]);
                jsonData[i].children = this.makeTreeData(jsonData, jsonData[i].NID);
            }
        }
        return children;
    }
};

//使用时：common.
module.exports = {
    gAppid: yunlv.base.gAppid,
    gYunlvServer: yunlv.base.gYunlvServer,
    gOrgOID: yunlv.base.gOrgOID,
    gToken: yunlv.base.gToken,
    doLoginFun: yunlv.base.doLoginFun,
    navigateBackFun: yunlv.base.navigateBackFun,
    ossObj: yunlv.base.ossObj,

    httpResource: yunlv.httpResource.httpResource,

    checkPhone: yunlv.tools.checkPhone,
    callPhone: yunlv.tools.callPhone,
    setOrg: yunlv.tools.setOrg,
    httpTohttps: yunlv.tools.httpTohttps,
    timeClock: yunlv.tools.timeClock,
    getNowFormatDate: yunlv.tools.getNowFormatDate,
    compareDate: yunlv.tools.compareDate,
    jsonIfyFun: yunlv.tools.jsonIfyFun,
    getSecondByTowDate: yunlv.tools.getSecondByTowDate,
    pxTorpx: yunlv.tools.pxTorpx,
    add0: yunlv.tools.add0,
    imgNameRome: yunlv.tools.imgNameRome,
    RndNum: yunlv.tools.RndNum,
    isNull: yunlv.tools.isNull,
    isNullOrDefault: yunlv.tools.isNullOrDefault,

    GetDistance: yunlv.location.GetDistance,

    getLocationByMP: yunlv.business.getLocationByMP,
    getOrganizationList: yunlv.business.getOrganizationList,
    mpLogin: yunlv.business.mpLogin,
    getCode: yunlv.business.getCode,
    isNeedAutho: yunlv.business.isNeedAutho,
    getUploadSign: yunlv.business.getUploadSign,

    arraySort: yunlv.data.sort,
    queryObjFromObjArr: yunlv.data.queryObjFromObjArr,
    removeObjFromObjArr: yunlv.data.removeObjFromObjArr,
    makeTreeData: yunlv.data.makeTreeData,
    isFace: yunlv.business.isFace
}
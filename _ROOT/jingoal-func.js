(function (io) {
    var _ajax = io.ajax;
    io.ajax = function (url, options) {
        var onsuccess = options.onsuccess;
        var onerror = options.onerror;
        var onfailure = options.onfailure;
        ecui.util.extend(options, {
            onsuccess: function (data) {
                var flagUrl = '/ecircle/ecircle/v1/get_comment_mention';
                if ('.html' === url.slice(url.length - 5)) {
                    // 如果是加载的HTML文件则直接通过
                    onsuccess(data);
                    return;
                }
                var dataParsed;
                try {
                    dataParsed = JSON.parse(data);
                } catch (e) {
                    if (onerror) {
                        onerror(data);
                    }
                    return;
                }
                var code = dataParsed.meta.code;
                if (200 === code) {
                    // 成功，回调
                    onsuccess(data);
                } else if (401 === code) {
                    // 未登录
                    if (0 === url.indexOf(flagUrl)) {
                        onerror(code, dataParsed.meta);
                    } else {
                    	//点击退出登录按钮，直接回到登录页
                    	if(0 == url.indexOf("loginOut")){
                    		jingoal.loginout.loginDialog();
                    	}
                    }
                } else {
                    if (onerror) {
                        onerror(code, dataParsed.meta);
                    }
                }
            },
            onerror: function () {
                if (onfailure) {
                    onfailure();
                }
            }
        });
        _ajax(url, options);
    };
}(ecui.io));

jingoal.ajax = function (url, options) {
    var onsuccess = options.onsuccess;
    var onerror = options.onerror;
    var onfailure = options.onfailure;
    options.method = (options.method || 'GET').toUpperCase();
    if (options.method === 'GET') {
        options.data = (function (data) {
            var results = [];
            for (var i in data) {
                if (data.hasOwnProperty(i)) {
                    results.push(i + '=' + data[i]);
                }
            }
            return results.join('&');
        }(options.data));
    } else {
        options.data = JSON.stringify(options.data);
    }
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';
    ecui.util.extend(options, {
        onsuccess: function (data) {
            data = JSON.parse(data);
            if (onsuccess) {
                onsuccess.call(null, data.data);
            }
        },
        onerror: function (code, data) {
            if (onerror) {
                onerror.call(null, code, data);
            } else {
                // todo: public error handler
            }
        },
        onfailure: function () {
            if (onfailure) {
                onfailure.call(null);
            } else {
                // todo: public failure handler
            }
        }
    });
    ecui.io.ajax(url, options);
};

jingoal.cookie = {
    set: function (key, val, exp) {
        var cookie = key + '=' + val;
        if (exp) {
            cookie += ('; expires=' + exp.toGMTString());
        }
        document.cookie = cookie;
    },
    get: function (key) {
        var cookies = document.cookie.split('; ');
        var val = null;
        cookies.forEach(function (cookie) {
            cookie = cookie.split('=');
            if (cookie[0] === key) {
                val = cookie[1];
            }
        });
        return val;
    },
    del: function (key) {
        var d = new Date();
        d.setTime(d.getTime() - 1000000);
        var cookie = key + '="" ; expires=' + d.toGMTString();
        document.cookie = cookie;
    }
};

(function (J) {
    var qurStr = document.location;
    J.location = {
        get: function (index) {
            return query[index];
        },
        set: function (index, value) {
            query[index] = value;
        },
        del: function (index) {
            delete query[index];
        },
        url: function () {
            return qurStr;
        }
    };
}(jingoal));

jingoal.loginout = {
    loginMgtsso: function () {
        var url = jingoal.location.url();
        jingoal.cookie.set('ouri', encodeURIComponent(url));
        location.href = jingoal.LOGIN_URL;
    },
    loginDialog: function () {
        var dialog = ecui.get('loginDialog');
        if (!dialog || (dialog && dialog.isShow())) {
            return;
        }
        dialog.setTitle("重新登录");
        
        //初始化界面
        ecui.$('loginError').style.display = 'none';
        ecui.$('loginName').value = '';
        ecui.$('password').value = '';
        
        dialog.showModal();
    },
    loginFinish: function () {
        var dialog = ecui.get('loginDialog');
        if (dialog) {
            dialog.hide();
        }
    },
    logout: function (callback) {
        jingoal.cookie.del('ouri');
        jingoal.cookie.del('flag');
        if (!callback) {
            callback = 'jingoal.loginout.logoutOther'; //jsonp回调该函数
        }
        jingoal.loginout.invokeOtherDomain(jingoal.SSO_HOST + '/logout?callback=' + callback);
    },
    invokeOtherDomain: function (src) {
        var ele = document.createElement('script');
        var v = new Date().getTime();
        src = src.replace(/^http[s]?:\/\//, '//');
        ele.src = src + (-1 === src.indexOf('?') ? '?' : '&') + 'v=' + v;
        document.getElementsByTagName('head')[0].appendChild(ele);
    },
    logoutOther: function (urls) {
        var next = function () {
            var url;
            if (urls.length) {
                url = urls.shift();
                url = url.replace(/^http[s]?:\/\//, '//');
                jingoal.ajax(url, {
                    onsuccess: next,
                    onerror: next,
                    onfailure: next
                });
            } else {
                jingoal.loginout.loginMgtsso();
                return;
            }
        };
        next();
        return;
    },
    isLogin: function (callback) {
        jingoal.LOGIN_ECIRCLE_SESSION = jingoal.cookie.get('ECIRCLESESSIONID');
        if (!jingoal.LOGIN_ECIRCLE_SESSION) {
            jingoal.loginout.loginMgtsso();
            return;
        }
        var url = '/ecircle/ecircle/v1/get_comment_mention';
        var func = function (after) {
            jingoal.ajax(url, {
                onsuccess: function (data_uc) {
                    callback(data_uc);
                },
                onerror: function () {
                    jingoal.loginout.logout();
                },
                onfailure: function () {
                    jingoal.loginout.logout();
                }
            });
        };
        func();
    }
};

jingoal.userAgent = function () {
    var sUserAgent = navigator.userAgent,
        pf = navigator.platform;
    if ((pf === 'Win32') || (pf === 'Windows')) {
        return 'windows';
    }
    if ((pf === 'Mac68K') || (pf === 'MacPPC') || (pf === 'Macintosh') || (pf === 'MacIntel')) {
        return 'mac';
    }
    if (pf === 'X11') {
        return 'unix';
    }
    if (sUserAgent.match(/Android/i)) {
        return 'android';
    }
    if (pf.indexOf('Linux') > -1) {
        return 'linux';
    }
    if (sUserAgent.match(/iPhone|iPad|iPod/i)) {
        return 'ios';
    }
    if (sUserAgent.match(/IEMobile/i)) {
        return 'windows phone';
    }
    return 'windows';
};
jingoal.util = {};

jingoal.util.getWindowSize = function () {
    var w = 0,
        h = 0;
    if ('number' === typeof (window.innerWidth)) {
        //Non-IE
        w = window.innerWidth;
        h = window.innerHeight;
    } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
        //IE 6+ in 'standards compliant mode'
        w = document.documentElement.clientWidth;
        h = document.documentElement.clientHeight;
    } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
        //IE 4 compatible
        w = document.body.clientWidth;
        h = document.body.clientHeight;
    }
    return {
        width: w,
        height: h
    };
};

jingoal.util.isRetinaDisplay = function () {
    if (window.matchMedia) {
        var mq = window.matchMedia('only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)');
        return ((mq && mq.matches) || (window.devicePixelRatio > 1));
    }
    return false;
};

jingoal.plugins = {};
jingoal.loadPlugin = function (name) {
    jingoal.loadPluginDepends = function (filename) {
        document.write('<script type="text/javascript" src="plugin/' + name + '/' + filename + '"></script>');
    };
    document.write('<script type="text/javascript" src="plugin/' + name + '/' + name + '.js"></script>');
};
jingoal.usePlugin = function (name, callback) {
    callback(jingoal.plugins[name]);
};

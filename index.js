(function () {
    var shareLI = null, initedShare = false;
    // var contains = document.body.contains ? function (par,chi) {
    //     return par.contains(chi);
    // } : function (par,chi) {
    //     return !!(par.compareDocumentPosition(chi) & 16);
    // };
    var getShareBtIndex = (function  (cmd) {
        // 共6个按钮
        var cmds = {'sqq':0, 'tsina':1, 'weixin':2,'qzone':3,'fbook':4,'twi':5};
        return function (cmd) {
            return cmds[cmd];
        }
    }());
    function shareInit() {
        var $ = jingoal.ecircle;
        window._bd_share_config = {
            common: {
                bdMiniList: ['sqq', 'tsina', 'weixin','qzone','fbook','twi'],
                onBeforeClick: function (cmd, config) {
                    // config.bdText = shareLI.getElementsByClassName("dynamic-item-text")[0].innerHTML; //分享的内容
                    config.bdText = $.getElementsByClassName(shareLI,"dynamic-item-text")[0].innerHTML; //分享的内容
                    // config.bdDesc = shareLI.getElementsByClassName("dynamic-item-text")[0].getAttribute("more"); //分享的摘要
                    config.bdDesc = $.getElementsByClassName(shareLI,"dynamic-item-text")[0].getAttribute("more"); //分享的摘要
                    // ie得不到location.origin
                    config.bdUrl = (location.origin || (location.protocol + "//" + location.hostname + (location.port ? ':' + location.port : ''))) + location.pathname + "#dynamicDetail~id=" + shareLI.getAttribute("dynamicid"); // 分享的Url地址
                    // 以下替换特殊符号没用，分享时会编码，比如把&符号变成%26，到目的页面又变成&amp;相当于多了这么个符号
                    config.bdDesc = config.bdDesc.replace(/&/g, '&amp;').replace(/\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, "<br/>");
                    if (cmd == "tsina" || cmd == "tqq" || cmd == "fx") {
                        config.bdText = config.bdDesc;
                    }
                    // var img_content = shareLI.getElementsByClassName("dynamic-img-wrap")[0];
                    var img_content = $.getElementsByClassName(shareLI,"dynamic-img-wrap")[0];
                    if (img_content) {
                        var imgs = img_content.getElementsByTagName("img");
                        if (imgs.length > 0) {
                            config.bdPic = imgs[0].src; //分享的图片
                        }

                    }
                    return config;
                }
            },
            share: [{
                "bdCustomStyle":"share.css"
            }]
        }
        with(document) 0[(getElementsByTagName('head')[0] || body).appendChild(createElement('script')).src = 'http://bdimg.share.baidu.com/static/api/js/share.js?cdnversion=' + ~(-new Date() / 36e5)];
        initedShare = true;

    }
    ecui.esr.onready = function () {
        // 处理index.html的特殊模板
        etpl.config({
            commandOpen: '<<<',
            commandClose: '>>>'
        });
        for (var el = document.getElementById('header').firstChild; el; el = el.nextSibling) {
            if (el.nodeType === 8) { //comment_node 注释节点
                etpl.compile(el.textContent || el.nodeValue);
            }
        }
        etpl.config({
            commandOpen: '<!--',
            commandClose: '-->'
        });
        return {
            model: function (options, callback) {
                jingoal.loginout.isLogin(function (data) {
                    options.commentCount = data;
                    ecui.esr.request([
                        'recommendList@/ecircle/ecircle/v1/get_recommend_list?lastCid=0',
                        'userInfo@/ecircle/ecircle/v1/get_user_info'
                    ], function () {
                        callback();
                    });
                });
                return false;
            },
            main: 'header',
            view: 'header',
            onbeforerender: function (context) {
                var name = context.userInfo.login_name;
                jingoal.ecircle.isRegulate = context.userInfo.is_regulate;
                jingoal.ecircle.userInfo = context.userInfo;
                context.userInfo.login_name = name.length > 16 ? name.substring(0, 16) + '...' : name;
                if (context.commentCount.comment_count > 0) {
                    ecui.get("message-count").style.display = 'block';
                }
            },
            onafterrender: function (context) {
                if (context.commentCount.comment_count > 0) {
                    ecui.$("message-count").style.display = 'block';
                }
                ecui.$('recommend-list').innerHTML = etpl.render('recommend-list', context);
                var $ = jingoal.ecircle,
                    header = ecui.$("header"),
                    logoutBtn = $.getElementsByClassName(header, 'log-out')[0],
                    span,
                    floatLogo = ecui.$('float-logo'),
                    newScrollY,
                    activeDelete = null,
                    remoteDynamicDialog = ecui.get('remoteDynamicDialog'),
                    logoutBtn1 = jingoal.ecircle.getElementsByClassName(document, 'log-out-btn')[0],
                    t,
                    companyInfo = {},
                    isLoading = false,
                    password = ecui.$("password");
                jingoal.ecircle.companyId = 0;
                jingoal.ecircle.companyInfo = companyInfo;
                jingoal.ecircle.isloadingOrLoadAll = false;
                tipArr = [];
                jingoal.ecircle.getComment = getComment;
                jingoal.ecircle.scrollY = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
                (function () {
                    var a = header.getElementsByTagName('a'),
                        hash = location.hash.replace('#', ''),
                        current = $.getElementsByClassName(header, 'current')[0];
                    if (hash === 'dynamic') {
                        $.removeClass(current, 'current');
                        $.addClass(a[1], 'current');
                    } else if (hash == 'companyDirectory') {
                        $.removeClass(current, 'current');
                        $.addClass(a[2], 'current');
                    } else if(hash == 'company\~id\=my' || hash == 'my_attention' || hash=='my_friend'){
                        $.removeClass(current, 'current');
                        $.addClass(a[3], 'current');
                    } else if (hash == '') {
                        $.removeClass(current, 'current');
                        $.addClass(a[1], 'current');
                    } 
                }());
                ecui.dom.addEventListener(password, 'keydown', function (e) {
                    if (e && (e.keyCode || e.which) == 13) {
                        reload();
                    }
                });
                var titleMap = {
                    "title_dynamic": "企业动态_今目标企业圈",
                    "title_directory": "企业名录_今目标企业圈",
                    "attention": "我关注的企业_今目标企业圈",
                    "friend": "我的企业好友_今目标企业圈"
                };
                ecui.dom.addEventListener(header, 'click', function (e) {
                    e = e || window.event;
                    var target = e.target || e.srcElement;
                    if (target.tagName && target.tagName.toLowerCase() === 'a' && !$.getParent({
                            el: target,
                            className: 'my-circle-list'
                        })) {
                        var current = $.getElementsByClassName(header, 'current')[0];
                        $.removeClass(current, 'current');
                        $.addClass(target, 'current');
                        document.title = titleMap[target.id];
                    }
                    if ($.getParent({
                            el: target,
                            className: 'my-circle'
                        })) {
                        var myCircle = $.getParent({
                            el: target,
                            className: 'my-circle'
                        });
                        var a = myCircle.getElementsByTagName('a')[0];
                        var current = $.getElementsByClassName(header, 'current')[0];
                        $.removeClass(current, 'current');
                        $.addClass(a, 'current');
                    }
                });
                ecui.$('mymessage').onclick = function () {
                	var current = $.getElementsByClassName(header, 'current')[0];
                	$.removeClass(current, 'current');
                }
                ecui.$('noBtn').onclick = function () {
                    remoteDynamicDialog.hide();
                    floatLogo.style.left = '-1000px';
                    floatLogo.style.top = '0';
                };
                ecui.dom.addEventListener(logoutBtn1, 'click', function () {
                    jingoal.ajax('/ecircle/ecircle/loginOut', {
                        method: 'post',
                        onsuccess: function (data) {
                            location.href = globalpath + "/welcome.html";
                        }
                    });
                });

                //鼠标移动
                dom.addEventListener(ecui.$('left-section'), 'mouseover', function (e) {
                    e = e || window.event;
                    var target = e.target || e.srcElement;

                    function delayLogo() {
                        jingoal.ecircle.companyId = $.getParent({
                            el: target,
                            className: 'item-wrap'
                        }).getAttribute('companyid');
                        if (companyInfo[jingoal.ecircle.companyId]) {
                            var data = companyInfo[jingoal.ecircle.companyId];
                            var option = {
                                company_id: data.company_id,
                                icon: data.icon === 'true' ? '/ecircle/ecircle/v1/show?companyId=' + data.company_id : 'css/img/logo48.png',
                                companyName: data.title,
                                star: data.star,
                                first_name: data.first_name,
                                second_name: data.second_name,
                                province_name: data.province_name,
                                city_name: data.city_name,
                                is_same_company: data.is_same_company,
                                group_type: data.group_type,
                                summary: data.summary,
                                dynamicCount: data.dynamic_count > 10000 ? "1万+" : data.dynamic_count,
                                attentionCount: data.attention_count,
                                friend: data.friend,
                                attention: data.attention
                            };
                            ecui.esr.setData('floatLogo', option);
                            floatLogo.style.display = 'block';
                            floatLogo.style.left = dom.getPosition(avatar).left - 8 + 'px';
                            floatLogo.style.top = dom.getPosition(avatar).top - 8 + 'px';
                        } else {
                            jingoal.ajax('/ecircle/ecircle/v1/view_directory?cid=' + jingoal.ecircle.companyId, {
                                method: 'GET',
                                onsuccess: function (data) {
                                    companyInfo[data.company_id] = data;
                                    var option = {
                                        company_id: data.company_id,
                                        icon: data.icon === 'true' ? '/ecircle/ecircle/v1/show?companyId=' + data.company_id : 'css/img/logo48.png',
                                        companyName: data.title,
                                        star: data.star,
                                        first_name: data.first_name,
                                        second_name: data.second_name,
                                        province_name: data.province_name,
                                        city_name: data.city_name,
                                        is_same_company: data.is_same_company,
                                        group_type: data.group_type,
                                        summary: data.summary,
                                        dynamicCount: data.dynamic_count > 10000 ? "1万+" : data.dynamic_count,
                                        attentionCount: data.attention_count,
                                        friend: data.friend,
                                        attention: data.attention
                                    };
                                    ecui.esr.setData('floatLogo', option);
                                    floatLogo.style.display = 'block';
                                    floatLogo.style.left = dom.getPosition(avatar).left - 8 + 'px';
                                    floatLogo.style.top = dom.getPosition(avatar).top - 8 + 'px';
                                }
                            });
                        }
                    }
                    if ($.hasClass(target, 'item-avatar') || $.hasClass(target, 'company-name') || $.hasClass(dom.getParent(target), 'company-name')) {
                        var avatar = $.getElementsByClassName($.getParent({
                            el: target,
                            className: 'item-wrap'
                        }), 'item-avatar')[0];
                        t = setTimeout(delayLogo, 500);
                    }
                    function allowShare (el) {
                        var li = jingoal.ecircle.getParent({
                            el: el,
                            className: 'dynamic-item'
                        });
                        var id = li.getAttribute('dynamicid');
                        // var bdsharebuttonbox = li.getElementsByClassName("bdsharebuttonbox")[0];
                        jingoal.ajax('/ecircle/ecircle/v1/add_share', {
                            method: 'POST',
                            data: {
                                "dynamic_id": id
                            },
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            onsuccess: function (data) {
                                // bdsharebuttonbox.style.display = "block";
                                shareLI = li;
                                if(!initedShare) {
                                    shareInit();
                                }
                                $.addClass(el, 'show_buttons');
                            },
                            onerror: function (code, meta){
                            	alertTip({
                                    title: meta.message
                                });
                            }
                        });
                    }
                    // if(target.tagName === 'LI' && $.hasClass(target, 'share-btn')) {
                    var el = jingoal.ecircle.getParent({
                        el: target,
                        className: 'share-btn'
                    });
                    if(el) {
                        clearTimeout(el._timer);
                        el._timer = setTimeout(function () {
                            allowShare(el);
                        },500)
                    }
                });
                dom.addEventListener(document.body, 'mouseout', function (e) {
                    e = e || window.event;
                    var target = e.target || e.srcElement;
                    if ($.hasClass(target, 'item-avatar') || $.hasClass(target, 'company-name') || $.hasClass(dom.getParent(target), 'company-name')) {
                        clearTimeout(t);
                    }
                    var el = jingoal.ecircle.getParent({
                        el: target,
                        className: 'share-btn'
                    });
                    if(el) {
                        clearTimeout(el._timer);
                        el._timer = setTimeout(function  () {
                            $.removeClass(el, 'show_buttons')
                        },500)
                    }
                });
                dom.addEventListener(floatLogo, 'mouseout', function (e) {
                    e = e || window.event;
                    var target = e.target || e.srcElement;
                    var position = dom.getPosition(floatLogo);
                    var x = e.pageX || e.clientX + Math.max(document.body.scrollLeft, document.documentElement.scrollLeft);
                    var y = e.pageY || e.clientY + Math.max(document.body.scrollTop, document.documentElement.scrollTop);
                    if (x <= position.left || x >= position.left + floatLogo.offsetWidth || y <= position.top || y >= position.top + floatLogo.offsetHeight) {
                        floatLogo.style.left = '-1000px';
                        floatLogo.style.top = '0';
                    }
                });
                dom.addEventListener(document.body, 'mouseenter', function (e) {
                    // e = ecui.wrapEvent(e);
                    // console.log(e.target);
                });

                //重新登录事件
                function reload() {
                    var nowDate = new Date();
                    var password = ecui.$('password').value.trim();
                    var token = nowDate.getTime();
                    password = hex_sha1(hex_sha1(password) + token);
                    var loginName = ecui.$('loginName').value.trim();
                    if (password.length == 0 || loginName.length == 0) {
                        ecui.$('loginError').style.display = 'inline';
                        return;
                    }
                    jingoal.ajax('/ecircle/ecircle/login', {
                        method: 'POST',
                        data: {
                            "password": password,
                            "loginName": ecui.$('loginName').value,
                            "token": token
                        },
                        onsuccess: function (data) {
                            if (data.is_login != true) {
                                ecui.$('loginError').style.display = 'inline';
                                return;
                            } else {
                                jingoal.loginout.loginFinish();
                            }
                        }
                    });
                }

                //获取评论，添加事件
                function getComment(dynamicId, el) {
                    el.setAttribute('page', 1);
                    jingoal.ajax('/ecircle/ecircle/v1/get_comments', {
                        method: 'post',
                        data: {
                            curr: 0,
                            dynamic_id: dynamicId,
                            max_id: 0,
                            max_page: "",
                            min_id: 0,
                            min_page: "",
                            count: 2,
                            to_page: el.getAttribute('page')
                        },
                        onsuccess: function (data) {
                            var ctx = {
                                comments: data.obj_list,
                                total: data.page_info.total,
                                nextPage: data.page_info.next_page_count,
                                uid: jingoal.ecircle.userInfo.uid
                            };
                            el.setAttribute('minpage', data.page_info.min_page);
                            el.setAttribute('minid', data.page_info.min_id);
                            el.style.display = 'block';
                            $.addClass(el, 'show');
                            var html = etpl.render('comment', ctx);
                            el.innerHTML = html;
                            var textarea = el.getElementsByTagName('textarea')[0],
                                commentList = $.getElementsByClassName(el, 'comment-detail-list')[0],
                                otherComment = $.getElementsByClassName(el, 'other-comment')[0],
                                noComment = $.getElementsByClassName(el, 'no-comment')[0],
                                dynamicItem = $.getParent({
                                    el: el,
                                    className: 'comment-list'
                                }),
                                publishBtn = $.getElementsByClassName(dynamicItem, 'button-publish')[0];
                                textarea.focus();
                                //评论输入框逻辑处理
                            function commentInputHandler() {
                                setTimeout(function () {
                                    var text = textarea.value.trim();
                                    var len = text.length;
                                    var placeholder = $.getElementsByClassName(dom.getParent(textarea), 'placeholder')[0];
                                    var commentTextCount = $.getElementsByClassName(dom.getParent(textarea), 'text-count')[0];
                                    if (textarea.value.length > 0) {
                                        placeholder.style.display = 'none';
                                    } else {
                                        placeholder.style.display = 'block';
                                    }
                                    if (150 - len >= 0) {
                                        commentTextCount.className = 'text-count text-gray';
                                        commentTextCount.innerHTML = '还可以输入<span class="text-count-num">' + (150 - len) + '</span>个字';
                                        if (len > 0) {

                                            $.removeClass(publishBtn, 'disabled');
                                            publishBtn.disabled = false;
                                        } else {

                                            if (!$.hasClass(publishBtn, 'disabled')) {
                                                $.addClass(publishBtn, 'disabled');
                                                publishBtn.disabled = true;
                                            }
                                        }
                                    } else {
                                        commentTextCount.className = 'text-count text-warning';
                                        commentTextCount.innerHTML = '超出了<span class="text-count">' + (len - 150) + '</span>个字';
                                        if (!$.hasClass(publishBtn, 'disabled')) {
                                            $.addClass(publishBtn, 'disabled');
                                            publishBtn.disabled = true;
                                        }
                                    }
                                }, 0);
                            }

                            function publishComment(e) {
                                var event = e || window.event,
                                    target = event.target || event.srcElement
                                jingoal.ajax('/ecircle/ecircle/v1/add_comment', {
                                    method: 'post',
                                    data: {
                                        content: textarea.value,
                                        dynamic_id: dynamicId
                                    },
                                    onsuccess: function (data) {
                                        var c = {
                                            comment: data
                                        };
                                        var str = etpl.render('comment-item', c);
                                        var fr = $.htmlToEl(str);
                                        commentList.appendChild(fr);
                                        commentList.scrollTop = commentList.scrollHeight;
                                        if (noComment) {
                                            noComment.style.display = 'none';
                                        }
                                        textarea.value = '';
                                        publishBtn.disabled = true;
                                        dom.addClass(publishBtn, 'disabled');
                                        textarea.focus();
                                        var html = $.getElementsByClassName($.getParent({
                                                el: target,
                                                className: 'dynamic-item'
                                            }), 'comment-count')[0].innerHTML,
                                            commentTextCount = $.getElementsByClassName(dom.getParent(textarea), 'text-count')[0];
                                        commentTextCount.innerHTML = '还可以输入<span>150</span>个字';
                                        $.getElementsByClassName($.getParent({
                                            el: target,
                                            className: 'dynamic-item'
                                        }), 'comment-count')[0].innerHTML = parseInt(html, 10) + 1;
                                    },
                                    onerror: function (code, data) {
                                        alertTip({
                                            title: data.message,
                                            hide: true,
                                            type: 'error'
                                        });
                                    }
                                });
                            }

                            function cancelPublish() {
                                el.style.display = 'none';
                                $.removeClass(el, 'show');
                                el.setAttribute('page', 1);
                            }
                            //加载更多评论
                            function loadMoreComment() {
                                jingoal.ajax('/ecircle/ecircle/v1/get_comments', {
                                    method: 'post',
                                    data: {
                                        curr: 0,
                                        dynamic_id: dynamicId,
                                        max_id: 0,
                                        max_page: "",
                                        min_id: el.getAttribute('minid'),
                                        min_page: el.getAttribute('minpage'),
                                        to_page: el.getAttribute('page')
                                    },
                                    onsuccess: function (data) {
                                        var companyId = $.getParent({
                                            el: el,
                                            className: 'dynamic-item'
                                        }).getAttribute('companyid');
                                        if (!data.obj_list.length) {
                                            otherComment.style.display = 'none';
                                            return;
                                        }
                                        var temp2 = '<!-- for:${comments} as ${comment} --><!--import:comment-item--> <!-- /for -->';
                                        var moreCommentRender = etpl.compile(temp2);
                                        var moreComment = {
                                            comments: data.obj_list
                                        };
                                        var str2 = moreCommentRender(moreComment);
                                        var fr = $.htmlToEl(str2);
                                        commentList.insertBefore(fr, commentList.firstChild);
                                        commentList.scrollTop = 0;
                                        el.setAttribute('page', parseInt(el.getAttribute('page'), 10) + 1);
                                        el.setAttribute('minpage', data.page_info.min_page);
                                        el.setAttribute('minid', data.page_info.min_id);
                                        //默认到10页，el.getAttribute('page'), 10) === 11，现在先1页测试
                                        if (parseInt(el.getAttribute('page'), 10) === 11 && location.href.indexOf('dynamic_detail') === -1) {
                                            otherComment.href = '#dynamic_detail~companyId=' + companyId + '~dynamicId=' + dynamicId;
                                            otherComment.innerHTML = '查看更多评论';
                                        }
                                        if (data.page_info.next_page_count == 0) {
                                            otherComment.style.display = 'none';
                                            return;
                                        }
                                    }
                                });
                            }

                            function deleteTheComment(e) {
                                var event = e || window.event,
                                    target = event.target || event.srcElement,
                                    commentId;
                                if ($.hasClass(target, 'delete-comment')) {
                                    commentId = $.getParent({
                                        el: target,
                                        className: 'comment-item'
                                    }).getAttribute('commentid');
                                    if (remoteDynamicDialog.isShow()) {
                                        return;
                                    }
                                    remoteDynamicDialog.setTitle("删除评论");
                                    ecui.esr.setData('removeDynamicWarn', '您确定删除此条评论吗?');
                                    remoteDynamicDialog.showModal();
                                    ecui.$('yesBtn').onclick = function () {
                                        jingoal.ajax('/ecircle/ecircle/v1/delete_comment', {
                                            method: 'post',
                                            data: {
                                                'comment_id': commentId
                                            },
                                            onsuccess: function () {
                                                remoteDynamicDialog.hide();
                                                alertTip({
                                                    title: '删除评论成功'
                                                });
                                                /*console.log($.getParent({
                                                    el: target,
                                                    className: 'dynamic-item'
                                                }));*/
                                                $.getElementsByClassName($.getParent({
                                                    el: target,
                                                    className: 'dynamic-item'
                                                }), 'comment-count')[0].innerHTML -= 1;
                                                dom.remove($.getParent({
                                                    el: target,
                                                    className: 'comment-item'
                                                }));
                                            },
                                            onerror: function (code, meta){
                                            	remoteDynamicDialog.hide();
                                            	alertTip({
                                                    title: meta.message
                                                });
                                            }
                                        });
                                    };
                                }
                            }
                            dom.addEventListener(commentList, 'click', deleteTheComment);
                            dom.addEventListener(publishBtn, 'click', publishComment);
                            if (otherComment) {
                                dom.addEventListener(otherComment, 'click', loadMoreComment);
                            }
                            dom.addEventListener(textarea, 'keydown', commentInputHandler);
                            dom.addEventListener(textarea, 'paste', commentInputHandler);
                            dom.addEventListener(textarea, 'input', commentInputHandler);
                            dom.addEventListener(textarea, 'focus', function () {
                                $.addClass(textarea, 'comment-textarea-focus');
                            });
                            dom.addEventListener(textarea, 'blur', function () {
                                if (!textarea.value.trim().length) {
                                    $.removeClass(textarea, 'comment-textarea-focus');
                                }
                            });
                        },
                        onerror: function (code, meta){
                        	alertTip({
                                title: meta.message
                            });
                        }
                    });
                }
                jingoal.ecircle.getComment = getComment;
                //加载更多动态
                function loadMoreDynamic(lastId, buildNo, number, page, url) {
                    var loadMoreDiv = dom.create('load-more', 'div'),
                        list = ecui.$('dynamic-list'),
                        location = ecui.esr.getLocation(),
                        url,
                        isCompany,
                        companyid,
                        isCompanyDetail;
                    if (location.indexOf('dynamic') != -1) {
                        if ($.isRegulate == "all") {
                            url = '/ecircle/ecircle/v1/get_all_dynamics';
                        } else if($.isRegulate == "disable"){
                            url = '/ecircle/ecircle/v1/get_disable_dynamics';
                        }else {
                            url = '/ecircle/ecircle/v1/get_person_dynamics';
                        }  
                    } else if (location.indexOf('company') > -1) {
                        url = '/ecircle/ecircle/v1/get_circle_dynamics';
                        isCompany = true;
                        companyid = 'my';
                        isCompanyDetail = true;
                        try {
                            companyid = location.split('~')[1].split('=')[1];
                        } catch (e) {}

                    }
                    loadMoreDiv.innerHTML = '<img src="css/img/loading_32@1x.gif"/><span>正在加载...<span>';
                    list.appendChild(loadMoreDiv);
                    jingoal.ecircle.isloadingOrLoadAll = true;
                    jingoal.ajax(url + '?isCompany=' + isCompany + '&otherCid=' + companyid + '&page=' + page + '&number=' + number + '&buildNo=' + buildNo + '&lastId=' + lastId, {
                        method: 'get',
                        onsuccess: function (data) {
                            var ctx = {
                                dynamicList: data,
                                count: number,
                                isRegulate: jingoal.ecircle.isRegulate,
                                isCompanyDetail: isCompanyDetail
                            };
                            var html = etpl.render('dynamic-list', ctx);
                            var fr = $.htmlToEl(html);
                            list.appendChild(fr);
                            dom.remove(loadMoreDiv);
                            list.setAttribute('last_id', data.page_info.last_id || 0);
                            list.setAttribute('build_no', data.page_info.build_no);
                            list.setAttribute('number', data.page_info.number);
                            list.setAttribute('page', data.page_info.page);
                            if (data.dynamics.length < number) {
                                jingoal.ecircle.isloadingOrLoadAll = true;
                            } else {
                                jingoal.ecircle.isloadingOrLoadAll = false;
                            }
                        },
                        onerror: function () {
                            alertTip({
                                title: '程序出错'
                            });
                        }
                    });
                }
                jingoal.ecircle.loadMoreDynamic = loadMoreDynamic;
                //加载大图
                function loadBigImg(target) {
                    var template, render, html;
                    template = '<div class="big-header layout_float_wrap"> <div class="layout_float_left up"><span class="mid_icon mid_icon1"></span><span class="mid_text">收起</span></div><div class="layout_float_left origin"><span class="mid_icon mid_icon2"></span><span class="mid_text">查看原图</span></div> </div> <div class="big-content"> <div class="left"></div> <div class="middle"></div> <div class="right"></div> <div class="loading"></div> <div class="img"> <img class="big-img" src="${current}"  /> </div> </div> <!-- if:${imglist.length}>1 --> <div class="big-smallitems"> <div class="left-hander hander" unselectable="on" onselectstart="function(){return false;}"> <div class="mid_helper"></div> <i class="mid_icon"></i> </div> <ul class="item-list"><!-- for: ${imglist} as ${item},${index} --><li class="item inline_block <!-- if: ${index}==${currentIndex} -->current<!-- elif:${index}==${imglist.length}-1 -->last<!-- /if -->" index="${index}"> <div class="mask"></div> <img class="small-img" src="${item.small}" /> </li><!-- /for --></ul> <div class="right-hander hander" unselectable="on" onselectstart="function(){return false;}"> <div class="mid_helper"></div> <i class="mid_icon"></i> </div> </div> <!-- /if -->';
                    render = etpl.compile(template);
                    var imgWrap = $.getParent({
                        el: target,
                        className: 'img-wrap'
                    });
                    if (imgWrap) {
                        var img = new Image();
                        img.onload = function () {
                            var imglist = [];
                            var imgNodeList = target.parentNode.parentNode.getElementsByTagName("img"),
                                currentIndex,
                                i;
                            for (i = 0, len = imgNodeList.length; i < len; i++) {
                                var img = imgNodeList[i];
                                imglist.push({
                                    small: img.src,
                                    big: img.getAttribute("big"),
                                    origin: img.getAttribute("origin")
                                });
                                if (img === target) {
                                    currentIndex = i;
                                }
                            }
                            createBigScan(target, imglist, currentIndex);
                        }
                        img.src = target.getAttribute("big");
                    }

                    function createBigScan(target, imglist, currentIndex) {
                        var imgContent = target.parentNode.parentNode;
                        var html = render({
                                imglist: imglist,
                                current: imglist[currentIndex].big,
                                currentIndex: currentIndex
                            }),
                            bigScan = dom.create('big-image-content', 'div');
                        bigScan.innerHTML = html;
                        imgContent.style.display = "none";
                        imgContent.parentNode.insertBefore(bigScan, imgContent);
                        var timer, currentLoadObj, oldIndex = currentIndex;

                        function getBigSrc(index, callback, loading, error) {
                            if (typeof index == "undefined") {
                                for (var i = 0, len = imglist.length; i < len; i++) {
                                    if (!imglist[i].load) {
                                        index = i;
                                        break;
                                    }
                                }
                            }
                            if (typeof index == "undefined" || typeof imglist[index] == "undefined") {
                                return;
                            }
                            if (!imglist[index].load) {
                                clearTimeout(timer);
                                currentLoadObj = null;
                                loading && loading(imglist[index]);
                                currentLoadObj = new Image();
                                currentLoadObj.onload = function () {
                                    imglist[index].load = true;
                                    callback && callback(imglist[index].big);
                                    timer = setTimeout(getBigSrc, 300)
                                }
                                currentLoadObj.src = imglist[index].big;
                            } else {
                                callback && callback(imglist[index].big);
                            }

                        }
                        var loadingElem = $.getElementsByClassName(bigScan, "loading")[0],
                            leftElem = $.getElementsByClassName(bigScan, "left")[0],
                            labelLeftElem = $.getElementsByClassName(bigScan, "left-hander")[0],
                            rightElem = $.getElementsByClassName(bigScan, "right")[0],
                            rightLabelElem = $.getElementsByClassName(bigScan, "right-hander")[0],
                            bigImgElem = $.getElementsByClassName(bigScan, "big-img")[0],
                            itemList = $.getElementsByClassName(bigScan, "item-list")[0],
                            labelItems;
                        if (itemList) {
                            labelItems = dom.children(itemList);
                        }

                        function goIndex(index) {
                            if (index == imglist.length - 1) {
                                $.addClass(rightElem, "disable");
                                $.addClass(rightLabelElem, "disable");
                            } else {
                                $.removeClass(rightElem, "disable");
                                $.removeClass(rightLabelElem, "disable");
                            }
                            if (index === 0) {
                                $.addClass(leftElem, "disable");
                                $.addClass(labelLeftElem, "disable");
                            } else {
                                $.removeClass(leftElem, "disable");
                                $.removeClass(labelLeftElem, "disable");
                            }
                            if (imglist.length === 1) {
                                $.removeClass(rightElem, "disable");
                                dom.addClass(rightElem, "one-page-arrow");
                                $.removeClass(leftElem, "disable");
                                dom.addClass(leftElem, "one-page-arrow");
                            }
                            if (oldIndex == index || oldIndex === null) return;
                            if (labelItems) {
                                $.removeClass(labelItems[oldIndex], "current");
                                $.addClass(labelItems[index], "current");
                            }
                            getBigSrc(index, function (src) {
                                loadingElem.style.display = "none";
                                bigImgElem.src = src;
                                itemList.scrollLeft = labelItems[index].offsetLeft - (itemList.offsetWidth / 2 - 32);
                            }, function () {
                                loadingElem.style.display = "block";
                            });
                        }
                        goIndex(currentIndex);
                        dom.addEventListener(bigScan, 'click', function (event) {
                            event = event || window.event;
                            var target = event.target || event.srcElement;
                            if ($.getParent({
                                    el: target,
                                    className: "left-hander"
                                }) || $.getParent({
                                    el: target,
                                    className: "left"
                                })) {
                                if (target.className.indexOf("one-page-arrow") == -1) {
                                    oldIndex = currentIndex;
                                    currentIndex = Math.max(--currentIndex, 0);
                                    goIndex(currentIndex);
                                }
                            }
                            if ($.getParent({
                                    el: target,
                                    className: "right-hander"
                                }) || $.getParent({
                                    el: target,
                                    className: "right"
                                })) {
                                if (target.className.indexOf("one-page-arrow") == -1) {
                                    oldIndex = currentIndex;
                                    currentIndex = Math.min(++currentIndex, imglist.length - 1);
                                    goIndex(currentIndex);
                                }
                            }
                            if ($.getParent({
                                    el: target,
                                    className: 'item'
                                })) {
                                oldIndex = currentIndex;
                                currentIndex = $.getParent({
                                    el: target,
                                    className: 'item'
                                }).getAttribute("index");
                                goIndex(currentIndex);
                            }
                            if ($.getParent({
                                    el: target,
                                    className: 'middle'
                                }) || $.getParent({
                                    el: target,
                                    className: 'up'
                                }) || target.className.indexOf("one-page-arrow") != -1) {
                                bigScan.parentNode.removeChild(bigScan);
                                imgContent.style.display = "block";
                            }
                            if ($.getParent({
                                    el: target,
                                    className: 'origin'
                                })) {
                                var newWindow = window.open("about:blank");
                                newWindow.document.write("<img src='" + imglist[currentIndex].origin + "' />");
                            }
                        });
                    }
                }
                //滚动加载
                window.onscroll = function () {
                    var top = Math.max(document.body.scrollTop, document.documentElement.scrollTop),
                        winHeight = window.innerHeight || document.documentElement.clientHeight,
                        pageHeight = document.documentElement.scrollHeight;
                    newScrollY = top;
                    if (top + winHeight > document.documentElement.scrollHeight - 150 && newScrollY - jingoal.ecircle.scrollY >= 0 && !jingoal.ecircle.isloadingOrLoadAll) {
                        // console.log("top=" + top + "winHeight=" + winHeight + "scrollHeight=" + document.documentElement.scrollHeight);
                        isLoading = true;
                        var dynamicList = ecui.$('dynamic-list');
                        if (dynamicList) {
                            var lastId = dynamicList.getAttribute('last_id'),
                                number = dynamicList.getAttribute('number'),
                                buildNo = dynamicList.getAttribute('build_no'),
                                page = dynamicList.getAttribute('page');
                            jingoal.ecircle.loadMoreDynamic(lastId, buildNo, number, page);
                        }
                        if (jingoal.ecircle.loadMoreDirectories) {
                            jingoal.ecircle.loadMoreDirectories();
                        }
                        if (jingoal.ecircle.loadMoreComments) {
                            jingoal.ecircle.loadMoreComments();
                        }
                        jingoal.ecircle.scrollY = newScrollY;
                    }
                }
                dom.addEventListener(document.body, 'click', function (e) {
                    var event = e || window.event,
                        target = event.target || event.srcElement;
                    if (!$.hasClass(target, 'icon-list-select')) {
                        for (var i = 0, len = tipArr.length; i < len; i++) {
                            tipArr[i].style.display = 'none';
                            $.removeClass(tipArr[i], 'show');
                        }
                    }
                    if (!$.getParent({
                            el: target,
                            className: 'log-out-wrapper'
                        })) {
                        var logOut = $.getElementsByClassName(ecui.$('header'), 'log-out-wrapper')[0];
                        if ($.hasClass(logOut, 'show')) {
                            logOut.style.display = 'none';
                            dom.removeClass(logOut, 'show');
                        } else {
                            if ($.hasClass(dom.getParent(target), 'log-out')) {
                                logOut.style.display = 'block';
                                $.addClass(logOut, 'show');
                            }
                        }
                        /*if ($.hasClass(logOut, 'show') && !$.hasClass(dom.getParent(target),'log-out')) {
                            logOut.style.display = 'none';
                            dom.removeClass(logOut, 'show');
                        } else {
                            if ($.hasClass(dom.getParent(target),'log-out')) {
                                logOut.style.display = 'block';
                                $.addClass(logOut, 'show');
                            }
                        }*/
                    }
                    //点击显示评论
                    if ($.getParent({
                            el: target,
                            className: 'comment-oper'
                        })) {
                        var parent = $.getParent({
                            el: target,
                            className: 'comment-oper-list'
                        });
                        var dynamicId = $.getParent({
                            el: target,
                            className: 'dynamic-item'
                        }).getAttribute('dynamicId');
                        if (!$.hasClass(dom.next(parent), 'show')) {
                            getComment(dynamicId, dom.next(parent));
                        } else {
                            return;
                        }
                    }
                    //删除操作
                    if ($.hasClass(target, 'icon-list-select')) {
                        var deleteOper = dom.next($.getParent({
                            el: target,
                            className: 'icon-list-select'
                        }));
                        var t = tipArr.pop();
                        // if (t && $.hasClass(t, 'show')) {
                        //     t.style.display = 'none';
                        //     $.removeClass(t, 'show');
                        // }

                        if (activeDelete && activeDelete !== deleteOper) {
                            activeDelete.style.display = 'none';
                            $.removeClass(deleteOper, 'show');
                        }
                        if ($.hasClass(deleteOper, 'show')) {
                            $.removeClass(deleteOper, 'show');
                            deleteOper.style.display = 'none';
                            activeDelete = null;
                        } else {
                            $.addClass(deleteOper, 'show');
                            deleteOper.style.display = 'block';
                            activeDelete = deleteOper;
                            if (tipArr.indexOf(deleteOper) === -1) {
                                tipArr.push(deleteOper);
                            }

                        }
                    }
                    if ($.hasClass(target, 'delete-dynamic')) {
                        var el = $.getParent({
                            el: target,
                            className: 'dynamic-item'
                        });
                        var id = el.getAttribute('dynamicid');
                        if (remoteDynamicDialog.isShow()) {
                            return;
                        }
                        remoteDynamicDialog.setTitle("删除动态");
                        ecui.esr.setData('removeDynamicWarn', '信息中包含的内容及其评论都将被彻底删除。确定删除这条动态信息吗?');
                        remoteDynamicDialog.showModal();
                        ecui.$('yesBtn').onclick = function () {
                            jingoal.ajax('/ecircle/ecircle/v1/delete_dynamic_id', {
                                method: 'post',
                                data: {
                                    'dynamic_id': id
                                },
                                onsuccess: function (data) {
                                    remoteDynamicDialog.hide();
                                    dom.remove(el);
                                    alertTip({
                                        title: '删除动态成功'
                                    });

                                    //企业详情页，删除初始化的三条动态后，自动加载动态
                                    var location = ecui.esr.getLocation();
                                    if (location.indexOf('company') > -1) {
                                        var loadmorediv = ecui.$('load_more'),
                                            dynamicListDiv = ecui.$('dynamic-list');

                                        if (loadmorediv.style.display == 'block' && ecui.dom.children(dynamicListDiv).length == 0) {
                                            var ecircle = jingoal.ecircle;
                                            ecircle.isloadingOrLoadAll = false;
                                            loadMoreDynamic(0, 0, 3, 0);
                                            loadmorediv.style.display = 'none';
                                        }
                                    }
                                    //删除动态后加载新动态
                                    if (location.indexOf('dynamic') > -1) {
                                        var top = Math.max(document.body.scrollTop, document.documentElement.scrollTop),
                                            winHeight = window.innerHeight || document.documentElement.clientHeight,
                                            pageHeight = document.documentElement.scrollHeight;
                                        newScrollY = top;
                                        if (top + winHeight > document.documentElement.scrollHeight - 150 && !jingoal.ecircle.isloadingOrLoadAll || winHeight >= document.documentElement.scrollHeight) {
                                            var dynamicList = ecui.$('dynamic-list');
                                            if (dynamicList) {
                                                var lastId = dynamicList.getAttribute('last_id'),
                                                    number = 10,
                                                    buildNo = dynamicList.getAttribute('build_no'),
                                                    page = dynamicList.getAttribute('page');
                                                jingoal.ecircle.loadMoreDynamic(lastId, buildNo, number, page);
                                            }
                                            jingoal.ecircle.scrollY = newScrollY;
                                        }
                                    }
                                },
                                onerror: function (code, meta){
                                	remoteDynamicDialog.hide();
                                	alertTip({
                                        title: meta.message
                                    });
                                }
                            });
                        };
                    }
                    if ($.hasClass(target, 'disable-dynamic')) {
                        var el = $.getParent({
                            el: target,
                            className: 'dynamic-item'
                        });
                        var id = el.getAttribute('dynamicid');
                        if (remoteDynamicDialog.isShow()) {
                            return;
                        }
                        remoteDynamicDialog.setTitle("屏蔽动态");
                        var text = $.getElementsByClassName(remoteDynamicDialog.getBody(), 'mid_text')[0];
                        text.innerHTML = '信息中包含的内容及其评论都将被彻底删除。确定屏蔽这条动态信息吗?';
                        remoteDynamicDialog.showModal();
                        ecui.$('yesBtn').onclick = function () {
                            jingoal.ajax('/ecircle/ecircle/v1/disable_dynamic_id', {
                                method: 'post',
                                data: {
                                    'dynamic_id': id
                                },
                                onsuccess: function (data) {
                                    remoteDynamicDialog.hide();
                                    dom.remove(el);
                                    alertTip({
                                        title: '屏蔽动态成功'
                                    });
                                },
                                onerror: function (code, meta){
                                	remoteDynamicDialog.hide();
                                	alertTip({
                                        title: meta.message
                                    });
                                }
                            });
                        };
                    }
                    if ($.hasClass(target, 'active_dynamic')) {
                        var el = $.getParent({
                            el: target,
                            className: 'dynamic-item'
                        });
                        var id = el.getAttribute('dynamicid');
                        if (remoteDynamicDialog.isShow()) {
                            return;
                        }
                        remoteDynamicDialog.setTitle("恢复动态");
                        var text = $.getElementsByClassName(remoteDynamicDialog.getBody(), 'mid_text')[0];
                        text.innerHTML = '该条动态信息将被恢复显示，关注者都可看到。确定恢复显示吗?';
                        remoteDynamicDialog.showModal();
                        ecui.$('yesBtn').onclick = function () {
                            jingoal.ajax('/ecircle/ecircle/v1/active_dynamic_id', {
                                method: 'post',
                                data: {
                                    'dynamic_id': id
                                },
                                onsuccess: function (data) {
                                    remoteDynamicDialog.hide();
                                    dom.remove(el);
                                    alertTip({
                                        title: '恢复成功'
                                    });
                                }
                            });
                        };
                    }
                    //加载大图
                    if (target.tagName.toLowerCase() === 'img' && $.getParent({
                            el: target,
                            className: 'img-wrap'
                        })) {
                        loadBigImg(target);
                    }
                    // 分享，点击分享小图标的处理
                    if(target.getAttribute('data-cmd')) {
                        var cmd = target.getAttribute('data-cmd');
                        if(cmd !== '') {
                            var index = getShareBtIndex(cmd);
                            ecui.$('sharebuttonbox').getElementsByTagName('a')[index].click();
                        }
                    }
                    //点击赞
                    var praise_oper = $.getParent({
                        el: target,
                        className: 'praise-oper'
                    });
                    if (praise_oper) {
                        var dynamicId = $.getParent({
                            el: target,
                            className: 'dynamic-item'
                        }).getAttribute('dynamicId');
                        var mid_text = $.getElementsByClassName(praise_oper, "mid_text")[0];
                        var mid_count = $.getElementsByClassName(praise_oper, "mid_count")[0];
                        var icon = praise_oper.getElementsByTagName('i')[0];
                        if ($.hasClass(praise_oper, "praise-already")) {
                            var start = parseInt(mid_count.innerHTML);
                            jingoal.ajax('/ecircle/ecircle/v1/remove_praise', {
                                method: 'POST',
                                data: {
                                    "dynamic_id": dynamicId
                                },
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                onsuccess: function (data) {
                                    mid_text.innerHTML = "赞";
                                    mid_count.innerHTML = (start - 1) + "";
                                    $.removeClass(icon, 'icon-up-active');
                                    $.removeClass(mid_text.parentNode, 'praise-already');
                                },
                                onerror: function (code, meta){
                                	alertTip({
                                        title: meta.message
                                    });
                                }
                            });
                        } else {
                            var start = parseInt(mid_count.innerHTML, 10);
                            jingoal.ajax('/ecircle/ecircle/v1/add_praise', {
                                method: 'POST',
                                data: {
                                    "dynamic_id": dynamicId
                                },
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                onsuccess: function (data) {
                                    mid_text.innerHTML = "已赞";
                                    mid_count.innerHTML = (start + 1) + "";
                                    $.addClass(icon, 'icon-up-active');
                                    $.addClass(mid_text.parentNode, 'praise-already');
                                    var span = $.getElementsByClassName(praise_oper, "none")[0];
                                    if (span) {
                                        span.className = 'none animate';
                                        setTimeout(function () {
                                            span.className = 'none';
                                        }, 500)
                                    }
                                },
                                onerror: function (code, meta){
                                	alertTip({
                                        title: meta.message
                                    });
                                }
                            });
                        }
                    }
                    //重新登录
                    if ($.getParent({
                            el: target,
                            className: 'resubmit'
                        })) {
                        reload();
                    }
                });
                $.on(document.body, 'read-expansion', 'click', function (target) {
                    if ($.hasClass(target, 'read-more')) {
                        target.parentNode.less = target.parentNode.innerHTML;
                        target.parentNode.innerHTML = target.parentNode.getAttribute("more").replace(/&/g, '&amp').replace(/\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, "<br/>");
                    }
                });

            }
        };
    };
}());

ecui.esr.addRoute('dynamic', {
    model: [
        'companyInfo@/ecircle/ecircle/v1/view_directory',
        'dynamicList@${url}?lastId=0&page=0&number=11&buildNo=0',
        'canPublish@/ecircle/ecircle/v1/get_publish_power'
    ],
    main: 'left-section',
    view: 'dynamic',
    onbeforerequest: function (context) {
      if (jingoal.ecircle.isRegulate) {
        if(context.type == "disable"){
           context.url = '/ecircle/ecircle/v1/get_disable_dynamics';
           jingoal.ecircle.isRegulate = context.type;
        }else{
           context.url = '/ecircle/ecircle/v1/get_all_dynamics';
           jingoal.ecircle.isRegulate = "all";
        }
      }else{
         context.url = '/ecircle/ecircle/v1/get_person_dynamics';
      }
    },
    onbeforerender: function (context) {
        jingoal.ecircle.isloadingOrLoadAll = false;
        if (context.companyInfo && context.dynamicList) {
            ecui.$("loading").style.display = 'none';
            ecui.$("content").style.display = 'block';
            context.count = 10;
            context.isRegulate = jingoal.ecircle.isRegulate;
            if (context.dynamicList.dynamics.length > 10) {
                context.dynamicList.dynamics.pop();
                context.lastId = context.dynamicList.dynamics[context.dynamicList.dynamics.length - 1].dynamic_id;
            } else {
                context.firstAll = true;
                if (context.dynamicList.dynamics.length === 0) {
                    context.noDynamic = true;
                }
                jingoal.ecircle.isloadingOrLoadAll = true;
            }
        } else {
            ecui.$("loading").style.display = 'none';
            ecui.$("content").style.display = 'none';
            alertTip({
                title: '程序出错',
                type: 'error'
            });
        }
    },
    onafterrender: function (context) {
        var $ = jingoal.ecircle,
            dynamicList = ecui.$('dynamic-list'),
            form = ecui.$('send-dynamic-input'),
            noAccess = ecui.$('no-access'),
            noAccessCloseBtn = noAccess.getElementsByTagName('i')[0],
            dynamicText = $.getElementsByClassName(form, 'dynamic-text')[0],
            sendBtn = $.getElementsByClassName(form, 'send-dynamic-btn')[0],
            textCount = $.getElementsByClassName(form, 'text-count')[0],
            imgCount = $.getElementsByClassName(form, 'img-count')[0],
            dom = ecui.dom,
            placeholder = $.getElementsByClassName(dom.getParent(dynamicText), 'placeholder')[0];

        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        if (window.scrollTo) {
            window.scrollTo(0, 0);
        }
        jingoal.ecircle.scrollY = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
        dynamicList.setAttribute('last_id', context.lastId);
        dynamicList.setAttribute('page', context.dynamicList.page_info.page);
        dynamicList.setAttribute('build_no', context.dynamicList.page_info.build_no);
        dynamicList.setAttribute('number', 10);
        //动态输入框逻辑处理
        function dynamicInputHandler() {
            setTimeout(function () {
                var text = dynamicText.value.trim();
                var len = text.length;
                textCount = $.getElementsByClassName(form, 'text-count')[0];
                if (dynamicText.getAttribute("start") === "true") {
                    placeholder.style.display = 'none';
                    return;
                }
                if (dynamicText.value.length > 0) {
                    placeholder.style.display = 'none';
                } else {
                    placeholder.style.display = 'block';
                }
                if (500 - len >= 0) {
                    dom.getParent(dom.getParent(textCount)).className = 'text-gray';
                    dom.getParent(textCount).innerHTML = '还可以输入<span class="text-count">&nbsp;' + (500 - len) + '&nbsp;</span>个字，';
                    if (len > 0) {
                        $.removeClass(sendBtn, 'disabled');
                        sendBtn.disabled = false;
                    } else {
                        if (!$.hasClass(sendBtn, 'disabled')) {
                            $.addClass(sendBtn, 'disabled');
                            sendBtn.disabled = true;
                        }
                    }
                } else {
                    dom.getParent(dom.getParent(textCount)).className = 'text-warning';
                    dom.getParent(textCount).innerHTML = '超出了<span class="text-count">&nbsp;' + (len - 500) + '&nbsp;</span>个字，';
                    if (!$.hasClass(sendBtn, 'disabled')) {
                        $.addClass(sendBtn, 'disabled');
                        sendBtn.disabled = true;
                    }
                }
            }, 0);
        }
        dom.addEventListener(dynamicText, 'keydown', dynamicInputHandler);
        dom.addEventListener(dynamicText, 'paste', dynamicInputHandler);
        dom.addEventListener(dynamicText, 'input', dynamicInputHandler);
        dom.addEventListener(dynamicText, 'focus', function () {
            $.addClass(dynamicText, 'dynamic-text-focus');
        });
        dom.addEventListener(dynamicText, 'blur', function () {
            if (!dynamicText.value.trim().length) {
                $.removeClass(dynamicText, 'dynamic-text-focus');
            }
        });
        dom.addEventListener(dynamicText, 'compositionstart', function () {
            // console.log("中文输入法开启");
            dynamicText.setAttribute("start", "true");
        });
        dom.addEventListener(dynamicText, 'compositionend', function () {
            // console.log("中文输入法关闭");
            dynamicText.setAttribute("start", "false");
        });
        // 上传
        if (ecui.get('fileFinder')){
            var fileFinder = new jingoal.ui.FileFinder(ecui.get('fileFinder').getBody(), 'stored', []);
            jingoal.ui.FileUpload.setFinderArea(fileFinder); // 设置回显的区域
            jingoal.ui.FileUpload.bindFileEvent(ecui.get('fileUpload').getBody().getElementsByTagName('input')[0]);
        }
        //发布动态
        dom.addEventListener(sendBtn, 'click', function (e) {
            var reqData;
            e = e || window.event;
            //var target = e.target || e.srcElement;
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            reqData = {
                content: dynamicText.value,
                fsids: [],
                picnames: [],
                tokens: []
            };
            fileFinder.getFileResult().upload.forEach(function (file) {
                reqData.fsids.push(file.fsid);
                reqData.picnames.push(file.name);
                reqData.tokens.push(file.token);
            });
            if (dynamicText.value) {
                jingoal.ajax('/ecircle/ecircle/v1/add_dynamic', {
                    method: 'post',
                    data: reqData,
                    onsuccess: function (data) {
                        sendBtn.disabled = true;
                        $.addClass(sendBtn, 'disabled');
                        dynamicText.value = '';
                        dynamicText.focus();
                        placeholder.style.display = 'block';
                        $.getElementsByClassName(form, 'text-count')[0].innerHTML = '500';
                        imgCount.innerHTML = 9;
                        var ctx = {
                            item: data,
                            isRegulate: jingoal.ecircle.isRegulate
                        };
                        var html = etpl.render('new-dynamic', ctx);
                        var fr = $.htmlToEl(html);
                        $.removeClass(dom.first(dynamicList), 'first-item');
                        dynamicList.insertBefore(fr, dynamicList.firstChild);
                        $.addClass(dom.first(dynamicList), 'first-item');
                        if (ecui.$('no-dynamic')) {
                            ecui.$('no-dynamic').style.display = 'none';
                        }
                        alertTip({
                            title: "发表动态成功",
                            hide: true,
                            type: "success"
                        });
                    },
                    onerror: function (code, meta){
                    	alertTip({
                            title: meta.message
                        });
                    }
                });
            }
        });
        dom.addEventListener(noAccessCloseBtn, 'click', function () {
            noAccess.style.display = 'none';
        });
    }
});

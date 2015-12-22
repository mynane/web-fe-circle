(function () {
    var dom = ecui.dom;
    //添加企业好友的dialog逻辑处理
    jingoal.ecircle.friendDialogEvent = function (cid) {
        var friendDialog = ecui.get('friendDialog');
        var friendText = ecui.get('addFriendTextarea').getMain(),
            addFriendBtn = ecui.get('submitAddFriend');
        ecui.get('cancelAddFriend').onclick = function () {
            friendDialog.hide();
        };
        function  hideLogo() {
            ecui.$('float-logo').style.left = '-1000px';
            ecui.$('float-logo').style.top = '0';
        }
        function addFriend() {
        	friendDialog.hide();
            jingoal.ajax('/ecircle/ecircle/v1/add_relation_send', {
                method: 'POST',
                data: {
                    nid: cid,
                    content: friendText.value,
                    type: 1
                },
                onsuccess: function (data) {
                    var status = data.return_type;
                    var option = {
                        title: '添加企业好友',
                        showClose: true
                    };
                    if (status === 0) {
                        option.content = '您已申请该企业为好友，请等待管理员审核。';
                    } else if (status === -3) { //权限
                        option.content = '您没有权限进行此操作。';
                    } else if (status === -2) { //加自己
                        option.content = '不能添加本企业为好友';
                    } else if (status === 1) { //我方停用了
                        option.content = '您的企业已停用与对方企业的好友关系';
                    } else if (status === 8) { //对方发出
                        option.content = '对方已经向您的企业提交好友申请，不能重复申请。';
                    } else if (status === 7) { //已经是好友
                        option.content = '成功添加好友';
                        if (ecui.get('addFriend' + cid)) {
                            var el = ecui.get('addFriend' + cid).getMain();
                            dom.addClass(el, 'color_gray');
                            el.innerHTML = '已建立好友关系';
                        }
                        if (ecui.get('1addFriend' + cid)) {
                            var el1 = ecui.get('1addFriend' + cid).getMain();
                            el1.innerHTML = '已建立好友关系';
                            dom.addClass(el1, 'color_gray');
                        }
                    } else {
                        option.content = '操作失败';
                    }
                    jingoal.ecircle.confirm(option);
                    hideLogo();
                }
            });
        }

        function friendInputHandler() {
            setTimeout(function () {
                var text = friendText.value,
                    len = text.trim().length,
                    addFriendBtnDom = addFriendBtn.getMain(),
                    textCount = ecui.get('friendDialogTextNum').getMain();
                if (friendText.getAttribute("start") === "true") {
                    return;
                }
                if (60 - len >= 0) {
                    dom.removeClass(textCount, 'text-warning');
                    dom.addClass(textCount, 'text-gray');
                    ecui.esr.setData('friendDialogTextNum', '还可以输入<span class="count">&nbsp;' + (60 - len) + '&nbsp;</span>个字');
                    if (len > 0 && text !== '') {
                        dom.removeClass(addFriendBtnDom, 'disabled');
                        addFriendBtnDom.disabled = false;
                        addFriendBtn.onclick = addFriend;
                    } else {
                        if (!addFriendBtnDom.disabled) {
                            dom.addClass(addFriendBtnDom, 'disabled');
                            addFriendBtnDom.disabled = true;
                            addFriendBtn.onclick = null;
                        }
                    }
                } else {
                    dom.removeClass(textCount, 'text-gray');
                    dom.addClass(textCount, 'text-warning');
                    ecui.esr.setData('friendDialogTextNum', '超出了<span class="count">&nbsp;' + (len - 60) + '&nbsp;</span>个字');
                    if (!addFriendBtnDom.disabled) {
                        dom.addClass(addFriendBtnDom, 'disabled');
                        addFriendBtnDom.disabled = true;
                        addFriendBtn.onclick = null;
                    }
                }
            }, 0);
        }
        addFriendBtn.onclick = addFriend;
        dom.addEventListener(friendText, 'keydown', friendInputHandler);
        dom.addEventListener(friendText, 'paste', friendInputHandler);
        dom.addEventListener(friendText, 'input', friendInputHandler);
        dom.addEventListener(friendText, 'compositionstart', function () {
            friendText.setAttribute("start", "true");
        });
        dom.addEventListener(friendText, 'compositionend', function () {
            friendText.setAttribute("start", "false");
        });
    };
    //恢复企业好友
    jingoal.ecircle.addRelationRestart = function (cid) {
    	friendDialog.hide();
        jingoal.ajax('/ecircle/ecircle/v1/add_relation_restart', {
            method: 'POST',
            data: {
                nid: cid
            },
            onsuccess: function (data) {
                var return_type = data.return_type;
                var message = data.message,
                    notifMsg = '';
                if (return_type === 0) {
                    jingoal.ecircle.confirm({
                        content: '成功恢复好友关系',
                        showClose: true
                    });
                    ecui.get('addFriend' + cid).getMain().innerHTML = '已建立好友关系';
                } else if (return_type === -3) {
                    jingoal.ecircle.confirm({
                        content: '您没有权限进行此操作',
                        showClose: true
                    });
                } else if (return_type === 2 || return_type === 3 || return_type === 7) {
                    jingoal.ecircle.confirm({
                        content: '操作失效',
                        showClose: true
                    });
                } else if (return_type === 12) {
                    if (message === 'overMaxLimit_mNeighbourNum') {
                        notifMsg = '您的友好企业个数已达上限，无法添加。';
                    }
                    if (message === 'overMaxLimit_oNeighbourNum') {
                        notifMsg = '该企业的好友数量已达上限，无法添加。';
                    }
                    if (message === 'overMaxLimit_mOpenNum') {
                        notifMsg = '您的全部企业好友中，对方开放成员总数已达上限，无法添加。';
                    }
                    if (message === 'overMaxLimit_oOpenNum') {
                        notifMsg = '该企业开放成员总数已达上限，无法添加。';
                    }
                    jingoal.ecircle.confirm({
                        content: notifMsg,
                        showClose: true
                    });
                }
                hideLogo();
            }
        });
    };
    //申请企业好友
    jingoal.ecircle.addRelationSend = function (cid) {
    	friendDialog.hide();
        jingoal.ajax("/ecircle/ecircle/v1/add_relation_send", {
            method: 'POST',
            data: {
                nid: cid,
                content: "申请成为开放人员",
                type: 3
            },
            onsuccess: function (data) {
                var returnCode = data.return_type;
                if (returnCode === 0) {
                    jingoal.ecircle.confirm({
                        content: "您已成功申请加入开放成员，请等待管理员审核。",
                        showClose: true
                    });
                } else if (returnCode === -3) {
                    jingoal.ecircle.confirm({
                        content: "您没有权限进行此操作",
                        showClose: true
                    });
                } else {
                    jingoal.ecircle.confirm({
                        content: "操作失败",
                        showClose: true
                    });
                }
                hideLogo();
            }
        });
    };
    //加入开放成员
    jingoal.ecircle.addRelationOpenuser = function (cid) {
    	friendDialog.hide();
        jingoal.ajax("/ecircle/ecircle/v1/add_relation_openuser", {
            method: 'POST',
            data: {
                nid: cid
            },
            onsuccess: function (data) {
                var returnCode = data.return_type;
                var returnMsg = data.message,
                    notifMsg = '';
                if (returnCode === 0) {
                    jingoal.ecircle.confirm({
                        content: "成功添加好友",
                        showClose: true
                    });
                    ecui.get('addFriend' + cid).getMain().innerHTML = "已建立好友关系";
                } else if (returnCode === -3) {
                    jingoal.ecircle.confirm({
                        content: "您没有权限进行此操作",
                        showClose: true
                    });
                } else if (returnCode === 12) {
                    notifMsg = "您的友好企业个数已达上限，无法添加。";
                    if (returnMsg === "overMaxLimit_mNeighbourNum") {
                        notifMsg = "您的友好企业个数已达上限，无法添加。";
                    }
                    if (returnMsg === "overMaxLimit_oNeighbourNum") {
                        notifMsg = "该企业的好友数量已达上限，无法添加。";
                    }
                    if (returnMsg === "overMaxLimit_mOpenNum") {
                        notifMsg = "您的全部企业好友中，对方开放成员总数已达上限，无法添加。";
                    }
                    if (returnMsg === "overMaxLimit_oOpenNum") {
                        notifMsg = "该企业开放成员总数已达上限，无法添加。";
                    }
                    jingoal.ecircle.confirm({
                        content: notifMsg,
                        showClose: true
                    });
                } else {
                    jingoal.ecircle.confirm({
                        content: "操作失败",
                        showClose: true
                    });
                }
                hideLogo();
            }
        });
    };
    //添加关注、取消关注、添加企业好友操作
    ecui.ui.DirectoryOperate = ecui.inherits(
        ecui.ui.Control,
        'ui-directory-operate',
        function (el, options) {
            this._oper = options.oper;
            this._id = +options.company_id;
            ecui.ui.Control.constructor.call(this, el, options);
        }, {
            onclick: function () {
                var that = this;
                var el, el1;
                //添加关注
                if (that._oper === 'attention') {
                    if (ecui.get('attention' + that._id)) {
                        el = ecui.get('attention' + that._id).getMain();
                    }
                    if (ecui.get('1attention' + that._id)) {
                        el1 = ecui.get('1attention' + that._id).getMain();
                    }
                    if ((el && el.className.indexOf('bg_gray') < 0) || (el1 && el1.className.indexOf('bg_gray') < 0)) {
                        jingoal.ajax('/ecircle/ecircle/v1/add_attention', {
                            method: 'post',
                            data: {
                                other_cid: that._id
                            },
                            onsuccess: function () {
                                if (el1) {
                                    el1.innerHTML = '取消关注';
                                    ecui.dom.addClass(el1, 'bg_gray color_gray');
                                    ecui.dom.removeClass(el1, 'bg_blue color_white');
                                    //jingoal.ecircle.companyInfo[that._id].attention = true;
                                    ecui.$('float-logo').style.left = '-1000px';
                                    ecui.$('float-logo').style.top = '0';
                                }
                                el.innerHTML = '取消关注';
                                ecui.dom.addClass(el, 'bg_gray color_black');
                                //jingoal.ecircle.companyInfo[that._id].attention = true;
                                ecui.$('float-logo').style.left = '-1000px';
                                ecui.$('float-logo').style.top = '0';
                                alertTip({
                                    title: '添加关注成功',
                                    hide: true,
                                    type: 'success'
                                });
                            }
                        });
                    } else { //取消关注
                        var remoteDynamicDialog = ecui.get('remoteDynamicDialog');
                        remoteDynamicDialog.setTitle("取消关注");
                        ecui.esr.setData('removeDynamicWarn', '取消关注后,您将不会收到该企业发布的动态信息,确定取消对该企业的关注吗?');
                        remoteDynamicDialog.showModal();
                        ecui.$('noBtn').onclick = function () {
                            remoteDynamicDialog.hide();
                        };
                        ecui.$('yesBtn').onclick = function () {
                            jingoal.ajax('/ecircle/ecircle/v1/remove_attention', {
                                method: 'post',
                                data: {
                                    other_cid: that._id
                                },
                                onsuccess: function () {
                                    remoteDynamicDialog.hide();
                                    if (ecui.esr.getData('type') === 'attention') {
                                        var page = ecui.esr.getData('currentPage'),
                                            total = ecui.esr.getData('total'),
                                            attentionPage = ecui.$('attentionPage'),
                                            item,
                                            children,
                                            pageControl,
                                            count = ecui.esr.getData('count'),
                                            createPage,
                                            changePage,
                                            changeView;
                                        item = jingoal.ecircle.getParent({
                                            el: el,
                                            className: 'company_item'
                                        });
                                        children = ecui.dom.children(ecui.dom.getParent(item));

                                        changePage = function changePage(page) {
                                            jingoal.ajax('/ecircle/ecircle/v1/get_attentions?page=' + page + '&number=' + count, {
                                                method: 'get',
                                                onsuccess: function (data) {
                                                    ecui.esr.setData('dynamics', data.companys);
                                                }
                                            });
                                        }

                                        createPage = function createPage(cur) {
                                            var div = ecui.dom.create('', 'div');
                                            div.setAttribute('ui', 'type:pagination;id:attentionPage;max:8;curr:' + cur + ';size:' + count + ';items:' + total + ';jump:false');
                                            div.className = 'page-list-wrap';
                                            attentionPage.appendChild(div);
                                            ecui.init(div);
                                            pageControl = ecui.get('attentionPage');
                                            pageControl.onpagination = function (page) {
                                                changePage(page);
                                            };
                                        }

                                        changeView = function changeView(isLast) {
                                            total = total - 1;
                                            ecui.esr.setData('total', total);
                                            if (total === 0) {
                                                if (ecui.get('attentionPage')) {
                                                    var ctrl = ecui.get('attentionPage');
                                                    ctrl.dispose();
                                                    ecui.dom.remove(ecui.dom.first(attentionPage));
                                                    ecui.dom.remove(item);
                                                    ecui.get('noAttention').show();
                                                    return;
                                                }
                                            }
                                            if (isLast) {
                                                jingoal.ajax('/ecircle/ecircle/v1/get_attentions?page=' + (page - 1) + '&number=' + count, {
                                                    method: 'get',
                                                    onsuccess: function (data) {
                                                        page = page - 1;
                                                        var cur = page;
                                                        ecui.esr.setData('currentPage', page);
                                                        ecui.esr.setData('dynamics', data.companys);
                                                        if (ecui.get('attentionPage')) {
                                                            var ctrl = ecui.get('attentionPage');
                                                            ctrl.dispose();
                                                            ecui.dom.remove(ecui.dom.first(attentionPage));
                                                            createPage(cur);
                                                        }
                                                    },
                                                    onerror: function () {
                                                        alertTip({
                                                            type: 'error',
                                                            title: '加载关注企业失败',
                                                            hide: true
                                                        });
                                                    }
                                                });
                                            } else {
                                                jingoal.ajax('/ecircle/ecircle/v1/get_attentions?page=' + page + '&number=' + count, {
                                                    method: 'get',
                                                    onsuccess: function (data) {
                                                        var cur = page;
                                                        ecui.esr.setData('currentPage', page);
                                                        ecui.esr.setData('dynamics', data.companys);
                                                        if (ecui.get('attentionPage')) {
                                                            var ctrl = ecui.get('attentionPage');
                                                            ctrl.dispose();
                                                            ecui.dom.remove(ecui.dom.first(attentionPage));
                                                            createPage(cur);
                                                        }
                                                    },
                                                    onerror: function () {
                                                        alertTip({
                                                            type: 'error',
                                                            title: '加载关注企业失败',
                                                            hide: true
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                        if (children.length > 1 && Math.ceil(total / count) === page) {
                                            total = total - 1;
                                            ecui.esr.setData('total', total);
                                            var paginationCount = ecui.$("paginationCount");
                                            if(paginationCount){
                                            	paginationCount.innerText = total;
                                            }
                                            ecui.dom.remove(item);
                                        } else {
                                            if (page === Math.ceil(total / count)) {
                                                changeView(true);
                                            } else {
                                                changeView();
                                            }
                                        }
                                    } else {
                                        if (el1) {
                                            el1.innerHTML = '关注';
                                            ecui.dom.addClass(el1, 'bg_blue color_white');
                                            ecui.dom.removeClass(el1, 'bg_gray color_gray');
                                            //jingoal.ecircle.companyInfo[that._id].attention = false;
                                            ecui.$('float-logo').style.left = '-1000px';
                                            ecui.$('float-logo').style.top = '0';
                                        }
                                        el.innerHTML = '关注';
                                        ecui.dom.removeClass(el, 'bg_gray color_black');
                                        //jingoal.ecircle.companyInfo[that._id].attention = false;
                                        ecui.$('float-logo').style.left = '-1000px';
                                        ecui.$('float-logo').style.top = '0';
                                        alertTip({
                                            title: '您已取消关注',
                                            hide: true,
                                            type: 'success'
                                        });
                                    }
                                }
                            });
                        };
                    }
                } else if (that._oper === 'add_friend') { //添加企业好友前获取状态信息
                    jingoal.ajax('/ecircle/ecircle/v1/get_relation_status', {
                        method: 'post',
                        data: {
                            nid: that._id
                        },
                        onsuccess: function (data) {
                            var response = data.response;
                            var companyName = data.detail.title;
                            var status = -1;
                            //var needcheck = 0;
                            var isAdmin = false;
                            var notifMsg = '',
                                message = '';
                            if (response) {
                                status = response.return_type;
                                message = response.message;
                                isAdmin = response.manger;
                                //needcheck = response.type;
                            }
                            var option = {
                                title: '添加企业好友',
                                showClose: true
                            };
                            if (status === 4) {
                                textCount = ecui.get('friendDialogTextNum').getMain();
                                dom.addClass(textCount, 'text-gray');
                                ecui.esr.setData('friendDialogTextNum', '还可以输入&nbsp;' + 60 + '&nbsp;个字');
                                ecui.get('addFriendTextarea').getMain().value = '';
                                ecui.esr.setData('friendCompanyName', companyName);
                                ecui.esr.setData('friendCompanyAddress', data.detail.address);
                                ecui.get('friendDialog').showModal();
                                jingoal.ecircle.friendDialogEvent(that._id);
                                return;
                            }
                            if (status === 1) {
                                if (isAdmin) {
                                    jingoal.ecircle.confirm({
                                        content: '您的企业已停用与对方的好友关系，是否立即恢复？',
                                        submitText: '恢复好友关系',
                                        callback: jingoal.ecircle.addRelationRestart
                                    });
                                } else {
                                    jingoal.ecircle.confirm({
                                        content: '您的企业已停用与对方的好友关系，无法申请企业好友。',
                                        showClose: true
                                    });
                                }
                                return;
                            }
                            if (status === 5) {
                                var info = companyName + " 已经与您的企业建立好友关系，您可以加入到开放成员中。";
                                jingoal.ecircle.confirm({
                                    content: info,
                                    title: "添加企业好友",
                                    submitText: "加入开放成员",
                                    callback: jingoal.ecircle.addRelationOpenuser
                                });
                                return;
                            }
                            if (status === 6) {
                                jingoal.ecircle.confirm({
                                    title: '添加企业好友',
                                    content: companyName + '已经与您的企业建立好友关系，您可以加入到开放成员中。',
                                    submitText: '申请加入开放成员',
                                    callback: jingoal.ecircle.addRelationSend
                                });
                                return;
                            }
                            if (status === -3) {
                                option.content = '您没有权限进行此操作。';
                            }
                            if (status === -2) {
                                option.content = '不能添加本企业为好友';
                            }
                            if (status === 7) {
                                option.content = '已经添加企业，不能重复添加。';
                            }
                            if (status === 8) {
                                option.content = companyName + ' 已经向您的企业提交好友申请，不能重复申请。';
                            }
                            if (status === 9 || status === 10) {
                                option.content = '您已经向' + companyName + ' 提交好友申请，不能重复申请。';
                            }
                            if (status === 12) {
                                notifMsg = '您的友好企业个数已达上限，无法添加。';
                                if (message === 'overMaxLimit_mNeighbourNum') {
                                    notifMsg = '您的友好企业个数已达上限，无法添加。';
                                }
                                if (message === 'overMaxLimit_oNeighbourNum') {
                                    notifMsg = '该企业的好友数量已达上限，无法添加。';
                                }
                                if (message === 'overMaxLimit_mOpenNum') {
                                    notifMsg = '您的全部企业好友中，对方开放成员总数已达上限，无法添加。';
                                }
                                if (message === 'overMaxLimit_oOpenNum') {
                                    notifMsg = '该企业开放成员总数已达上限，无法添加。';
                                }
                                option.content = notifMsg;
                            }
                            if (status === -1) {
                                option.content = '操作失败';
                            }
                            jingoal.ecircle.confirm(option);
                        }
                    });
                }
            }
        }
    );
}());

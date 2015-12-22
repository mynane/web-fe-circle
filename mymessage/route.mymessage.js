(function(ecui) {
    var esr = ecui.esr,
        dom = ecui.dom;
    var pageInfo, url, type,
        _$ = ecui.$,
        $ = jingoal.ecircle;
    ecui.esr.addRoute('mymessage', {
        model: function(option, render) {
            if ((typeof option.type == "undefined") || option.type == "receive") {
                option.type = "receive";
                _$("message-count").style.display = 'none';
                url = "/ecircle/ecircle/v1/get_comments_4_receive";
            } else {
                url = "/ecircle/ecircle/v1/get_comments_4_me";
            }
            type = option.type;
            esr.request('message@' + url + "?minId=0&minPage&maxId=0&maxPage&curr=0&toPage=1", function() {
                render();
            });
            return false;
        },
        main: 'left-section',
        view: "mymessage",
        onbeforerender: function(context) {
            _$("loading").style.display = 'none';
            _$("content").style.display = 'block';
            var message = context.message;
            pageInfo = message.page_info;
            esr.setData("comments", message);
            esr.setData("type", type);

            var title = type === 'receive' ? '我收到的评论' : '我发出的评论';
            document.title = '评论消息' + ' - ' + title;
        },
        onafterrender: function(context) {
            // headerMenu.setIndex(-1);
            $.isloadingOrLoadAll = false;
            delete $.loadMoreComments;
            // console.log($.isloadingOrLoadAll)
            document.body.scrollTop = document.documentElement.scrollTop = 0;
            jingoal.ecircle.scrollY = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
            var scrollY = document.body.scrollTop,
                newScrollY,
                ul = _$('mymessage-list'),
                all_words = ['last_id','page','number','min_id','max_id','curr_page','build_no'];
            function setPageinfo(pageInfo) {

            	if(ul){
                    for(var a = all_words.length;a--;) {
                        ul.setAttribute(all_words[a],pageInfo[all_words[a]]);
                    }
            	}
            }
            function getPageinfo () {
                var res = {};
                for(var a = all_words.length;a--;) {
                    res[all_words[a]] = ul.getAttribute(all_words[a]);
                }
                return res;
            }
            setPageinfo(context.message.page_info)
            var type = context.type,
                loadBt = _$('load_more'),
                loadMore = function() {
                    if($.isloadingOrLoadAll || !ul) return;
                    $.isloadingOrLoadAll = true;
                    var loadMoreDiv = dom.create('load-more', 'div');
                    var pginfo = getPageinfo();
                    var last_id = pginfo.last_id,
                        page = pginfo.page,
                        number = pginfo.number,
                        min_id = pginfo.min_id,
                        max_id = pginfo.max_id,
                        curr_page = pginfo.curr_page,
                        build_no = pginfo.build_no;
                    jingoal.ajax(url + '?minId=' + min_id + '&minPage&maxId=' + max_id + '&maxPage&curr=' + curr_page + '&toPage=' + (curr_page - 0 + 1), {
                        method: 'GET',
                        onsuccess: function(data) {
                            // console.log(data);
                            var html = etpl.render('mymessage-list', {
                                comments: data,
                                type:type
                            });
                            var fr = $.htmlToEl(html);
                            ul.appendChild(fr);
                            dom.remove(loadMoreDiv);
                            setPageinfo(data.page_info);
                            $.isloadingOrLoadAll = false;
                            if(data.obj_list.length< number) {
                                _$('loaded_all').style.display = 'block';
                                $.isloadingOrLoadAll = true;
                                delete $.loadMoreComments;
                            }
                        },
                        onerror: function () {
                            alertTip({title:'加载失败，请重试！',type:error});
                            $.isloadingOrLoadAll = false;
                        }
                    });
                    
                    loadMoreDiv.innerHTML = '<img src="css/img/loading_32@1x.gif"/><span>正在加载...<span>';
                    _$('left-section').appendChild(loadMoreDiv);
                    if (!loadBt.getAttribute('clicked')) {
                        loadBt.setAttribute('clicked', true);
                        loadBt.style.display = 'none';
                        esr.setData('autoLoad', true);
                    }
                    if(!$.loadMoreComments) $.loadMoreComments = loadMore;
                };
            if(loadBt){
            	dom.addEventListener(loadBt, 'click', loadMore);
            }
            if(ul){
            dom.addEventListener(ul, 'click', function  (e) {
                e = ecui.wrapEvent(e);
                var target = e.target;
                if(target.tagName === 'LI' && $.hasClass(target, 'delete-comment')) {
                    var dialog = ecui.get('delcomment');
                    /*if(!dialog) {
                        dialog = etpl.render('del_dialog', {
                            title:'删除评论',
                            content: '你确定删除这条评论吗？',
                            cancelValue:'取消',
                            okValue: '删除'
                        });
                        document.body.appendChild($.htmlToEl(dialog));
                        dialog  = ecui.get('delcomment');
                    }*/
                    if(!dialog) {
                        var dialogdiv = '<div id="delcomment" ui="type:dialog;id:delcomment" class="dialog" style="display:none;width:550px"> <label>删除评论</label> <div class="modal-body"> <div class="modal-prompt modal-success" style="width:auto;border-top: none;"> <div class="mid_helper"></div> <i class="mid_icon"></i> <div class="mid_text">您确定删除此条评论吗?</div> </div> </div> <div class="modal-footer "> <div class="modal-footer-content" style="height: auto;margin-bottom: 0;margin-top: 0;padding: 0;"> <button class="btn default large" ui="id:cancelDel">取消</button> <button class="btn primary large ml16" ui="id:submitDel">删除</button> </div> </div>';
                        dialogdiv = $.htmlToEl(dialogdiv);
                        document.body.appendChild(dialogdiv);
                        dialogdiv = ecui.$('delcomment')
                        // console.log(dialogdiv, dialog)
                        dialog = ecui.init(dialogdiv);
                        dialog = ecui.get('delcomment');
                    }
                    // console.log(dialog)
                    dialog.showModal();
                    var submit = ecui.get('submitDel'),
                        cancel = ecui.get('cancelDel');
                    submit.onclick = function () {
                        var commentid = target.getAttribute("commentid");
                        if (commentid) {
                            jingoal.ajax("/ecircle/ecircle/v1/delete_comment", {
                                method:'POST',
                                data: {
                                    "comment_id" : commentid
                                },
                                onsuccess: function(data) {
                                   // var eComment=target.parentNode.parentNode;
                                   // updateCommentNumber(eComment,"-1");
                                   var commentItem = $.getParent({
                                        el: target,
                                        className: 'comment-item'
                                    });
                                    var mymessageMark = ecui.$('mymessage-list');
                                   if(mymessageMark){
                                   	  var commentItemDel = $.getParent({
                                        el: target,
                                        className: 'comment-delete-btn'
                                      });
                                      var commentItemInfo = $.getParent({
                                        el: target,
                                        className: 'comment-info'
                                      });
                                      var commentItemContent =commentItemInfo.getElementsByClassName("comment-content");
                                      commentItemContent.innerHTML='<span class="mid_text3">该评论已经被删除！</span>';
                                      commentItemDel.parentNode.removeChild(commentItemDel);
                                   }else{
                                   	$.addClass(commentItem,"del");
                                   	setTimeout(function(){
                                        commentItem.parentNode.removeChild(commentItem);
                                    },500);
                                   }
                                   dialog.hide();
                                },
                                onerror: function (code, message) {
                                    alertTip({
                                        title: code+':'+message.message,
                                        type:'error'
                                    });
                                    dialog.hide();
                                }
                            });
                        }
                    }
                    cancel.onclick = function () {
                        dialog.hide();
                    }
                }
            })
           }
            
            /*if (context.type == "receive") {
                // headerCommentNumber.getMain().style.display = "none";
            }
            if (context.comments.obj_list.length == 0) return;
            var pageObj = pagingDynamic(document.getElementById("papging-wrap"), {
                showpages: 5,
                initPage: pageInfo.next_page_count,
                callback: function(now, opt, next) {
                    //处理分页请求
                    $.get(url, {
                        minId: pageInfo.min_id,
                        minPage: pageInfo.min_page,
                        maxId: pageInfo.max_id,
                        maxPage: pageInfo.max_page,
                        curr: pageInfo.curr_page,
                        toPage: now
                    }, function(data) {
                        data = $.parseJSON(data);
                        pageInfo = data.data.page_info;
                        ecui.esr.setData("comments", data.data);
                        ecui.esr.setData("type", type);
                        next(pageInfo.next_page_count);
                        window.scrollTo(0, 0);
                    });
                }
            });*/
        }
    });
}(ecui));

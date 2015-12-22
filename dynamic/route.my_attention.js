(function () {
    ecui.esr.addRoute('my_attention', {
        model: [
            'companyDirectory@/ecircle/ecircle/v1/get_attentions?lastId=0&page=1&number=10'
        ],
        main: 'left-section',
        view: 'my_attention',
        ondispose: function () {
            jingoal.ecircle.searchMyAttention = false;
        },
        onbeforerequest: function () {
            ecui.esr.setData('type', 'attention');
        },
        onbeforerender: function (context) {
            ecui.esr.setData('dynamics', context.companyDirectory.companys);
            ecui.esr.setData('type', 'attention');
            ecui.esr.setData('total', context.companyDirectory.page_info.total);
            ecui.esr.setData('count', 10);
            context.currentPage = 1;
            ecui.$("loading").style.display = 'none';
            ecui.$("content").style.display = 'block';
            jingoal.ecircle.searchMyAttention = true;
        },
        onafterrender: function (context) {
            if (!context.companyDirectory.companys.length) {
                ecui.get('noAttention').show();
            }
            var attentionPage = ecui.$('attentionPage'),
                pageControl,
                searchForAttention = ecui.get('searchForAttention'),
                div = ecui.dom.create('', 'div');
            searchForAttention.onclick = jingoal.ecircle.seniorSearch;
            function pageRefresh() {
                if (!attentionPage) {
                    return;
                }
                div.setAttribute('ui', 'type:pagination;id:attentionPage;max:8;curr:1;size:10;items:' + context.companyDirectory.page_info.total + ';jump:false');
                div.className = 'page-list-wrap';
                attentionPage.appendChild(div);
                ecui.init(div);
                pageControl = ecui.get('attentionPage');
                pageControl.onpagination = function (page) {
                    context.currentPage = page;
                    jingoal.ajax('/ecircle/ecircle/v1/get_attentions?page=' + page + '&number=10', {
                        method: 'get',
                        onsuccess: function (data) {
                            ecui.esr.setData('dynamics', data.companys);
                        },
                        onerror: function () {
                            alertTip({
                                type: 'error',
                                title: '加载关注企业失败',
                                hide: true
                            });
                        }
                    });
                };
            }
            pageRefresh();
        }
    });
}());

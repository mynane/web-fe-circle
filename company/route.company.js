(function(ecui) {
    var esr = ecui.esr;
    esr.addRoute('company', {
        model: [
            'companyInfo@/ecircle/ecircle/v1/view_directory?cid=${cid}',
            'companyDatas@/ecircle/ecircle/v1/get_circle_dynamics?lastId=0&page=0&number=4&isCompany=true&otherCid=${id}&b1447901241800=1'
        ],
        main: 'left-section',
        view: 'company',
        onbeforerequest: function (context) {
            context.cid = context.id;
            if(context.id === 'my') {
                context.cid = '';
            }
        },
        onbeforerender: function(context) {
            ecui.$("loading").style.display = 'none';
            ecui.$("content").style.display = 'block';
            if (context.id == "my" || context.companyInfo.is_same_company) {
                // data.detail.ismine = true;
                esr.setData('ismine', true);
            }
            // esr.setData('companyInfo', context.companyDatas.detail);
            // console.log(context, context.companyDatas);
            document.title = (context.companyInfo.name || context.companyInfo.title) + '- 我的企业圈';
            document.body.scrollTop = document.documentElement.scrollTop = 0;
            jingoal.ecircle.scrollY = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
            var $ = jingoal.ecircle;
            var data = context.companyDatas;
            if (data.detail.is_same_company) {
                data.detail.ismine = true;
            }
            esr.setData("isSystemAdmin", data.detail.is_system_admin);
            esr.setData("isCompanyDetail", true);
            esr.setData("company", data.detail); //改下后端    
            esr.setData("noDynamic", false);
            if (data.dynamics && data.dynamics.length === 0 && data.page_info.page ===0) {
                    esr.setData("noDynamic", true);
            }
            if (data.dynamics && data.dynamics.length > 3) {
                esr.setData('hasMore', true);
                data.dynamics.pop();
                data.page_info.last_id = data.dynamics[2].dynamic_id;
            }
            esr.setData("dynamicList", data);
            esr.setData("count", 3);
            esr.setData("pageInfo", data.page_info);
            esr.setData("dynamic", data.detail); //适配target:company-logo模板
            // next();
            // dynamicPageInfo = data.page_info;
        },
        onafterrender: function(context) {
            var ecircle = jingoal.ecircle;
            ecircle.isloadingOrLoadAll = true;
            var pageInfo = context.pageInfo,
                hasMore = context.hasMore,loadmorediv;
            if (hasMore) {
                loadmorediv = ecui.$('load_more');
                loadmorediv.style.display = 'block';
                loadmorediv.onclick = function () {
                    ecircle.isloadingOrLoadAll = false;
                    ecircle.loadMoreDynamic(pageInfo.last_id, pageInfo.build_no, 3, pageInfo.page);
                    loadmorediv.style.display = 'none';
                };
            }
        }
    });
}(ecui));

(function () {
    ecui.esr.addRoute('dynamic_detail', {
        model: [
            'dynamicList@/ecircle/ecircle/v1/get_dynamic_id?dynamicId=${dynamicId}',
            'companyInfo@/ecircle/ecircle/v1/view_directory?cid=${companyId}'
        ],
        main: 'left-section',
        view: 'dynamic-detail',
        onbeforerequest: function (context) {
            context.dynamicId = context.dynamicId || 0;
            context.companyId = context.companyId || 0;
            context.isdetail = true;
            context.isCompanyDetail = false;
        },
        onbeforerender: function (context) {
        	var temp0 = context.dynamicList;
            var temp = ecui.util.extend({}, context.dynamicList);
            context.dynamicList = {};
            context.dynamicList.dynamics = [temp];
            jingoal.ecircle.isLoadingOrLoadAll = true;
            if (context.companyInfo && temp0) {
                context.count = 1;
                ecui.$("loading").style.display = 'none';
                ecui.$("content").style.display = 'block';
            } else {
                ecui.$("loading").style.display = 'none';
                ecui.$("content").style.display = 'none';
                /*alertTip({
                    title: '程序出错',
                    type: 'error'
                });*/
            }
        },
        onafterrender: function (context) {
            var $ = jingoal.ecircle,
                dynamicId = context.dynamicId,
                commentList = $.getElementsByClassName(document.body, 'comment-list')[0];
            commentList.style.display = 'block';
            $.addClass(commentList, 'show');
            $.getComment(dynamicId, commentList);
        }
    });
}());

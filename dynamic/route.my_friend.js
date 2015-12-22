(function() {
	ecui.esr.addRoute('my_friend', {
		model: [
			'companyDirectory@/ecircle/ecircle/v1/get_friends?page=1&number=10'
		],
		main: 'left-section',
		view: 'my_friend',
		onbeforerequest: function(context) {
			context.type = context.type || '';
		},
		onbeforerender: function(context) {
			ecui.esr.setData('dynamics', context.companyDirectory.companys);
			ecui.esr.setData('total', context.companyDirectory.page_info.total);
			context.type = 'friend';
			ecui.$("loading").style.display = 'none';
			ecui.$("content").style.display = 'block';
		},
		onafterrender: function(context) {
            if (!context.companyDirectory.companys.length) {
                ecui.get('noFriend').show();
                ecui.$('searchForFriend').onclick = jingoal.ecircle.seniorSearch;
            }
			if (context.companyDirectory.page_info.total > 0) {
				var friendPage = ecui.$('friendPage'),
					pageControl;

				function pageRefresh() {
					friendPage.setAttribute('ui', 'type:pagination;id:friendPage;max:8;curr:1;size:10;items:' + context.companyDirectory.page_info.total + ';jump:false');
					friendPage.className = 'page-list-wrap';
					ecui.init(friendPage);
					pageControl = ecui.get('friendPage');
				}
				pageRefresh();
				pageControl.onpagination = function(page) {
					jingoal.ajax('/ecircle/ecircle/v1/get_friends?page=' + page + '&number=10', {
						method: 'get',
						onsuccess: function(data) {
							ecui.esr.setData('dynamics', data.companys);
						},
						onerror: function() {
							alertTip({
								type: 'error',
								title: '加载友好企业失败',
								hide: true
							});
						}
					});
				};
			}
		}
	});
}());
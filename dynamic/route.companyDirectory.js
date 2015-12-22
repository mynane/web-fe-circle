(function () {
    function initDirectoryList(data, refresh) {
        var listContent = ecui.get('listContent');
        var renderResult = etpl.render('companyDirectoryList', data);
        if (refresh) {
            ecui.get('noMoreDirectories').hide();
            listContent.getMain().innerHTML = renderResult;
        } else {
            ecui.dom.insertHTML(listContent.getMain(), 'beforeEnd', renderResult);
        }
        var companies = ecui.dom.children(listContent.getMain());
        var i, len = companies.length;
        for (i = 0; i < len; i++) {
            ecui.init(companies[i]);
        }
        if (ecui.get('loadMore')) {
            ecui.get('loadMore').hide();
        }
        var hasMore = data.dynamics.length > 9;
        ecui.esr.setData('hasMore', hasMore);
        if (!hasMore) {
            if (!refresh) {
                ecui.get('noMoreDirectories').show();
            } else if (!data.dynamics.length) {
                ecui.get('noSearchResult').show();
            }
            return;
        }
    }

    function loadingDirectory(option, dialog) {
        var url = '&lastId=' + option.lastId + '&page=' + option.page
                + '&number=' + option.number;
        if (option.verified && option.verified !== 'undefined') {
            url += '&verfied=' + option.verified;
        }
        if (option.name) {
            url += '&name=' + option.name;
        }
        if (option.firstBusiness && option.firstBusiness !== '0') {
            url += '&first_business=' + option.firstBusiness;
        }
        if (option.secondBusiness && option.secondBusiness !== '0') {
            url += '&second_business=' + option.secondBusiness;
        }
        if (option.provinceCode && option.provinceCode !== '0') {
            url += '&province_code=' + option.provinceCode;
        }
        if (option.cityCode && option.cityCode !== '0') {
            url += '&city_code=' + option.province_code + '_' + option.cityCode;
        }
        if (option.companyType && option.companyType !== '0') {
            url += '&company_type=' + option.companyType;
        }
        if (option.isForbid !== undefined) {
            url += '&isForbid=' + option.isForbid;
            url = '/ecircle/ecircle/v1/get_circle_directorys?' + url;
        } else {
            url = '/ecircle/ecircle/v1/serach_directorys?' + url;
        }
        jingoal.ajax(url, {
            method: 'GET',
            onsuccess: function (data) {
                jingoal.ecircle.searchMyAttention = false;
                initDirectoryList(data, option.page < 1);
                if (ecui.esr.getData('companyDirectory')) {
                    ecui.esr.setData('companyDirectory', data);
                }
                if (dialog) {
                    dialog.hide();
                    ecui.get('simpleSearchInput').getMain().value = option.name;
                }
            }
        });
    }
    jingoal.ecircle.loadMoreDirectories = function () {
        var loadMore = ecui.get('loadMore'),
            hasMore = ecui.esr.getData('hasMore');
        if (hasMore && loadMore) {
            ecui.esr.setData('hasMore', false);
            loadMore.show();
            var option = ecui.esr.getData('searchCondition');
            if (option) {
                option.page += 1;
            } else {
                option = {};
                var contextPageInfo = ecui.esr.getData('companyDirectory').page_info;
                option.page = contextPageInfo.page + 1;
                option.lastId = contextPageInfo.last_id;
                option.number = contextPageInfo.number;
                option.verified = contextPageInfo.verified;
                option.isForbid = false;
            }
            loadingDirectory(option);
        }
    };
    jingoal.ecircle.seniorSearch = function () {
        var o = {
            firstBusiness: jingoal.ecircle.firstBusiness,
            secondBusiness: jingoal.ecircle.secondBusiness,
            provices: jingoal.ecircle.provices,
            province_cities: jingoal.ecircle.province_cities
        };
        var seniorSearchHtml = etpl.render('senior-search');
        ecui.dom.insertHTML(document.body, 'beforeEnd', seniorSearchHtml);
        ecui.init(ecui.dom.last(document.body));
        ecui.esr.setData('searchOption', o);
        ecui.esr.setData('businesses', o.secondBusiness['0']);
        ecui.esr.setData('cities', o.province_cities['0']);
        var seniorSearchDialog = ecui.get('seniorSearchDialog');
        seniorSearchDialog.showModal();
        var seniorSearchInput = ecui.get('seniorSearchInput'),
            seniorSearchInputDom = seniorSearchInput.getMain(),
            selectSecondBusiness = ecui.get('selectSecondBusiness'),
            selectProvinceCities = ecui.get('selectProvinceCities'),
            simpleSearchInput = ecui.get('simpleSearchInput');
        if (simpleSearchInput) {
            seniorSearchInputDom.value = simpleSearchInput.getMain().value;
        }
        //selectSecondBusiness.setSelectedIndex(0);
        //selectProvinceCities.setSelectedIndex(0);
        var selectFirstBusiness = ecui.get('selectFirstBusiness'),
            selectProvince = ecui.get('selectProvince'),
            cancalSearch = ecui.get('cancalSearch'),
            submitSearch = ecui.get('submitSearch');
            //companyType = ecui.get('companyType'),
            //companyVerified = ecui.get('companyVerified');
        var searchCondition = {};
        seniorSearchInput.onfocus = function () {
            ecui.dom.removeClass(ecui.dom.getParent(seniorSearchInputDom), 'msg_warn');
        };
        selectFirstBusiness.onchange = function () {
            searchCondition.firstBusiness = selectFirstBusiness.getValue();
            ecui.esr.setData('businesses', o.secondBusiness[searchCondition.firstBusiness]);
            if (searchCondition.firstBusiness === '0') {
                ecui.get('selectSecondBusiness').setSelectedIndex(0);
            }

        };
        selectProvince.onchange = function () {
            searchCondition.provinceCode = selectProvince.getValue();
            ecui.esr.setData('cities', o.province_cities[searchCondition.provinceCode]);
            if (searchCondition.provinceCode === '0') {
                ecui.get('selectProvinceCities').setSelectedIndex(0);
            }
        };
        cancalSearch.onclick = function () {
            seniorSearchDialog.hide();
        };
        submitSearch.onclick = function () {
            if (jingoal.ecircle.searchMyAttention) {
                ecui.esr.change('companyDirectory', false);
            }
            jingoal.ecircle.scrollY = 0;
            selectSecondBusiness = ecui.get('selectSecondBusiness');
            selectProvinceCities = ecui.get('selectProvinceCities');
            searchCondition.provinceCode = selectProvince.getValue();
            searchCondition.firstBusiness = selectFirstBusiness.getValue();
            searchCondition.secondBusiness = selectSecondBusiness.getValue();
            searchCondition.cityCode = selectProvinceCities.getValue();
            //searchCondition.verified = companyVerified.getValue() === 'true';
            //searchCondition.companyType = companyType.getValue();
            searchCondition.name = seniorSearchInputDom.value;
            if (searchCondition.secondBusiness === '0' && searchCondition.cityCode === '0' && searchCondition.name === '') {
                seniorSearchDialog.hide();
                return;
            }
            if (searchCondition.name === '') {
                var searchBox = ecui.dom.getParent(seniorSearchInputDom);
                var i = 0;
                var warnInterval = setInterval(function () {
                    if (i % 2 === 1) {
                        ecui.dom.addClass(searchBox, 'msg_warn');
                    } else {
                        ecui.dom.removeClass(searchBox, 'msg_warn');
                    }
                    if (i++ === 3) {
                        clearInterval(warnInterval);
                    }
                }, 150);
                return;
            }
            searchCondition.lastId = 0;
            searchCondition.page = 0;
            searchCondition.number = 10;
            ecui.esr.setData('searchCondition', searchCondition);
            loadingDirectory(searchCondition, seniorSearchDialog);
        };
    };
    ecui.esr.addRoute('companyDirectory', {
        model: 'companyDirectory@/ecircle/ecircle/v1/get_circle_directorys?lastId=${lastId}&page=${page}&number=${number}&verfied=${verified}&isForbid=false',
        main: 'left-section',
        view: 'companyDirectory',
        onbeforerequest: function (context) {
            context.lastId = context.lastId || 0;
            context.page = context.page || 0;
            context.number = context.number || 10;
            context.verified = context.verified || true;
        },
        onbeforerender: function () {
            ecui.$('loading').style.display = 'none';
            ecui.$('content').style.display = 'block';
            jingoal.ecircle.isloadingOrLoadAll = false;
        },
        onafterrender: function (context) {
            if (!jingoal.ecircle.searchMyAttention) {
                initDirectoryList(context.companyDirectory, true);
            }
            var simpleSearch = ecui.get('simpleSearch'),
                simpleSearchInput = ecui.get('simpleSearchInput'),
                seniorSearch = ecui.get('seniorSearch');
            simpleSearch.onclick = function () {
                jingoal.ecircle.scrollY = 0;
                var name = simpleSearchInput.getMain().value;
                if (!name || name === '') {
                    return;
                }
                var condition = {
                    lastId: 0,
                    page: 0,
                    number: 10,
                    name: name
                };
                ecui.esr.setData('searchCondition', condition);
                loadingDirectory(condition);
            };
            simpleSearchInput.onfocus = function () {
                var searchBtn = ecui.dom.previous(this.getBody()).getElementsByTagName('i')[0];
                searchBtn.style.backgroundPosition = '-128px -16px';
                ecui.dom.addClass(ecui.$('simpleInputWrapper'), 'simple-input-wrapper-focus');
            };
            simpleSearchInput.onblur = function () {
                var searchBtn = ecui.dom.previous(this.getBody()).getElementsByTagName('i')[0];
                searchBtn.style.backgroundPosition = '-128px 0';
                ecui.dom.removeClass(ecui.$('simpleInputWrapper'), 'simple-input-wrapper-focus');
            };
            seniorSearch.onclick = jingoal.ecircle.seniorSearch;
        }
    });
}());

(function(ecui) {
    var esr = ecui.esr,
        dom = ecui.dom,
        io = ecui.io,
        util = ecui.util,
        trim = function  (str) {
            return str.replace(/^\s+/,'').replace(/\s+$/,'');
        },
        $ = jingoal.ecircle;

    ecui.esr.addRoute('company-edit', {
        model: [
            'company@/ecircle/ecircle/v1/get_directory'
        ],
        main: 'left-section',
        view: 'company-edit',
        onbeforerender: function(context) {
            ecui.$("loading").style.display = 'none';
            ecui.$("content").style.display = 'block';
            document.title = (context.company.name || context.company.title) + '- 编辑企业信息';
            var company = context.company;
            // 修复一个电话都没有时电话输入框都不显示了的情况
            if(company.contact_numbers && company.contact_numbers.length < 1) {
                company.contact_numbers = [''];
            }
            esr.setData('companyInfo', company);
            // alert(1)
            // ecui.esr.setData("company",data);
            // ecui.esr.setData("dynamic",data);
            // 修复下拉框默认选择
            if(!company.city_code || company.city_code === '-1') {
                company.city_code = 0;
            }
            if(!company.province_code || company.province_code === '-1') {
                company.province_code = 0;
            }
            if(!company.first_business || company.first_business === '-1') {
                company.first_business = 0;
            }
            if(!company.second_business || company.second_business === '-1') {
                company.second_business = 0;
            }
            var o = {
                firstBusiness: jingoal.ecircle.firstBusiness,
                secondBusiness: jingoal.ecircle.secondBusiness,
                provices: jingoal.ecircle.provices,
                province_cities: jingoal.ecircle.province_cities
            };
            esr.setData('selectDatas', o);
            esr.setData('businesses', o.secondBusiness[company.first_business] || []);
            esr.setData('cities', o.province_cities[company.province_code] || []);
        },
        onafterrender: function(context) {
            var ocitySelect = ecui.get('ocitySelect'),
                ocityquSelect = ecui.get('ocityquSelect'),
                oBusSelect = ecui.get('oBusSelect'),
                oBusSubSelect = ecui.get('oBusSubSelect'),
                // oCompanyType = ecui.get('oCompanyType'),
                // oCompanyMaker = ecui.get('oCompanyMaker'),
                companyServer = ecui.get('companyServer'),
                // oCompnayAddress = ecui.get('oCompnayAddress'),
                companySummary = ecui.get('companySummary'),
                oCompanyPerson = ecui.get('oCompanyPerson'),
                oCompanyUrl = ecui.get('oCompanyUrl'),
                oTel = ecui.get('oTel'),
                companyInfo = context.companyInfo;
            var o = context.selectDatas;    
            oBusSelect.onchange = function () {
                var firstBusiness = oBusSelect.getValue();
                esr.setData('businesses', o.secondBusiness[firstBusiness]);
                // 联动下拉每次都会重绘，所以要对变量重新赋值
                oBusSubSelect = ecui.get('oBusSubSelect');
                if (firstBusiness === '0') {
                    oBusSubSelect.setSelectedIndex(0);
                }
            }    
            ocitySelect.onchange = function () {
                var province_code = ocitySelect.getValue();
                esr.setData('cities', o.province_cities[province_code]);

                ocityquSelect = ecui.get('ocityquSelect');
                ocityquSelect.setSelectedIndex(0);
            }    
            var companySummaryElem=companySummary.getMain(),
                companyServerElem=companyServer.getMain();
            var canSubmit = false,
                ieVer = /MSIE (\d)\.0/.test(navigator.userAgent) && (RegExp.$1-0);
            // console.log(ieVer)
            function checkinput (input) {
                // console.log(input)
                var fn = function (e) {
                    e = e || window.event;
                    var target = e.target || e.srcElement;
                    if(input.validateFn) {
                        var can = input.validateFn(target, target.value);
                    }
                }
                if(window.addEventListener) { //先执行W3C
                  input.addEventListener("input", fn, false);
                } else {
                  input.attachEvent("onpropertychange",fn);         
                }
                 
                if(ieVer && ieVer === 9) { //IE9
                  input.attachEvent("onkeydown", function() {
                    var key = window.event.keyCode;
                    (key == 8 || key == 46) && fn();//处理回退与删除         
                  });
                  input.attachEvent("oncut", fn);//处理粘贴
                }
            }   
            function checkPhone (t, value) {
                var regPhone=/^\d{7,20}$/gi;
                if(value==""||(regPhone.test(value))){
                    $.addClass(t.validater, 'hide');
                    $.removeClass(t.parentNode, 'error');
                } else {
                    $.removeClass(t.validater, 'hide');
                    $.addClass(t.parentNode, 'error');
                    return false;
                }
            }
            function initValidate () {
                var form = ecui.$('company_edit_form'),
                    onfocus = function (e) {
                        e = ecui.wrapEvent(e);
                        var target = e.target, vali;
                        // console.log(target)
                        if(target.tagName === 'INPUT' ||target.tagName === 'TEXTAREA') {
                            vali = target.getAttribute('xvalidater');
                            if(!target.validater && vali) {
                                target.validater = ecui.$(vali); 
                                checkinput(target);
                            }
                            if($.hasClass(target, 'tel-number')) {
                                if(!target.validateFn) {
                                    target.validateFn = checkPhone;
                                }
                            }
                        }
                    },
                    onblur = function (e) {
                        e = ecui.wrapEvent(e);
                        
                        
                    };
                dom.addEventListener(form, 'focus', onfocus);
                dom.addEventListener(form, 'blur', onblur);
                if(ieVer && ieVer < 9) {
                    dom.addEventListener(form, 'focusin', onfocus);
                    dom.addEventListener(form, 'focusout', onblur);
                }

                var textarea = ecui.$('companySummary');
                textarea.validater = ecui.$(textarea.getAttribute('xvalidater'));
                checkinput(textarea);
                ecui.$('companySummary').validateFn = function (t, val) {
                    val = trim(val);
                    if(val == '' || val.length <= 300) {
                        $.addClass(t.validater, 'hide');
                        $.removeClass(t.parentNode, 'error');
                    } else {
                        $.removeClass(t.validater, 'hide');
                        t.validater.getElementsByTagName('B')[0].innerHTML = val.length - 300;
                        $.addClass(t.parentNode, 'error');
                        return false;
                    }
                }
                ecui.$('oCompanyUrl').validateFn = function (t, val) {
                    val = trim(val);
                    if(val == '' || val.length <= 100) {
                        $.addClass(t.validater, 'hide');
                        $.removeClass(t.parentNode, 'error');
                    } else {
                        $.removeClass(t.validater, 'hide');
                        $.addClass(t.parentNode, 'error');
                        return false;
                    }
                }
                ecui.$('companyServer').validateFn = function (t, val) {
                    if(val == '' || val.length <= 50) {
                        $.addClass(t.validater, 'hide');
                        $.removeClass(t.parentNode, 'error');
                    } else {
                        $.removeClass(t.validater, 'hide');
                        t.validater.getElementsByTagName('B')[1].innerHTML = val.length - 50;
                        $.addClass(t.parentNode, 'error');
                        return false;
                    }
                }
                var inputs = form.getElementsByTagName('input');
                for(var i = 0,input, hasValidater, validater;i<inputs.length;i++) {
                    input = inputs[i];
                    if(hasValidater = input.getAttribute('xvalidater')) {
                        validater = ecui.$(hasValidater);
                        if(validater) {
                            input.validater = validater;
                            checkinput(input);
                            if($.hasClass(input, 'tel-number')) {
                                input.validateFn = checkPhone;
                            }
                        }
                    }
                }
            }
            initValidate();
            var form = ecui.$('company_edit_form'),
                fs;

            oTel.onclick=function(event){
                event = ecui.wrapEvent(event);
                var target=event.target;
                while(target !== oTel.getMain()) {
                    if(target.className.indexOf('add-wrap') > -1) {
                        break;
                    }
                    target = target.parentNode;
                }
                if(target.className.indexOf('add-wrap') > -1 && target.parentNode.parentNode.children.length < 5) {
                    var node = target.parentNode,
                        cloned = node.cloneNode(true);
                    node.className = node.className.replace(/\blast\b/,'');
                    cloned.getElementsByTagName('input')[0].value = '';  
                    cloned.className = cloned.className.replace(/\bfirst\b/,'');  
                    target.parentNode.parentNode.appendChild(cloned);   
                    if(target.parentNode.parentNode.children.length === 5) {
                        cloned.removeChild(cloned.getElementsByTagName('div')[1]);
                    }
                    node.removeChild(target); 
                }
            }    
            dom.addEventListener(form, 'submit', submitForm);
            function getSubmitData(){
                var submitData={};
                submitData.company_id=companyInfo.company_id;
                if(typeof fileUploadResult!="undefined"){
                    submitData.icon=fileUploadResult.fsid;
                    submitData.file_name=fileUploadResult.fileName;
                }
                submitData.province_code=trim(ocitySelect.getValue());
                submitData.city_code=trim(ocityquSelect.getValue());
                submitData.first_business=trim(oBusSelect.getValue());
                submitData.second_business=trim(oBusSubSelect.getValue());
                // submitData.company_type=trim(oCompanyType.getValue());
                // submitData.company_maker=trim(oCompanyMaker.getValue());
                // submitData.address=trim(oCompnayAddress.getMain().value);
                submitData.summary=trim(companySummaryElem.value);
                submitData.server=trim(companyServerElem.value);
                submitData.contact_numbers=[];
                for(var telElems = oTel.getMain().getElementsByTagName('input'),t = 0, tel;t < telElems.length; t++) {
                    tel = trim(telElems[t].value);
                    if(tel!='') {
                        submitData.contact_numbers.push(tel);
                    }
                }
                submitData.contact_person=trim(oCompanyPerson.getMain().value);
                submitData.web_site=trim(oCompanyUrl.getMain().value);
                /*for(var p in placeholders) {
                    if(submitData[p] == placeholders[p]) submitData[p] = '';
                }*/
                return submitData;
            }
            function validateFailed () {
                function errorTip () {                    
                    alertTip({
                        title:'资料验证有错误，请检查！',
                        type:'error'
                    });
                }
                var textarea = ecui.$('companySummary');
                if(textarea.validateFn) {
                    if(textarea.validateFn(textarea, textarea.value) === false) {
                        errorTip();
                        return false;
                    }
                }
                var inputs = form.getElementsByTagName('input');
                for(var i = 0,input;i<inputs.length;i++) {
                    input = inputs[i];
                    if(input.validateFn && input.validateFn(input,input.value) === false) {
                        errorTip();
                        return false;
                    }
                }                
            }
            function submitForm (e) {
                e = ecui.wrapEvent(e);
                e.preventDefault();
                // console.log(getSubmitData())
                if(validateFailed() === false) {
                    return false;
                }
                jingoal.ajax('/ecircle/ecircle/v1/edit_directory', {
                    data : getSubmitData(),
                    type: 'post',
                    method: 'post',
                    onsuccess : function  (data) {
                        // alert('ok')
                        alertTip('企业信息修改成功！');
                        esr.redirect('company~id=my')
                    },
                    onerror: function  () {
                         alertTip({
                            title:'提交失败，请重试！',
                            type:'error'
                        });
                    }
                })
                return false;
            }
        }
    });
}(ecui));

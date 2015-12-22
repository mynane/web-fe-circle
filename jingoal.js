var jingoal = {
    LOGIN_URL: "/web-fe-ecircle/welcome.html",
    LOGIN_ECIRCLE_SESSION: "/web-fe-ecircle/index.html"
};
jingoal.ui = {};
jingoal.ecircle = {};
var dom = ecui.dom;
jingoal.ecircle.confirm = function (options) {
    var confirmHTML = etpl.render('confirm-dialog', options);
    ecui.dom.insertHTML(document.body, 'beforeEnd', confirmHTML);
    ecui.init(ecui.dom.last(document.body));
    var confirmDialog = ecui.get('confirmDialog');
    confirmDialog.showModal();
    var confirmCancel = ecui.get('confirmCancel'),
        confirmOK = ecui.get('confirmOK');
    if (options.title) {
        confirmDialog.setTitle(options.title);
    }
    if (confirmOK) {
        confirmOK.onclick = function () {
            confirmDialog.hide();
            options.callback();
        };
    }
    confirmCancel.onclick = function () {
        confirmDialog.hide();
    };
};
jingoal.ecircle.confirm.hide = function () {
    ecui.get('confirmDialog').hide();
};
jingoal.ecircle.hasClass = function (el, cls) {
    if (!el) {
        return false;
    }
    if (el.className) {
        return dom.hasClass(el, cls);
    }
    return false;
};
jingoal.ecircle.addClass = function (el, cls) {
    if (!el) {
        return;
    }
    if (!jingoal.ecircle.hasClass(el, cls)) {
        dom.addClass(el, cls);
    }
};
jingoal.ecircle.removeClass = function (el, cls) {
    if (!jingoal.ecircle.hasClass(el, cls)) {
        return;
    }
    dom.removeClass(el, cls);
};
jingoal.ecircle.getElementsByClassName = function (el, cls) {
    var children,
        result = [],
        i;
    if (!el){
        return;
    }
    if (el.getElementsByClassName) {
        return el.getElementsByClassName(cls);
    }
    children = el.getElementsByTagName('*');
    for (i = 0; i < children.length; i++) {
        if (jingoal.ecircle.hasClass(children[i], cls)) {
            result.push(children[i]);
        }
    }
    return result;
};
jingoal.ecircle.getParent = function (obj) {
    obj.final = obj.final || document.documentElement;
    var parent_elem = obj.el;
    while (parent_elem && parent_elem !== obj.final) {
        if (jingoal.ecircle.hasClass(parent_elem, obj.className)) {
            return parent_elem;
        }
        parent_elem = ecui.dom.getParent(parent_elem);
    }
    return null;
};
jingoal.ecircle.toogleShow = function (el) {
    if (jingoal.ecircle.hasClass(el, 'show')) {
        dom.removeClass(el, 'show');
        el.style.display = 'none';
    } else {
        dom.addClass(el, 'show');
        el.style.display = 'block';
    }
};
/**
事件委托
delegate 委托元素
cls 事件发生元素的class
type 事件类型 多个有空格隔开
fn 回掉函数
*/
jingoal.ecircle.on = function (delegate, cls, type, fn) {
    var types = type.split(/\s+/),
        i;
    for (i = 0; i < types.length; i++) {
        dom.addEventListener(delegate, types[i], function (e) {
            e = e || window.event;
            var target = jingoal.ecircle.getParent({
                el: e.target || e.srcElement,
                className: cls,
                final: delegate
            });
            if (target) {
                fn(target, e);
            }
        });
    }
};
jingoal.ecircle.htmlToEl = function (html) {
    var div = document.createElement('div'),
        fr = document.createDocumentFragment(),
        firstChild,
        nextSib;
    div.innerHTML = html;
    firstChild = div.firstChild;
    while (firstChild) {
        nextSib = firstChild.nextSibling;
        fr.appendChild(firstChild);
        firstChild = nextSib;
    }
    return fr;
}
etpl.addFilter('publish-time', function (source, text) {
    var t = new Date(+source),
        now = new Date(),
        y = t.getFullYear(),
        month = t.getMonth() + 1,
        day = t.getDate(),
        h = t.getHours(),
        m = t.getMinutes();
    if (t.getFullYear() == now.getFullYear()) {
        if (t.getMonth() == now.getMonth() && t.getDate() == now.getDate()) {
            return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
        } else {
            return (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day + "&nbsp;&nbsp;" + (h < 10 ? '0' : '') + h + ":" + (m < 10 ? '0' : '') + m;
        }
    }
    return y + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;
});
/**
 * 添加截取字体个数过滤器
 * @param  {[string]} 源数据
 * @return {[string]} 处理后的数据
 */
etpl.addFilter('threeLine', function (source) {
    source = source.replace(/^\s+|\s+$/, "");
    var maxLen = parseInt(Math.random() * 20 + 140);
    if (source.length > maxLen) {
        return source.slice(0, maxLen).replace(/ /g, "&nbsp;").replace(/([\r\n]+)/g, "<br />") + "... ..." + '<span class="read-expansion read-more"><span class="more_text"><a>查看更多</a></span><i class="icon-more"></i></span>';
    } else {
        return source.slice(0, maxLen).replace(/ /g, "&nbsp;").replace(/([\r\n]+)/g, "<br />");
    }
    return source;
});
etpl.addFilter('logoDetail', function (source) {
    source = source.replace(/^\s+|\s+$/, "");
    var maxLen = 72;
    if (source.length > maxLen) {
        return source.slice(0, maxLen).replace(/ /g, "&nbsp;").replace(/([\r\n]+)/g, "<br />") + "..." ;
    } else {
        return source.slice(0, maxLen).replace(/ /g, "&nbsp;").replace(/([\r\n]+)/g, "<br />");
    }
    return source;
});
etpl.addFilter('multile', function (source) {
    var count = parseInt(source, 10);
    var s = 1e4,
        d = count;
    if (count / s > 1) {
        d = '1万+';
    }
    return d;
});
etpl.addFilter('huanhang', function (source) {
    return source.replace(/ /g, "&nbsp;").replace(/([\r\n]+)/g, "<br />");
});
 etpl.addFilter('hangye', function(first_name,second_name,province_name,city_name) {
     	var address='';
		if(first_name&&second_name){
	    	address=address+first_name + '/' + second_name + '';
	    }else{
	    	if(first_name){
	    		address=address+first_name + '';
	    	}
	    	if(second_name){
	    		address=address+second_name + '';
	    	}
	    }
	    if((first_name||second_name)&&(province_name||city_name)){
	    	address=address+'&nbsp;&nbsp;-&nbsp;&nbsp;';
	    }
	    if(province_name&&city_name){
	    	address=address+province_name + ',' + city_name + '';
	    }else{
	    	if(province_name){
	    		address=address+province_name + '';
	    	}
	    	if(city_name){
	    		address=address+city_name + '';
	    	}
	    }
 	return address;
});
//{if 0}//
document.write('<link rel="stylesheet/less" type="text/css" href="index.css" />');
//{/if}//
document.write('<script type="text/javascript" src="_ROOT/jingoal-func.js"></script>');
document.write('<script type="text/javascript" src="_ROOT/search-options.js"></script>');
document.write('<script type="text/javascript" src="_ROOT/etpl-filter.js"></script>');
document.write('<script type="text/javascript" src="dialog/alertTip.js"></script>');
document.write('<script type="text/javascript" src="_ROOT/ui/pagination.js"></script>');
document.write('<script type="text/javascript" src="_ROOT/ui/fileUpload.js"></script>');
document.write('<script type="text/javascript" src="_ROOT/ui/fileFinder.js"></script>');
document.write('<script type="text/javascript" src="_ROOT/ui/md5.js"></script>');
ecui.esr.loadModule('dynamic');
ecui.esr.loadModule('company');
ecui.esr.loadModule('company-edit');
ecui.esr.loadModule('mymessage');
//{if 0}//
document.write('<script type="text/javascript" src="_common/less.js_"></script>');
//{/if}//

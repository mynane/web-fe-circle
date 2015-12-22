etpl.addFilter('jingoal', function (source, text) {
    return new Function('$', 'return jingoal.' + text)(source);
});
etpl.addFilter('time', function (source, useExtra) {
    var t = new Date(+source),
        now = new Date(),
        month = t.getMonth() + 1,
        day = t.getDate(),
        s = (t.getHours() < 10 ? '0' : '') + t.getHours() + ':' + (t.getMinutes() < 10 ? '0' : '') + t.getMinutes(),
        year;

    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    var time_diff = new Date().getTime() - t.getTime(),
        now_time = new Date().getTime() - now.getTime();
    if (time_diff < now_time) {
        return s;
    }
    if (now_time < time_diff && time_diff < now_time + 24 * 60 * 60 * 1000) {
        return jingoal.RES.yesterday + s;
    }
    if ((/(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined) < 9) {
        year = t.getYear();
    } else {
        year = t.getYear() + 1900;
    }
    if (useExtra === 1) {
        return year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day + ' ' + s;
    }
    return year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;
});
etpl.addFilter('timeWeek', function (source) {
    var t = new Date(+source),
        month = t.getMonth() + 1,
        day = t.getDate(),
        week = t.getDay(),
        year;

    week = [jingoal.RES.sunday, jingoal.RES.monday, jingoal.RES.tuesday, jingoal.RES.wednesday, jingoal.RES.thursday, jingoal.RES.friday, jingoal.RES.saturday][week];
    if ((/(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined) < 9) {
        year = t.getYear();
    } else {
        year = t.getYear() + 1900;
    }
    return year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day + '  ' + week;
});
etpl.addFilter('default', function (source, text) {
    return source || text;
});
etpl.addFilter('select', function (source, text, ontrue, onfalse) {
    return new Function('$', '$1', '$2', 'return ' + text + '?$1:$2')(source, ontrue, onfalse);
});
etpl.addFilter('preLength', function (source, length, includeHTML) {
    if (includeHTML === false) {  //富文本编辑器content
        var str = source.replace(/<\/?[^>]*>/g, '').replace(/\s+/g, ' ').replace(/&nbsp;/g, ' ');
        str = ecui.util.decodeHTML(str);
        str = str.length > length ? (str.substr(0, length) + '...') : str.substr(0, length);
        return ecui.util.encodeHTML(str);
    }
    return ecui.util.encodeHTML(source.length > length ? (source.substr(0, length) + '...') : source.substr(0, length));

});
etpl.addFilter('cutLength', function (source, length) {
    return source.length > length ? (source.substr(0, length) + '...') : source.substr(0, length);
});
etpl.addFilter('kq_time', function (source, type) {//时间格式   00:00    00:00.00
    if (source) {
        var t = new Date(+source);
        if (type === 1) {
            return (t.getHours() < 10 ? '0' : '') + t.getHours() + ':' + (t.getMinutes() < 10 ? '0' : '') + t.getMinutes() + ' <b class="kq_seconds">' + (t.getSeconds() < 10 ? '0' : '') + t.getSeconds() + '</b>';
        }
        return (t.getHours() < 10 ? '0' : '') + t.getHours() + ':' + (t.getMinutes() < 10 ? '0' : '') + t.getMinutes();
    }
    return '';
});

etpl.addFilter('contains', function (source, text) {
    return source.indexOf(text) >= 0 ? true : false;
});

etpl.addFilter('random', function (source) {//url后面加随机数
    return source + '&random=' + Math.random();
});

etpl.addFilter('take_time', function (source, type) {
    var t = new Date(+source),
        y = t.getFullYear(),
        month = t.getMonth() + 1,
        day = t.getDate(),
        week = t.getDay();
    week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][week];
    if (type === 1) {
        return y + '-' + (month < 10 ? '0' : '') + month;
    }
    if (type === 2) {
        return (day < 10 ? '0' : '') + day;
    }
    if (type === 3) {
        return week;
    }
});

etpl.addFilter('day_of_week', function (source) {
    return ['日', '一', '二', '三', '四', '五', '六'][new Date(+source).getDay()];
});

etpl.addFilter('splices', function (source) {
    return source.replace(',', '/&nbsp;');
});
etpl.addFilter('changeWorkDay', function (source) {
    var rv = [], i, len,
        daysItems = source.split(','),
        week = ['一', '二', '三', '四', '五', '六', '日'];
    for (i = 0, len = daysItems.length; i < len; i++) {
        rv[i] = week[daysItems[i] - 1];
    }
    return rv.join(', ');
});
etpl.addFilter('addZero', function (source) {
    return (source < 10 ? '0' : '') + source;
});

etpl.addFilter('trimHTML', function (source) {
    return source.replace(/<\/?[^>]+>/g, '');
});

etpl.addFilter('userName', function (source) {
    return jingoal.CompanyUser[source].name;
});
    etpl.addFilter('hasData', function(source) {
        // source=utils.trim(source)
        return source==""?"<div class='nocontent'>未填写</div>":source;
    });
    etpl.addFilter('math', function(source,funcstr) {
        var func=new Function("$","return "+funcstr);
        return func(source);
    });
    etpl.addFilter('time', function (source, text) {
        var t = new Date(+source),
            now = new Date(),
            y = t.getFullYear(),
            month = t.getMonth() + 1,
            day = t.getDate(),
            h = t.getHours(),
            m = t.getMinutes();
            if(t.getFullYear() == now.getFullYear()) {
                if(t.getMonth() == now.getMonth() && t.getDate() == now.getDate()) {
                    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
                }else {
                    return (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day + "&nbsp;&nbsp;" + (h < 10 ? '0' : '') + h + ":" + (m < 10 ? '0' : '') + m;
                }
            }
            return  y + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day ;
    });
    //{if 0}//
ecui.esr.loadModuleName();
//{/if}//
ecui.esr.loadRoute('company');

function loadTemplate(url) {
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('GET', url, false);
    xhr.send(null);

    if (xhr.status >= 200 && xhr.status < 300) {
        return xhr.responseText;
    }

    return '';
}

function get_obj_type(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
}

function extend(old_obj, new_obj) {
    function inner_extend(o_obj, n_obj) {
        for (var i in n_obj) {
            if (typeof get_obj_type(n_obj[i]) == "object") {
                if (typeof o_obj[i] != "object") {
                    o_obj[i] = {}
                }
                inner_extend(o_obj[i], n_obj[i]);
            } else {
                o_obj[i] = n_obj[i]
            }

        }
    }
    inner_extend(old_obj, new_obj);
    return old_obj;
}

function alertTip(info) {
    if (get_obj_type(info) == "string") {
        var info = {
            title: info,
            hide: true,
            type: "success"
        };
    } else {
        info = extend({
            type: "success",
            hide: true
        }, info);
    }
    var str = '';
    if (etpl.targets['alert-tip']) {
        str = '<!--use:alert-tip-->';
    }else{
        str = loadTemplate('dialog/alert.html');
    }
    var render = etpl.compile(str);
    var resultArea = document.createElement('div');
    resultArea.className = "alert-tip-wrap";
    resultArea.innerHTML = render(info);
    document.body.appendChild(resultArea);

    resultArea.onmouseout = function () {
        setTimeout(function () {
            document.body.removeChild(resultArea);
        }, 500);
    };
    setTimeout(function () {
        document.body.removeChild(resultArea);
    }, 2000);
}

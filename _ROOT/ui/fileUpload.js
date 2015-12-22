/** file Stat:
 * -1 失败
 *  0 刚选择
 *  1 获得token成功
 *  2 上传中
 *  3 上传完成
 *
 */


if (!XMLHttpRequest.prototype.sendAsBinary) {
    XMLHttpRequest.prototype.sendAsBinary = function (sData) {
        var nBytes = sData.length, ui8Data = new window.Uint8Array(nBytes);
        for (var nIdx = 0; nIdx < nBytes; nIdx++) {
            ui8Data[nIdx] = sData.charCodeAt(nIdx) & 0xff;
        }
        this.send(ui8Data);
    };
}

(function () {
    // Private array of chars to use
    //var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    Math.uuid = function (len, radix) {
        var chars = CHARS, uuid = [], i;
        radix = radix || chars.length;
        if (len) {
            // Compact form
            for (i = 0; i < len; i++) {
                uuid[i] = chars[0 | Math.random() * radix];
            }
        } else {
            // rfc4122, version 4 form
            var r;
            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';
            // Fill in random data.  At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }
        return uuid.join('');
    };
    // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
    // by minimizing calls to random()
    Math.uuidFast = function () {
        var chars = CHARS, uuid = new Array(36), rnd = 0, r;
        for (var i = 0; i < 36; i++) {
            if (i === 8 || i === 13 ||  i === 18 || i === 23) {
                uuid[i] = '-';
            } else if (i === 14) {
                uuid[i] = '4';
            } else {
                if (rnd <= 0x02) {
                    rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
                }
                r = rnd & 0xf;
                rnd = rnd >> 4;
                uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
            }
        }
        return uuid.join('');
    };
    // A more compact, but less performant, RFC4122v4 solution:
    Math.uuidCompact = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
}());


(function () {
    // 上传用的初始条件
    var isHtml5Upload = window.File && window.FileReader && window.FileList
        && window.Blob && window.FormData;
    //var swfuploadObj;//swfuploadObj flash上传实例
    /*var flashInstalled;
    try {
        flashInstalled = ((navigator.plugins !== 'undefined' && typeof navigator.plugins['Shockwave Flash'] === 'object')
            || (window.ActiveXObject && (new ActiveXObject('ShockwaveFlash.ShockwaveFlash')) !== false));
    } catch (ex) {
        flashInstalled = false;
    }*/
    // 上传控件，只负责最核心的上传功能
    var HTML5Uploader = (function () {
        var fileQueue = {};
        var ajaxQueue = {};
        return {
            setQueue: function (queue) {
                fileQueue = queue;
            },
            setUploadURL: function () {
            },
            startUpload: function (fileid) {
                var formdata = new FormData();
                formdata.append('uploadForm', fileQueue[fileid].file);
                var xhr = new XMLHttpRequest();
                xhr.open('post', fileQueue[fileid].uploadUrl, true);
                xhr.upload.onprogress = function (event) {
                    if (event.lengthComputable) {
                        FileQueue.setProgress(fileid, event.loaded, event.total);
                    }
                };
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                            FileQueue.uploadFinish(fileid, xhr.responseText);//成功后设置状态
                            FileQueue.start();//成功后上传下一个
                        } else {
                            //fileQueueManager.error(fileid, xhr);
                        }
                    }
                };
                xhr.send(formdata);
                ajaxQueue[fileid] = xhr;
            },
            cancelUpload: function (fileid) {
                try {
                    ajaxQueue[fileid].abort();
                } catch (ignore) {
                    //console && console.log('未进行网络传输');
                }
            }
        };
    }());
    var FlashUploader = (function () {
    }());
    var uploadManger = isHtml5Upload ? HTML5Uploader : FlashUploader; // 最后暴露出来一个对象
    // 文件对象
    /*var FileObject = function (file) {
    };*/

    // 文件队列
    var FileQueue = (function () {
        var queue = {};
        var _fileUpload = null;
        var _requestToken = function (uuid, callback, onerror) {
            jingoal.ajax('/ecircle/ecircle/v1/get_uploadtoken', {
                method: 'GET',
                data: {
                    'hash': queue[uuid].hash,
                    'size': queue[uuid].size
                },
                onsuccess: function (data) {
                    var url;
                    if (0 === data.code) {
                        ecui.util.extend(queue[uuid], data.file_info_meta);
                        queue[uuid].state = 1;
                        url = data.file_info_meta.uploadurl;
                        url = url.substring(url.indexOf('serv'));
                        queue[uuid].uploadUrl = '/uploadfile/' + url;
                        if (callback) {
                            callback();
                        }
                    } else {
                        if (onerror) {
                            onerror(data);
                        }
                    }
                },
                onerror: onerror,
                onfailure: onerror
            });
        };
        return {
            addFiles: function (files, fileUpload) {
                var that = this;
                var uuids = [], uuid;
                var i, l = files.length;
                var type;
                _fileUpload = fileUpload;
                for (i = 0; i < l; i++) {
                    uuid = Math.uuid();
                    type = files[i].name.replace(/^.*(\.[^\.]+)$/, '$1').toLowerCase();
                    if (/^\.png|\.jpg|\.jpeg|\.gif|\.bmp$/.test(type)) {
                        uuids.push(uuid);
                        queue[uuid] = {
                            name: files[i].name,
                            type: files[i].name.replace(/^.*(\.[^\.]+)$/, '$1').toLowerCase(),
                            size: files[i].size,
                            file: files[i],
                            stat: 0,
                            uuid: uuid
                        };
                        _fileUpload.addFileItem(queue[uuid]);
                    }
                }
                uploadManger.setQueue(queue);
                this.start();
            },
            insert: '',
            cancle: '',
            start: function () {
                // count queue size
                var nextUuid = null, item = null, fileItem;
                for (var i in queue) {
                    if (queue.hasOwnProperty(i) && 0 === queue[i].stat) {
                        nextUuid = i;
                        break;
                    }
                }
                if (nextUuid) {
                    item = queue[nextUuid];
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        //item.data = e.target.result;
                        item.hash = md5(e.target.result);
                        item.stat = 1;
                        fileItem = _fileUpload.getFinderArea().getFileUpload(nextUuid);
                        fileItem.dom.getElementsByTagName('img')[0].src = e.target.result;
                        _requestToken(nextUuid, function () {
                            uploadManger.startUpload(nextUuid);
                        }, function () {
                            // todo:
                        });
                    }
                    reader.readAsDataURL(item.file);
                }
            },
            uploadFinish: function (uuid, responseText) {
                var file = _fileUpload.getFinderArea().getFileUpload(uuid);
                var data = responseText;
                /*try {
                    var data = JSON.parse(responseText);
                    if (data.code === '0') {*/
                        // 业务上的成功
                        file.finish(data);
                        delete queue[uuid];
                    /*} else {
                        // Object { code="300",  error_code="1012",  error="the file size is exceed the limit"}
                    }
                } catch (ignore) {
                    // todo: set to failure
                }*/
            },
            setProgress: function (uuid, loaded, total) {
                var file = _fileUpload.getFinderArea().getFileUpload(uuid);
                file.precent(loaded, total);
            }
        };
    }());

    jingoal.ui.FileUpload = (function () {
        var _finder;
        return {
            setFinderArea: function (finder) {
                _finder = finder;
            },
            getFinderArea: function () {
                return _finder;
            },
            addFileItem: function (file) {
                _finder.addFileUpload(file);
            },
            updateFileInfo: function () {
            },
            //bindDragEvent: function (el) {
            bindDragEvent: function () {
                /*var handleFiles = function (files) {
                    for (var i = 0; i < files.length; i++) {
                        //var file = files[i];
                    }
                    requestToken(files);
                };*/
                /*document.addEventListener('dragenter', function (e) {
                    el.style.borderColor = 'gray';
                }, false);
                document.addEventListener('dragleave', function (e) {
                    el.style.borderColor = 'silver';
                }, false);
                el.addEventListener('dragenter', function (e) {
                    el.style.borderColor = 'gray';
                    el.style.backgroundColor = 'white';
                }, false);
                el.addEventListener('dragleave', function (e) {
                    el.style.backgroundColor = 'transparent';
                }, false);
                el.addEventListener('dragenter', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                }, false);
                el.addEventListener('dragover', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                }, false);
                el.addEventListener('drop', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    handleFiles(e.dataTransfer.files);
                }, false);*/
            },
            bindFileEvent: function (el) {
                var that = this;
                el.addEventListener('click', function () {
                    this.value = '';
                });
                el.addEventListener('change', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    if (this.files.length) {
                        FileQueue.addFiles(this.files, that);
                    }
                });
            }
        };
    }());
}());
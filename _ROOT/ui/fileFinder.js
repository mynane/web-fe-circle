(function () {
    var tplItem = '<!-- target: fileFinderItem -->' +
        '<li class="fileItem">' +
        '<a href="#">' +
        '<img <!-- if: ${data} --> src="${data}" <!-- /if --> >' +
        '<i class="delete" title="不上传这张图"></i>' +
        '<div class="inline_block progress" style="width: 0%;"></div>' +
        '</a>' +
        '</li>';
    etpl.compile(tplItem);
    //
    var FileItem = function (file, type, finder) {
        this.file = file;
        this.type = type;
        this.finder = finder;
        this.status = null;
        this.dom = null;
    };
    FileItem.prototype.output = function () {
        var that = this;
        var div = document.createElement('div');
        div.innerHTML = etpl.render('fileFinderItem', ecui.util.extend({
            type: this.type
        }, this.file));
        this.dom = div.children[0];
        ecui.$fastCreate(ecui.ui.Control, this.dom, null, {}).onclick = function (e) {
            var action = e.target.getAttribute('data-action');
            if ('delete' === action) {
                that.finder.addFileDelete(that);
            }
        };
        return div.children[0];
    };
    FileItem.prototype.upload = function () {
    };
    FileItem.prototype.precent = function (loaded, total) {
        this.dom.getElementsByTagName('div')[0].style.width = parseInt(loaded * 100 / total, 10) + '%';
        
    };
    FileItem.prototype.finish = function () {
        this.dom.getElementsByTagName('i')[0].setAttribute('data-action', 'delete');
    };
    FileItem.prototype.delete = function () {
    };
    FileItem.prototype.getValue = function () {
    };
    /**
     *
     */
    jingoal.ui.FileFinder = function (el, type, files) {
        var that = this;
        this.el = el;
        this.type = type;
        this.queueUpload = []; //上传中的队列
        this.queueStored = []; // 已经上传完的，或者回显的队列
        this.queueDelete = [];// 删除的队列
        files.forEach(function (file) {
            if ('browse' === type) {
                that.addFileBrowse(file);
            } else {
                that.addFileStored(file);
            }
        });
    };
    jingoal.ui.FileFinder.prototype.addFileBrowse = function (file) {
        var item = new FileItem(file, 'browse', this);
        this.el.appendChild(item.output());
    };
    jingoal.ui.FileFinder.prototype.addFileUpload = function (file) {
        ecui.findControl(this.el).show();
        var item = new FileItem(file, 'upload', this);
        this.queueUpload.push(item);
        this.el.appendChild(item.output());
    };
    jingoal.ui.FileFinder.prototype.getFileUpload = function (uuid) {
        var result = null;
        this.queueUpload.forEach(function (file) {
            if (file.file.uuid === uuid) {
                result = file;
            }
        });
        return result;
    };
    jingoal.ui.FileFinder.prototype.addFileStored = function (file) {
        var item = new FileItem(file, 'store', this);
        this.queueStored.push(item);
        this.el.appendChild(item.output());
    };
    jingoal.ui.FileFinder.prototype.addFileDelete = function (item) {
        if (item.type === 'upload') {
            ecui.util.remove(this.queueUpload, item);
            if (this.queueUpload.length === 0) {
                //ecui.findControl(this.el).hide();
            }
        } else {
            // store
            ecui.util.remove(this.queueStored, item);
            this.queueDelete.push(item);
        }
        ecui.findControl(item.dom).dispose();
        item.dom.parentNode.removeChild(item.dom);
        item = null;
    };
    jingoal.ui.FileFinder.prototype.getFileResult = function () {
        var result = {'upload': [], 'delete': []};
        this.queueUpload.forEach(function (item) {
            result.upload.push({
                name: item.file.name,
                size: item.file.size,
                fsid: item.file.fsid,
                token: item.file.token
            });
        });
        this.queueDelete.forEach(function (item) {
            result.delete.push({
                name: item.file.name,
                size: item.file.size,
                fsid: item.file.fsid,
                rid: item.file.rid
            });
        });
        return result;
    };
    /*jingoal.ui.FileFinder.prototype.getFileResult = function () {
    };*/
}());
ecui.ext.popup = function (control, value) {
    value = value.split(',');
    var over = value.indexOf('over') >= 0;

    ecui.delegate(value[0], control, function (target) {
        target.onhide = function () {
            if (ecui.ext.popup.type === 'click') {
                ecui.restore();
            }
            if (target.control) {
                target.control.alterClass('-hover');
            }
            ecui.ext.popup.type = null;
            ecui.ext.popup.owner = null;
        };

        this.onmouseover = function () {
            if (!ecui.isTouch()) {
                if (over && !ecui.ext.popup.type) {
                    ecui.ext.popup.type = 'over';
                    this.showPopup();
                } else if (ecui.ext.popup.type) {
                    return false;
                }
            }
        };
        this.onmouseout = function () {
            if (ecui.ext.popup.type === 'over') {
                target.hide();
            } else if (ecui.ext.popup.type) {
                return false;
            }
        };
        this.onclick = function (event) {
            if (!ecui.ext.popup.type) {
                target.control = this;
                this.alterClass('+hover');
                ecui.ext.popup.type = 'click';
                this.showPopup();
                ecui.intercept(this);
            }
            event.exit();
        };
        this.onintercept = function (event) {
            var control = ecui.findControl(event.target);
            if (!target.contain(control)) {
                target.hide();
                if (this.contain(control)) {
                    event.stopPropagation();
                }
            }
            return false;
        };
        this.showPopup = function () {
            target.getOuter().style.position = 'absolute';
            target.$setParent(this);
            target.getOuter().style.visibility = 'hidden';

            ecui.ext.popup.owner = target;
            var oThis = this;

            if (!target.resetPosition) {
                target.resetPosition = function () {
                    var el = oThis.getOuter(),
                        pos = ecui.dom.getPosition(el),
                        width = target.getWidth(),
                        elWidth = el.offsetWidth,
                        mainLeft = ecui.dom.getPosition(ecui.get('apps').getBody()).left,
                        controlX = Math.min(Math.max(pos.left + (elWidth - width) / 2, mainLeft + 10), mainLeft + ecui.get('apps').getMain().offsetWidth - width - 10);

                    target.setPosition(controlX, 48);
                    target.show();

                    el = ecui.dom.first(target.getBody());
                    if (el && el.tagName === 'I') {
                        el.style.left = (pos.left + elWidth / 2 - controlX - el.offsetWidth / 2) + 'px';
                        el.style.top = -el.offsetHeight + 'px';
                    }
                };
            }
            target.resetPosition();
            target.getOuter().style.visibility = '';
        };
    });
};

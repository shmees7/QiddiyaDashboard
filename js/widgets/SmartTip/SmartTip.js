define("dojo/Evented dojo/_base/declare dojo/_base/lang dojo/dom-geometry dojo/dom-style dijit/_WidgetBase dijit/_TemplatedMixin dojo/text!./templates/SmartTip.html".split(" "), function(e, f, d, g, b, h, k, l) {
    return f("SmartTip", [h, k, e], {
        declaredClass: "esri.widgets.SmartTip",
        templateString: l,
        hidden: !0,
        options: {
            view: null,
            point: null,
            mapPoint: null,
            info: {}
        },
        constructor: function(a, b) {
            d.mixin(this.options, a);
            this.domNode = b
        },
        postCreate: function() {
            this.inherited(arguments)
        },
        startup: function() {
            this.inherited(arguments);
            this.view.watch("extent", d.hitch(this, this._updateExtent));
            this.update(this.options)
        },
        destroy: function() {
            this.view = null;
            this.inherited(arguments)
        },
        clear: function() {},
        update: function(a) {
            a ? (this.hidden = !1, this.options.point = a.point, this.options.mapPoint = a.mapPoint, this.options.info = a.info, this._updateTip(), setTimeout(d.hitch(this, this._updatePosition), 900)) : this._hideTip()
        },
        _updateTip: function() {
            var a = this.options.info;
            if (a) {
                var c = a.row1.toUpperCase() + "<br/>",
                    c = c + ("<span class='white'>" + a.row2 + "&nbsp;&nbsp;" +
                        a.row3 + "</span><br/>");
                a.tag && (c += "<div class='tag' style='background-color:rgb(" + a.color.join() + ")'>" + a.tag + "</div>");
                this.infoNode.innerHTML = c;
                a.value ? (b.set(this.image, "display", "block"), this.image.src = "http://coolmaps.esri.com/Dashboards/VisionZero/proxy.php?" + a.value, this._startCamera()) : (b.set(this.image, "display", "none"), this._stopCamera())
            }
        },
        _updatePosition: function() {
            if (this.options.point) {
                g.position(this.domNode);
                var a = this.view.toScreen(this.options.mapPoint);
                var c = a.x;
                a = a.y;
                b.set(this.domNode, "left", c + "px");
                b.set(this.domNode, "top",
                    a + "px")
            } else this._hideTip()
        },
        _startCamera: function() {
            this._stopCamera();
            this.timer = setInterval(d.hitch(this, this._updateCamera), 1E3)
        },
        _stopCamera: function() {
            this.timer && (clearInterval(this.timer), this.timer = null)
        },
        _updateCamera: function() {
            this.options.info.value && !this.hidden && (this.image.src = "http://coolmaps.esri.com/Dashboards/VisionZero/proxy.php?" + this.options.info.value + "?rand=" + Math.random())
        },
        _updateExtent: function() {
            if (!this.options.point || this.hidden) this._hideTip();
            else {
                var a = this.view.toScreen(this.options.mapPoint);
                b.set(this.domNode,
                    "left", a.x + "px");
                b.set(this.domNode, "top", a.y + "px")
            }
        },
        _hideTip: function() {
            this.hidden = !0;
            this._stopCamera();
            b.set(this.containerNode, "display", "block");
            b.set(this.domNode, "left", "-400px")
        }
    })
});
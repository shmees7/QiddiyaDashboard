define("dojo/Evented dojo/_base/array dojo/_base/declare dojo/_base/lang dojo/dom dojo/dom-class dojo/dom-construct dojo/dom-style dojo/on dijit/_WidgetBase dijit/_WidgetsInTemplateMixin dijit/_TemplatedMixin dojo/text!./templates/Card.html".split(" "), function(p, m, q, g, r, b, e, h, n, t, u, v, w) {
    return q("Card", [t, v, u, p], {
        declaredClass: "esri.widgets.Card",
        templateString: w,
        options: {},
        id: null,
        label: "",
        sublabel: "",
        icon: "",
        color: "#6e6e6e",
        maximized: !1,
        features: [],
        constructor: function(a) {
            this.id = a.id;
            this.label =
                a.label;
            this.sublabel = a.sublabel;
            this.icon = a.icon;
            this.color = a.color
        },
        postCreate: function() {
            this.inherited(arguments)
        },
        startup: function() {},
        destroy: function() {},
        toggle: function() {
            var a = {
                id: this.id,
                action: "maximize",
                manual: !0
            };
            b.contains(this.cardNode, "maximized") && (a.action = "resize");
            this.emit("toggle", a)
        },
        maximize: function() {
            this.maximized = !0;
            b.add(this.cardNode, "maximized")
        },
        minimize: function() {
            this.maximized = !1;
            b.add(this.cardNode, "minimized")
        },
        resize: function() {
            this.maximized = !1;
            b.remove(this.cardNode,
                "maximized");
            b.remove(this.cardNode, "minimized")
        },
        unselect: function() {
            for (var a = 0; a < this.features.length; a++) b.remove(this.id + "_col_" + a, "selected")
        },
        select: function(a) {
            this.unselect();
            b.add(this.id + "_col_" + a, "selected")
        },
        update: function(a) {
            this.summaryNode.innerHTML = a.value;
            a.label && (this.sublabelNode.innerHTML = a.label);
            a.icon && h.set(this.iconNode, "background-image", "url(" + a.icon + ")");
            this.features = a.features;
            this._updateDetails()
        },
        _updateDetails: function() {
            var a = this.infoNode;
            e.empty(a);
            h.set(a,
                "width", 300 * this.features.length + "px");
            m.forEach(this.features, g.hitch(this, function(x, k) {
                var d = x.attributes.info,
                    c = d.row1.toUpperCase(),
                    f = e.create("div", {
                        id: this.id + "_col_" + k
                    }, a);
                b.add(f, "col");
                c = e.create("div", {
                    innerHTML: c
                }, f);
                b.add(c, "row1");
                c = e.create("div", {
                    innerHTML: d.row2
                }, f);
                b.add(c, "row2");
                c = e.create("div", {
                    innerHTML: d.row3
                }, f);
                b.add(c, "row3");
                c = "url(" + this.icon + ")";
                "WEATHER" === this.label && (c = "url(" + d.icon + ")");
                var l = e.create("div", {}, f);
                b.add(l, "image");
                h.set(l, "background-image", c);
                n(l,
                    "click", g.hitch(this, this._click, k));
                "CAMERAS" === this.label && (c = e.create("img", {
                    id: "cam_" + k,
                    src: d.icon
                }, f), b.add(c, "camera"), n(c, "click", g.hitch(this, this._click, k)));
                d.tag && (c = e.create("div", {
                    innerHTML: d.tag
                }, f), b.add(c, "tag"), d.color && (d = "rgb(" + d.color.join() + ")", h.set(c, "background-color", d)));
                "WEATHER" !== this.label && (d = e.create("div", {}, f), b.add(d, "pulse"), f = e.create("div", {}, f), b.add(f, "eye"))
            }))
        },
        _startCams: function() {
            this.timer && (clearInterval(this.timer), this.timer = null);
            this.timer = setInterval(g.hitch(this,
                this._updateCams), 3E3)
        },
        _updateCams: function() {
            "CAMERAS" === this.label && this.maximized && m.forEach(this.features.length, function(a, b) {
                var e = a.attributes.info.value;
                r.byId("cam_" + b).src = e + "?rand=" + Math.random()
            })
        },
        _click: function(a) {
            this.emit("select", {
                id: this.id,
                action: "select",
                manual: !0,
                label: this.label,
                index: a,
                feature: this.features[a]
            })
        }
    })
});
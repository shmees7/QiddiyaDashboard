define(["dojo/_base/lang", "dojo/_base/array", "esri/core/declare", "esri/geometry/SpatialReference", "esri/views/3d/externalRenderers"], function(l, m, k, n, g) {
    var b = window.THREE;
    return k([], {
        constructor: function(a, c) {
            this.view = a;
            this.routes = c;
            this.origin = [0, 0, 0];
            var h = [0, 0, 0];
            g.toRenderCoordinates(a, h, 0, n.WGS84, this.origin, 0, 1);
            var e = new b.Matrix4;
            e.fromArray(g.renderCoordinateTransformAt(this.view, h, a.spatialReference, Array(16)));
            this.rotation = new b.Matrix4;
            this.rotation.extractRotation(e);
            this.counter =
                0
        },
        setup: function(a) {
            this.renderer = new b.WebGLRenderer({
                context: a.gl,
                premultipliedAlpha: !1
            });
            this.renderer.autoClearDepth = !1;
            this.renderer.autoClearColor = !1;
            this.renderer.autoClearStencil = !1;
            this.scene = new b.Scene;
            this.camera = new b.PerspectiveCamera;
            this._createLights();
            this._createObjects();
            a.resetWebGLState()
        },
        render: function(a) {
            this.renderer.resetGLState();
            this._animate();
            this._updateCamera(a);
            this._updateLights(a);
            this.renderer.render(this.scene, this.camera);
            g.requestRender(this.view);
            this.renderer.resetGLState()
        },
        dispose: function() {
            this._clearScene()
        },
        _clearScene: function() {
            for (var a = this.scene.children.length - 1; 0 <= a; a--) this.scene.remove(this.scene.children[a])
        },
        _createObjects: function() {
            this._clearScene();
            var a = new b.Vector3(this.origin[0], this.origin[1], this.origin[2]);
            this.curves = [];
            this.curvesInfo = [];
            m.forEach(this.routes, l.hitch(this, function(c, h) {
                var e = [],
                    d = c.attributes;
                m.forEach(c.geometry.paths[0], l.hitch(this, function(c, h) {
                    var d = [0, 0, 0];
                    g.toRenderCoordinates(this.view, [c[0], c[1], 6], 0, this.view.spatialReference,
                        d, 0, 1);
                    d = new b.Vector3(d[0], d[1], d[2]);
                    d.sub(a);
                    e.push(d)
                }));
                var f = new b.SplineCurve3(e);
                this.curves.push(f);
                d = {
                    speed: this._getSpeed(d.value),
                    counter: 0
                };
                this.curvesInfo.push(d);
                f = f.getPointAt(.2);
                d = new b.Geometry;
                d.vertices.push(new b.Vector3(0, 0, 0));
                var k = new b.PointsMaterial({
                        size: 6,
                        sizeAttenuation: !1
                    }),
                    d = new b.Points(d, k);
                d.position.set(f.x, f.y, f.z);
                this.scene.add(d)
            }))
        },
        _getSpeed: function(a) {
            var c = 8E-4;
            20 <= a ? c = .002 : 35 <= a ? c = .01 : 50 <= a && (c = .02);
            return c
        },
        _createLights: function() {
            this.directionalLight =
                new b.DirectionalLight;
            this.scene.add(this.directionalLight);
            this.ambientLight = new b.AmbientLight;
            this.scene.add(this.ambientLight)
        },
        _animate: function() {
            for (var a = 0; a < this.scene.children.length; a++) {
                var c = this.scene.children[a],
                    b = this.curves[a],
                    e = this.curvesInfo[a];
                e.counter += e.speed;
                1 < e.counter && (e.counter = 0);
                b = b.getPointAt(e.counter);
                c.position.set(b.x, b.y, b.z)
            }
        },
        _updateCamera: function(a) {
            a = a.camera;
            this.camera.projectionMatrix.fromArray(a.projectionMatrix);
            var c = this.origin;
            this.camera.position.set(a.eye[0] -
                c[0], a.eye[1] - c[1], a.eye[2] - c[2]);
            this.camera.up.set(a.up[0], a.up[1], a.up[2]);
            this.camera.lookAt(new b.Vector3(a.center[0] - c[0], a.center[1] - c[1], a.center[2] - c[2]))
        },
        _updateLights: function(a) {
            var c = a.sunLight.direction,
                b = a.sunLight.diffuse;
            this.directionalLight.color.setRGB(b.color[0], b.color[1], b.color[2]);
            this.directionalLight.intensity = b.intensity;
            this.directionalLight.position.set(c[0], c[1], c[2]);
            a = a.sunLight.ambient;
            this.ambientLight.color.setRGB(a.color[0], a.color[1], a.color[2]);
            this.ambientLight.intensity =
                a.intensity
        }
    })
});
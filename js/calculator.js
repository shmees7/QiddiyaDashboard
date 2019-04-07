define(["dojo/_base/array", "dojo/_base/declare"], function(m, t) {
    return t(null, {
        spatialReference: null,
        distance: 10,
        rows: 256,
        cols: 256,
        xmin: -180,
        xmax: 180,
        ymin: -90,
        ymax: 90,
        radius: 10,
        dateField: null,
        features: null,
        indices: null,
        vertices: null,
        data: null,
        constructor: function(a) {
            this.spatialReference = a.spatialReference;
            this.dateField = a.dateField
        },
        processData: function(a) {
            this.distance = a.distance || 10;
            this.xmin = a.extent.xmin;
            this.ymin = a.extent.ymin;
            this.xmax = a.extent.xmax;
            this.ymax = a.extent.ymax;
            this.cols = this.rows =
                Math.max(Math.ceil((this.xmax - this.xmin) / this.distance), Math.ceil((this.ymax - this.ymin) / this.distance));
            this.features = a.features;
            a = this._generateIndices();
            var b = this._generateVertices(),
                c = this._calcHeatmap();
            return {
                indices: a,
                vertices: b,
                data: c
            }
        },
        _generateIndices: function() {
            for (var a = [], b = 0; b < this.rows - 1; b++)
                for (var c = 0; c < this.cols - 1; c++) {
                    var g = b + 1,
                        h = c + 1,
                        e = b * this.cols + h,
                        f = g * this.cols + c;
                    a.push(b * this.cols + c, f, e, e, f, g * this.cols + h)
                }
            return a
        },
        _generateVertices: function() {
            for (var a = [], b = (this.xmax - this.xmin) /
                    (this.cols - 1), c = (this.ymax - this.ymin) / (this.rows - 1), g = this.ymax, h = 0; h < this.rows; h++) {
                for (var e = this.xmin, f = 0; f < this.cols; f++) a.push(e, g, 20), e += b;
                g -= c
            }
            return a
        },
        _calcHeatmap: function() {
            if (this.features) {
                for (var a = this.dateField, b = [], c = 0, c = 0; 12 > c; c++) {
                    var g = m.filter(this.features, function(b) {
                            b = (new Date(b.attributes[a])).getMonth();
                            return c === b
                        }),
                        g = this._calcMatrix(g);
                    b.push(g)
                }
                var h = 0;
                m.forEach(b, function(a) {
                    for (var b = 0; b < a.length; b++) a[b] > h && (h = a[b])
                });
                for (c = 0; c < b.length; c++) this._normalizeMatrix(b[c],
                    h);
                return b
            }
        },
        _calcMatrix: function(a) {
            var b = this.radius,
                c = this.rows * this.cols,
                g = this.rows - 1,
                h = this.cols - 1,
                e = this.xmax - this.xmin,
                f = this.ymax - this.ymin,
                q = a.length,
                d, m = new Float32Array(q),
                u = new Float32Array(q);
            for (d = 0; d < q; d++) {
                var k = a[d].geometry;
                m[d] = Math.floor(this.cols * (k.x - this.xmin) / e);
                u[d] = this.rows - Math.floor(this.rows * (k.y - this.ymin) / f)
            }
            a = Math.round(2 * b);
            e = -2 * b * b;
            f = b / (2 * Math.sqrt(2 * Math.PI));
            k = 2 * a + 1;
            b = new Float32Array(k);
            for (d = 0; d < k; d++) {
                var l = d - a;
                b[d] = Math.exp(l * l / e) * f
            }
            c = new Float32Array(c);
            for (d = 0; d < q; d++)
                for (var r = u[d], l = m[d], e = l - a, f = r - a, k = Math.max(0, e), l = Math.min(h, l + a), r = Math.min(g, r + a), n = Math.max(0, f); n <= r; n++)
                    for (var t = b[n - f], p = k; p <= l; p++) c[n * this.cols + p] += 1 * t * b[p - e];
            return c
        },
        _normalizeMatrix: function(a, b) {
            for (var c = 0; c < a.length; c++) a[c] = Math.min(b, a[c]) / b
        }
    })
});
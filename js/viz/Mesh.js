define(["dojo/Evented", "dojo/_base/Color", "esri/core/declare", "esri/geometry/SpatialReference", "esri/views/3d/externalRenderers"], function(g, h, k, l, e) {
    return k([g], {
        declaredClass: "esri.viz.Mesh",
        view: null,
        height: 500,
        vertices: null,
        indices: null,
        data: null,
        arrMult: null,
        arrColorStart: [1, 0, 0],
        arrColorEnd: [1, 1, 0],
        slice: 0,
        counter: 0,
        constructor: function(a, b) {
            this.view = a;
            this.height = b.height || 500;
            this.arrColorStart = this.normalizeColor(b.color1);
            this.arrColorEnd = this.normalizeColor(b.color2);
            this.indices = b.indices;
            this.vertices = b.vertices;
            this.length = b.vertices.length;
            this.data = b.data;
            this.arrPosition = new Float32Array(3 * this.length);
            this.arrMult = new Float32Array(this.length)
        },
        setup: function(a) {
            try {
                this.initShaders(a)
            } finally {
                a.resetWebGLState()
            }
        },
        dispose: function() {
            this.view = null
        },
        initShaders: function(a) {
            a = a.gl;
            var b = a.createShader(a.VERTEX_SHADER),
                c = a.createShader(a.FRAGMENT_SHADER);
            a.shaderSource(b, "uniform mat4 uPMatrix;uniform mat4 uVMatrix;attribute vec3 aPosition;attribute float aMult;varying float vMult;void main(void) {vMult = clamp(aMult*5.0,0.0,1.0);gl_Position = uPMatrix * uVMatrix * vec4(aPosition, 1.0);}");
            a.shaderSource(c, "precision mediump float;uniform vec3 uColorStart;uniform vec3 uColorEnd;varying float vMult;void main(void) {gl_FragColor = vMult * vec4(uColorStart, 1.0);}");
            a.compileShader(b);
            a.getShaderParameter(b, a.COMPILE_STATUS) ? (a.compileShader(c), a.getShaderParameter(c, a.COMPILE_STATUS) ? (this.program = a.createProgram(), a.attachShader(this.program, b), a.attachShader(this.program, c), a.linkProgram(this.program), a.getProgramParameter(this.program, a.LINK_STATUS) ? (this.pMatrixUniform = a.getUniformLocation(this.program,
                "uPMatrix"), this.vMatrixUniform = a.getUniformLocation(this.program, "uVMatrix"), this.aPosition = a.getAttribLocation(this.program, "aPosition"), this.uColorStart = a.getUniformLocation(this.program, "uColorStart"), this.uColorEnd = a.getUniformLocation(this.program, "uColorEnd"), this.uMax = a.getUniformLocation(this.program, "uMax"), this.aMult = a.getAttribLocation(this.program, "aMult"), this.bufPosition = a.createBuffer(), this.bufMult = a.createBuffer(), this.bufIndex = a.createBuffer(), a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,
                this.bufIndex), a.bufferData(a.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), a.STATIC_DRAW)) : alert(a.getShaderInfoLog(this.program))) : alert(a.getShaderInfoLog(c))) : alert(a.getShaderInfoLog(b))
        },
        render: function(a) {
            this.calcHeatmap();
            var b = a.gl;
            b.useProgram(this.program);
            b.enable(b.DEPTH_TEST);
            b.enable(b.CULL_FACE);
            b.enable(b.BLEND);
            b.blendFuncSeparate(b.SRC_ALPHA, b.ONE_MINUS_SRC_ALPHA, b.ONE, b.ONE_MINUS_SRC_ALPHA);
            var c = a.camera;
            b.uniformMatrix4fv(this.pMatrixUniform, !1, c.projectionMatrix);
            b.uniformMatrix4fv(this.vMatrixUniform, !1, c.viewMatrix);
            e.toRenderCoordinates(this.view, this.vertices, 0, l.WebMercator, this.arrPosition, 0, this.length);
            this.draw(b);
            e.requestRender(this.view);
            a.resetWebGLState();
            b.blendFuncSeparate(b.SRC_ALPHA, b.ONE_MINUS_SRC_ALPHA, b.ONE, b.ONE_MINUS_SRC_ALPHA);
            b.enable(b.DEPTH_TEST)
        },
        draw: function(a) {
            a.uniform3fv(this.uColorStart, new Float32Array(this.arrColorStart));
            a.uniform3fv(this.uColorEnd, new Float32Array(this.arrColorEnd));
            a.uniform1f(this.uMax, this.max);
            a.bindBuffer(a.ARRAY_BUFFER, this.bufPosition);
            a.bufferData(a.ARRAY_BUFFER, this.arrPosition, a.STATIC_DRAW);
            a.vertexAttribPointer(this.aPosition, 3, a.FLOAT, !1, 0, 0);
            a.enableVertexAttribArray(this.aPosition);
            a.bindBuffer(a.ARRAY_BUFFER, this.bufMult);
            a.bufferData(a.ARRAY_BUFFER, this.arrMult, a.STATIC_DRAW);
            a.vertexAttribPointer(this.aMult, 1, a.FLOAT, !1, 0, 0);
            a.enableVertexAttribArray(this.aMult);
            a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this.bufIndex);
            a.drawElements(a.LINES, this.indices.length, a.UNSIGNED_SHORT, 0)
        },
        normalizeColor: function(a) {
            a = (new h(a)).toRgb();
            return [a[0] / 255, a[1] / 255, a[2] / 255]
        },
        calcHeatmap: function() {
            this.counter += .005;
            1 <= this.counter && (this.counter = .005, this.slice += 1, 12 <= this.slice && (this.slice = 0));
            .005 === this.counter && this.emit("update", {
                slice: this.slice
            });
            var a = this.data[this.slice],
                b;
            b = 0 < this.slice ? this.data[this.slice - 1] : this.data[11];
            for (var c = new Float32Array(a.length), d = 0; d < a.length; d++) {
                var f = 3 * d + 2,
                    e = 0;
                b && (e = this.height * b[d]);
                this.vertices[f] += (this.height * a[d] - e) / 200;
                c[d] = this.vertices[f] / this.height
            }
            this.arrMult = c
        }
    })
});
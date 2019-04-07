//Globals
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/dom",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/on",
    "dojo/promise/all",
    "dojo/request/xhr",
    "dijit/registry",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/geometry/support/webMercatorUtils",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/layers/FeatureLayer",
    "esri/widgets/Legend",
    "esri/widgets/Expand",
    "esri/widgets/AreaMeasurement3D",
    "esri/widgets/DirectLineMeasurement3D",
    "esri/widgets/Sketch",
    "esri/widgets/Slice",
    "esri/widgets/Bookmarks",
    "esri/widgets/CoordinateConversion",
    "esri/widgets/Directions",
    "esri/renderers/smartMapping/creators/color",
    "esri/widgets/ColorSlider",
    "esri/core/lang",
    "esri/layers/SceneLayer",
    "esri/layers/TileLayer",
    "esri/Map",
    "esri/renderers/SimpleRenderer",
    "esri/renderers/ClassBreaksRenderer",
    "esri/symbols/FillSymbol3DLayer",
    "esri/symbols/IconSymbol3DLayer",
    "esri/symbols/MeshSymbol3D",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/PointSymbol3D",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/views/SceneView",
    "esri/views/3d/externalRenderers",
    "esri/widgets/Home",
    "esri/widgets/BasemapGallery",
    "esri/widgets/LayerList",
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "esri/tasks/support/StatisticDefinition",
    "esri/geometry/SpatialReference",
    "esri/tasks/GeometryService",
    "esri/tasks/support/ProjectParameters",
    "esri/core/watchUtils",
    "esri/PopupTemplate",
    "widgets/Card/Card",
    "widgets/SmartTip/SmartTip",
    "effects/Ring",
    "effects/Traffic",
    "application/calculator",
    "dojo/domReady!"],
    function (z, f, e, u, h, k, g, p, A, v, q, r, w, t, m, x
        , FeatureLayer, Legend, Expand, AreaMeasurement3D, DirectLineMeasurement3D, Sketch, Slice, Bookmarks
        , CoordinateConversion, Directions, colorRendererCreator, ColorSlider, lang
        , B, C, D, E, ClassBreaksRenderer, F, O, G, H, P, y, Q, I, n
        , Home, BasemapGallery, LayerList, QueryTask, Query, StatisticDefinition, SpatialReference, GeometryService, ProjectParameters
        , watchUtils, PopupTemplate, J, K, L, M, Calculator) {
        return z(null, {
            config: {},
            index: 0,
            loopIndex: -1,
            hiColor: "#ffffff",
            buildingsColors: {},
            edgeStyle: null,
            startup: function (a) {
                var b;
                a ? (this.config = a, this._initApp()) : (a = Error("Main:: Config is not defined"), this.reportError(a), b = new u, b.reject(a), b = b.promise);
                return b
            },
            reportError: function (a) {
                k.remove(document.body, "app-loading");
                k.add(document.body, "app-error");
                var b = h.byId("loading_message");
                b && (b.innerHTML = "Unable to create map: " + a.message);
                return a
            },
            cookie_read: function (name) {
                var cookies = document.cookie.split(';')
                for (var i = 0; i < cookies.length; i++) {
                    var c = cookies[i].replace(/^\s+/, '')
                    if (c.indexOf(name + '=') == 0) {
                        return decodeURIComponent(c.substring(name.length + 1).split('+').join(' '))
                    }
                }
                return null;
            },
            cookie_write: function (name, value, ms) {
                // write cookie
                var date = new Date()
                date.setTime(date.getTime() + ms)
                document.cookie = name + "=" + encodeURIComponent(value) + (ms ? ";expires=" + date.toGMTString() : '') + ";path=/"
            },
            cookie_delete: function (name) {
                this.cookie_write(name, '', -1);
            },
            _initApp: function () {
                this._initColors();
                this._initMap()
            },
            _initMap: function () {
                this.map = new D;
                this.baseLayer = new C(this.config.basemapUrl);
                this.map.add(this.baseLayer);
                var a = new G({
                    symbolLayers: [new F({
                        material: {
                            color: this.config.buildingsColor
                        }
                    })]
                }),
                    a = new E({
                        symbol: a
                    });
                this.lyrBuildings = new B({
                    portalItem: {
                        id: "4ac2a674fdb54bb79471abe8368fd7d4"
                    },
                    outFields: ['*'],
                    popupTemplate: new PopupTemplate({
                        title: "{NAME}",
                        content: [{
                            type: "fields",
                            fieldInfos: [
                                {
                                    fieldName: "CNSTRCT_YR",
                                    label: "Construction year"
                                }, {
                                    fieldName: "HEIGHTROOF",
                                    label: "Height (ft)"
                                }, {
                                    fieldName: "NUM_FLOORS",
                                    label: "Floors"
                                }]
                        }],
                        fieldInfos: [
                            {
                                fieldName: "HEIGHTROOF",
                                format: {
                                    digitSeparator: true,
                                    places: 2
                                }
                            }, {
                                fieldName: "NUM_FLOORS",
                                format: {
                                    digitSeparator: true,
                                    places: 0
                                }
                            }]
                    }),
                    //definitionExpression: "CNSTRCT_YR> 2000",
                    title: "Buildings",
                    renderer: this._getBuildingSceneRendererByOccupancy()
                });
                this.lyrBuildings.opacity = 1;
                this.map.add(this.lyrBuildings);

                this.lyrTraffic = new x({
                    title: "Traffic Layer",
                });
                this.lyrTraffic.opacity = .4;
                this.map.add(this.lyrTraffic);

                this.lyrData = new x({
                    title: "Operations Layer",
                });
                this.map.add(this.lyrData);
                this._create3DView()
            },
            _initColors() {
                var me = this;
                me.buildingsColors = JSON.parse(JSON.stringify(me.config.buildingsColors));
                var savedcolors = this.cookie_read("dashboardColors");
                if (savedcolors && savedcolors.length)
                    me.buildingsColors = JSON.parse(savedcolors);

                document.getElementById("under_construction").value = me.buildingsColors.under_construction;
                document.getElementById("semi_occupied").value = me.buildingsColors.semi_occupied;
                document.getElementById("not_occupied").value = me.buildingsColors.not_occupied;
                document.getElementById("fully_occupied").value = me.buildingsColors.fully_occupied;
                document.getElementById("others").value = me.buildingsColors.others;


                document.getElementById("applySettingsBtn").addEventListener("click",
                    function () {
                        me.buildingsColors["under_construction"] = document.getElementById("under_construction").value;
                        me.buildingsColors["semi_occupied"] = document.getElementById("semi_occupied").value;
                        me.buildingsColors["not_occupied"] = document.getElementById("not_occupied").value;
                        me.buildingsColors["fully_occupied"] = document.getElementById("fully_occupied").value;
                        me.buildingsColors["others"] = document.getElementById("others").value;

                        me.cookie_write("dashboardColors", JSON.stringify(me.buildingsColors), (10 * 365 * 24 * 60 * 60));
                        me.lyrBuildings.renderer = me._getBuildingSceneRendererByOccupancy();
                    });

                document.getElementById("resetSettingsBtn").addEventListener("click",
                    function () {
                        me.buildingsColors = JSON.parse(JSON.stringify(me.config.buildingsColors));
                        me.cookie_delete("dashboardColors");

                        document.getElementById("under_construction").value = me.buildingsColors.under_construction;
                        document.getElementById("semi_occupied").value = me.buildingsColors.semi_occupied;
                        document.getElementById("not_occupied").value = me.buildingsColors.not_occupied;
                        document.getElementById("fully_occupied").value = me.buildingsColors.fully_occupied;
                        document.getElementById("others").value = me.buildingsColors.others;

                        me.lyrBuildings.renderer = me._getBuildingSceneRendererByOccupancy();
                    });
            },
            _create3DView: function () {
                this.view3D =
                    new I({
                        container: "panelView",
                        map: this.map,
                        camera: {
                            position: this.config.center,
                            tilt: this.config.tilt,
                            heading: this.config.heading
                        },
                        padding: {
                            bottom: 180
                        },
                        constraints: {
                            tilt: {
                                max: 70,
                                mode: "manual"
                            }
                        },
                        highlightOptions: {
                            color: [255, 255, 0, 1],
                            fillOpacity: .4
                        },
                        popup: {
                            dockEnabled: !0,
                            dockOptions: {
                                buttonEnabled: !1,
                                breakpoint: !1
                            },
                            actions: []
                        },
                        environment: {
                            lighting: {
                                ambientOcclusionEnabled: !1,
                                directShadowsEnabled: !1
                            }
                        }
                    });

                this.view3D.when(e.hitch(this, function () {
                    // allow navigation above and below the ground
                    this.map.ground.navigationConstraint = {
                        type: "none"
                    };
                    // the webscene has no basemap, so set a surfaceColor on the ground
                    this.map.ground.surfaceColor = "#fff";
                    // to see through the ground, set the ground opacity to 0.4
                    this.map.ground.opacity = 0.4;
                }));

                this.view3D.when(e.hitch(this, function () {
                    // allow navigation above and below the ground
                    this.map.ground.navigationConstraint = {
                        type: "none"
                    };
                    this.view3D.ui.components = ["attribution", "navigation-toggle", "compass", "zoom"];


                    var homeWidget = new Home({
                        view: this.view3D
                    });
                    this.view3D.ui.add(homeWidget, "top-left");

                    var expandWidgets = [];

                    this.legend = new Legend({
                        view: this.view3D,
                        layerInfos: [{
                            layer: this.lyrBuildings,
                            title: "Legend"
                        }]
                    });
                    expandWidgets.push(
                        new Expand({
                            view: this.view3D,
                            content: this.legend,
                            expandIconClass: "esri-icon-layer-list",
                            expandTooltip: "Legend",
                            group: "top-right"
                        })
                    );

                    var layerList = new LayerList({
                        view: this.view3D
                    });
                    expandWidgets.push(
                        new Expand({
                            view: this.view3D,
                            content: layerList,
                            expandIconClass: "esri-icon-layers",
                            expandTooltip: "Layers List",
                            group: "top-right"
                        })
                    );

                    var basemapGallery = new BasemapGallery({
                        view: this.view3D
                    });
                    expandWidgets.push(
                        new Expand({
                            view: this.view3D,
                            content: basemapGallery,
                            expandIconClass: "esri-icon-basemap",
                            expandTooltip: "Basemap Gallery",
                            group: "top-right"
                        })
                    );
                    /*
                        const bookmarks = new Bookmarks({
                            view: this.view3D
                        });
                        expandWidgets.push(
                            new Expand({
                                view: this.view3D,
                                content: bookmarks,
                                expandIconClass: "esri-icon-bookmark",
                                expandTooltip: "Bookmarks",
                                group: "top-right"
                            })
                        );
                    */
                    var ccWidget = new CoordinateConversion({
                        view: this.view3D
                    });
                    expandWidgets.push(
                        new Expand({
                            view: this.view3D,
                            content: ccWidget,
                            expandIconClass: "esri-icon-up-down-arrows",
                            expandTooltip: "Coordinate Conversion",
                            group: "top-right"
                        })
                    );

                    var directionsWidget = new Directions({
                        view: this.view3D
                    });
                    expandWidgets.push(
                        new Expand({
                            view: this.view3D,
                            content: directionsWidget,
                            expandIconClass: "esri-icon-directions",
                            expandTooltip: "Directions",
                            group: "top-right"
                        })
                    );

                    //Measure
                    expandWidgets.push(this._setupMeasureWidget());

                    // Add a toggle button for the buildings edges
                    expandWidgets.push(this._setEdgeToggle());

                    //Toggle Renderer widget
                    expandWidgets.push(this._setupRenderersWidget());
                    /*
                        //sketch
                        const graphiclayer = new x();
                        this.map.add(graphiclayer);
                        const sketch = new Sketch({
                            layer: graphiclayer,
                            view: this.view3D
                        });

                        expandWidgets.push(
                            new Expand({
                                view: this.view3D,
                                content: sketch,
                                expandIconClass: "esri-icon-edit",
                                expandTooltip: "Sketch",
                                group: "top-right"
                            })
                        );
                    */
                    var sliceWidget = new Slice({
                        view: this.view3D
                    });
                    expandWidgets.push(
                        new Expand({
                            view: this.view3D,
                            content: sliceWidget,
                            expandIconClass: "esri-icon-collection",
                            expandTooltip: "Slice Buildings",
                            group: "top-right"
                        })
                    );

                    expandWidgets.push(
                        new Expand({
                            view: this.view3D,
                            content: document.getElementById("color_container"),
                            expandIconClass: "esri-icon-settings",
                            expandTooltip: "Settings",
                            group: "top-right"
                        })
                    );

                    if (expandWidgets && expandWidgets.length) {
                        this.view3D.ui.add(expandWidgets, "top-right");
                    }

                    this.view3D.environment.atmosphereEnabled = !1;
                    this.view3D.environment.starsEnabled = !1;

                    var view3D = this.view3D;
                    this.view3D.whenLayerView(this.lyrBuildings).then(function (e) {
                        var t, n = Date.now();
                        view3D.on("pointer-move", function (r) {
                            var i = Date.now();
                            i - n > 20 && !view3D.interacting && (n = i,
                                view3D.hitTest({
                                    x: r.x,
                                    y: r.y
                                }).then(function (n) {
                                    var r = n.results[0] ? n.results[0].graphic : null;
                                    r && "Buildings" === r.layer.title ? (t && t.remove(),
                                        t = e.highlight([r.attributes.OBJECTID])) : t && t.remove()
                                }))
                        })
                    })


                    this._initUI()
                }), e.hitch(this, function () {
                    this.reportError(Error("Main:: Unable to create scene"))
                }))
            },
            _setupMeasureWidget: function () {
                var activeWidget = null;
                var view = this.view3D;
                document.getElementById("distanceButton").addEventListener("click",
                    function () {
                        setActiveWidget(null);
                        if (!this.classList.contains('active')) {
                            setActiveWidget('distance');
                        } else {
                            setActiveButton(null);
                        }
                    });

                document.getElementById("areaButton").addEventListener("click",
                    function () {
                        setActiveWidget(null);
                        if (!this.classList.contains('active')) {
                            setActiveWidget('area');
                        } else {
                            setActiveButton(null);
                        }
                    });

                function setActiveWidget(type) {
                    switch (type) {
                        case "distance":
                            activeWidget = new DirectLineMeasurement3D({
                                view: view
                            });

                            // skip the initial 'new measurement' button
                            activeWidget.viewModel.newMeasurement();

                            view.ui.add(activeWidget, "top-right");
                            setActiveButton(document.getElementById('distanceButton'));
                            break;
                        case "area":
                            activeWidget = new AreaMeasurement3D({
                                view: view
                            });

                            // skip the initial 'new measurement' button
                            activeWidget.viewModel.newMeasurement();

                            view.ui.add(activeWidget, "top-right");
                            setActiveButton(document.getElementById('areaButton'));
                            break;
                        case null:
                            if (activeWidget) {
                                view.ui.remove(activeWidget);
                                activeWidget.destroy();
                                activeWidget = null;
                            }
                            break;
                    }
                }

                function setActiveButton(selectedButton) {
                    // focus the view to activate keyboard shortcuts for sketching
                    view.focus();
                    var elements = document.getElementsByClassName("active");
                    for (var i = 0; i < elements.length; i++) {
                        elements[i].classList.remove("active");
                    }
                    if (selectedButton) {
                        selectedButton.classList.add("active");
                    }
                }

                return new Expand({
                    view: this.view3D,
                    content: document.getElementById("measureTools"),
                    expandIconClass: "esri-icon-polygon",
                    expandTooltip: "Measure Tools",
                    group: "top-right"
                })
            },
            _setEdgeToggle: function () {
                // Add a toggle button for the edges
                var me = this;
                document.getElementById("controls").addEventListener("click", function (event) {

                    if (event.target.id === "sketchEdges") {
                        me.edgeStyle = me.config.sketchEdges;
                    }
                    else if (event.target.id === "solidEdges") {
                        me.edgeStyle = me.config.solidEdges;
                    }
                    else if (event.target.id === "noEdges") {
                        me.edgeStyle = null;
                    }
                    if (event.target.checked) {
                        var renderer = me.lyrBuildings.renderer.clone();
                        //renderer.symbol.symbolLayers.getItemAt(0).edges = edges;
                        me.lyrBuildings.renderer = me._getBuildingSceneRendererByOccupancy();
                    }
                });

                return new Expand({
                    view: me.view3D,
                    content: document.getElementById("controls"),
                    expandIconClass: "esri-icon-organization",
                    expandTooltip: "Buildingd Edge",
                    group: "top-right"
                })
            },
            _setupRenderersWidget: function () {
                var me = this;
                document.getElementById("renderers").addEventListener("click", function (event) {
                    if (event.target.id === "buildingOccupancy") {
                        me.lyrBuildings.renderer = me._getBuildingSceneRendererByOccupancy();
                    }
                    else if (event.target.id === "constructionYear") {
                        me.lyrBuildings.renderer = me._getConstructionYearRenderer();
                    }

                });

                return new Expand({
                    view: me.view3D,
                    content: document.getElementById("renderers"),
                    expandIconClass: "esri-icon-feature-layer",
                    expandTooltip: "Toggle Renderer",
                    group: "top-right"
                })
            },
            _initUI: function () {
                this._initControls();
                this._initSmartTip();
                this._updateClock();
                this._initCards();
                k.remove(document.body, "app-loading")

                var me = this;
                me.showCars = true;
                document.getElementById("carsDisplayImg").addEventListener('click', function toggleCars() {
                    if (me.showCars) {
                        me._removeTrafficRenderer();
                        me.showCars = false
                    } else {
                        me._addTrafficRenderer(me.trafficCardData.data.features);
                        me.showCars = true
                    }
                }, false);
            },
            _initControls: function () {
                p(h.byId("btnPlay"), "click", e.hitch(this, this._toggleTimer))
            },
            _initSmartTip: function () {
                this.smartTip = new K({
                    view: this.view3D,
                    point: null,
                    mapPoint: null,
                    info: null
                }, h.byId("panelSmartTip"));
                this.smartTip.startup()
            },
            _updateClock: function () {
                var a = new Date,
                    b = this.config.months[a.getMonth()].substring(0, 3).toUpperCase(),
                    c = a.getDate(),
                    a = a.getHours() + ":" + a.getMinutes();
                h.byId("panelDate").innerHTML = b + " " + c + " " + a;
                setTimeout(e.hitch(this, this._updateClock),
                    1E3)
            },
            _initCards: function () {
                var a = h.byId("panelCards");
                g.set(a, "width", 320 * this.config.cards.length + "px");
                f.forEach(this.config.cards, e.hitch(this, function (b, c) {
                    b.id = "card" + c;
                    var d = new J(b);
                    d.placeAt(a);
                    p(d, "toggle", e.hitch(this, this._toggleCard));
                    p(d, "select", e.hitch(this, this._selectFeature));
                    d.startup();
                    b.card = d
                }));
                setTimeout(e.hitch(this, this._initData, 3E3))
            },
            _toggleCard: function (a) {
                a.manual && this._pauseTimer();
                var b = g.get("panelBottom", "width"),
                    c = "#ffffff";
                this.lyrData.removeAll();
                this._removeHiRenderer();
                this.smartTip.update(null);
                "maximize" === a.action ? (this.scrollPos = h.byId("panelBottom").scrollLeft, g.set("panelCards", "width", b + "px"), f.forEach(this.config.cards, e.hitch(this, function (b, N) {
                    var d = "card" + N,
                        e = q.byId(d);
                    e.unselect();
                    d !== a.id ? e.minimize() : (c = e.color, e.maximize(), "WEATHER" !== e.label && this._renderFeatures(b))
                }))) : (f.forEach(this.config.cards, function (a, b) {
                    var c = q.byId("card" + b);
                    c.unselect();
                    c.resize()
                }), b = 320 * this.config.cards.length, g.set("panelCards", "width", b + "px"), setTimeout(e.hitch(this,
                    this._resetScroll), 600));
                this.hiColor = c;
                g.set("panelTop", "color", c);
                g.set("btnPlay", "background-color", c)
            },
            _resetScroll: function () {
                h.byId("panelBottom").scrollLeft = this.scrollPos
            },
            _selectFeature: function (a) {
                a.manual && this._pauseTimer();
                if (a.feature.geometry) {
                    var b = a.feature.geometry,
                        c = b;
                    "polyline" === b.type && (c = b.getPoint(0, Math.floor(b.paths[0].length / 2)));
                    c.z = 250;
                    this._addHiRenderer(c);
                    this.view3D.goTo({
                        target: c,
                        zoom: 16,
                        heading: 360 * Math.random(),
                        tilt: this.config.tilt
                    }, {
                            maxDuration: 2E3
                        });
                    setTimeout(e.hitch(this,
                        this._zoomToLoc), 1E3);
                    b = c;
                    c.spatialReference.isWGS84 && (b = t.geographicToWebMercator(c));
                    this.smartTip.update({
                        point: c,
                        mapPoint: b,
                        info: a.feature.attributes.info
                    });
                    q.byId(a.id).select(a.index)
                }
            },
            _initDataOld: function () {
                var a = [];
                f.forEach(this.config.cards, function (b) {
                    b = v(b.dataUrl, {
                        handleAs: "json",
                        preventCache: !0
                    });
                    a.push(b)
                });
                A(a).then(e.hitch(this, function (a) {
                    f.forEach(a, e.hitch(this, function (a, b) {
                        var c = this.config.cards[b];
                        c.data = {
                            results: a
                        };
                        this._processData(c)
                    }))
                }))
            },
            _initData: function () {
                f.forEach(this.config.cards,
                    e.hitch(this, function (a) {
                        switch (a.label) {
                            case "TRAFFIC":
                                a.data = {
                                    results: trafficData //loaded in the main page (index.html) --Data load section
                                };
                                break;
                            case "CAMERAS":
                                a.data = {
                                    results: camerasData //loaded in the main page (index.html) --Data load section
                                };
                                break;
                            case "Building Occupancy":
                                a.data = {
                                    results: buildingOccupancyData //loaded in the main page (index.html) --Data load section
                                };
                                break;
                            case "Building Type":
                                a.data = {
                                    results: buildingTypeData //loaded in the main page (index.html) --Data load section
                                };
                                break;
                            case "Building Accomplishment":
                                a.data = {
                                    results: buildingAccomplishmentData //loaded in the main page (index.html) --Data load section
                                };
                                break;
                            case "COLLISIONS":
                                a.data = {
                                    results: accidentsData //loaded in the main page (index.html) --Data load section
                                };
                                break;
                            case "PEDESTRIANS":
                                a.data = {
                                    results: pedestrianData //loaded in the main page (index.html) --Data load section
                                };
                                break;
                            case "CYCLISTS":
                                a.data = {
                                    results: cyclistData //loaded in the main page (index.html) --Data load section
                                };
                                break;
                            case "MOTORISTS":
                                a.data = {
                                    results: motoristData //loaded in the main page (index.html) --Data load section
                                };
                                break;
                            case "AIR QUALITY":
                                a.data = {
                                    results: airQualityData //loaded in the main page (index.html) --Data load section
                                };
                                break;
                            case "WEATHER":
                                a.data = {
                                    results: weatherDataByDay //loaded in the main page (index.html) --Data load section
                                };
                                break;
                            default:
                                a.data = {
                                    results: []
                                };
                        }

                        this._processData(a)

                        /*
                        v(a.dataUrl, {
                            handleAs: "json",
                            preventCache: !0
                        }).then(e.hitch(this, function(b) {
                            a.data = {
                                results: b
                            };
                            this._processData(a)
                        }))*/
                    }))
            },
            _processData: function (a) {
                console.log(a);
                var b = [];
                f.forEach(a.data.results, e.hitch(this, function (c) {
                    var d;
                    c.lat && c.lon ? d = new r({
                        longitude: c.lon,
                        latitude: c.lat
                    }) : c.path && (d = this._getCoords(c.path), d = new w({
                        paths: d,
                        spatialReference: {
                            wkid: 4326
                        }
                    }));
                    d = new m(d);
                    d.attributes = c;
                    d.attributes.info = this._getInfo(c, a.label);
                    b.push(d)
                }));
                this._orderFeatures(b, a.label);
                a.data.features = b;
                a.data.counter = 0;
                this._updateCard(a)
            },
            _getCoords: function (a) {
                var b = [],
                    c, d, e;
                c = 0;
                for (d = a.length; c < d; c += 2) e = a.slice(c, c + 2), e.reverse(), e.push(5), b.push(e);
                return b
            },
            _getInfo: function (a, b) {
                var c = {
                    row1: "",
                    row2: "",
                    row3: "",
                    icon: null,
                    color: null,
                    tag: ""
                },
                    d;
                d = "";
                a.date && (d = new Date(1E3 * a.date), d = this._formatDate(d));
                switch (b) {
                    case "TRAFFIC":
                        c.row1 = a.label;
                        c.row2 = Math.round(a.value);
                        c.row3 = "MPH - AVG SPEED";
                        c.tag = this._getTrafficLabel(a.value);
                        c.color = this._getTrafficColor(a.value).splice(0,
                            3);
                        break;
                    case "Building Occupancy":
                        c.row1 = a.label;
                        c.row2 = a.value;
                        c.row3 = a.desc;
                        break;
                    case "Building Type":
                        c.row1 = a.label;
                        c.row2 = a.value;
                        c.row3 = a.desc;
                        break;
                    case "Building Accomplishment":
                        c.row1 = a.label;
                        c.row2 = a.value;
                        c.row3 = a.desc;
                        break;
                    case "COLLISIONS":
                        c.row1 = d + " " + a.time;
                        c.row2 = a.ped_i + a.ped_k + a.cyc_i + a.cyc_k + a.mot_i + a.mot_k;
                        c.row3 = "INJURIES / DEATHS";
                        c.tag = 0 < a.ped_k + a.cyc_k + a.mot_k ? a.ped_k + a.cyc_k + a.mot_k + " DEATHS" : "";
                        break;
                    case "PEDESTRIANS":
                        c.row1 = d + " " + a.time;
                        c.row2 = a.ped_i + a.ped_k;
                        c.row3 = "INJURIES / DEATHS";
                        c.tag = 0 < a.ped_k ? a.ped_k + " DEATHS" : "";
                        break;
                    case "CYCLISTS":
                        c.row1 = d + " " + a.time;
                        c.row2 = a.cyc_i + a.cyc_k;
                        c.row3 = "INJURIES / DEATHS";
                        c.tag = 0 < a.cyc_k ? a.cyc_k + " DEATHS" : "";
                        break;
                    case "MOTORISTS":
                        c.row1 = d + " " + a.time;
                        c.row2 = a.mot_i + a.mot_k;
                        c.row3 = "INJURIES / DEATHS";
                        c.tag = 0 < a.mot_k ? a.mot_k + " DEATHS" : "";
                        break;
                    case "AIR QUALITY":
                        c.row1 = a.label;
                        c.row2 = a.value;
                        c.row3 = a.desc;
                        break;
                    case "WEATHER":
                        c.row1 = a.day;
                        c.row2 = Math.round(a.max) + "&deg;- " + Math.round(a.min) + "&deg;";
                        c.row3 = "MAX - MIN";
                        "NOW" === a.day && (c.row2 = Math.round(a.max) + "&deg;", c.row3 = "");
                        c.tag = a.desc;
                        c.icon = "images/w/" + this.config.weatherData[a.code][1];
                        break;
                    case "CAMERAS":
                        c.row1 = a.label, c.value = a.value, c.icon = a.thumbnail
                }
                return c
            },
            _formatDate: function (a) {
                var b = a.getDate();
                return this.config.months[a.getMonth()] +
                    " " + b
            },
            _orderFeatures: function (a, b) {
                "CAMERAS" !== b && "Building Occupancy" !== b && "Building Type" !== b && "Building Accomplishment" !== b && "AIR QUALITY" !== b && "WEATHER" !== b && (a.sort(this._compare), "TRAFFIC" !== b && a.reverse())
            },
            _compare: function (a, b) {
                return a.attributes.info.row2 < b.attributes.info.row2 ? -1 : a.attributes.info.row2 > b.attributes.info.row2 ? 1 : 0
            },
            _updateCard: function (a) {
                var b = null,
                    c = null,
                    d = null,
                    e = a.data,
                    l;
                switch (a.label) {
                    case "TRAFFIC":
                        var g = 0,
                            h = 0;
                        f.forEach(e.features, function (a) {
                            g += 1;
                            h += a.attributes.value
                        });
                        b = Math.round(h / g);
                        this.trafficCardData = a;
                        this._renderTraffic(a);
                        break;
                    case "Building Occupancy":
                        l = e.features[2];
                        b = l.attributes.desc;
                        c = l.attributes.label;
                        break;
                    case "Building Type":
                        l = e.features[0];
                        b = l.attributes.desc;
                        c = l.attributes.label;
                        break;
                    case "Building Accomplishment":
                        l = e.features[4];
                        b = l.attributes.desc;
                        c = l.attributes.label;
                        break;
                    case "AIR QUALITY":
                        l = e.features[0];
                        b = l.attributes.value;
                        c = l.attributes.label;
                        break;
                    case "WEATHER":
                        l = e.results[0];
                        b = l.max + "&deg;";
                        c = l.desc;
                        d = "images/w/" + this.config.weatherData[l.code][1];
                        break;
                    default:
                        b = e.features.length
                }
                a.card.update({
                    value: b,
                    label: c,
                    icon: d,
                    features: e.features
                })
            },
            _renderTraffic: function (a) {
                this.lyrTraffic.removeAll();
                "TRAFFIC" === a.label && (a = a.data.features, f.forEach(a, e.hitch(this, function (a) {
                    var c = this._getTrafficColor(a.attributes.value);
                    /*
                        c = new y({
                            color: c,
                            width: 5
                        });*/

                    var symbol = {
                        type: "line-3d",  // autocasts as new LineSymbol3D()
                        symbolLayers: [{
                            type: "path",  // autocasts as new PathSymbol3DLayer()
                            size: 5,    // width of the tube in meters
                            material: { color: c }
                        }]
                    };

                    a = new m(a.geometry, symbol, a.attributes);
                    this.lyrTraffic.graphics.add(a)
                })),
                    this._addTrafficRenderer(a))
            },
            _getTrafficColor: function (a) {
                var b = [255, 0, 0];
                20 <= a ? b = [255, 200, 0] : 35 <= a ? b = [163, 200, 61] : 50 <= a && (b = [77, 200, 61]);
                return b
            },
            _getTrafficLabel: function (a) {
                var b = "HEAVY";
                20 <= a ? b = "SEMI-HEAVY" : 35 <= a ? b = "MODERATE" : 50 <= a && (b = "LIGHT");
                return b
            },
            _renderFeatures: function (a) {
                this.lyrData.removeAll();
                if ("WEATHER" !== a.label && "Building Occupancy" !== a.label && "Building Type" !== a.label && "Building Accomplishment" !== a.label) {
                    var b = a.data.features,
                        c = new y({
                            color: a.color,
                            width: 2
                        });

                        var symbol = {
                            type: "line-3d",  // autocasts as new LineSymbol3D()
                            symbolLayers: [{
                                type: "path",  // autocasts as new PathSymbol3DLayer()
                                size: 2,    // width of the tube in meters
                                material: { color: a.color }
                            }]
                        };

                    this._getSymbol(a.icon, a.color).then(e.hitch(this, function (a) {
                        f.forEach(b, e.hitch(this, function (b) {
                            if (b.geometry) {
                                var d =
                                    b.geometry;
                                "polyline" === d.type && (d = d.getPoint(0, Math.floor(d.paths[0].length / 2)));
                                var d = new r({
                                    x: d.longitude,
                                    y: d.latitude,
                                    z: 250
                                }),
                                    e = new w([
                                        [d.longitude, d.latitude, 0],
                                        [d.longitude, d.latitude, 250]
                                    ]),
                                    e = new m(e, symbol, b.attributes);
                                b = new m(d, a, b.attributes);
                                this.lyrData.add(e);
                                this.lyrData.add(b)
                            }
                        }))
                    }))
                }

                if ("Building Occupancy" == a.label) {
                    this.lyrBuildings.renderer = this._getBuildingSceneRendererByOccupancy();
                } else if ("Building Type" == a.label) {
                    this.lyrBuildings.renderer = this._getBuildingSceneRendererByType();
                } else if ("Building Accomplishment" == a.label) {
                    this.lyrBuildings.renderer = this._getBuildingSceneRendererByAccomplishment();
                }
            },
            _getSymbol: function (a, b) {
                var c = new u,
                    d = h.byId("panelSym").getContext("2d");
                d.canvas.width = 500;
                d.canvas.height = 500;
                d.arc(250, 250, 250, 0, 2 * Math.PI, !1);
                d.fillStyle = b;
                d.fill();
                var e = new Image;
                e.onload = function () {
                    d.drawImage(e,
                        100, 100, 300, 300);
                    d.scale(5, 5);
                    var a = d.canvas.toDataURL(),
                        a = new H({
                            url: a,
                            width: "30px",
                            height: "30px"
                        });
                    c.resolve(a)
                };
                e.src = a;
                return c
            },
            _addTrafficRenderer: function (a) {
                var b = [];
                f.forEach(a, function (a) {
                    var c = t.geographicToWebMercator(a.geometry),
                        c = new m(c);
                    c.attributes = a.attributes;
                    b.push(c)
                });
                this._removeTrafficRenderer();
                this.trafficRenderer = new M(this.view3D, b);
                n.add(this.view3D, this.trafficRenderer)
            },
            _removeTrafficRenderer: function () {
                this.trafficRenderer && n.remove(this.view3D, this.trafficRenderer);
                this.trafficRenderer = null
            },
            _addHiRenderer: function (a) {
                a = new r({
                    longitude: a.longitude,
                    latitude: a.latitude,
                    z: 0
                });
                a = t.geographicToWebMercator(a);
                this._removeHiRenderer();
                this.hiRenderer = new L(this.view3D, a, {
                    width: 100,
                    height: 300,
                    color: this.hiColor,
                    loop: !0
                });
                n.add(this.view3D, this.hiRenderer)
            },
            _removeHiRenderer: function () {
                this.hiRenderer && n.remove(this.view3D, this.hiRenderer);
                this.hiRenderer = null
            },
            _pauseTimer: function () {
                k.contains("btnPlay", "playing") && this._toggleTimer()
            },
            _toggleTimer: function () {
                k.contains("btnPlay",
                    "playing") ? (this._stopTimer(), k.remove("btnPlay", "playing")) : (this._startTimer(), k.add("btnPlay", "playing"))
            },
            _startTimer: function () {
                this._stopTimer();
                this._tickTimer();
                this.timer = setInterval(e.hitch(this, this._tickTimer), this.config.interval)
            },
            _stopTimer: function () {
                this.timer && (clearInterval(this.timer), this.timer = null);
                this._stopTimerActions()
            },
            _stopTimerActions: function () {
                this.lyrData.removeAll();
                this.smartTip.update(null);
                this._removeHiRenderer();
                f.forEach(this.config.cards, e.hitch(this, function (a) {
                    a.card.unselect();
                    a.card.resize()
                }));
                this.hiColor = "#ffffff";
                g.set("panelTop", "color", "#ffffff");
                g.set("btnPlay", "background-color", "#ffffff");
                g.set("panelCards", "width", 320 * this.config.cards.length + "px");
                this.loopIndex = -1
            },
            _tickTimer: function () {
                this.loopIndex += 1;
                0 === this.loopIndex ? (this._timerMaximize(), this._timerSelect()) : 0 < this.loopIndex && 3 > this.loopIndex ? this._timerSelect() : (this._timerResize(), this.loopIndex = -1, this.index += 1, this.index >= this.config.cards.length && (this.index = 0))
            },
            _timerMaximize: function () {
                0 < this.config.cards[this.index].data.features.length ?
                    this._toggleCard({
                        id: "card" + this.index,
                        action: "maximize",
                        manual: !1
                    }) : (this.index += 1, this.loopIndex = 0, this.index >= this.config.cards.length && (this.index = 0), this._timerMaximize())
            },
            _timerResize: function () {
                this._toggleCard({
                    id: "card" + this.index,
                    action: "resize",
                    manual: !1
                })
            },
            _timerSelect: function () {
                var a = this.config.cards[this.index],
                    b = 0;
                if ("WEATHER" === a.label || 0 === a.data.features.length) this.loopIndex = 2;
                else {
                    var c = {
                        id: "card" + this.index,
                        action: "select",
                        manual: !1,
                        label: a.label,
                        index: b,
                        feature: a.data.features[b]
                    },
                        b = b + 1;
                    b >= a.data.features.length && (b = 0, this.loopIndex = 2);
                    a.data.counter = b;
                    this._selectFeature(c);
                    "Building Occupancy" === a.label && (this.loopIndex = 4)
                    "Building Type" === a.label && (this.loopIndex = 5)
                    "Building Accomplishment" === a.label && (this.loopIndex = 5)
                    "AIR QUALITY" === a.label && (this.loopIndex = 2)
                }
            },
            _getBuildingSceneRendererByOccupancy: function () {
                this._removeConstructionYearRenderer();
                var edgeStyle = this.edgeStyle;

                var ageClasses = [{
                    minValue: 1900,
                    maxValue: 1930,
                    label: "Fully Occupied",
                    color: this.buildingsColors.fully_occupied
                }, {
                    minValue: 1931,
                    maxValue: 1960,
                    label: "Not Occupied",
                    color: this.buildingsColors.not_occupied
                }, {
                    minValue: 1961,
                    maxValue: 1990,
                    label: "Semi Occupied",
                    color: this.buildingsColors.semi_occupied
                }, {
                    minValue: 1991,
                    maxValue: 2024,
                    label: "Under Construction",
                    color: this.buildingsColors.under_construction
                }];

                var initPeriod = [!0, !0, !0, !0, !0];

                var me = this;
                var renderer = new ClassBreaksRenderer({
                    field: "CNSTRCT_YR",
                    legendOptions: {
                        title: "Building Occupancy"
                    },
                    defaultSymbol: new G({
                        symbolLayers: [new F({
                            material: {
                                color: this.buildingsColors.others
                            },
                            edges: edgeStyle
                        })]
                    }),
                    classBreakInfos: ageClasses.map(function (e, t) {
                        var n = initPeriod[t] ? e.color : me.config.buildingsColor;
                        return {
                            minValue: e.minValue,
                            maxValue: e.maxValue,
                            label: e.label,
                            symbol: new G({
                                symbolLayers: [new F({
                                    material: {
                                        color: n
                                    },
                                    edges: edgeStyle
                                })]
                            })
                        }
                    })
                });


                return renderer;
            },
            _getBuildingSceneRendererByType: function () {
                var ageClasses = [{
                    minValue: 1900,
                    maxValue: 1930,
                    label: "Residential",
                    color: [153, 167, 204]
                }, {
                    minValue: 1931,
                    maxValue: 1960,
                    label: "Commercial",
                    color: [153, 204, 179]
                }, {
                    minValue: 1961,
                    maxValue: 1990,
                    label: "Medical",
                    color: [153, 204, 203]
                }, {
                    minValue: 1991,
                    maxValue: 2024,
                    label: "Educational",
                    color: [149, 184, 214]
                }, {
                    minValue: 1991,
                    maxValue: 2024,
                    label: "Governmental",
                    color: [153, 204, 179]
                }];

                var initPeriod = [!0, !0, !0, !0, !0];

                var renderer = new ClassBreaksRenderer({
                    field: "CNSTRCT_YR",
                    legendOptions: {
                        title: "Building Type"
                    },
                    defaultSymbol: new G({
                        symbolLayers: [new F({
                            material: {
                                color: this.config.buildingsColor
                            }
                        })]
                    }),
                    classBreakInfos: ageClasses.map(function (e, t) {
                        var n = initPeriod[t] ? e.color : this.config.buildingsColor;
                        return {
                            minValue: e.minValue,
                            maxValue: e.maxValue,
                            label: e.label,
                            symbol: new G({
                                symbolLayers: [new F({
                                    material: {
                                        color: n
                                    }
                                })]
                            })
                        }
                    })
                });

                return renderer;
            },
            _getBuildingSceneRendererByAccomplishment: function () {
                var ageClasses = [{
                    minValue: 1900,
                    maxValue: 1930,
                    label: "0 To 20 (%)",
                    color: [153, 204, 203]
                }, {
                    minValue: 1931,
                    maxValue: 1960,
                    label: "21 To 40 (%)",
                    color: [153, 167, 204]
                }, {
                    minValue: 1961,
                    maxValue: 1990,
                    label: "41 To 60 (%)",
                    color: [153, 204, 179]
                }, {
                    minValue: 1991,
                    maxValue: 2024,
                    label: "61 To 80 (%)",
                    color: [153, 204, 179]
                }, {
                    minValue: 1991,
                    maxValue: 2024,
                    label: "81 To 100 (%)",
                    color: [149, 184, 214]
                }];

                var initPeriod = [!0, !0, !0, !0, !0];

                var renderer = new ClassBreaksRenderer({
                    field: "CNSTRCT_YR",
                    legendOptions: {
                        title: "Building Accomplishment"
                    },
                    defaultSymbol: new G({
                        symbolLayers: [new F({
                            material: {
                                color: this.config.buildingsColor
                            }
                        })]
                    }),
                    classBreakInfos: ageClasses.map(function (e, t) {
                        var n = initPeriod[t] ? e.color : this.config.buildingsColor;
                        return {
                            minValue: e.minValue,
                            maxValue: e.maxValue,
                            label: e.label,
                            symbol: new G({
                                symbolLayers: [new F({
                                    material: {
                                        color: n
                                    }
                                })]
                            })
                        }
                    })
                });

                return renderer;
            },
            _getConstructionYearRenderer: function () {
                // configure parameters for the color renderer generator
                // the layer must be specified along with a field name
                // or arcade expression. The basemap and other properties determine
                // the appropriate default color scheme.
                var layer = this.lyrBuildings;
                var view = this.view3D;
                var me = this;

                var colorParams = {
                    layer: layer,
                    basemap: this.map.basemap,
                    field: "CNSTRCT_YR",
                    theme: "above-and-below",
                    minValue: 1800
                };

                // Set up initial color slider properties.
                // numHandles determines whether 2 or 3 handles
                // will be visible in the slider. The primary handle
                // (middle one of the three) controls all handles
                // when moved if `syncedHandles` is true.

                var sliderParams = {
                    numHandles: 3,
                    syncedHandles: true,
                    container: "slider"
                };

                // Generate a continuous color renderer based on the
                // statistics of the data in the provided layer
                // and field.
                //
                // This resolves to an object containing several helpful
                // properties, including color scheme, statistics,
                // the renderer and visual variable

                colorRendererCreator.createContinuousRenderer(colorParams)
                    .then(function (response) {

                        // set the renderer to the layer and add it to the map
                        layer.renderer = response.renderer;

                        // add the statistics and color visual variable objects
                        // to the color slider parameters

                        sliderParams.statistics = response.statistics;
                        sliderParams.visualVariable = response.visualVariable;

                        // input the slider parameters in the slider's constructor
                        // and add it to the view's UI

                        var colorSlider = new ColorSlider(sliderParams);
                        me.colorSlide = colorSlider;
                        view.ui.add("containerDiv", "top-left");

                        // when the user slides the handle(s), update the renderer
                        // with the updated color visual variable object

                        colorSlider.on("data-change", function () {
                            var renderer = layer.renderer.clone();
                            renderer.visualVariables = [lang.clone(colorSlider.visualVariable)];
                            layer.renderer = renderer;
                        });

                    })
                    .catch(function (error) {
                        console.log("there was an error: ", error);
                    });
            },
            _removeConstructionYearRenderer: function () {
                if (!this.colorSlide)
                    return;

                this.view3D.ui.remove("containerDiv");
                this.colorSlide.destroy();
            }
        })
    });
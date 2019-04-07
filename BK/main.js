//Globals
Array.prototype.compare = function(testArr) {
    if (this.length != testArr.length) return false;
    for (var i = 0; i < testArr.length; i++) {
        if (this[i].compare) { //To test values in nested arrays
            if (!this[i].compare(testArr[i])) return false;
        }
        else if (this[i] !== testArr[i]) return false;
    }
    return true;
}

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
	"esri/widgets/DirectLineMeasurement3D",
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
	"viz/Mesh",
	"dojo/domReady!"],
    function(z, f, e, u, h, k, g, p, A, v, q, r, w, t, m, x
			, FeatureLayer, Legend, B, C, D, E, ClassBreaksRenderer, F, O, G, H, P, y, Q, I, n
			, Home, BasemapGallery, DirectLineMeasurement3D, LayerList, QueryTask, Query, StatisticDefinition, SpatialReference, GeometryService, ProjectParameters
			, watchUtils, PopupTemplate, J, K, L, M, Calculator, Mesh) {
        return z(null, {
            config: {},
            index: 0,
            loopIndex: -1,
            hiColor: "#ffffff",
            startup: function(a) {
                var b;
                a ? (this.config = a, this._initApp()) : (a = Error("Main:: Config is not defined"), this.reportError(a), b = new u, b.reject(a), b = b.promise);
                return b
            },
            reportError: function(a) {
                k.remove(document.body, "app-loading");
                k.add(document.body, "app-error");
                var b = h.byId("loading_message");
                b && (b.innerHTML = "Unable to create map: " + a.message);
                return a
            },
            _initApp: function() {
				this.geomSer = new GeometryService({
					url:this.config.gpServerURL
				});
				
				this.calculator =
                    new Calculator({
                        idField: this.config.FeederPillarIDFieldName,
                        dateField: this.config.ReadingDateFieldName
                    });
					
                this._initMap()
            },
            _initMap: function() {
                this.map = new D({
					basemap: "gray",
                    ground: "world-elevation"
				});
                //this.baseLayer = new C(this.config.basemapUrl);
                //this.map.add(this.baseLayer);
				
				this.lyrIncidentCatchmentArea = new FeatureLayer({
					url: this.config.incidentCatchmentArea,
					popupEnabledBoolean: true,
					outFields: ["*"],
					elevationInfo: {
						mode : "on-the-ground"
					},
					definitionExpression: "1 = 2",
					title: "Incident Analysis",
				  });
				 this.map.add(this.lyrIncidentCatchmentArea);
				
				if(mode == "local"){
					//Building Layer
					this.lyrBuildings = new FeatureLayer({
						url: this.config.BuildingLayerUrl,
						popupEnabledBoolean: true,
						outFields: ["*"],
						renderer:this._getBuildingRenderer(),
						definitionExpression: "Elevation > 0", // show only buildings with height
						title: "Buildings",
						popupTemplate: { // autocasts as new PopupTemplate()
						  title: "{BUILDING_NAME_A }",
						  content: [{
							type: "fields",
							fieldInfos: [{
							  fieldName: "BLOCK_NO",
							  label: "BLOCK NO"
							}, {
							  fieldName: "Status",
							  label: "Status"
							}, {
							  fieldName: "Elevation",
							  label: "Height"
							}]
						  }]
						}
					});
				}else{
					//Building Layer
					this.lyrBuildings = new B({
						url: this.config.BuildingSceneLayerUrl,
						outFields: ["*"],
						popupTemplate: new PopupTemplate({
							title: "{NAME}",
							content: "Built in {CNSTRCT_YR} this building has {NUM_FLOORS} floors and is {HEIGHTROOF} ft. high. Number of residents is "+ getRandomInt(50, 300) + ". Number of families is "+ getRandomInt(10, 30) + ". Number of empty properties is " + getRandomInt(5, 15)
						}),
						//definitionExpression: "CNSTRCT_YR> 2000",
						title: "Buildings",
						renderer: this._getBuildingSceneRenderer()
					});
				}					
                this.lyrBuildings.opacity = 1;
                this.map.add(this.lyrBuildings);
                
				this.schoolsNearestFacilities = new FeatureLayer({
					url: this.config.SchoolNearestFacilitiesUrl,
					title: "Schools Nearest Facilities",
					definitionExpression: "1 = 2",
					visible: false,
					elevationInfo: {
					  // elevation mode that will place points on top of the buildings or other SceneLayer 3D objects
					  mode: "relative-to-scene"
					},
					renderer: this._getLandMarksRenderer(),
					outFields: ["*"],
					// feature reduction is set to selection because our scene contains too many points and they overlap
					featureReduction: {
					  type: "selection"
					},
					labelingInfo: [
					{
					  labelExpressionInfo: {
						value: "{FacilityName} / Distance: {DistanceFromSchool} KM."
					  },
					  symbol: {
						type: "label-3d", // autocasts as new LabelSymbol3D()
						symbolLayers: [{
						  type: "text", // autocasts as new TextSymbol3DLayer()
						  material: {
							color: "white"
						  },
						  // we set a halo on the font to make the labels more visible with any kind of background
						  halo: {
							size: 1,
							color: [50, 50, 50]
						  },
						  size: 10
						}]
					  }
					}],
					labelsVisible: true
				  });
				this.map.add(this.schoolsNearestFacilities);
				
				this.lyrData = new x({
					title: "Operations Layer",
				});
				this.map.add(this.lyrData);
				
                this._create3DView()
            },
            _create3DView: function() {
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
					
                this.view3D.then(e.hitch(this, function() {
                    this.view3D.ui.components = ["attribution", "navigation-toggle", "compass", "zoom"];
					
					var homeWidget = new Home({
										view: this.view3D
									});
					this.view3D.ui.add(homeWidget, "top-left");
					
					var legend = new Legend({
						view: this.view3D,
						layerInfos: [{
							layer: this.lyrBuildings,
							title: "Legend"
						  }]
					});
					this.view3D.ui.add(legend, "top-right");
	  
					var view3D = this.view3D;
					this.view3D.whenLayerView(this.lyrBuildings).then(function(e) {
                            var t, n = Date.now();
                            view3D.on("pointer-move", function(r) {
                                var i = Date.now();
                                i - n > 20 && !view3D.interacting && (n = i,
                                view3D.hitTest({
                                    x: r.x,
                                    y: r.y
                                }).then(function(n) {
                                    var r = n.results[0] ? n.results[0].graphic : null;
                                    r && "Buildings" === r.layer.title ? (t && t.remove(),
                                    t = e.highlight([r.attributes.OBJECTID])) : t && t.remove()
                                }))
                            })
                        })
						
					
					var layerList = new LayerList({
					  view: this.view3D
					});
					this.view3D.ui.add(layerList, {
					  position: "bottom-right"
					});
					/*
					var measurementWidget = new DirectLineMeasurement3D({
					  view: this.view3D
					});
					this.view3D.ui.add(measurementWidget, "top-right");
					
					var basemapGallery = new BasemapGallery({
						  view: this.view3D
						});
					this.view3D.ui.add(basemapGallery, {
					  position: "top-right"
					});
					*/
                    this.view3D.environment.atmosphereEnabled = 1;
                    this.view3D.environment.starsEnabled = 1;
					
					var view3D = this.view3D;
					var me = this;
					watchUtils.whenTrue(this.view3D, "stationary", function() {
						// Get the new extent of the view only when view is stationary.
						if (view3D.extent) {
							me._prepareDataStoreAndInitData();
						}
					 });
	  
                    this._initUI();				
                }), e.hitch(this, function() {
                    this.reportError(Error("Main:: Unable to create scene"))
                }))
            },
            _initUI: function() {
                this._initControls();
                this._initSmartTip();
                this._updateClock();
                this._initCards();
                k.remove(document.body, "app-loading")
            },
            _initControls: function() {
                p(h.byId("btnPlay"), "click", e.hitch(this, this._toggleTimer))
            },
            _initSmartTip: function() {
                this.smartTip = new K({
                    view: this.view3D,
                    point: null,
                    mapPoint: null,
                    info: null
                }, h.byId("panelSmartTip"));
                this.smartTip.startup()
            },
            _updateClock: function() {
                var a = new Date,
                    b = this.config.months[a.getMonth()].substring(0, 3).toUpperCase(),
                    c = a.getDate(),
                    a = a.getHours() + ":" + a.getMinutes();
                h.byId("panelDate").innerHTML = b + " " + c + " " + a;
                setTimeout(e.hitch(this, this._updateClock),
                    1E3)
            },
            _initCards: function() {
                var a = h.byId("panelCards");
                g.set(a, "width", 320 * this.config.cards.length + "px");
                f.forEach(this.config.cards, e.hitch(this, function(b, c) {
                    b.id = "card" + c;
                    var d = new J(b);
                    d.placeAt(a);
                    p(d, "toggle", e.hitch(this, this._toggleCard));
                    p(d, "select", e.hitch(this, this._selectFeature));
                    d.startup();
                    b.card = d
                }));
                setTimeout(e.hitch(this, this._prepareDataStoreAndInitData, 3E3))
            },
            _toggleCard: function(a) {
                a.manual && this._pauseTimer();
                var b = g.get("panelBottom", "width"),
                    c = "#ffffff";
                this.lyrData.removeAll();
                this._removeHiRenderer();
                this.smartTip.update(null);
				this.lyrIncidentCatchmentArea.definitionExpression = "1=2";
				this.schoolsNearestFacilities.definitionExpression = "1=2";
				
                "maximize" === a.action ? (this.scrollPos = h.byId("panelBottom").scrollLeft, g.set("panelCards", "width", b + "px"), f.forEach(this.config.cards, e.hitch(this, function(b, N) {
                    var d = "card" + N,
                        e = q.byId(d);
                    e.unselect();
                    d !== a.id ? e.minimize() : (c = e.color, e.maximize(), "WEATHER" !== e.label && this._renderFeatures(b))
                }))) : (f.forEach(this.config.cards, function(a, b) {
                    var c = q.byId("card" + b);
                    c.unselect();
                    c.resize()
                }), b = 320 * this.config.cards.length, g.set("panelCards", "width", b + "px"), setTimeout(e.hitch(this,
                    this._resetScroll), 600));
                this.hiColor = c;
                g.set("panelTop", "color", c);
                g.set("btnPlay", "background-color", c)
            },
            _resetScroll: function() {
                h.byId("panelBottom").scrollLeft = this.scrollPos
            },
            _selectFeature: function(a) {
                a.manual && this._pauseTimer();
                if (a.feature.geometry) {
					if(a.label == "SCHOOLS"){
						this.lyrIncidentCatchmentArea.definitionExpression = "NAME_AR = '"+ a.feature.attributes.NAME_AR +"'";
						this.schoolsNearestFacilities.definitionExpression = "SchoolName = '"+ a.feature.attributes.NAME_AR +"'";
					}
                    var b = a.feature.geometry
					, c = b;
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
						/*
						setTimeout(e.hitch(this,function(){
							this._removeHiRenderer();							
						}), 5000);
						*/
				}                
            },
            _initDataOld: function() {
                var a = [];
                f.forEach(this.config.cards, function(b) {
                    b = v(b.dataUrl, {
                        handleAs: "json",
                        preventCache: !0
                    });
                    a.push(b)
                });
                A(a).then(e.hitch(this, function(a) {
                    f.forEach(a, e.hitch(this, function(a, b) {
                        var c = this.config.cards[b];
                        c.data = {
                            results: a
                        };
                        this._processData(c)
                    }))
                }))
            },
			_prepareDataStoreAndInitData: function(){
				var queryTask = new QueryTask({
								url: this.config.BuildingLayerUrl
							  });
							  
				var query = new Query();
				query.returnGeometry = true;
				query.outFields = ["*"];
				query.geometry = this.view3D.extent;
				query.outSpatialReference = new SpatialReference(102100);
				query.where = "1=1";
			  
				var me = this;
				return queryTask.execute(query).then(function(results){
				  me.buildingsDataStore = {
						results: results.features
					};
					
					me._initData();
				});

			},
            _initData: function() {
                f.forEach(this.config.cards,
                    e.hitch(this, function(a) {
						if(a.dataSource && a.dataSource=="mapService"){
							var queryTask = new QueryTask({
								url: a.dataUrl
							  });
							  
							var query = new Query();
							query.returnGeometry = true;
							
							if(a.filterByExtent)
								query.geometry = this.view3D.extent;
						
							query.spatialRelationshipString = "intersects";
							query.outFields = ["*"];
							query.outSpatialReference = new SpatialReference(102100);
							
							if(a.condition)
								query.where = a.condition;
						  
							var me = this;
							queryTask.execute(query).then(function(results){
							  a.data = {
									results: results.features
								};
								me._processData(a)
						  });
						}else if(a.dataSource && a.dataSource=="featureLayer"){
							var query = new Query();
							query.returnGeometry = true;
							
							if(a.filterByExtent)
								query.geometry = this.view3D.extent;
							
							query.spatialRelationshipString = "intersects";
							query.outFields = ["*"];
							query.outSpatialReference = new SpatialReference(102100);
							
							if(a.condition)
								query.where = a.condition;
						  
							var me = this;
							me.map.layers.items[0].queryFeatures(query).then(function(results){
							  a.data = {
									results: results.features
								};
								me._processData(a)
						  });
						}else if(a.dataSource && a.dataSource=="buildingsDataStore"){
							if(!(this.buildingsDataStore && this.buildingsDataStore.results)){
								this.buildingsDataStore = {
									results: []
								};
							}
							a.data = Object.assign({}, this.buildingsDataStore);
							this._processData(a)
						}else{
							v(a.dataUrl, {
								handleAs: "json",
								preventCache: !0
							}).then(e.hitch(this, function(b) {
								a.data = {
									results: b
								};
								this._processData(a)
							}))
						}
                    }))
            },
            _processData: function(a) {
                console.log(a);
                var b = [];
                f.forEach(a.data.results, e.hitch(this, function(c) {
                    var d;
					if(c.geometry && c.attributes){
						d = new m(c.geometry);
						d.attributes = Object.assign({}, c.attributes);
					}else{
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
						d.attributes = Object.assign({}, c.attributes);
					}
                    
                    d.attributes.info = this._getInfo(c, a.label, a);
                    b.push(d)
                }));
                this._orderFeatures(b, a.label);
                a.data.features = b;
                a.data.counter = 0;
                this._updateCard(a)
            },
            _getCoords: function(a) {
                var b = [],
                    c, d, e;
                c = 0;
                for (d = a.length; c < d; c += 2) e = a.slice(c, c + 2), e.reverse(), e.push(5), b.push(e);
                return b
            },
            _getInfo: function(a, b, card) {
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
					case "SCHOOLS":
                        c.row1 = a.attributes.NAME_AR;
                        c.row2 = a.attributes.StudentsCountInZone ;
                        c.row3 = "6-18 years old in the zone";
                        c.tag = a.attributes.BLOCK_NO;
                        c.color = [0, 0, 255]
                        break;                    
                    case "CO2 Emmision":
                        d = new Date(a.attributes.Date);
						fd = this._formatDate(d);
						
                        c.row1 = fd + " "+ d.getHours()+":"+d.getMinutes();
                        c.row2 = a.attributes.Energy_Emission;
                        c.row3 = "CO2 Emmision";
                        c.tag = a.attributes.FeederPillarID;
						c.color = [0, 0, 255];
                        break;
					case "R Phase Voltage":
                        d = new Date(a.attributes.Date);
						fd = this._formatDate(d);
						
                        c.row1 = fd + " "+ d.getHours()+":"+d.getMinutes();
                        c.row2 = a.attributes.RPhaseVoltage;
                        c.row3 = "R Phase Voltage";
                        c.tag = a.attributes.FeederPillarID;
						c.color = [0, 0, 255];
                        break;
                    case "Y Phase Voltage":
                        d = new Date(a.attributes.Date);
						fd = this._formatDate(d);
						
                        c.row1 = fd + " "+ d.getHours()+":"+d.getMinutes();
                        c.row2 = a.attributes.YPhaseVoltage;
                        c.row3 = "Y Phase Voltage";
                        c.tag = a.attributes.FeederPillarID;
						c.color = [0, 0, 255];
                        break;
                    case "B Phase Voltage":
                        d = new Date(a.attributes.Date);
						fd = this._formatDate(d);
						
                        c.row1 = fd + " "+ d.getHours()+":"+d.getMinutes();
                        c.row2 = a.attributes.BPhaseVoltage;
                        c.row3 = "B Phase Voltage";
                        c.tag = a.attributes.FeederPillarID;
						c.color = [0, 0, 255];
                        break;
                    case "THDsensor Humidity":
                        d = new Date(a.attributes.Date);
						fd = this._formatDate(d);
						
                        c.row1 = fd + " "+ d.getHours()+":"+d.getMinutes();
                        c.row2 = a.attributes.THDsensor_Humidity;
                        c.row3 = "THDsensor Humidity";
                        c.tag = a.attributes.FeederPillarID;
						c.color = [0, 0, 255];
                        break;
					case "THDsensor Temperature":
                        d = new Date(a.attributes.Date);
						fd = this._formatDate(d);
						
                        c.row1 = fd + " "+ d.getHours()+":"+d.getMinutes();
                        c.row2 = a.attributes.THDsensor_Temperature;
                        c.row3 = "THDsensor Temperature";
                        c.tag = a.attributes.FeederPillarID;
						c.color = [0, 0, 255];
                        break;
                    case "Weather Visibility":
                        d = new Date(a.attributes.Date);
						fd = this._formatDate(d);
						
                        c.row1 = a.attributes.FeederPillarID +" / "+fd + " "+ d.getHours()+":"+d.getMinutes();
                        c.row2 = (a.attributes.Visibility);
                        c.row3 = "Meter";
                        c.tag = a.attributes.FeederPillarID;
                        c.color = [0, 0, 255];
                        break;      
                    case "Weather Clouds":
                        d = new Date(a.attributes.Date);
						fd = this._formatDate(d);
						
                        c.row1 = a.attributes.FeederPillarID +" / "+fd + " "+ d.getHours()+":"+d.getMinutes();
                        c.row2 = (a.attributes.Clouds);
                        c.row3 = "Weather Clouds";
                        c.tag = a.attributes.FeederPillarID;
                        c.color = [0, 0, 255];
                        break;
					default:
						c.row1 = "Building no. " + a.attributes[card.displayFieldName];
                        c.row2 = a.attributes[card.displayFieldName];
                        c.row3 = b;
                        c.tag = b;
                        c.color = [0, 0, 255];
				
                }
                return c
            },
            _formatDate: function(a) {
                var b = a.getDate();
                return this.config.months[a.getMonth()] +
                    " " + b
            },
            _orderFeatures: function(a, b) {
                "CAMERAS" !== b && "AIR QUALITY" !== b && "WEATHER" !== b && (a.sort(this._compare), "TRAFFIC" !== b && a.reverse())
            },
            _compare: function(a, b) {
                return a.attributes.info.row2 < b.attributes.info.row2 ? -1 : a.attributes.info.row2 > b.attributes.info.row2 ? 1 : 0
            },
            _updateCard: function(a) {
                var b = null,
                    c = null,
                    d = null,
                    e = a.data,
                    l;
                switch (a.label) {
                    case "TRAFFIC":
                        var g = 0,
                            h = 0;
                        f.forEach(e.features, function(a) {
                            g += 1;
                            h += a.attributes.value
                        });
                        b = Math.round(h / g);
                        this._renderTraffic(a);
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
						b = e.features.length;
						if(a.statisticType && a.statisticFieldName){
							var values = a.data.features.map(f => f.attributes[a.statisticFieldName]);
							if(values && values.length){
								switch (a.statisticType){
									case "sum":
										b = this._arrSum(values).toFixed(2);
										break;
									case "min":
										b = this._arrMin(values).toFixed(2);
										break;
									case "max":
										b = this._arrMax(values).toFixed(2);
										break;
									case "avg":
										b = this._arrAvg(values).toFixed(2);
										break;
								}
							}
						}
                }
				if (b > 1000)
					b = (b/1000).toFixed(2) + 'K';
				
                a.card.update({
                    value: b,
                    label: c,
                    icon: d,
                    features: e.features
                })
            },
            _renderTraffic: function(a) {
                this.lyrTraffic.removeAll();
                "TRAFFIC" === a.label && (a = a.data.features, f.forEach(a, e.hitch(this, function(a) {
                        var c = this._getTrafficColor(a.attributes.value),
                            c = new y({
                                color: c,
                                width: 5
                            });
                        a = new m(a.geometry, c, a.attributes);
                        this.lyrTraffic.add(a)
                    })),
                    this._addTrafficRenderer(a))
            },
            _getTrafficColor: function(a) {
                var b = [255, 0, 0];
                20 <= a ? b = [255, 200, 0] : 35 <= a ? b = [163, 200, 61] : 50 <= a && (b = [77, 200, 61]);
                return b
            },
            _getTrafficLabel: function(a) {
                var b = "HEAVY";
                20 <= a ? b = "SEMI-HEAVY" : 35 <= a ? b = "MODERATE" : 50 <= a && (b = "LIGHT");
                return b
            },
            _renderFeatures: function(a) {
                this.lyrData.removeAll();
                if ("WEATHER" !== a.label) {
                    var b = a.data.features,
                        c = new y({
                            color: a.color,
                            width: 2
                        });
                    this._getSymbol(a.icon, a.color).then(e.hitch(this, function(a) {
                        f.forEach(b, e.hitch(this, function(b) {
                            if (b.geometry) {
                                var d =
                                    b.geometry;
                                "polyline" === d.type && (d = d.getPoint(0, Math.floor(d.paths[0].length / 2)));
                                var d = new r({
                                        x: d.longitude,
                                        y: d.latitude,
                                        z: 200
                                    }),
                                    e = new w([
                                        [d.longitude, d.latitude, 0],
                                        [d.longitude, d.latitude, 200]
                                    ]),
                                    e = new m(e, c, b.attributes);
                                b = new m(d, a, b.attributes);
                                this.lyrData.add(e);
                                this.lyrData.add(b)
                            }
                        }))
                    }))
                }
            },
			_getWebStyleSymbol:function (name) {
				return {
				  type: "web-style", // autocasts as new WebStyleSymbol()
				  name: name,
				  styleName: "EsriRealisticStreetSceneStyle"
				};
			  },
			_getFPPolesStatusRenderer: function(){
				return {
					type: "unique-value", // autocasts as new UniqueValueRenderer()
					field: "LightStatus",
					uniqueValueInfos: [{
					  value: 0,
					  symbol: {
							  type: "point-3d",  // autocasts as new PointSymbol3D()
							  symbolLayers: [{
								type: "object",  // autocasts as new ObjectSymbol3DLayer()
								width: 3,  // diameter of the object from east to west in meters
								height: 0.5,  // height of the object in meters
								//depth: 5,  // diameter of the object from north to south in meters
								resource: { primitive: "cylinder" },
								material: { color: "red" }
							  }]
							}//this._getWebStyleSymbol("Overhanging_Sidewalk_-_Light_off")
					}, {
					  value: 1,
					  symbol: {
							  type: "point-3d",  // autocasts as new PointSymbol3D()
							  symbolLayers: [{
								type: "object",  // autocasts as new ObjectSymbol3DLayer()
								width: 3,  // diameter of the object from east to west in meters
								height: 1,  // height of the object in meters
								//depth: 5,  // diameter of the object from north to south in meters
								resource: { primitive: "cylinder" },
								material: { color: "yellow" }
							  }]
							}//this._getWebStyleSymbol("Overhanging_Sidewalk_-_Light_on")
					}]
				  };
			},
			_getFPStreetsStatusRenderer: function(){
				return {
					type: "unique-value", // autocasts as new UniqueValueRenderer()
					field: "LightStatus",
					uniqueValueInfos: [{
					  value: 0,
					  symbol: {
								type: "line-3d",
								symbolLayers: [{
									type: "line",
									size: 15,
									material: {
										color: [255, 0, 0, 0.7]
									}
								}]
							}
					}, {
					  value: 1,
					  symbol: {
								type: "line-3d",
								symbolLayers: [{
									type: "line",
									size: 15,
									material: {
										color: [255, 255, 0, 0.5]
									}
								}]
							}
					}]
				  };
			},
			_getFPStatusRenderer: function(){
				return {
					type: "unique-value", // autocasts as new UniqueValueRenderer()
					field: "LightStatus",
					uniqueValueInfos: [{
					  value: 0,
					  symbol: {
							  type: "point-3d",  // autocasts as new PointSymbol3D()
							  symbolLayers: [{
								type: "object",  // autocasts as new ObjectSymbol3DLayer()
								width: 10,    // diameter of the object from east to west in meters
								height: 5,  // height of object in meters
								depth: 15,   // diameter of the object from north to south in meters
								resource: { primitive: "cube" },
								material: { color: "red" }
							  }]
							}
					}, {
					  value: 1,
					   symbol: {
							  type: "point-3d",  // autocasts as new PointSymbol3D()
							  symbolLayers: [{
								type: "object",  // autocasts as new ObjectSymbol3DLayer()
								width: 10,    // diameter of the object from east to west in meters
								height: 5,  // height of object in meters
								depth: 15,   // diameter of the object from north to south in meters
								resource: { primitive: "cube" },
								material: { color: "yellow" }
							  }]
							}
					}]
				  };
			},
            _getSymbol: function(a, b) {
                var c = new u,
                    d = h.byId("panelSym").getContext("2d");
                d.canvas.width = 500;
                d.canvas.height = 500;
                d.arc(250, 250, 250, 0, 2 * Math.PI, !1);
                d.fillStyle = b;
                d.fill();
                var e = new Image;
                e.onload = function() {
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
            _addTrafficRenderer: function(a) {
                var b = [];
                f.forEach(a, function(a) {
                    var c = t.geographicToWebMercator(a.geometry),
                        c = new m(c);
                    c.attributes = a.attributes;
                    b.push(c)
                });
                this._removeTrafficRenderer();
                this.trafficRenderer = new M(this.view3D, b);
                n.add(this.view3D, this.trafficRenderer)
            },
            _removeTrafficRenderer: function() {
                this.trafficRenderer && n.remove(this.view3D, this.trafficRenderer);
                this.trafficRenderer = null
            },
            _addHiRenderer: function(a) {
                a = new r({
                    longitude: a.longitude,
                    latitude: a.latitude,
                    z: 0
                });
                a = t.geographicToWebMercator(a);
                this._removeHiRenderer();
                this.hiRenderer = new L(this.view3D, a, {
                    width: 500,
                    height: 200,
                    color: this.hiColor,
                    loop: !0
                });
                n.add(this.view3D, this.hiRenderer)
            },
            _removeHiRenderer: function() {
                this.hiRenderer && n.remove(this.view3D, this.hiRenderer);
                this.hiRenderer = null
            },
            _pauseTimer: function() {
                k.contains("btnPlay", "playing") && this._toggleTimer()
            },
            _toggleTimer: function() {
                k.contains("btnPlay",
                    "playing") ? (this._stopTimer(), k.remove("btnPlay", "playing")) : (this._startTimer(), k.add("btnPlay", "playing"))
            },
            _startTimer: function() {
                this._stopTimer();
                this._tickTimer();
                this.timer = setInterval(e.hitch(this, this._tickTimer), this.config.interval)
            },
            _stopTimer: function() {
                this.timer && (clearInterval(this.timer), this.timer = null);
                this._stopTimerActions()
            },
            _stopTimerActions: function() {
                this.lyrData.removeAll();
                this.smartTip.update(null);
                this._removeHiRenderer();
                f.forEach(this.config.cards, e.hitch(this, function(a) {
                    a.card.unselect();
                    a.card.resize()
                }));
                this.hiColor = "#ffffff";
                g.set("panelTop", "color", "#ffffff");
                g.set("btnPlay", "background-color", "#ffffff");
                g.set("panelCards", "width", 320 * this.config.cards.length + "px");
                this.loopIndex = -1
            },
            _tickTimer: function() {
                this.loopIndex += 1;
                0 === this.loopIndex ? (this._timerMaximize(), this._timerSelect()) : 0 < this.loopIndex && 3 > this.loopIndex ? this._timerSelect() : (this._timerResize(), this.loopIndex = -1, this.index += 1, this.index >= this.config.cards.length && (this.index = 0))
            },
            _timerMaximize: function() {
                0 < this.config.cards[this.index].data.features.length ?
                    this._toggleCard({
                        id: "card" + this.index,
                        action: "maximize",
                        manual: !1
                    }) : (this.index += 1, this.loopIndex = 0, this.index >= this.config.cards.length && (this.index = 0), this._timerMaximize())
            },
            _timerResize: function() {
                this._toggleCard({
                    id: "card" + this.index,
                    action: "resize",
                    manual: !1
                })
            },
            _timerSelect: function() {
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
                    "AIR QUALITY" === a.label && (this.loopIndex = 2)
                }
            },
			_getBuildingRenderer: function(){
				var fullyOccupiedSym = {
					type: "polygon-3d", // autocasts as new PolygonSymbol3D()
					symbolLayers: [{
					  type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
					  material: {
						//color: "#9E559C"						
						//color: "#FBE789"
						color: [153, 167, 204, 0.7]
					  }
					}]
				  };

				  var notOccupiedSym = {
					type: "polygon-3d", // autocasts as new PolygonSymbol3D()
					symbolLayers: [{
					  type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
					  material: {
						//color: "#A7C636"
						//color: "#1B90A7"
						color: [153, 204, 203]
					  }
					}]
				  };
				  
				  var semiOccupiedSym = {
					type: "polygon-3d", // autocasts as new PolygonSymbol3D()
					symbolLayers: [{
					  type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
					  material: {
						//color: "#A7EEFF"
						//color: [167,238,255]
						color: [153, 204, 179]
					  }
					}]
				  };
				  
				  var underConstructionSym = {
					type: "polygon-3d", // autocasts as new PolygonSymbol3D()
					symbolLayers: [{
					  type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
					  material: {
						//color: "#BAEE00"
						//color: [186,238,0]
						color: [175, 206, 152]
					  }
					}]
				  };

				  var renderer = {
					type: "unique-value", // autocasts as new UniqueValueRenderer()
					defaultSymbol: {
					  type: "polygon-3d", // autocasts as new PolygonSymbol3D()
					  symbolLayers: [{
						type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
						material: {
						  //color: "#FC921F"
						  color: [230, 230, 230, 1]
						}
					  }]
					},
					defaultLabel: "Other",
					field: "Status",
					uniqueValueInfos: [{
					  value: "Fully Occupied",
					  symbol: fullyOccupiedSym,
					  label: "Fully Occupied"
					}, {
					  value: "Not Occupied",
					  symbol: notOccupiedSym,
					  label: "Not Occupied"
					}, {
					  value: "Semi Occupied",
					  symbol: semiOccupiedSym,
					  label: "Semi Occupied"
					}, {
					  value: "Under Construction",
					  symbol: underConstructionSym,
					  label: "Under Construction"
					}],
					visualVariables: [{
					  type: "size",
					  field: "Elevation",
					  valueUnit: "meters" // Converts and extrudes all data values in meters
					}]
				  };
				  
				  return renderer;
			},
			_getBuildingSceneRenderer: function(){
				var ageClasses =  [{
						minValue: 1900,
						maxValue: 1930,
						label: "Fully Occupied",
						color: [153, 167, 204]
					}, {
						minValue: 1931,
						maxValue: 1960,
						label: "Not Occupied",
						color: [149, 184, 214]
					}, {
						minValue: 1961,
						maxValue: 1990,
						label: "Semi Occupied",
						color: [153, 204, 203]
					}, {
						minValue: 1991,
						maxValue: 2024,
						label: "Under Construction",
						color: [153, 204, 179]
					}];
							
				var initPeriod = [!0, !0, !0, !0, !0];
				
				var renderer = new ClassBreaksRenderer({
					field: "CNSTRCT_YR",
					legendOptions: {
						title: "Status"
					},
					defaultSymbol: new G({
						symbolLayers: [new F({
							material: {
								color: this.config.buildingsColor
							}
						})]
					}),
					classBreakInfos: ageClasses.map(function(e, t) {
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
			_getUniqueValueSymbol: function (name, color) {
				var verticalOffset = {
					screenLength: 40,
					maxWorldLength: 200,
					minWorldLength: 35
				  };
				return {
				  type: "point-3d", // autocasts as new PointSymbol3D()
				  symbolLayers: [{
					type: "icon", // autocasts as new IconSymbol3DLayer()
					resource: {
					  href: name
					},
					size: 20,
					outline: {
					  color: "white",
					  size: 2
					}
				  }],

				  verticalOffset: verticalOffset,

				  callout: {
					type: "line", // autocasts as new LineCallout3D()
					color: "white",
					size: 2,
					border: {
					  color: color
					}
				  }
				};
			},
			_getLandMarksRenderer(){
				var pointsRenderer = {
					type: "unique-value", // autocasts as new UniqueValueRenderer()
					field: "FacilityType",
					uniqueValueInfos: [{
					  value: "ambulance",
					  symbol: this._getUniqueValueSymbol("./images/ambulance.png", "#D13470")
					}, {
					  value: "firefighter",
					  symbol: this._getUniqueValueSymbol("./images/fire-station.png", "#F97C5A")
					}, {
					  value: "Church",
					  symbol: this._getUniqueValueSymbol("Church.png", "#884614")
					}, {
					  value: "Hotel",
					  symbol: this._getUniqueValueSymbol("Hotel.png", "#56B2D6")
					}, {
					  value: "Park",
					  symbol: this._getUniqueValueSymbol("Park.png", "#40C2B4")
					}]
				};
				
				return pointsRenderer;
			},
			_addMeshRenderer: function(a) {
                this._removeMesheRnderer();
                this.meshRenderer = new Mesh(this.view3D, {
                    height: 400,
                    color1: this.config.highColor,
                    color2: this.config.buildingsColor,
                    vertices: a.vertices,
                    indices: a.indices,
                    data: a.data
                });
                
                n.add(this.view3D, this.meshRenderer)
            },
            _removeMesheRnderer: function() {
                this.meshRenderer && x.remove(this.view3D, this.meshRenderer);
                this.meshRenderer = null
            },
			_arrSum: arr => arr.reduce((a,b) => a + b, 0),
			_arrMax: arr => Math.max(...arr),
			_arrMin: arr => Math.min(...arr),
			_arrAvg: arr => arr.reduce((a,b) => a + b, 0) / arr.length
        })
    });
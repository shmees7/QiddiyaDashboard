define({
    // UI
    "title": "NYC VISION ZERO",
    "colors2": ["#5cc9cd", "#54b2cd", "#4ba0c7", "#448ec7", "#b599db", "#d3d440", "#b4b537", "#99b535", "#6da92c", "#4d9828", "#f5c002", "#fb9721", "#fb621e", "#e53d0c", "#d1260f"],
    "colors": ["#5cc9cd", "#b599db", "#6da92c", "#fb9721", "#fb621e", "#e53d0c", "#d1260f"],
    "interval": 10000,

    // MAP
    "center": [-73.95689483673105, 40.72792435985267, 950], //[-74.003, 40.68, 1800],
    //"center": [-8228182.035477651, 4962756.086061472 , -0.5646835984662175], //[-74.003, 40.68, 1800],
    "zoom": 16,
    "tilt": 69.93185946918338, //65,
    "heading": 293.60038766701484, //0,
    "basemapUrl": "http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer",
    //"buildingsUrl": "http://tiles.arcgis.com/tiles/0p6i4J6xhQas4Unf/arcgis/rest/services/Manhattan3D_CullingBack/SceneServer/layers/0",
    "buildingsUrl": "https://tiles.arcgis.com/tiles/cFEFS0EWrhfDeVw9/arcgis/rest/services/Buildings_Manhattan/SceneServer",
    "buildingsColor": [170, 170, 170, 1],
    "defaultColor": [230, 230, 230, 1],

    // DATA
    "dataUrl": "data/data2.json",
    "roadsUrl": "http://services.arcgis.com/80hk79qB8z45zcHi/arcgis/rest/services/Road_Links/FeatureServer/5",
    "trafficUrl": "http://207.251.86.229/nyc-links-cams/LinkSpeedQuery.txt",
    "camerasUrl": "http://dotsignals.org/new-data.php?query=",
    "cctvUrl": "http://dotsignals.org/google_popup.php?cid=318",
    "airUrl": "http://www.airnowapi.org/aq/forecast/latLong/?format=application/json&latitude=39.0509&longitude=-121.4453&date=2016-12-10&distance=25&API_KEY=D5B03A82-25A5-47B4-8CF3-19E5E780EB3E",

    solidEdges: {
        type: "solid",
        color: [0, 0, 0, 0.6],
        size: 1
    },
    sketchEdges: {
        type: "sketch",
        color: [0, 0, 0, 0.8],
        size: 1,
        extensionLength: 10
    },
    buildingsColors: {
        under_construction: "#39b1c3",
        semi_occupied: "#4ca957",
        not_occupied: "#e9d029",
        fully_occupied: "#ea3873",
        others: "#999999",
    },
    // CARDS
    "cards": [
        {
            "label": "TRAFFIC",
            "sublabel": "MPH - AVG SPEED",
            "color": "#013484",
            "icon": "./images/car.png"
            //,"dataUrl": "http://coolmaps.esri.com/Dashboards/VisionZero/data/data.php?card=traffic"
        }, {
            "label": "CAMERAS",
            "sublabel": "NEAR MAP CENTER",
            "color": "#215a8f",
            "icon": "./images/camera.png"
            //,"dataUrl": "http://coolmaps.esri.com/Dashboards/VisionZero/data/data.php?card=cameras"
        }, {
            "label": "Building Occupancy",
            "sublabel": "",
            "color": "#5f5288",
            "icon": "./images/fullyoccupied.png"
            //,"dataUrl": ".http://coolmaps.esri.com/Dashboards/VisionZero/data/data.php?card=airquality"
        }, {
            "label": "Building Accomplishment",
            "sublabel": "",
            "color": "#ea41b6",
            "icon": "./images/underConstruction.png"
            //,"dataUrl": ".http://coolmaps.esri.com/Dashboards/VisionZero/data/data.php?card=airquality"
        }, {
            "label": "Building Type",
            "sublabel": "",
            "color": "#ff740d",
            "icon": "./images/GovernmentBuildings.png"
            //,"dataUrl": ".http://coolmaps.esri.com/Dashboards/VisionZero/data/data.php?card=airquality"
        }, {
            "label": "COLLISIONS",
            "sublabel": "CRASHES",
            "color": "#ffc024",
            "icon": "./images/accident2.png"
            //,"dataUrl": "http://coolmaps.esri.com/Dashboards/VisionZero/data/data.php?card=accidents"
        }, {
            "label": "PEDESTRIANS",
            "sublabel": "INJURIES / DEATHS",
            "color": "#67ac4b",
            "icon": "./images/man.png"
            //,"dataUrl": "http://coolmaps.esri.com/Dashboards/VisionZero/data/data.php?card=accidents&type=pedestrian"
        }, {
            "label": "CYCLISTS",
            "sublabel": "INJURIES / DEATHS",
            "color": "#37c4e9",
            "icon": "./images/bike.png"
            //,"dataUrl": "http://coolmaps.esri.com/Dashboards/VisionZero/data/data.php?card=accidents&type=cyclist"
        }, {
            "label": "MOTORISTS",
            "sublabel": "INJURIES / DEATHS",
            "color": "#013484",
            "icon": "./images/driver.png"
            //,"dataUrl": "http://coolmaps.esri.com/Dashboards/VisionZero/data/data.php?card=accidents&type=motorist"
        }, {
            "label": "AIR QUALITY",
            "sublabel": "",
            "color": "#215a8f",
            "icon": "./images/air.png"
            //,"dataUrl": ".http://coolmaps.esri.com/Dashboards/VisionZero/data/data.php?card=airquality"
        }, {
            "label": "WEATHER",
            "sublabel": "",
            "color": "#5f5288",
            "icon": "./images/weather.png"
            //,"dataUrl": "http://coolmaps.esri.com/Dashboards/VisionZero/data/data.php?card=weather"
        }
    ],

    // MONTHS
    "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],

    // WEATHER
    "weatherData": {
        119: ["Cloudy", "cloudy5.png", "cloudy5.png"],
        377: ["Moderate or heavy showers of ice pellets", "hail.png", "hail.png"],
        374: ["Light showers of ice pellets", "hail.png", "hail.png"],
        350: ["Ice pellets", "hail.png", "hail.png"],
        353: ["Light rain shower", "light_rain.png", "light_rain.png"],
        302: ["Moderate rain", "light_rain.png", "light_rain.png"],
        296: ["Light rain", "light_rain.png", "light_rain.png"],
        293: ["Patchy light rain", "light_rain.png", "light_rain.png"],
        266: ["Light drizzle", "light_rain.png", "light_rain.png"],
        263: ["Patchy light drizzle", "light_rain.png", "light_rain.png"],
        122: ["Overcast", "overcast.png", "overcast.png"],
        359: ["Torrential rain shower", "shower3.png", "shower3.png"],
        308: ["Heavy rain", "shower3.png", "shower3.png"],
        365: ["Moderate or heavy sleet showers", "sleet.png", "sleet.png"],
        362: ["Light sleet showers", "sleet.png", "sleet.png"],
        320: ["Moderate or heavy sleet", "sleet.png", "sleet.png"],
        317: ["Light sleet", "sleet.png", "sleet.png"],
        314: ["Moderate or Heavy freezing rain", "sleet.png", "sleet.png"],
        311: ["Light freezing rain", "sleet.png", "sleet.png"],
        284: ["Heavy freezing drizzle", "sleet.png", "sleet.png"],
        281: ["Freezing drizzle", "sleet.png", "sleet.png"],
        185: ["Patchy freezing drizzle nearby", "sleet.png", "sleet.png"],
        182: ["Patchy sleet nearby", "sleet.png", "sleet.png"],
        395: ["Moderate or heavy snow in area with thunder", "snow4.png", "snow4.png"],
        335: ["Patchy heavy snow", "snow4.png", "snow4.png"],
        230: ["Blizzard", "snow4.png", "snow4.png"],
        227: ["Blowing snow", "snow4.png", "snow4.png"],
        371: ["Moderate or heavy snow showers", "snow5.png", "snow5.png"],
        338: ["Heavy snow", "snow5.png", "snow5.png"],
        389: ["Moderate or heavy rain in area with thunder", "tstorm3.png", "tstorm3.png"],
        392: ["Patchy light snow in area with thunder", "snow2.png", "snow2_night.png"],
        386: ["Patchy light rain in area with thunder", "tstorm1.png", "tstorm1_night.png"],
        368: ["Light snow showers", "snow2.png", "snow2_night.png"],
        356: ["Moderate or heavy rain shower", "shower2.png", "shower2_night.png"],
        332: ["Moderate snow", "snow3.png", "snow3_night.png"],
        329: ["Patchy moderate snow", "snow2.png", "snow2_night.png"],
        326: ["Light snow", "snow1.png", "snow1_night.png"],
        323: ["Patchy light snow", "snow1.png", "snow1_night.png"],
        305: ["Heavy rain at times", "shower2.png", "shower2_night.png"],
        299: ["Moderate rain at times", "shower2.png", "shower2_night.png"],
        260: ["Freezing fog", "fog.png", "fog_night.png"],
        248: ["Fog", "fog.png", "fog_night.png"],
        200: ["Thundery outbreaks in nearby", "tstorm1.png", "tstorm1_night.png"],
        179: ["Patchy snow nearby", "snow1.png", "snow1_night.png"],
        176: ["Patchy rain nearby", "shower1.png", "shower1_night.png"],
        143: ["Mist", "mist.png", "mist_night.png"],
        116: ["Partly Cloudy", "cloudy3.png", "cloudy3_night.png"],
        113: ["Clear/Sunny", "sunny.png", "sunny_night.png"]
    }

});
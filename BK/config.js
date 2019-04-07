const mode = "global";
 //global or local
localConfigs = {
	"SchoolsUrl": "http://52.178.111.221/server/rest/services/NCSI/NCSI_20180401/MapServer/0",
	"incidentCatchmentArea": "http://52.178.111.221/server/rest/services/NCSI/NCSI_20180401/MapServer/3",
	"SchoolNearestFacilitiesUrl": "http://52.178.111.221/server/rest/services/NCSI/NCSI_Manhaten_20180404/MapServer/3", //*** need to have local one
	"buildingsUrl": "http://52.178.111.221/server/rest/services/NCSI/NCSI_20180401/MapServer/2", //"http://52.178.111.221/server/rest/services/IoT/Streetlighting_IoT_v0_1_20180228/MapServer/8",//"http://52.178.111.221/server/rest/services/NCSI/NCSI_20180401/MapServer/2",
	"buildingsSceneUrl": "https://tiles.arcgis.com/tiles/n8DZcMxnIWosk4zB/arcgis/rest/services/IOT_Building/SceneServer",
	"Streets_sceneLayerUrl": "https://tiles.arcgis.com/tiles/n8DZcMxnIWosk4zB/arcgis/rest/services/IOT_Streets/SceneServer",
	"center": [58.407720212213576 , 23.58128119273296, 750],
	"tilt": 66.32991792131092,
	"heading": 78.44884304417742,
	"defaultColor": [170, 170, 170, 1]
};

globalConfigs = { //Manhaten
	"SchoolsUrl": "http://52.178.111.221/server/rest/services/NCSI/NCSI_Manhaten_20180404/MapServer/0",
	"incidentCatchmentArea": "http://52.178.111.221/server/rest/services/Qiddiya/Qiddiya_Manhaten_20180906/MapServer/5",
	"SchoolNearestFacilitiesUrl": "http://52.178.111.221/server/rest/services/NCSI/NCSI_Manhaten_20180404/MapServer/3",
	"buildingsUrl": "http://52.178.111.221/server/rest/services/NCSI/NCSI_Manhaten_20180404/MapServer/1",
	"buildingsSceneUrl": "https://tiles.arcgis.com/tiles/cFEFS0EWrhfDeVw9/arcgis/rest/services/Buildings_Manhattan/SceneServer",
	"Streets_sceneLayerUrl": "https://tiles.arcgis.com/tiles/n8DZcMxnIWosk4zB/arcgis/rest/services/IOT_Streets/SceneServer",
	"center": [-73.95689483673105, 40.72642435985267 , 950],
	"tilt": 69.93185946918338,
	"heading": 293.60038766701484,
	"defaultColor": [230, 230, 230, 1]
};

baseMapsUrls = {
	"World_Dark_Gray_Base": "http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer",
	"World_Light_Gray_Base": "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer"
}
define({
    // UI
    "title": "Qiddiya",
    "colors2": ["#5cc9cd", "#54b2cd", "#4ba0c7", "#448ec7", "#b599db", "#d3d440", "#b4b537", "#99b535", "#6da92c", "#4d9828", "#f5c002", "#fb9721", "#fb621e", "#e53d0c", "#d1260f"],
    "colors": ["#5cc9cd", "#b599db", "#6da92c", "#fb9721", "#fb621e", "#e53d0c", "#d1260f"],
    "interval": 10000,
	"gpServerURL":"http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer",
	
    // MAP
    "center": mode == "global"? globalConfigs.center : localConfigs.center,
    "zoom": 16,
    "tilt": mode == "global"? globalConfigs.tilt : localConfigs.tilt,
    "heading": mode == "global"? globalConfigs.heading : localConfigs.heading,
	
    "basemapUrl": baseMapsUrls.World_Dark_Gray_Base,

	"incidentCatchmentArea":  mode == "global"? globalConfigs.incidentCatchmentArea : localConfigs.incidentCatchmentArea,
	"SchoolNearestFacilitiesUrl": mode == "global"? globalConfigs.SchoolNearestFacilitiesUrl : localConfigs.SchoolNearestFacilitiesUrl,
	"BuildingLayerUrl": mode == "global"? globalConfigs.buildingsUrl : localConfigs.buildingsUrl,	
	"BuildingSceneLayerUrl": mode == "global"? globalConfigs.buildingsSceneUrl : localConfigs.buildingsSceneUrl,
	
    "buildingsColor": mode == "global"? globalConfigs.defaultColor : localConfigs.defaultColor,
	"highColor": [17, 187, 223, 1],
	    
    // CARDS
    "cards": [
		{
            "label": "SCHOOLS",
			"dataSource":"mapService",
            "sublabel": "School",
            "color": "#8f58af",
            "icon": "./images/school.png",
			"filterByExtent": 1,
            "dataUrl": mode == "global"? globalConfigs.SchoolsUrl : localConfigs.SchoolsUrl,
			"condition": "1=1"
        },
        {
            "label": "FULLY OCCUPIED",
			"dataSource":"buildingsDataStore",
			"statisticType": "sum",
			"statisticFieldName":"FullyOccupiedCount",
			"displayFieldName":"FullyOccupiedCount",
            "sublabel": "Fully Occupied Buildings",
            "color": "#8f77ce",
            "icon": "./images/fullyoccupied.png",
			"filterByExtent": 1,
            "dataUrl": mode == "global"? globalConfigs.buildingsUrl:localConfigs.buildingsUrl
        },
		{
            "label": "NOT OCCUPIED",
			"dataSource":"buildingsDataStore",
			"statisticType": "sum",
			"statisticFieldName":"NotOccupiedCount",
			"displayFieldName":"NotOccupiedCount",
            "sublabel": "Not Occupied Buildings",
            "color": "#2f89dc",
            "icon": "./images/emptyBuilding.png",
            "filterByExtent": 0,
            "dataUrl": mode == "global"? globalConfigs.buildingsUrl:localConfigs.buildingsUrl
        },
		{
            "label": "SEMI OCCUPIED",
			"dataSource":"buildingsDataStore",
			"statisticType": "sum",
			"statisticFieldName":"SemiOccupiedCount",
			"displayFieldName":"SemiOccupiedCount",
            "sublabel": "Semi Occupied Buildings",
            "color": "#2fa1d5",
            "icon": "./images/semiOccupied.png",
            "filterByExtent": 0,
            "dataUrl": mode == "global"? globalConfigs.buildingsUrl:localConfigs.buildingsUrl
        },
		{
            "label": "UNDER CONSTRUCTION",
			"dataSource":"buildingsDataStore",
			"statisticType": "sum",
			"statisticFieldName":"UnderConstructionCount",
			"displayFieldName":"UnderConstructionCount",
            "sublabel": "Under Construction Buildings",
            "color": "#2fb3e8",
            "icon": "./images/underConstruction.png",
            "filterByExtent": 0,
            "dataUrl": mode == "global"? globalConfigs.buildingsUrl:localConfigs.buildingsUrl
        },
        {
            "label": "Education Institutions",
			"dataSource":"buildingsDataStore",
			"statisticType": "sum",
			"statisticFieldName":"EducationInstitutionsCount",
			"displayFieldName":"EducationInstitutionsCount",
            "sublabel": "Education Institutions",
            "color": "#2fb3e8",
            "icon": "./images/EducationInstitutions.png",
            "filterByExtent": 0,
            "dataUrl": mode == "global"? globalConfigs.buildingsUrl:localConfigs.buildingsUrl
        },
		{
            "label": "Markets",
			"dataSource":"buildingsDataStore",
			"statisticType": "sum",
			"statisticFieldName":"MarketsCount",
			"displayFieldName":"MarketsCount",
            "sublabel": "Markets",
            "color": "#6da71e",
            "icon": "./images/market.png",
            "filterByExtent": 0,
            "dataUrl": mode == "global"? globalConfigs.buildingsUrl:localConfigs.buildingsUrl
        },
		{
            "label": "Government Buildings",
			"dataSource":"buildingsDataStore",
			"statisticType": "sum",
			"statisticFieldName":"GovernmentBuildingsCount",
			"displayFieldName":"GovernmentBuildingsCount",
            "sublabel": "Government Buildings",
            "color": "#2fa1d5",
            "icon": "./images/GovernmentBuildings.png",
            "filterByExtent": 0,
            "dataUrl": mode == "global"? globalConfigs.buildingsUrl:localConfigs.buildingsUrl
        },
		{
            "label": "Firefighter Stations",
			"dataSource":"buildingsDataStore",
			"statisticType": "sum",
			"statisticFieldName":"FireFighterStationsCount",
			"displayFieldName":"FireFighterStationsCount",
            "sublabel": "Firefighter Stations",
            "color": "#2fb3e8",
            "icon": "./images/fire-station.png",
            "filterByExtent": 0,
            "dataUrl": mode == "global"? globalConfigs.buildingsUrl:localConfigs.buildingsUrl
        },
		{
            "label": "Ambulance Stations",
			"dataSource":"buildingsDataStore",
			"statisticType": "sum",
			"statisticFieldName":"AmbulanceStationsCount",
			"displayFieldName":"AmbulanceStationsCount",
            "sublabel": "Ambulance Stations",
            "color": "#2fb3e8",
            "icon": "./images/ambulance.png",
            "filterByExtent": 0,
            "dataUrl": mode == "global"? globalConfigs.buildingsUrl:localConfigs.buildingsUrl
        }
		
    ],

    // MONTHS
    "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],

    // WEATHER
    "weatherData": {
         119:["Cloudy","cloudy5.png","cloudy5.png"],
         377:["Moderate or heavy showers of ice pellets","hail.png","hail.png"],
         374:["Light showers of ice pellets","hail.png","hail.png"],
         350:["Ice pellets","hail.png","hail.png"],
         353:["Light rain shower","light_rain.png","light_rain.png"],
         302:["Moderate rain","light_rain.png","light_rain.png"],
         296:["Light rain","light_rain.png","light_rain.png"],
         293:["Patchy light rain","light_rain.png","light_rain.png"],
         266:["Light drizzle","light_rain.png","light_rain.png"],
         263:["Patchy light drizzle","light_rain.png","light_rain.png"],
         122:["Overcast","overcast.png","overcast.png"],
         359:["Torrential rain shower","shower3.png","shower3.png"],
         308:["Heavy rain","shower3.png","shower3.png"],
         365:["Moderate or heavy sleet showers","sleet.png","sleet.png"],
         362:["Light sleet showers","sleet.png","sleet.png"],
         320:["Moderate or heavy sleet","sleet.png","sleet.png"],
         317:["Light sleet","sleet.png","sleet.png"],
         314:["Moderate or Heavy freezing rain","sleet.png","sleet.png"],
         311:["Light freezing rain","sleet.png","sleet.png"],
         284:["Heavy freezing drizzle","sleet.png","sleet.png"],
         281:["Freezing drizzle","sleet.png","sleet.png"],
         185:["Patchy freezing drizzle nearby","sleet.png","sleet.png"],
         182:["Patchy sleet nearby","sleet.png","sleet.png"],
         395:["Moderate or heavy snow in area with thunder","snow4.png","snow4.png"],
         335:["Patchy heavy snow","snow4.png","snow4.png"],
         230:["Blizzard","snow4.png","snow4.png"],
         227:["Blowing snow","snow4.png","snow4.png"],
         371:["Moderate or heavy snow showers","snow5.png","snow5.png"],
         338:["Heavy snow","snow5.png","snow5.png"],
         389:["Moderate or heavy rain in area with thunder","tstorm3.png","tstorm3.png"],
         392:["Patchy light snow in area with thunder","snow2.png","snow2_night.png"],
         386:["Patchy light rain in area with thunder","tstorm1.png","tstorm1_night.png"],
         368:["Light snow showers","snow2.png","snow2_night.png"],
         356:["Moderate or heavy rain shower","shower2.png","shower2_night.png"],
         332:["Moderate snow","snow3.png","snow3_night.png"],
         329:["Patchy moderate snow","snow2.png","snow2_night.png"],
         326:["Light snow","snow1.png","snow1_night.png"],
         323:["Patchy light snow","snow1.png","snow1_night.png"],
         305:["Heavy rain at times","shower2.png","shower2_night.png"],
         299:["Moderate rain at times","shower2.png","shower2_night.png"],
         260:["Freezing fog","fog.png","fog_night.png"],
         248:["Fog","fog.png","fog_night.png"],
         200:["Thundery outbreaks in nearby","tstorm1.png","tstorm1_night.png"],
         179:["Patchy snow nearby","snow1.png","snow1_night.png"],
         176:["Patchy rain nearby","shower1.png","shower1_night.png"],
         143:["Mist","mist.png","mist_night.png"],
         116:["Partly Cloudy","cloudy3.png","cloudy3_night.png"],
         113:["Clear/Sunny", "sunny.png", "sunny_night.png"]
    }

});

// Adding a map 
var map = L.map('map',{
		zoomControl: false,
}).setView([0,0], 2);

// Creating basemaps and adding a switch control
var baseMaps = new L.basemapsSwitcher([
	{
		layer: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
							attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
				}),
		icon: 'basemaps/Satellite.jpg',
		name: 'Satellite'
	},
	{
		layer: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
							attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
							maxZoom: 16
			}),
		icon: 'basemaps/NatGeo.jpg',
		name: 'Physical'
	},
	{
		layer: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
							attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
				}),
		icon: 'basemaps/Street.jpg',
		name: 'Street'
	},
	{
		layer: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
							attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
				}).addTo(map),
		icon: 'basemaps/Topographic.jpg',
		name: 'Topographic'
	},
], 

{ position: 'bottomright' }).addTo(map); 

/* BUTTONS ON THE RIGHT */

var layerControl = L.control.layers(null, null).addTo(map); 

//Zoom Control
var zoomHome = L.Control.zoomHome({
		position: 'topright'
}).addTo(map);

//Adding Drawing Controls 
map.pm.addControls({  
	position: 'topright', 
});  

/* BUTTONS ON THE LEFT TOP*/

// Geocoding/search for a location
L.Control.geocoder({
	defaultMarkGeocode: false,
	position: 'topleft',
})
.on('markgeocode', function(e) {
    var bbox = e.geocode.bbox;
    var poly = L.polygon([
		bbox.getSouthEast(),
		bbox.getNorthEast(),
		bbox.getNorthWest(),
		bbox.getSouthWest()
    ]).addTo(map);
	map.fitBounds(poly.getBounds());
}).addTo(map);

// Loading CSV files
L.Control.Button = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        var button = L.DomUtil.create('input', 'leaflet-control-button', container);
		L.DomEvent.disableClickPropagation(button);
		button.type="file";
		button.accept=".csv" 
		
		container.style.width = '32px';
		container.style.height = '32px';
		container.style.padding = "0";
		container.style.display = "flex";
        container.style.alignItems = "center";    
 		
        L.DomEvent.on(container, 'click', function(){
            $("input").change(function(event){
				var selectedFile = event.target.files[0];
				var reader = new FileReader();
				
				reader.onload = function(event) {
					layertag = event.target.result;
					var csvlayer = omnivore.csv(layertag).addTo(map); 
					
					layerControl.addOverlay(csvlayer, selectedFile.name);
				};
				
				reader.readAsDataURL(selectedFile);	
		
			});
        });

        container.title = "csv";

        return container;
    },
    onRemove: function(map) {},
});
var control = new L.Control.Button()
control.addTo(map);  

// Loading Geojson and KML files
var control = L.Control.fileLayerLoad({
		position: 'topleft',
		fitBounds: true,
        layerOptions: {
			style: {
				color:'red'
			}
		},
        addToMap: true,
        fileSizeLimit: 50000,
        formats: [
            '.geojson',
            '.kml',
        ]  
}).addTo(map); 

control.loader.on('data:loaded', function (event) {
        
		var spatiallayer = event.layer;
		var layername = event.filename;
		var format = event.format;
		var groupname;
		
		if (format == "kml"){
			groupname = "Spatial Layers - KML"
		}
		else{
			groupname = "Spatial Layers - Geojson"
		}
		layerControl.addOverlay(spatiallayer, layername);
		
});

/* BUTTONS ON THE LEFT BOTTOM */

//Scale Bar Control
var scalebar = L.control.betterscale({
		metric: true,
		imperial: false,
		position: 'bottomleft'
}).addTo(map);

//Print Map 
var printer = L.control.browserPrint({
	position: 'bottomleft', 
	title: 'Print Maps',
	printModes: ["Portrait", "Landscape", "Custom"]
}).addTo(map); 

//Export Map as an Image
var saveimage = L.easyPrint({
	title: "Download Map Images",
	position: 'bottomleft',
	sizeModes: ['Current', 'A4Portrait', 'A4Landscape'],
	exportOnly: true,
}).addTo(map);

// Export KML files
L.Control.Button = L.Control.extend({
    options: {
        position: 'bottomleft'
    },
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        var button = L.DomUtil.create('a', 'leaflet-control-button', container);
		button.id="export"
        
		L.DomEvent.disableClickPropagation(button);
        
		L.DomEvent.on(button, 'click', function(){
            var layers = map.pm.getGeomanDrawLayers();
			var group = L.featureGroup();
			layers.forEach((layer)=>{
				group.addLayer(layer);
			});
			var shapes = group.toGeoJSON();
			var kml = tokml(shapes)
			
			var name = prompt('Enter file name','data.kml'); 
			var convertedData = 'application/vnd.google-earth.kml+xml;charset=utf-8,' + encodeURIComponent(kml);

			button.setAttribute('href', 'data:' + convertedData);
			button.setAttribute('download',name); 
        });

        container.title = "Donwload KML";

        return container;
    },
    onRemove: function(map) {},
});
var control = new L.Control.Button()
control.addTo(map); 

// Export GeoJSON files
L.Control.Button = L.Control.extend({
    options: {
        position: 'bottomleft'
    },
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        var button = L.DomUtil.create('a', 'leaflet-control-button', container);
		button.id="export"
        
		L.DomEvent.disableClickPropagation(button);
        
		L.DomEvent.on(button, 'click', function(){
            var layers = map.pm.getGeomanDrawLayers();
			var group = L.featureGroup();
			layers.forEach((layer)=>{
				group.addLayer(layer);
			});
			var shapes = group.toGeoJSON();
			
			var name = prompt('Enter file name','data.geojson'); 
			var convertedData = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(shapes));

			button.setAttribute('href', 'data:' + convertedData);
			button.setAttribute('download',name); 
        });

        container.title = "Download GeoJSON";

        return container;
    },
    onRemove: function(map) {},
});
var control = new L.Control.Button()
control.addTo(map); 
/************ibrahim**********/








/***********ibrahim************/
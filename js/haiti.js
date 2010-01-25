var HAITI = {
}

Ext.onReady(function() {
    var enable_gmaps = false;
    
    Ext.DomHelper.append(document.body,
                         {tag: 'div',id: 'address2'});
    Ext.get('address_div').show();
    function onFeatureSelect(event) {
        var feature = event.feature;
        var selectedFeature = feature;
        var url = '';
        if (feature.layer.base) {
            url += feature.layer.base;
        }
	//console.log(feature.attributes);
        url += feature.attributes.url;
	popupString = '';
	if(feature.attributes.name) {
		popupString += '<b>' + feature.attributes.name + '</b>'
	}
	if(feature.attributes.title) {
		popupString += '<b>' + feature.attributes.title + '</b>'
	}
	if(feature.attributes.link) {
		popupString += '<br/><a href="' + feature.attributes.link + '" target="_blank">' + feature.attributes.link + '</a><br/>' 
	}
	if(feature.attributes.desc) {
		popupString += feature.attributes.desc
	}
	if(feature.attributes.description) {
		if(feature.attributes.description.substr(0,7) == 'http://') {
			popupString += '<br/><a href="' + feature.attributes.description + '" target="_blank">' + feature.attributes.description + '</a><br/>' 
		} else {
			popupString += '<br/>' + feature.attributes.description + '<br/>' 
		}
			
	}
	if(feature.attributes.url) {
		popupString += '<a target="_blank" href="'+url+'"><img src="' + url+'" /></a>' 
	}
        var popup = new OpenLayers.Popup.FramedCloud("chicken", 
            feature.geometry.getBounds().getCenterLonLat(),
            new OpenLayers.Size(400,400),
		popupString,
            null, true);
        feature.popup = popup;
        map.addPopup(popup);
    }
    function onFeatureUnselect(event) {
        var feature = event.feature;
        if(feature.popup) {
            map.removePopup(feature.popup);
            feature.popup.destroy();
            delete feature.popup;
        }
    }

    var osm_getTileURL = function(bounds) {
        var res = this.map.getResolution();
        var x = Math.round((bounds.left - this.maxExtent.left) /
                           (res * this.tileSize.w));
        var y = Math.round((this.maxExtent.top - bounds.top) /
                           (res * this.tileSize.h));
        var z = this.map.getZoom();
        var limit = Math.pow(2, z);
        
        if (z > 19) { return "404.png"; }
        if (y < 0 || y >= limit) {
            return "404.png";
        } else {
            x = ((x % limit) + limit) % limit;
            return this.url + z + "/" + x + "/" + y + "." + this.type;
        }
    };


    var map_options = { 
        'units' : "m",
        'maxResolution' : 156543.0339,
        'numZoomLevels' : 22,
        'projection' : new OpenLayers.Projection("EPSG:900913"),
        'displayProjection' : new OpenLayers.Projection("EPSG:4326"),
        'maxExtent' : new OpenLayers.Bounds(-20037508.34,-20037508.34,
                                            20037508.34,20037508.34),
        'controls': [new OpenLayers.Control.Navigation(), new OpenLayers.Control.PanZoomBar(), new OpenLayers.Control.Attribution()]                                    
    };
    
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 2;

    //OpenLayers.ProxyHost = "/ushahidi/proxy.cgi?url=";

    var map = new OpenLayers.Map('mappanel', map_options);
    HAITI.map = map;

    var layerRoot = new Ext.tree.TreeNode({
        text: "All Layers",
        expanded: true
    });

    /////////////////////////////////////
    // OSM Base Layers    ///////////////
    /////////////////////////////////////
    var OSM_mapnik = new OpenLayers.Layer.TMS(
        "OpenStreetMap (Haiti)",
        "http://live.openstreetmap.nl/haiti/",
        {
            type: 'png', getURL: osm_getTileURL,
            displayOutsideMaxExtent: true,
            attribution: '<a href="http://www.openstreetmap.org/">' +
                'OpenStreetMap</a>',
            buffer: 0    
        }
    );
    map.addLayers([OSM_mapnik]);
    var haiti_best = new OpenLayers.Layer.XYZ("Satellite/Aerial Imagery",
        "http://hypercube.telascience.org/tiles/1.0.0/haiti-best-900913/${z}/${x}/${y}.jpg",
        {
            buffer:0,
            visibility: false
        }
    );
    map.addLayer(haiti_best);

    /////////////////////////////////////
    // Google Base Layers ///////////////
    /////////////////////////////////////
    if (enable_gmaps) {
        var gphy = new OpenLayers.Layer.Google( "Google Terrain",
            {type: G_PHYSICAL_MAP, 'sphericalMercator': true} );
        var gmap = new OpenLayers.Layer.Google( "Google Streets",
            {'sphericalMercator': true});
        var ghyb = new OpenLayers.Layer.Google("Google Hybrid",
            {type: G_HYBRID_MAP, 'sphericalMercator': true} );
        var gsat = new OpenLayers.Layer.Google("Google Satellite",
            {type: G_SATELLITE_MAP, 'sphericalMercator': true} );
        map.addLayers([gphy,ghyb,gmap,gsat]);
    }


    // Layer root container
    layerRoot.appendChild(new GeoExt.tree.BaseLayerContainer({
        text: "Base Layers",
        map: map,
        expanded: true
    }));


    /////////////////////////////////////
    // ENC Layers ///////////////////////
    /////////////////////////////////////
    var encwms = "http://ocs-spatial.ncd.noaa.gov/wmsconnector/com.esri.wms.Esrimap/encdirect?";
    var enclayers = "DEPTH CONTOUR,DEPTH AREA_polygon,SEA AREA_polygon,COASTLINE,LAND AREA_line,ENC INDEX,COVERAGE,FAIRWAY,TRAFFIC SEPARATION ZONE,SEABED AREA_point,RESTRICTED AREA";
    var enclyr = new OpenLayers.Layer.WMS("NOAA ENC WMS",
        encwms, {
            layers: enclayers,
            transparent: true,
            format: "image/png"
        }, {
            isBaseLayer: false, buffer:0,
            visibility: false
        });
    map.addLayers([enclyr]);

    /////////////////////////////////////
    // Digital Globe Image Layers ///////
    /////////////////////////////////////
    var dglobe_layers = [];
    var dg_crisis_tc = new OpenLayers.Layer.XYZ(
        "DG Crisis Event Service (TC)",
        "http://maps.nypl.org/tilecache/1/dg_crisis/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    dglobe_layers.push(dg_crisis_tc);
    /*
    var worldview_011510_tc = new OpenLayers.Layer.XYZ(
        "DG WorldView (2010/01/15) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/worldview-20100115-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    dglobe_layers.push(worldview_011510_tc); */
    var qbird_pre_tc = new OpenLayers.Layer.XYZ(
        "DG Quickbird (Pre-Event) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/quickbird-pre-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    dglobe_layers.push(qbird_pre_tc);
    var qbird_011510_tc = new OpenLayers.Layer.XYZ(
        "DG Quickbird (2010/01/15) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/quickbird-20100115-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    dglobe_layers.push(qbird_011510_tc);
    var worldview_011710_tc = new OpenLayers.Layer.XYZ(
        "DG WorldView (2010/01/17) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/worldview-20100117-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false,
            buffer:0
        }
    );
    dglobe_layers.push(worldview_011710_tc);
    var qbird_011810_tc = new OpenLayers.Layer.XYZ(
        "DG Quickbird (2010/01/18) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/quickbird-20100118-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    dglobe_layers.push(qbird_011810_tc);

    var worldview_011810_tc = new OpenLayers.Layer.XYZ(
        "DG WorldView (2010/01/18) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/worldview-20100118-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    dglobe_layers.push(worldview_011810_tc);
    var worldview_011910_tc = new OpenLayers.Layer.XYZ(
        "DG WorldView (2010/01/19) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/worldview-20100119-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    dglobe_layers.push(worldview_011910_tc);
    var qbird_012010_tc = new OpenLayers.Layer.XYZ(
        "DG Quickbird (2010/01/20) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/quickbird-20100120-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    dglobe_layers.push(qbird_012010_tc);
    var worldview_012010_tc = new OpenLayers.Layer.XYZ(
        "DG WorldView (2010/01/20) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/worldview-20100120-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    dglobe_layers.push(worldview_012010_tc);

    map.addLayers(dglobe_layers);
    
    /////////////////////////////////////
    // SPOT Image Layers ///////
    /////////////////////////////////////
    var spot_layers = []
    var spot_011410_tc = new OpenLayers.Layer.XYZ(
        "SpotImage (2010/01/14)",
        "http://hypercube.telascience.org/tiles/1.0.0/spot-20100114-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    spot_layers.push(spot_011410_tc);
    var spot_011510_tc = new OpenLayers.Layer.XYZ(
        "SpotImage (2010/01/15)",
        "http://hypercube.telascience.org/tiles/1.0.0/spot-20100115-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    spot_layers.push(spot_011510_tc);
    map.addLayers(spot_layers);
    
    /////////////////////////////////////
    // High Res Aerial Image Layers ///////
    /////////////////////////////////////
    var hires_layers = []
    var google_011710_tc = new OpenLayers.Layer.XYZ(
        "Google Aerial (2010/01/17) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/google-20100117-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, attribution: "Google 2010"
        }
    );
    hires_layers.push(google_011710_tc);
    var noaa_011810_tc = new OpenLayers.Layer.XYZ(
        "NOAA Aerial (2010/01/17)",
        "http://hypercube.telascience.org/tiles/1.0.0/noaa-20100118-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    hires_layers.push(noaa_011810_tc);
    var worldbank_012110_tc = new OpenLayers.Layer.XYZ(
        "Worldbank (2010/01/21)",
        "http://hypercube.telascience.org/tiles/1.0.0/worldbank-21-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    hires_layers.push(worldbank_012110_tc);

    map.addLayers(hires_layers);
    
    /////////////////////////////////////
    // GeoEye Image Layers //////////////
    /////////////////////////////////////
    var geoeye_layers = [];
    var ge_011310_wms = new OpenLayers.Layer.WMS(
        "Event Imagery PAP (WMS)",
        "http://maps.nypl.org/relief/maps/wms/32?",
        {
            transparent: 'TRUE',
            'sphericalMercator': true
        },
        {'reproject': false, 'isBaseLayer': false, 'visibility': false}
    );
    geoeye_layers.push(ge_011310_wms);
    var ge_011310_tc = new OpenLayers.Layer.XYZ(
        "Event Imagery Extended (TC)",
        "http://maps.nypl.org/tilecache/1/geoeye/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    geoeye_layers.push(ge_011310_tc);
    var ikonos_011510_wms = new OpenLayers.Layer.WMS(
        "Ikonos (2010/01/14-15) (WMS)",
        "http://hypercube.telascience.org/cgi-bin/mapserv?",
        {
            map: '/home/racicot/haiti/mapfiles/basedata.map',
            layers: 'ikonos-01-15',
            transparent: 'TRUE',
            'sphericalMercator': true
        },
        {'reproject': false, 'isBaseLayer': false, 'visibility': false}
    );
    geoeye_layers.push(ikonos_011510_wms);
    var ikonos_011510_tc = new OpenLayers.Layer.XYZ(
        "Ikonos (2010/01/14-15) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/geoeye-ikonos-20100115-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, attribution: "GeoEye 2010"
        }
    );
    geoeye_layers.push(ikonos_011510_tc);
    var geoeye_011610_wms = new OpenLayers.Layer.WMS(
        "GeoEye1 (2010/01/16) (WMS)",
        "http://hypercube.telascience.org/cgi-bin/mapserv?",
        {
            map: '/home/racicot/haiti/mapfiles/basedata.map',
            layers: 'geoeye-01-16',
            transparent: 'TRUE',
            'sphericalMercator': true
        },
        {'reproject': false, 'isBaseLayer': false, 'visibility': false}
    );
    geoeye_layers.push(geoeye_011610_wms);
    var geoeye_011610_tc = new OpenLayers.Layer.XYZ(
        "GeoEye1 (2010/01/16) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/geoeye-geoeye-20100116-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    geoeye_layers.push(geoeye_011610_tc);
    var ikonos_011710_wms = new OpenLayers.Layer.WMS(
        "Ikonos (2010/01/17) (WMS)",
        "http://hypercube.telascience.org/cgi-bin/mapserv?",
        {
            map: '/home/racicot/haiti/mapfiles/basedata.map',
            layers: 'ikonos-01-17',
            transparent: 'TRUE',
            'sphericalMercator': true
        },
        {'reproject': false, 'isBaseLayer': false, 'visibility': false}
    );
    geoeye_layers.push(ikonos_011710_wms);
    var ikonos_011710_tc = new OpenLayers.Layer.XYZ(
        "Ikonos (2010/01/17) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/geoeye-ikonos-20100117-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    geoeye_layers.push(ikonos_011710_tc);
    var geoeye_011810_tc = new OpenLayers.Layer.XYZ(
        "GeoEye1 (2010/01/18) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/geoeye-geoeye-20100118-900913/${z}/${x}/${y}.jpg?rand=1",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    geoeye_layers.push(geoeye_011810_tc);
    
    map.addLayers(geoeye_layers);


    /////////////////////////////////////
    // Topo Layers //////////////////////
    /////////////////////////////////////
    var topo_layers = [];
    var tlm = new OpenLayers.Layer.XYZ(
        "Haiti Collarless 1:50k (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/haiti-tlm-50/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    topo_layers.push(tlm); 
    var city_wms = new OpenLayers.Layer.WMS(
        "PAP Collarless 1:12.5k (WMS)",
        "http://hypercube.telascience.org/cgi-bin/mapserv?",
        {
            map: '/home/racicot/haiti/mapfiles/basedata.map',
            layers: 'HAITI_12k_NEW_TOPO',
            transparent: 'TRUE',
            'sphericalMercator': true
        },
        {'reproject': false, 'isBaseLayer': false, 'visibility': false}
    );
    topo_layers.push(city_wms); 
    var city = new OpenLayers.Layer.XYZ(
        "PAP Collared 1:12.5k (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/haiti-city/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    topo_layers.push(city); 

    map.addLayers(topo_layers);

    /////////////////////////////////////
    // OSM Overlay Layers////////////////
    /////////////////////////////////////
    var osm_camps_wms = new OpenLayers.Layer.XYZ(
        "Damage/Ref Camps Live",
        "http://live.openstreetmap.nl/haiti-symbols/${z}/${x}/${y}.png",
        {
            buffer: 0, isBaseLayer: false,
            'sphericalMercator': true,
            visibility: false, numZoomLevels: 20 
        }
    );
    var osm_overlay = new OpenLayers.Layer.XYZ(
        "Roads Overlay Live (TC)",
        "http://live.openstreetmap.nl/mapnik-line/${z}/${x}/${y}.png",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, numZoomLevels: 20
        }
    );

    map.addLayers([osm_camps_wms,osm_overlay]);

    var overlays = [];
    var sfc_overlays = [];

    var osb = new OpenLayers.Layer.GML("OpenStreetBugs", 
        "http://openstreetbugs.appspot.com/getGPX?l=-74.8614387&b=17.555208&r=-69.538562&t=20.432356&open=1",
        {format: OpenLayers.Format.GPX, projection: new OpenLayers.Projection("EPSG:4326"),
         styleMap: new OpenLayers.StyleMap({'graphicHeight': 11, graphicWidth: 11, externalGraphic: 'http://ose.petschge.de/client/open_bug_marker.png'}),
         visibility: false
        });
    osb.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    sfc_overlays.push(osb);    
    overlays.push(osb); 
   
    var ose = new OpenLayers.Layer.GML("OpenStreetEmergencies", 
        "http://ose.petschge.de/cgi-bin/getRSSfeed?l=-74.8614387&b=17.555208&r=-69.538562&t=20.432356&open=1",
        {format: OpenLayers.Format.GeoRSS, projection: new OpenLayers.Projection("EPSG:4326"),
         styleMap: new OpenLayers.StyleMap({'graphicHeight': 11, graphicWidth: 11, externalGraphic: 'http://ose.petschge.de/client/open_bug_marker.png'}),
         visibility: false
        });
    ose.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    sfc_overlays.push(ose);    
    overlays.push(ose);    

    var p3_je1 = new OpenLayers.Layer.Vector('P-3 - JE17JJ (2010/01/17) ', {
        projection: map.displayProjection,
        strategies: [new OpenLayers.Strategy.Fixed()],
        styleMap: new OpenLayers.StyleMap({'fillColor': 'white',
                                           pointRadius: 6,
                                           opacity: 0.5,
                                           fillOpacity: 0.8,
                                           strokeColor: 'red',
                                           'strokeWidth': 1}),
        protocol: new OpenLayers.Protocol.HTTP({
            url: "p3-json/p3-JE17JJ.json",
            format: new OpenLayers.Format.GeoJSON({
                extractStyles: true,
                extractAttributes: true
            })
        }),
        visibility: false,
        'base': '/haiti/data/source/Navy/P3/JE17JJ/Images/'
    });
    p3_je1.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    sfc_overlays.push(p3_je1);
    overlays.push(p3_je1);
    var p3_je18 = new OpenLayers.Layer.Vector('P-3 - JE18 (2010/01/18) ', {
        projection: map.displayProjection,
        strategies: [new OpenLayers.Strategy.Fixed()],
        styleMap: new OpenLayers.StyleMap({'fillColor': 'white',
                                           pointRadius: 6,
                                           opacity: 0.5,
                                           fillOpacity: 0.8,
                                           strokeColor: 'red',
                                           'strokeWidth': 1}),
        protocol: new OpenLayers.Protocol.HTTP({
            url: "p3-json/je18.json",
            format: new OpenLayers.Format.GeoJSON({
                extractStyles: true,
                extractAttributes: true
            })
        }),
        visibility: false,
        'base':"/haiti/data/source/Navy/P3/JE18Photo's/"
    });
    p3_je18.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    sfc_overlays.push(p3_je18);
    overlays.push(p3_je18);
    var p3_je19ss = new OpenLayers.Layer.Vector('P-3  (2010/01/19 ss) ', {
        projection: map.displayProjection,
        strategies: [new OpenLayers.Strategy.Fixed()],
        styleMap: new OpenLayers.StyleMap({'fillColor': 'white',
                                           pointRadius: 6,
                                           opacity: 0.5,
                                           fillOpacity: 0.8,
                                           strokeColor: 'red',
                                           'strokeWidth': 1}),
        protocol: new OpenLayers.Protocol.HTTP({
            url: "p3-json/je19ss.json",
            format: new OpenLayers.Format.GeoJSON({
                extractStyles: true,
                extractAttributes: true
            })
        }),
        visibility: false,
        'base': '/haiti/data/source/Navy/P3/JE19SS/'
    });
    p3_je19ss.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    sfc_overlays.push(p3_je19ss);
    overlays.push(p3_je19ss);
    var p3_je19 = new OpenLayers.Layer.Vector('P-3  (2010/01/19 ) ', {
        projection: map.displayProjection,
        strategies: [new OpenLayers.Strategy.Fixed()],
        styleMap: new OpenLayers.StyleMap({'fillColor': 'white',
                                           pointRadius: 6,
                                           opacity: 0.5,
                                           fillOpacity: 0.8,
                                           strokeColor: 'red',
                                           'strokeWidth': 1}),
        protocol: new OpenLayers.Protocol.HTTP({
            url: "p3-json/je19.json",
            format: new OpenLayers.Format.GeoJSON({
                extractStyles: true,
                extractAttributes: true
            })
        }),
        visibility: false,
        'base': '/haiti/data/source/Navy/P3/JE19QQ/'
    });
    p3_je19.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    sfc_overlays.push(p3_je19);
    overlays.push(p3_je19);
    var p3_je20tt = new OpenLayers.Layer.Vector('P-3  (2010/01/20 TT) ', {
        projection: map.displayProjection,
        strategies: [new OpenLayers.Strategy.Fixed()],
        styleMap: new OpenLayers.StyleMap({'fillColor': 'white',
                                           pointRadius: 6,
                                           opacity: 0.5,
                                           fillOpacity: 0.8,
                                           strokeColor: 'red',
                                           'strokeWidth': 1}),
        protocol: new OpenLayers.Protocol.HTTP({
            url: "p3-json/je20tt.json",
            format: new OpenLayers.Format.GeoJSON({
                extractStyles: true,
                extractAttributes: true
            })
        }),
        visibility: false,
        'base': '/haiti/data/source/Navy/P3/JE20TT/'
    });
    p3_je20tt.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    sfc_overlays.push(p3_je20tt);
    overlays.push(p3_je20tt);
    
	lookupLayer = new OpenLayers.Layer.Vector("",{
        styleMap: new OpenLayers.StyleMap({
            'fillColor': 'red',
            'pointRadius': 5
        })
    });
    map.addLayer(lookupLayer);




    /////////////////////////////////////
    // Ushahidi Overlays
    /////////////////////////////////////
    var ushahidi_overlays = [];
	
	// Incidents
	var ushahidiIncidents = new OpenLayers.Layer.Vector("Latest 100 Incidents", {
        projection: map.displayProjection,
        strategies: [new OpenLayers.Strategy.Fixed()],
		visibility: false,
		format: OpenLayers.Format.GeoRSS, 
        styleMap: new OpenLayers.StyleMap({'externalGraphic': "http://www.hcvb.org/Directory/Emergency_icon.gif", pointRadius: 10}),
        protocol: new OpenLayers.Protocol.HTTP({
            url: "http://haiti.ushahidi.com/feed/?l=100",
            format: new OpenLayers.Format.GeoRSS({
                extractStyles: true, 
                extractAttributes: true
            })
        }),
        visibility: false
	   });
    ushahidiIncidents.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
	sfc_overlays.push(ushahidiIncidents);	
	ushahidi_overlays.push(ushahidiIncidents);	


	/////////////////////////////////////
    // Sahana Overlays
    /////////////////////////////////////
    var sahana_overlays = [];

	//Hospitals
	var sahanaHospitals = new OpenLayers.Layer.Vector("Hospitals", {
        projection: map.displayProjection,
        strategies: [new OpenLayers.Strategy.Fixed()],
		visibility: false,
		format: OpenLayers.Format.KML, 
        styleMap: new OpenLayers.StyleMap({'externalGraphic': "http://haiti.sahanafoundation.org/prod/default/download/gis_marker.image.E_Med_Hospital_S1.png", pointRadius: 10}),
        protocol: new OpenLayers.Protocol.HTTP({
            url: "http://haiti.sahanafoundation.org/prod/hms/hospital.kml",
            format: new OpenLayers.Format.KML({
                extractStyles: true, 
                extractAttributes: true
            })
        }),
        visibility: false
	   });
    sahanaHospitals.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
	sahana_overlays.push(sahanaHospitals);	
	sfc_overlays.push(sahanaHospitals);	
	
	//Offices
	var sahanaOffices = new OpenLayers.Layer.Vector("Offices", {
        projection: map.displayProjection,
        strategies: [new OpenLayers.Strategy.Fixed()],
		visibility: false,
		format: OpenLayers.Format.KML, 
        styleMap: new OpenLayers.StyleMap({'externalGraphic': "http://haiti.sahanafoundation.org/prod/default/download/gis_marker.image.Emergency_Operations_Center_S1.png", pointRadius: 10}),
        protocol: new OpenLayers.Protocol.HTTP({
            url: "http://haiti.sahanafoundation.org/prod/gis/location.kml?feature_class=Office",
            format: new OpenLayers.Format.KML({
                extractStyles: true, 
                extractAttributes: true
            })
        }),
        visibility: false
	   });
    sahanaOffices.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
	sahana_overlays.push(sahanaOffices);	
	sfc_overlays.push(sahanaOffices);	

	//Food Distribution Centers
	var foodDistributionCenters = new OpenLayers.Layer.Vector("Food Distribution Centers", {
        projection: map.displayProjection,
        strategies: [new OpenLayers.Strategy.Fixed()],
		visibility: false,
		format: OpenLayers.Format.KML, 
        styleMap: new OpenLayers.StyleMap({'externalGraphic': "http://www.realmexmipueblo.com/images/food_icon.gif", pointRadius: 10}),
        protocol: new OpenLayers.Protocol.HTTP({
            url: "http://ispatial.t-sciences.com/haiti/tmp/kml/e6e/2a2/097/46d/major_food__water_distribution_centers_haiti_1.19.2010.kml",
            format: new OpenLayers.Format.KML({
                extractStyles: false, 
                extractAttributes: true
            })
        }),
        visibility: false
	   });
    foodDistributionCenters.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
	sfc_overlays.push(foodDistributionCenters);	
	overlays.push(foodDistributionCenters);	



    map.addLayers(ushahidi_overlays);
    map.addLayers(sahana_overlays);
    map.addLayers(overlays);

    var sf = new OpenLayers.Control.SelectFeature(sfc_overlays);
    map.addControl(sf);
    sf.activate();

    var image_overlays = [];
    var pdf_6k = new OpenLayers.Layer.WMS("6K Delta State PDFs (Click for link)",
        "http://hypercube.telascience.org/cgi-bin/mapserv", {
            'map':'/geo/haiti/mapfiles/vector.map',
            'layers':'pdf_6k', 'transparent': true
        }, {
            buffer: 0, isBaseLayer: false, visibility: false
        }    
                                          
                                         );    
    pdf_6k.events.on({
        "visibilitychanged": function() { 
            if (this.visibility) {
                if (!this.control) {
                    this.control = new OpenLayers.Control.Click();
                    this.map.addControl(this.control);
                }
                this.control.activate();
            } else {
                this.control.deactivate();
            }    
        },
        'scope': pdf_6k
    });    
    image_overlays.push(pdf_6k);
    map.addLayers(image_overlays);

    /////////////////////////////////////
    // Layer Stores      ////////////////
    /////////////////////////////////////
    var dg_store = new GeoExt.data.LayerStore({
        map: map,
        initDir: 0,
        layers: dglobe_layers 
    });
    // Actually add to the tree...
    layerRoot.appendChild(new GeoExt.tree.OverlayLayerContainer({
        text: "Digital Globe",
        layerStore: dg_store,
        expanded: false
    }));

    var geye_store = new GeoExt.data.LayerStore({
        map: map,
        initDir: 0,
        layers:geoeye_layers 
    });
    // Actually add to the tree...
    layerRoot.appendChild(new GeoExt.tree.OverlayLayerContainer({
        text: "GeoEye",
        layerStore: geye_store,
        expanded: false
    }));

    var hires_store = new GeoExt.data.LayerStore({
        map: map,
        initDir: 0,
        layers: hires_layers
    });
    // Actually add to the tree...
    layerRoot.appendChild(new GeoExt.tree.OverlayLayerContainer({
        text: "Hi Res Aerials Image",
        layerStore: hires_store,
        expanded: false
    }));

    var spot_store = new GeoExt.data.LayerStore({
        map: map,
        initDir: 0,
        layers:spot_layers 
    });
    // Actually add to the tree...
    layerRoot.appendChild(new GeoExt.tree.OverlayLayerContainer({
        text: "CNES/SpotImage",
        layerStore: spot_store,
        expanded: false
    }));


    var osm_store = new GeoExt.data.LayerStore({
        map: map,
        initDir: 0,
        layers: [osm_camps_wms, osm_overlay]
    });
    // Actually add to the tree...
    layerRoot.appendChild(new GeoExt.tree.OverlayLayerContainer({
        text: "OSM Overlays",
        layerStore: osm_store,
        expanded: true
    }));

    var ushahidi_overlay_store = new GeoExt.data.LayerStore({
        map: map,
        initDir: 0,
        layers: ushahidi_overlays
    });
    // Actually add to the tree...
    layerRoot.appendChild(new GeoExt.tree.OverlayLayerContainer({
        text: "Ushahidi Overlays",
        layerStore: ushahidi_overlay_store,
        expanded: true
    }));

    var sahana_overlay_store = new GeoExt.data.LayerStore({
        map: map,
        initDir: 0,
        layers: sahana_overlays
    });
    // Actually add to the tree...
    layerRoot.appendChild(new GeoExt.tree.OverlayLayerContainer({
        text: "Sahana Overlays",
        layerStore: sahana_overlay_store,
        expanded: true
    }));

    var overlay_store = new GeoExt.data.LayerStore({
        map: map,
        initDir: 0,
        layers: overlays
    });

    // Actually add to the tree...
    layerRoot.appendChild(new GeoExt.tree.OverlayLayerContainer({
        text: "Other Overlays",
        layerStore: overlay_store,
        expanded: true
    }));

    var overlay_store = new GeoExt.data.LayerStore({
        map: map,
        initDir: 0,
        layers: overlays
    });
    // Actually add to the tree...
    var ioverlay_store = new GeoExt.data.LayerStore({
        map: map,
        initDir: 0,
        layers: image_overlays
    });
    layerRoot.appendChild(new GeoExt.tree.OverlayLayerContainer({
        text: "Image Overlays",
        layerStore: ioverlay_store,
        expanded: true
    }));
    var topo_store = new GeoExt.data.LayerStore({
        map: map,
        initDir: 0,
        layers: topo_layers
    });
    // Actually add to the tree...
    layerRoot.appendChild(new GeoExt.tree.OverlayLayerContainer({
        text: "Topo Maps",
        layerStore: topo_store,
        expanded: false
    }));

    var encstore = new GeoExt.data.LayerStore({
        map: map,
        initDir: 0,
        layers: [enclyr]
    });
    // Actually add to the tree...
    layerRoot.appendChild(new GeoExt.tree.OverlayLayerContainer({
        text: "Charts",
        layerStore: encstore,
        expanded: false
    }));



    HAITI.stores = [];
    HAITI.store_lyrs = [];
    HAITI.lyrs = []
    ////// Add Control for PDF Selection ///////
    ////// Sourced From Controls.js
    var showLoc = new ShowLoc(); 
    var streetQuery = new StreetQuery();
    var selectPdfControl = new SelectPdfControl();
    ///////////////////////////////////////////
    map.addControl(new OpenLayers.Control.MGRSMousePosition());
    map.addControl(new OpenLayers.Control.Scale());

    map.events.register('changebaselayer', map, function(e) {
        if (e.layer.mapObject) {
            e.layer.mapObject.checkResize();
            e.layer.moveTo(e.layer.map.getCenter(), e.layer.map.getZoom());
        }
    });
	var show_loc = new GeoExt.Action({
        text: "Click to Show Location",
        control: showLoc,
        map: map,
        toggleGroup: "draw",
        allowDepress: false,
        tooltip: "Click map to show location in Decimal degrees + DDMMSS",
        group: "draw"
    });
	var street_query = new GeoExt.Action({
        text: "Gazetteer By Grid",
        control: streetQuery,
        map: map,
        toggleGroup: "draw",
        allowDepress: false,
        tooltip: "Click map to query street objects in that MGRS grid",
        group: "draw"
    });
	var action = new GeoExt.Action({
        text: "MGRS PDFs",
        control: selectPdfControl,
        map: map,
         // button options
        toggleGroup: "draw",
        allowDepress: false,
        tooltip: "Select Delta State MGRS Pdfs",
        // check item options
        group: "draw"
    });
     var nav = new GeoExt.Action({
        text: "Navigate Map",
        control: new OpenLayers.Control.Navigation(),
        map: map,
        // button options
        toggleGroup: "draw",
        allowDepress: false,
        pressed: true,
        tooltip: "navigate",
        // check item options
        group: "draw",
        checked: true
    });

    toolbarItems = [];
    toolbarItems.push(nav);
    toolbarItems.push(action);
    toolbarItems.push(street_query);
    toolbarItems.push(show_loc);
    var mapPanel = new GeoExt.MapPanel({
        renderTo: 'mappanel',
        map: map,
        title: 'Map',
        extent: map.getExtent(),
        tbar:toolbarItems
    });
    map.addControl(new OpenLayers.Control.Permalink());
    map.addControl(new OpenLayers.Control.Permalink(null, 'http://openstreetmap.org/edit?tileurl=http://hypercube.telascience.org/tiles/1.0.0/haiti-best-900913/!/!/!.jpg&', {'displayClass': 'editLink'}));

    var layerTree = new Ext.tree.TreePanel({
        title: 'Map Layers',
        id: 'map_lt',
        //renderTo: 'tree',
        root: layerRoot,
        rootVisible: false,
        border: false,
        autoScroll:true,
        region:'center'
    });

    var contrib_window = new Ext.Window({
        applyTo:'contrib-div',
        layout:'fit',
        width:500,
        height:400,
        closeAction:'hide',
        plain: true,
        items: new Ext.TabPanel({
            activeTab:0,
            deferredRender:false,
            border:false,
            items: [new Ext.Panel({
		title: 'Personal',
              	autoLoad: 'contrib/personal_contrib.html'
	    }),new Ext.Panel({
		title: 'Corporate',
              	autoLoad: 'contrib/corp_contrib.html'
	    }),new Ext.Panel({
		title: 'Infrastructure',
              	autoLoad: 'contrib/infra_contrib.html'
	    })]
        }),

        buttons: [{
            text: 'Close',
            handler: function(){
                contrib_window.hide();
            }
        }]
    });

    var west = new Ext.Panel({
        region: 'west',
        id: 'west-panel',
        title:'&nbsp',
        //split:true,
        width: 300,
        minSize: 175,
        maxSize: 400,
        collapsible: true,
        margins: '0 0 0 5',
        layout: 'border',
        layoutConfig:{
            animate: true
        },
        tbar:[
            {xtype: 'tbfill'},
            {
                id:'btn_oldmap',
                text: 'Old UAV Map',
                tooltip: 'Open new window with old UAV map',
                minWidth:30,
                listeners: {
                    'click' : {
                        fn: function(){
                            window.open("uav-old.html");
                        },
                        scope: this
                    }
                }},{
                    xtype: 'tbseparator'
                },{
                    id:'btn_layerlist',
                    text: 'Layer List',
                    tooltip: 'Open new window with layer list',
                    minWidth:30,
                    listeners: {
                        'click' : {
                            fn: function(){
                                window.open("layers.html");
                            },
                            scope: this
                        }
                    }
                },{
                    xtype: 'tbseparator'
                },{
                    id:'btn_contributers',
                    text: 'Contributers',
                    tooltip: '',
                    minWidth:30,
                    listeners: {
                        'click' : {
                            fn: function(){
				contrib_window.show();
                            },
                            scope: this
                        }               
                    }}],
        items: [
            {
                contentEl: 'address_div',
                title: "Tools",
                region: "north",
                border:false
            },
            {
                region: "center",
                title: "",
                layout: 'fit',
                items: [layerTree]
            }]
    });

    new Ext.Viewport({
        layout: "border",
        items: [{
            region: "north",
            contentEl: "title",
            height:55
        }, {
            region: "center",
            title: "",
            layout: 'fit',
            items: [mapPanel]
        }, west]
    });
    Ext.DomHelper.append(Ext.get('title'),
                         {tag: 'img', id: 'title_logo',src: 'images/haiti_logo_telascience.png', height: 58});
    setMapCenter();

});

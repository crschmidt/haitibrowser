var HAITI = {
}

function contains(a, obj) {
    var i = a.length;
    while (i--) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
};

Ext.onReady(function() {
    var enable_gmaps = false;
    
    Ext.DomHelper.append(document.body,
                         {tag: 'div',id: 'address2'});
    Ext.get('address_div').show();

    var map_options = { 
        'units' : "m",
        'maxResolution' : 156543.0339,
        'numZoomLevels' : 22,
        'projection' : new OpenLayers.Projection("EPSG:900913"),
        'displayProjection' : new OpenLayers.Projection("EPSG:4326"),
        'maxExtent' : new OpenLayers.Bounds(-20037508.34,-20037508.34,
                                            20037508.34,20037508.34),
        'controls': [new OpenLayers.Control.Navigation(), new OpenLayers.Control.PanZoomBar(),
                     new OpenLayers.Control.Attribution()]    };
    
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 2;

    //OpenLayers.ProxyHost = "/ushahidi/proxy.cgi?url=";

    var map = new OpenLayers.Map('mappanel', map_options);
    HAITI.map = map;
    var layerRoot = new Ext.tree.TreeNode({
        text: "All Layers",
        expanded: true
    });
    var layer_groups = [];

    /////////////////////////////////////
    // OSM Base Layers
    /////////////////////////////////////
    var OSM_mapnik = new OpenLayers.Layer.TMS(
        "OpenStreetMap (Haiti)",
        "http://live.openstreetmap.nl/haiti/",
        {
            type: 'png', getURL: osm_getTileURL,
            displayOutsideMaxExtent: true,
            attribution: '<a href="http://www.openstreetmap.org/">' +
                'OpenStreetMap</a>',
            buffer: 0, linkId: 'osm'    
        }
    );
    map.addLayers([OSM_mapnik]);
    var haiti_best = new OpenLayers.Layer.XYZ("Satellite/Aerial Imagery",
        "http://hypercube.telascience.org/tiles/1.0.0/haiti-best-900913/${z}/${x}/${y}.jpg",
        {
            buffer:0,
            visibility: false, linkId:'basephoto'
        }
                                             );
    map.addLayer(haiti_best);

    /////////////////////////////////////
    // Google Base Layers
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
        draggable:false,
        expanded: true
    }));

    /////////////////////////////////////
    // Digital Globe Image Layers
    /////////////////////////////////////
    var dglobe_layers = [];
    var dg_crisis_tc = new OpenLayers.Layer.XYZ(
        "DG Crisis Event Service (TC)",
        "http://maps.nypl.org/tilecache/1/dg_crisis/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'dgcrisis'
        }
    );
    dglobe_layers.push(dg_crisis_tc);
    var wv_pre_tc = new OpenLayers.Layer.XYZ(
        "DG Worldview (Pre-Event) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/worldview-pre-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'wvpre'

        }
    );
    dglobe_layers.push(wv_pre_tc);
    var qbird_pre_tc = new OpenLayers.Layer.XYZ(
        "DG Quickbird (Pre-Event) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/quickbird-pre-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'qbpre'
        }
    );
    dglobe_layers.push(qbird_pre_tc);
    var qbird_011510_tc = new OpenLayers.Layer.XYZ(
        "DG Quickbird (2010/01/15) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/quickbird-20100115-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'qb15'
        }
    );
    dglobe_layers.push(qbird_011510_tc);
    var worldview_011710_tc = new OpenLayers.Layer.XYZ(
        "DG WorldView (2010/01/17) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/worldview-20100117-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false,
            buffer:0, linkId: 'wv17'
        }
    );
    dglobe_layers.push(worldview_011710_tc);
    var qbird_011810_tc = new OpenLayers.Layer.XYZ(
        "DG Quickbird (2010/01/18) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/quickbird-20100118-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'qb18'
        }
    );
    dglobe_layers.push(qbird_011810_tc);

    var worldview_011810_tc = new OpenLayers.Layer.XYZ(
        "DG WorldView (2010/01/18) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/worldview-20100118-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'wv18'
        }
    );
    dglobe_layers.push(worldview_011810_tc);
    var worldview_011910_tc = new OpenLayers.Layer.XYZ(
        "DG WorldView (2010/01/19) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/worldview-20100119-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'wv19'
        }
    );
    dglobe_layers.push(worldview_011910_tc);
    var qbird_012010_tc = new OpenLayers.Layer.XYZ(
        "DG Quickbird (2010/01/20) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/quickbird-20100120-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'qb20'
        }
    );
    dglobe_layers.push(qbird_012010_tc);
    var worldview_012010_tc = new OpenLayers.Layer.XYZ(
        "DG WorldView (2010/01/20) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/worldview-20100120-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'wv20'
        }
    );
    dglobe_layers.push(worldview_012010_tc);
    map.addLayers(dglobe_layers);
    
    /////////////////////////////////////
    // SPOT Image Layers
    /////////////////////////////////////
    var spot_layers = []
    var spot_011410_tc = new OpenLayers.Layer.XYZ(
        "SpotImage (2010/01/14)",
        "http://hypercube.telascience.org/tiles/1.0.0/spot-20100114-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'spot14'
        }
    );
    spot_layers.push(spot_011410_tc);
    var spot_011510_tc = new OpenLayers.Layer.XYZ(
        "SpotImage (2010/01/15)",
        "http://hypercube.telascience.org/tiles/1.0.0/spot-20100115-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'spot15'
        }
    );
    spot_layers.push(spot_011510_tc);
    map.addLayers(spot_layers);
    
    /////////////////////////////////////
    // High Res Aerial Image Layers
    /////////////////////////////////////
    var hires_layers = []
    var google_011710_tc = new OpenLayers.Layer.XYZ(
        "Google Aerial (2010/01/17) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/google-20100117-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, attribution: "Google 2010", 'linkId': 'goog17'
        }
    );
    hires_layers.push(google_011710_tc);
    var noaa_011810_tc = new OpenLayers.Layer.XYZ(
        "NOAA Aerial (2010/01/17)",
        "http://hypercube.telascience.org/tiles/1.0.0/noaa-20100118-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'noaa17'
        }
    );
    hires_layers.push(noaa_011810_tc);
    var noaa_012010_tc = new OpenLayers.Layer.XYZ(
        "NOAA Aerial (2010/01/21)",
        "http://hypercube.telascience.org/tiles/1.0.0/noaa-20100120-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'noaa17'
        }
    );
    hires_layers.push(noaa_012010_tc);
    var noaa_012210_tc = new OpenLayers.Layer.XYZ(
        "NOAA Aerial (2010/01/22)",
        "http://hypercube.telascience.org/tiles/1.0.0/noaa-20100122-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'noaa22'
        }
    );
    hires_layers.push(noaa_012210_tc);
    var noaa_012310_tc = new OpenLayers.Layer.XYZ(
        "NOAA Aerial (2010/01/23)",
        "http://hypercube.telascience.org/tiles/1.0.0/noaa-20100123-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'noaa23'
        }
    );
    hires_layers.push(noaa_012310_tc);
    var worldbank_012110_tc = new OpenLayers.Layer.XYZ(
        "Worldbank (2010/01/21-22)",
        "http://hypercube.telascience.org/tiles/1.0.0/worldbank-21-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'wb21'
        }
    );
    hires_layers.push(worldbank_012110_tc);
    var worldbank_012310_tc = new OpenLayers.Layer.XYZ(
        "Worldbank (2010/01/23)",
        "http://hypercube.telascience.org/tiles/1.0.0/worldbank-23-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'wb23'
        }
    );
    hires_layers.push(worldbank_012310_tc);
    map.addLayers(hires_layers);
    var worldbank_012410_tc = new OpenLayers.Layer.XYZ(
        "Worldbank (2010/01/24)",
        "http://hypercube.telascience.org/tiles/1.0.0/worldbank-24-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'wb24'
        }
    );
    hires_layers.push(worldbank_012410_tc);
    var noaa_012410_tc = new OpenLayers.Layer.XYZ(
        "NOAA Aerial (2010/01/24)",
        "http://hypercube.telascience.org/tiles/1.0.0/noaa-20100124-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'noaa24'
        }
    );
    hires_layers.push(noaa_012410_tc);
    map.addLayers(hires_layers);
    
    /////////////////////////////////////
    // GeoEye Image Layers
    /////////////////////////////////////
    var geoeye_layers = [];
    var ge_011310_wms = new OpenLayers.Layer.WMS(
        "Event Imagery PAP (WMS)",
        "http://maps.nypl.org/relief/maps/wms/32?",
        {
            transparent: 'TRUE',
            'sphericalMercator': true
        },
        {'reproject': false, 'isBaseLayer': false, 'visibility': false, linkId: 'gepap'}
    );
    geoeye_layers.push(ge_011310_wms);
    var ge_011310_tc = new OpenLayers.Layer.XYZ(
        "Event Imagery Extended (TC)",
        "http://maps.nypl.org/tilecache/1/geoeye/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'geevt'
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
        {'reproject': false, 'isBaseLayer': false, 'visibility': false,
         linkId: 'ik15'}
    );
    geoeye_layers.push(ikonos_011510_wms);
    var ikonos_011510_tc = new OpenLayers.Layer.XYZ(
        "Ikonos (2010/01/14-15) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/geoeye-ikonos-20100115-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, attribution: "GeoEye 2010",
            linkId: 'ik15'
        }
    );
    geoeye_layers.push(ikonos_011510_tc);
    var geoeye_011610_tc = new OpenLayers.Layer.XYZ(
        "GeoEye1 (2010/01/16) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/geoeye-geoeye-20100116-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'ge16' 
        }
    );
    geoeye_layers.push(geoeye_011610_tc);
    var ikonos_011710_tc = new OpenLayers.Layer.XYZ(
        "Ikonos (2010/01/17) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/geoeye-ikonos-20100117-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'ik17'
        }
    );
    geoeye_layers.push(ikonos_011710_tc);
    var geoeye_011810_tc = new OpenLayers.Layer.XYZ(
        "GeoEye1 (2010/01/18) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/geoeye-geoeye-20100118-900913/${z}/${x}/${y}.jpg?rand=1",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'ge18'
        }
    );
    geoeye_layers.push(geoeye_011810_tc);
    map.addLayers(geoeye_layers);


    /////////////////////////////////////
    // Topo Layers
    /////////////////////////////////////
    var topo_layers = [];
    var tlm = new OpenLayers.Layer.XYZ(
        "Haiti Collarless 1:50k (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/haiti-tlm-50/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'tlm50'
        }
    );
    topo_layers.push(tlm); 
    var city = new OpenLayers.Layer.XYZ(
        "PAP Collared 1:12.5k (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/haiti-city/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, linkId: 'city'
        }
    );
    topo_layers.push(city); 
    map.addLayers(topo_layers);

    /////////////////////////////////////
    // OSM Overlay Layers
    /////////////////////////////////////
    var osm_layers = [];
    var osm_camps_wms = new OpenLayers.Layer.XYZ(
        "Damage/Ref Camps",
        "http://live.openstreetmap.nl/haiti-symbols/${z}/${x}/${y}.png",
        {
            buffer: 0, isBaseLayer: false,
            'sphericalMercator': true,
            visibility: false, numZoomLevels: 20,
            linkId: 'osmcamps' 
        }
    );
    osm_layers.push(osm_camps_wms); 
    var osm_overlay = new OpenLayers.Layer.XYZ(
        "OSM Roads Overlay",
        "http://live.openstreetmap.nl/mapnik-line/${z}/${x}/${y}.png",
        {
            isBaseLayer: false, buffer:0,
            visibility: false, numZoomLevels: 20,
            linkId: 'osmroads'
        }
    );
    osm_layers.push(osm_overlay); 
    map.addLayers(osm_layers);

    /////////////////////////////////////
    // Overlays Layers
    /////////////////////////////////////
    var sfc_overlays = [];

    var osb = new OpenLayers.Layer.GML("OpenStreetBugs", 
        "http://openstreetbugs.appspot.com/getGPX?l=-74.8614387&b=17.555208&r=-69.538562&t=20.432356&open=1",
        {
            format: OpenLayers.Format.GPX, 
            projection: new OpenLayers.Projection("EPSG:4326"),
            styleMap: new OpenLayers.StyleMap({'graphicHeight': 11, graphicWidth: 11,
                                               externalGraphic: 'http://ose.petschge.de/client/open_bug_marker.png'}),
            visibility: false, 
            linkId: 'osb'
        });
    osb.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    sfc_overlays.push(osb);    
    osm_layers.push(osb); 
    
    var ose = new OpenLayers.Layer.GML("OpenStreetEmergencies", 
        "http://ose.petschge.de/cgi-bin/getRSSfeed?l=-74.8614387&b=17.555208&r=-69.538562&t=20.432356&open=1",
        {format: OpenLayers.Format.GeoRSS, projection: new OpenLayers.Projection("EPSG:4326"),
        styleMap: new OpenLayers.StyleMap({'graphicHeight': 11, graphicWidth: 11,
        externalGraphic: 'http://ose.petschge.de/client/open_bug_marker.png'}),
        visibility: false,
        linkId: 'ose'
        });
    ose.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    sfc_overlays.push(ose);    
    osm_layers.push(ose);    
    
    var p3_overlays = [];

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
        linkId: 'p3-1',
        'base': '/haiti/data/source/Navy/P3/JE17JJ/Images/'
    });
    p3_je1.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    sfc_overlays.push(p3_je1);
    p3_overlays.push(p3_je1);
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
        linkId: 'p3-2',
        'base':"/haiti/data/source/Navy/P3/JE18Photo's/"
    });
    p3_je18.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    sfc_overlays.push(p3_je18);
    p3_overlays.push(p3_je18);
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
        linkId: 'p3-3',
        'base': '/haiti/data/source/Navy/P3/JE19SS/'
    });
    p3_je19ss.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    sfc_overlays.push(p3_je19ss);
    p3_overlays.push(p3_je19ss);
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
        linkId: 'p3-4',
        'base': '/haiti/data/source/Navy/P3/JE19QQ/'
    });
    p3_je19.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    sfc_overlays.push(p3_je19);
    p3_overlays.push(p3_je19);
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
        linkId: 'p3-5',
        'base': '/haiti/data/source/Navy/P3/JE20TT/'
    });
    p3_je20tt.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    sfc_overlays.push(p3_je20tt);
    p3_overlays.push(p3_je20tt);




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
        styleMap: new OpenLayers.StyleMap({'externalGraphic': "http://www.hcvb.org/Directory/Emergency_icon.gif",
                                           pointRadius: 10}),
        protocol: new OpenLayers.Protocol.HTTP({
            url: "http://haiti.ushahidi.com/feed/?l=100",
            format: new OpenLayers.Format.GeoRSS({
                extractStyles: true, 
                extractAttributes: true
            })
        }),
        linkId: 'ushinc',
        visibility: false
    });
    ushahidiIncidents.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    sfc_overlays.push(ushahidiIncidents);       
    ushahidi_overlays.push(ushahidiIncidents);  
    map.addLayers(ushahidi_overlays);



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
        linkId: 'sahhosp',
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
        linkId: 'sahoff',
        visibility: false
    });
    sahanaOffices.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    sahana_overlays.push(sahanaOffices);        
    sfc_overlays.push(sahanaOffices);   

    //Food Distribution Centers
    /*var foodDistributionCenters = new OpenLayers.Layer.Vector("Food Distribution Centers", {
        projection: map.displayProjection,
        strategies: [new OpenLayers.Strategy.Fixed()],
        visibility: false,
        format: OpenLayers.Format.KML, 
        styleMap: new OpenLayers.StyleMap({'externalGraphic': "http://www.realmexmipueblo.com/images/food_icon.gif",
                                           pointRadius: 10}),
        protocol: new OpenLayers.Protocol.HTTP({
            url: "http://ispatial.t-sciences.com/haiti/tmp/kml/e6e/2a2/097/46d/major_food__water_distribution_centers_haiti_1.19.2010.kml",
            format: new OpenLayers.Format.KML({
                extractStyles: false, 
                extractAttributes: true
            })
        }),
        linkId: 'fooddist',
        visibility: false
    });
    foodDistributionCenters.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    sfc_overlays.push(foodDistributionCenters); 
    overlays.push(foodDistributionCenters);    */ 

    map.addLayers(p3_overlays);
    map.addLayers(sahana_overlays);

    /////////////////////////////////////
    // InRelief Overlays
    /////////////////////////////////////
    /*var inrelief_overlays = [];

    var spotLastLoc = new OpenLayers.Layer.Vector("SPOT Last Location", {
        projection: map.displayProjection,
        strategies: [new OpenLayers.Strategy.Fixed()],
        visibility: false,
        format: OpenLayers.Format.KML, 
        protocol: new OpenLayers.Protocol.HTTP({
            url: "http://hurakan.ucsd.edu/cwid/NspotLastLocation.kml",
            format: new OpenLayers.Format.KML({
                extractAttributes: true,
                maxDepth: 3
            })
        }),
        linkId: 'spot1',
        visibility: false
    });
    spotLastLoc.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    inrelief_overlays.push(spotLastLoc);        
    sfc_overlays.push(spotLastLoc);     
    var spotMessage = new OpenLayers.Layer.Vector("SPOT Message", {
        projection: map.displayProjection,
        strategies: [new OpenLayers.Strategy.Fixed()],
        visibility: false,
        format: OpenLayers.Format.KML, 
        protocol: new OpenLayers.Protocol.HTTP({
            url: "http://hurakan.ucsd.edu/cwid/NspotMessage.kml",
            format: new OpenLayers.Format.KML({
                extractAttributes: true,
                maxDepth: 3
            })
        }),
        linkId: 'spot2',
        visibility: false
    });
    spotMessage.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    inrelief_overlays.push(spotMessage);        
    sfc_overlays.push(spotMessage);     
    
    var latitude = new OpenLayers.Layer.Vector("SPOT Latitude", {
        projection: map.displayProjection,
        strategies: [new OpenLayers.Strategy.Fixed()],
        visibility: false,
        format: OpenLayers.Format.KML, 
        protocol: new OpenLayers.Protocol.HTTP({
            url: "http://hurakan.ucsd.edu/cwid/Latitude.kml",
            format: new OpenLayers.Format.KML({
                extractAttributes: true,
                maxDepth: 3
            })
        }),
        linkId: 'spot3',
        visibility: false
    });
    latitude.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });
    inrelief_overlays.push(latitude);   
    sfc_overlays.push(latitude);        
    


    map.addLayers(inrelief_overlays);
    */

    var sf = new OpenLayers.Control.SelectFeature(sfc_overlays);
    map.addControl(sf);
    sf.activate();

    var image_overlays = [];
    var pdf_6k = new OpenLayers.Layer.WMS("6K Delta State PDFs (Click for link)",
        "http://hypercube.telascience.org/cgi-bin/mapserv", {
            'map':'/geo/haiti/mapfiles/vector.map',
            'layers':'pdf_6k', 'transparent': true
        }, {
            buffer: 0, isBaseLayer: false, visibility: false,
            linkId: 'pdf6k'
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
    lookupLayer = new OpenLayers.Layer.Vector("", {styleMap: new OpenLayers.StyleMap({'pointRadius': 4, 'fillColor': 'red'})});
    map.addLayer(lookupLayer);


    /////////////////////////////////////
    // Layer Stores
    /////////////////////////////////////

    // This actually determines the order of the groups
    layer_groups.push({name:'OSM Overlays', layers:osm_layers,
                       expanded:true});
    layer_groups.push({name:'Image Overlays', layers:image_overlays,
                       expanded:true});
    layer_groups.push({name:'Ushahidi Overlays', layers:ushahidi_overlays,
                       expanded:true});
    layer_groups.push({name:'Sahana Overlays', layers:sahana_overlays,
                       expanded:true});
    layer_groups.push({name:'Drone-style Overlays', layers:p3_overlays,
                       expanded:false});
    layer_groups.push({name:'Topo Maps', layers:topo_layers,
                       expanded:false});
    layer_groups.push({name:'Hi Res Aerials Image', layers:hires_layers,
                       expanded:false});
    layer_groups.push({name:'Digital Globe', layers:dglobe_layers,
                       expanded:false});
    layer_groups.push({name:'GeoEye', layers:geoeye_layers,
                       expanded:false});
    layer_groups.push({name:'CNES/SpotImage', layers:spot_layers,
                       expanded:false});
    /*layer_groups.push({name:'InRelief Overlays', layers:inrelief_overlays,
                       expanded:false});*/

    for (var p=0; p<layer_groups.length; p+=1){
        var my_layers = layer_groups[p]["layers"];
        var my_store = new GeoExt.data.LayerStore({
            map: map,
            initDir: GeoExt.data.LayerStore.MAP_TO_STORE|GeoExt.data.LayerStore.STORE_TO_MAP,
            layers: layer_groups[p]["layers"]
        });
        // Actually add to the tree...
        layerRoot.appendChild(new GeoExt.tree.LayerContainer({
            text: layer_groups[p]["name"],
            layerStore: my_store,
            expanded: layer_groups[p]["expanded"],
            draggable:false,
            loader: new GeoExt.tree.LayerLoader({
                layers: layer_groups[p]["layers"],
                filter: function(record) {
                    var layer = record.get("layer");
                    var layers = this.layers;
                    return contains(layers, layer);
                }
            })
        }));
    }


    HAITI.stores = [];
    HAITI.store_lyrs = [];
    HAITI.lyrs = []
    ////// Add Control for PDF Selection ///////
    ////// Sourced From Controls.js
    var showLoc = new ShowLoc(); 
    var streetQuery = new StreetQuery();
    HAITI.streetQuery = streetQuery;
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
    var edit = new GeoExt.Action({
        text: "Edit Layer",
        control: new H.Edit(),
        map: map,
        // button options
        toggleGroup: "draw",
        allowDepress: false,
        tooltip: "Draw Custom Layer",
        // check item options
        group: "draw"
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

    toolbarItems = [nav, action, street_query, show_loc, edit];
    var mapPanel = new GeoExt.MapPanel({
        renderTo: 'mappanel',
        map: map,
        title: 'Map',
        extent: map.getExtent(),
        tbar:toolbarItems
    });
    map.addControl(new H.ArgParser());
    map.addControl(new H.Permalink());
    map.addControl(new H.Permalink(null, 'http://openstreetmap.org/edit?tileurl=http://hypercube.telascience.org/tiles/1.0.0/haiti-best-900913/!/!/!.jpg&', {'displayClass': 'editLink', 'text': "Edit in OSM"}));

    var layerTree = new Ext.tree.TreePanel({
        title: 'Map Layers',
        id: 'map_lt',
        enableDD: true,
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
    ltPanel = new Ext.Panel({
        region: "center",
        title: "",
        layout: 'fit',
        items: [layerTree]
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
            }, ltPanel
        ]
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

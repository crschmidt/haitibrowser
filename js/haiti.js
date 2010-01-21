var HAITI = {
}

Ext.onReady(function() {
    var enable_gmaps = true;
    
    Ext.DomHelper.append(document.body,
                         {tag: 'div',id: 'address2'});
    Ext.get('address_div').show();

    var osm_getTileURL = function(bounds) {
        var res = this.map.getResolution();
        var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
        var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
        var z = this.map.getZoom();
        var limit = Math.pow(2, z);
    
        if (y < 0 || y >= limit) {
            return OpenLayers.Util.getImagesLocation() + "404.png";
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
        'maxExtent' : new OpenLayers.Bounds(-20037508,-20037508,20037508,20037508)
        //controls: []
    };
    
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;

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
            attribution: '<a href="http://www.openstreetmap.org/">OpenStreetMap</a>'
        }
    );
    map.addLayers([OSM_mapnik]);

    /////////////////////////////////////
    // Google Base Layers ///////////////
    /////////////////////////////////////
    if (enable_gmaps) {
        var gphy = new OpenLayers.Layer.Google( "Google Terrain", {type: G_PHYSICAL_MAP, 'sphericalMercator': true} );
        var gmap = new OpenLayers.Layer.Google( "Google Streets", {'sphericalMercator': true});
        var ghyb = new OpenLayers.Layer.Google("Google Hybrid", {type: G_HYBRID_MAP, 'sphericalMercator': true} );
        var gsat = new OpenLayers.Layer.Google("Google Satellite", {type: G_SATELLITE_MAP, 'sphericalMercator': true} );
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

    var worldview_011510_tc = new OpenLayers.Layer.XYZ(
        "DG WorldView (2010/01/15) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/worldview-20100115-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    dglobe_layers.push(worldview_011510_tc);
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

    var worldview_011810_tc = new OpenLayers.Layer.XYZ(
        "DG WorldView (2010/01/18) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/worldview-20100118-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    dglobe_layers.push(worldview_011810_tc);

    map.addLayers(dglobe_layers);
    
    /////////////////////////////////////
    // SPOT Image Layers ///////
    /////////////////////////////////////
    var spot_011410_tc = new OpenLayers.Layer.XYZ(
        "Spot (2010/01/14) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/spot-20100114-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    var spot_011510_tc = new OpenLayers.Layer.XYZ(
        "Spot (2010/01/15) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/spot-20100114-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    map.addLayers([spot_011510_tc,spot_011410_tc]);
    
    /////////////////////////////////////
    // GOOGLE Image Layers ///////
    /////////////////////////////////////
    var google_011710_tc = new OpenLayers.Layer.XYZ(
        "Google Aerial (2010/01/17) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/google-20100117-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    map.addLayers([google_011710_tc]);
    
    /////////////////////////////////////
    // GeoEye Image Layers //////////////
    /////////////////////////////////////
    var ge_011310_wms = new OpenLayers.Layer.WMS(
        "Event Imagery PAP (WMS)",
        "http://maps.nypl.org/relief/maps/wms/32?",
        {
            transparent: 'TRUE',
            'sphericalMercator': true
        },
        {'reproject': false, 'isBaseLayer': false, 'visibility': false}
    );
    var ge_011310_tc = new OpenLayers.Layer.XYZ(
        "Event Imagery Extended (TC)",
        "http://maps.nypl.org/tilecache/1/geoeye/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
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
    var ikonos_011510_tc = new OpenLayers.Layer.XYZ(
        "Ikonos (2010/01/14-15) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/geoeye-ikonos-20100115-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
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
    var geoeye_011610_tc = new OpenLayers.Layer.XYZ(
        "GeoEye1 (2010/01/16) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/geoeye-geoeye-20100116-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
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
    var ikonos_011710_tc = new OpenLayers.Layer.XYZ(
        "Ikonos (2010/01/17) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/geoeye-ikonos-20100117-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    var geoeye_011810_tc = new OpenLayers.Layer.XYZ(
        "GeoEye1 (2010/01/18) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/geoeye-geoeye-20100118-900913/${z}/${x}/${y}.jpg?rand=1",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
    
    map.addLayers([geoeye_011810_tc,ikonos_011710_tc,ikonos_011710_wms,geoeye_011610_tc,geoeye_011610_wms,
                   ikonos_011510_tc,ikonos_011510_wms,ge_011310_tc,ge_011310_wms]);

    /////////////////////////////////////
    // NOAA Image Layers ////////////////
    /////////////////////////////////////
    var noaa_011810_wms = new OpenLayers.Layer.WMS(
        "NOAA Aerial (2010/01/18) (WMS)",
        "http://hypercube.telascience.org/cgi-bin/mapserv?",
        {
            map: '/home/racicot/haiti/mapfiles/basedata.map',
            layers: 'noaa-01-18',
            transparent: 'TRUE',
            'sphericalMercator': true
        },
        {'reproject': false, 'isBaseLayer': false, 'visibility': false}
    );
    var noaa_011810_tc = new OpenLayers.Layer.XYZ(
        "NOAA Aerial (2010/01/18) (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/noaa-20100118-900913/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );

    map.addLayers([noaa_011810_tc,noaa_011810_wms]);

    /////////////////////////////////////
    // Topo Layers //////////////////////
    /////////////////////////////////////
    var tlm = new OpenLayers.Layer.XYZ(
        "Haiti Collarless 1:50k (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/haiti-tlm-50/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );
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
    var city = new OpenLayers.Layer.XYZ(
        "PAP Collared 1:12.5k (TC)",
        "http://hypercube.telascience.org/tiles/1.0.0/haiti-city/${z}/${x}/${y}.jpg",
        {
            isBaseLayer: false, buffer:0,
            visibility: false
        }
    );

    map.addLayers([city, city_wms, tlm]);

    /////////////////////////////////////
    // OSM Overlay Layers////////////////
    /////////////////////////////////////
    var osm_camps_wms = new OpenLayers.Layer.WMS(
        "Damage/Ref Camps Live (WMS)",
        "http://haiti.dbsgeo.com/?",
        {
            layers: 'osm_haiti_overlay_900913',
            transparent: 'TRUE',
            'sphericalMercator': true
        },
        {'reproject': false, 'isBaseLayer': false, 'visibility': false}
    );
    var osm_overlay = new OpenLayers.Layer.XYZ(
        "Roads Overlay Live (TC)",
        "http://live.openstreetmap.nl/mapnik-line/${z}/${x}/${y}.png",
        {
            isBaseLayer: false, buffer:0,
            visibility: true
        }
    );

    map.addLayers([osm_camps_wms,osm_overlay]);

    //var dg_crisis_wms = new OpenLayers.Layer.WMS(
    //    "DG Crisis Event Service",
    //    "http://maps.nypl.org/relief/maps/wms/32?",
    //    {
    //        map: '/home/projects/erma/erma-trunk/mapfile/raster.map',
    //        transparent: 'TRUE',
    //        layers: 'NOAA_REGION2and3_RNC_5k',
    //        'sphericalMercator': true
    //    },
    //    {'reproject': false, 'isBaseLayer': false, 'visibility': false}
    //);


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
        layers: [geoeye_011810_tc,ikonos_011710_tc,ikonos_011710_wms,geoeye_011610_tc,geoeye_011610_wms,
                 ikonos_011510_tc,ikonos_011510_wms,ge_011310_tc,ge_011310_wms]
    });
    // Actually add to the tree...
    layerRoot.appendChild(new GeoExt.tree.OverlayLayerContainer({
        text: "GeoEye",
        layerStore: geye_store,
        expanded: false
    }));

    var google_store = new GeoExt.data.LayerStore({
        map: map,
        initDir: 0,
        layers: [google_011710_tc]
    });
    // Actually add to the tree...
    layerRoot.appendChild(new GeoExt.tree.OverlayLayerContainer({
        text: "Google Image",
        layerStore: google_store,
        expanded: false
    }));

    var spot_store = new GeoExt.data.LayerStore({
        map: map,
        initDir: 0,
        layers: [spot_011510_tc,spot_011410_tc]
    });
    // Actually add to the tree...
    layerRoot.appendChild(new GeoExt.tree.OverlayLayerContainer({
        text: "SPOT",
        layerStore: spot_store,
        expanded: false
    }));

    var noaa_store = new GeoExt.data.LayerStore({
        map: map,
        initDir: 0,
        layers: [noaa_011810_tc,noaa_011810_wms]
    });
    // Actually add to the tree...
    layerRoot.appendChild(new GeoExt.tree.OverlayLayerContainer({
        text: "NOAA Images",
        layerStore: noaa_store,
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

    var topo_store = new GeoExt.data.LayerStore({
        map: map,
        initDir: 0,
        layers: [city, city_wms, tlm]
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

    map.addControl(new OpenLayers.Control.MousePosition());
    map.addControl(new OpenLayers.Control.Permalink());
    map.addControl(new OpenLayers.Control.Scale());

    map.events.register('changebaselayer', map, function(e) {
        if (e.layer.mapObject) {
            e.layer.mapObject.checkResize();
            e.layer.moveTo(e.layer.map.getCenter(), e.layer.map.getZoom());
        }
    });

    var mapPanel = new GeoExt.MapPanel({
        renderTo: 'mappanel',
        map: map,
        title: 'Map',
        extent: map.getExtent()
    });


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
        items: [
            {
                contentEl: 'address_div',
		title: "Tools",
                region:'north',
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
            height: 50
        }, {
            region: "center",
            title: "",
            layout: 'fit',
            items: [mapPanel]
        }, west]
    });
    setMapCenter();

});


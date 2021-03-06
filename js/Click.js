OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
    defaultHandlerOptions: {
        'single': true,
        'double': false,
        'pixelTolerance': 0,
        'stopSingle': false,
        'stopDouble': false
    },

    initialize: function(options) {
        this.handlerOptions = OpenLayers.Util.extend(
            {}, this.defaultHandlerOptions
        );
        OpenLayers.Control.prototype.initialize.apply(
            this, arguments
        ); 
        this.handler = new OpenLayers.Handler.Click(
            this, {
                'click': this.onClick
            }, this.handlerOptions
        );
    }, 
    response: function(req) {
        this.w.destroy();
        var gml = new OpenLayers.Format.GML();
        var features = gml.read(req.responseText);
        var html = features.length + " pdfs. <br /><ul>";
        if (features.length) { 
            for (var i = 0; i < features.length; i++) {
                var f = features[i];
                var text = f.attributes.utm_zone + f.attributes.grid_zone+f.attributes.grid_square+f.attributes.easting + f.attributes.northing; 
                var url = features[i].attributes.url;
                url = url.replace('Haiti_6Kscale_lettersize_GeopdfimageAtlas_vDSU20100119/Haiti_6K_scale_letter_size_geopdf_image_Atlas_vDSU20100119-1_', "Haiti_6Kscale_8511A4size_Geopdfimage_Atlas_vDSU20100123/Haiti_6Kscale_8511A4size_Geopdfimage_Atlas_vDSU20100123_");
                html += "<li><a href='"+url+"'>"+text+"</a></li>";
            }
        }
        html += "</ul>";
        this.w = new Ext.Window({'html':html,
            width: 300,
            'title': 'Results',
            height: 200});
        this.w.show();
    },
    onClick: function(evt) {
        var u = new USNG2();
        var mgrs = u.fromLonLat(HAITI.map.getLonLatFromPixel(evt.xy).transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326")), 2);
        var lonlat = HAITI.map.getLonLatFromPixel(evt.xy).transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326")); 
        var bbox = new OpenLayers.Bounds(lonlat.lon-.00001, lonlat.lat-.00001, lonlat.lon+0.00001, lonlat.lat+.00001).toBBOX();
        OpenLayers.Request.GET({
            url: 'http://www.sharedgeo.org/datasets/shared/maps/usng/pdf.map?VERSION=1.0.0&SERVICE=WFS&&request=GetFeature&typename=wfs_all_maps&bbox='+bbox,
            callback: OpenLayers.Function.bind(this.response, this)
        });    
        this.w = new Ext.Window({'html':"Searching Delta State PDFs, please wait.",
            width: 200,
            'title': "Please Wait."});
        this.w.show();
    } 
});

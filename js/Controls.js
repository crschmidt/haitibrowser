    ShowLoc = OpenLayers.Class(OpenLayers.Control, {
        initialize: function() { 
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
            this.handler = new OpenLayers.Handler.Click(this, {'click': this.onClick, stopClicks: true, stopDown: true});
        },
        onClick: function(evt) {
            var u = new USNG2();
            var lonlat = HAITI.map.getLonLatFromPixel(evt.xy).transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"))
            var mgrs = u.fromLonLat(lonlat, 2);
            var bbox = HAITI.map.getExtent().transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
            var dms = ollonlat2dms(lonlat);
            var w = new Ext.Window({
                'html': "<form target='_blank' action='http://spreadsheets.google.com/viewform'>" +
                    "<input type='hidden' value='txgVFOXJcRXX56lbAHo35yA' name='key' />" +
                    "Latitude: <input type='text' name='entry_1' size='10' value='" + lonlat.lat.toFixed(5) + "' />  , Longitude:  " + 
                    "<input size='10' type='text' name='entry_2' value='" + lonlat.lon.toFixed(5) + "'/>" +
                    "<input type='hidden' name='entry_3' value='" + lonlat.lat.toFixed(5) + " " + lonlat.lon.toFixed(5) +"' />" +
                    '<input type="hidden" name="entry_5" value="' + dms[0] + ' ' + dms[1] + '" />' +
                     '<input type="hidden" name="entry_6" value="' + dms[0] + '" />' +
                    '<input type="hidden" name="entry_7" value="' + dms[1] + '" />' +
                    " <br />" + 
                    "<input type='submit' value='Save to Ushahidi Spreadsheet' /></form><br />MGRS: " + mgrs + "<br /> No DMS Yet <br />BBOX: " + bbox.toBBOX()+"<br />",
                'width': 500,
                'height': 200,
                'title': 'Save Location'
            });
            w.show();
        } 
    }); 

    var StreetQuery = OpenLayers.Class(OpenLayers.Control, {
        initialize: function() { 
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
            this.handler = new OpenLayers.Handler.Click(this, {'click': this.onClick, stopClicks: true, stopDown: true});
        },
        onClick: function(evt) {
            var u = new USNG2();
            var mgrs = u.fromLonLat(HAITI.map.getLonLatFromPixel(evt.xy).transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326")), 2);
            
            OpenLayers.Request.GET({
                url: 'tools/search_index.cgi?grid='+mgrs,
                callback: HAITI.streetQuery.response 
            });    
        }, 
        response: function(req) {
            var f = new OpenLayers.Format.JSON();
            var html = "<table width='100%'><tr>" +
            "<td>ID</td><td>Name</td><td>Type</td><td>OSM ID</td><td>Commune</td><td>Section</td><td>E1000</td><td>N1000</td><td>GZD</td><td></td><td>MGRS</td>";

            var data = f.read(req.responseText);
            if (!data) { return; }
            for (var id = 0; id < data.results.length; id++) {
                var row = "<tr><td>" + data.results[id].join("</td><td>") + "</td></tr>";
                html += row;
            }
		    var w = new Ext.Window({'html':html,
		    	width: 900,
                height: 600,
                autoScroll: true,
		    	'title': "Street Index"});
		    w.show();
        }
    });  
    var SelectPdfControl = OpenLayers.Class(OpenLayers.Control, {
		draw: function () {
			// this Handler.Box will intercept the shift-mousedown
			// before Control.MouseDefault gets to see it
			this.handler = new OpenLayers.Handler.Box( this,
				{"done": this.getPdf});
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
					html += "<li><a href='"+url+"' target=\"_blank\">"+text+"</a></li>";
				}
			}
			html += "</ul>";
			this.w = new Ext.Window({'html':html,
				width: 300,
				'title': 'Results',
				autoScroll: true,
                height: 400});
			this.w.show();
		},
		///'projection' : new OpenLayers.Projection("EPSG:900913"),
        ///'displayProjection' : new OpenLayers.Projection("EPSG:4326"),
		getPdf: function (bounds) {
			var ll = HAITI.map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.left, bounds.bottom)).transform(new OpenLayers.Projection("EPSG:900913"),new OpenLayers.Projection("EPSG:4326"));
            var ur = HAITI.map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.right, bounds.top)).transform(new OpenLayers.Projection("EPSG:900913"),new OpenLayers.Projection("EPSG:4326"));
            var boundsgeog = new OpenLayers.Bounds(ll.lon,ll.lat,ur.lon,ur.lat);
            bbox=boundsgeog.toBBOX();
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

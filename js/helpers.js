    function onFeatureSelect(event) {
        var feature = event.feature;
        var selectedFeature = feature;
        var url = '';
        if (feature.layer.base) {
            url += feature.layer.base;
        }
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
        HAITI.map.addPopup(popup);
    }
    function onFeatureUnselect(event) {
        var feature = event.feature;
        if(feature.popup) {
            HAITI.map.removePopup(feature.popup);
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



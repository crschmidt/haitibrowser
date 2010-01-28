/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Control/ArgParser.js
 */

/**
 * Class: OpenLayers.Control.Permalink
 * The Permalink control is hyperlink that will return the user to the 
 * current map view. By default it is drawn in the lower right corner of the
 * map. The href is updated as the map is zoomed, panned and whilst layers
 * are switched.
 * `
 * Inherits from:
 *  - <OpenLayers.Control>
 */
if (!window.H) { H = {}; };
H.Permalink = OpenLayers.Class(OpenLayers.Control.Permalink, {
    
    /**
     * APIProperty: argParserClass
     * {Class} The ArgParser control class (not instance) to use with this
     *     control.
     */
    argParserClass: H.ArgParser,
    
    /**
     * Method: draw
     *
     * Returns:
     * {DOMElement}
     */    
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
          
        if (!this.element) {
            this.div.className = this.displayClass;
            this.element = document.createElement("a");
            this.element.innerHTML = this.text ? this.text : OpenLayers.i18n("permalink");
            this.element.href="";
            this.div.appendChild(this.element);
        }
        this.map.events.on({
            'moveend': this.updateLink,
            'changelayer': this.updateLink,
            'changebaselayer': this.updateLink,
            scope: this
        });
        
        // Make it so there is at least a link even though the map may not have
        // moved yet.
        this.updateLink();
        
        return this.div;
    },
   
    /**
     * APIMethod: createParams
     * Creates the parameters that need to be encoded into the permalink url.
     * 
     * Parameters:
     * center - {<OpenLayers.LonLat>} center to encode in the permalink.
     *     Defaults to the current map center.
     * zoom - {Integer} zoom level to encode in the permalink. Defaults to the
     *     current map zoom level.
     * layers - {Array(<OpenLayers.Layer>)} layers to encode in the permalink.
     *     Defaults to the current map layers.
     * 
     * Returns:
     * {Object} Hash of parameters that will be url-encoded into the
     * permalink.
     */
    createParams: function(center, zoom, layers) {
        center = center || this.map.getCenter();
          
        var params = OpenLayers.Util.getParameters(this.base);
        
        // If there's still no center, map is not initialized yet. 
        // Break out of this function, and simply return the params from the
        // base link.
        if (center) { 

            //zoom
            params.zoom = zoom || this.map.getZoom(); 

            //lon,lat
            var lat = center.lat;
            var lon = center.lon;
            
            if (this.displayProjection) {
                var mapPosition = OpenLayers.Projection.transform(
                  { x: lon, y: lat }, 
                  this.map.getProjectionObject(), 
                  this.displayProjection );
                lon = mapPosition.x;  
                lat = mapPosition.y;  
            }       
            params.lat = Math.round(lat*100000)/100000;
            params.lon = Math.round(lon*100000)/100000;
    
            //layers        
            layers = layers || this.map.layers;  
            params.layers = '';
            var activeLayers = []
            for (var i=0, len=layers.length; i<len; i++) {
                var layer = layers[i];
                if (!layer.linkId) { continue; }
                if (layer.isBaseLayer) {
                    if (layer == this.map.baseLayer) {
                        activeLayers.push(layer.linkId)
                    }    
                } else {
                    if (layer.getVisibility()) {
                        activeLayers.push(layer.linkId);
                    }    
                }
            }
            params.layers = activeLayers;
        }

        return params;
    }, 

    CLASS_NAME: "OpenLayers.Control.Permalink"
});

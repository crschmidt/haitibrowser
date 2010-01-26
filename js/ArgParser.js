/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Control.ArgParser
 * The ArgParser control adds location bar querystring parsing functionality 
 * to an OpenLayers Map.
 * When added to a Map control, on a page load/refresh, the Map will 
 * automatically take the href string and parse it for lon, lat, zoom, and 
 * layers information. 
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
if (!window.H) { H = {}; };
H.ArgParser = OpenLayers.Class(OpenLayers.Control.ArgParser, {

    /** 
     * Method: configureLayers
     * As soon as all the layers are loaded, cycle through them and 
     *   hide or show them. 
     */
    configureLayers: function() {
        var layerLinks = {}
        for (var i = 0; i < this.map.layers.length; i++) {
            if (this.map.layers[i].linkId) {
                layerLinks[this.map.layers[i].linkId] = this.map.layers[i];
            }    
        }
        var count = 0;
        var layers = this.layers;
        if (typeof layers == "string")  {   
            layers = layers.split(",");
        }    
        for (var i = 0; i < layers.length; i++) {
            var layerMap = {};
            var layerId = layers[i];
            if (layerLinks[layerId]) {
                if (layerLinks[layerId].isBaseLayer) {
                    this.map.setBaseLayer(layerLinks[layerId]);
                } else {
                    layerLinks[layerId].setVisibility(true);
                }
                count += 1;
            }    
            
        }
        if (count == layers.length) {
            this.map.events.unregister('addlayer', this, this.configureLayers);
        }    
    },     

    CLASS_NAME: "OpenLayers.Control.ArgParser"
});

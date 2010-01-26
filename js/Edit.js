if (!window.H) { H = {}; }
H.EditToolbar  = OpenLayers.Class(OpenLayers.Control.EditingToolbar, {
    initialize: function() {
        OpenLayers.Control.EditingToolbar.prototype.initialize.apply(this, arguments);
        var save = new OpenLayers.Control.Button({
            trigger: function() { alert('abc')},
            displayClass: 'olControlSaveFeatures'
        });    
        this.addControls([save]);
    },
    CLASS_NAME: 'OpenLayers.Control.EditingToolbar'
});
H.Edit = OpenLayers.Class(OpenLayers.Control, {
    activate: function() {
        this.layer = new OpenLayers.Layer.Vector("Edit Layer", {displayInLayerSwitcher: false});
        this.map.addLayer(this.layer);
        this.toolbar = new H.EditToolbar(this.layer);
        this.map.addControl(this.toolbar);
    },
    deactivate: function() {
        this.map.removeControl(this.toolbar);
    },
    CLASS_NAME: 'H.Edit'
});    

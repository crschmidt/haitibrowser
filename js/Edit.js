if (!window.H) { H = {}; }
H.EditToolbar  = OpenLayers.Class(OpenLayers.Control.EditingToolbar, {
    initialize: function(layer, options) {
        this.layer = layer;
        OpenLayers.Control.EditingToolbar.prototype.initialize.apply(this, arguments);
        var save = new OpenLayers.Control.Button({
            trigger: OpenLayers.Function.bind(this.save, this),
            displayClass: 'olControlSaveFeatures'
        });    
        this.addControls([save]);
    },
    save: function() {
        if (!this.layer.remote_id) {
            var req = OpenLayers.Request.POST({
                url: 'http://cmapdemo.labs.metacarta.com/featurestore/layer/',
                callback: OpenLayers.Function.bind(this.handleNewLayer, this)
            });    
                
        } else {
            alert("already saved");
        }    
    },
    handleNewLayer: function(response) {
        var f = new OpenLayers.Format.JSON();
        var data = f.read(response.responseText);
        layer.remote_id = data.id;
    },
    CLASS_NAME: 'OpenLayers.Control.EditingToolbar'
});
H.Edit = OpenLayers.Class(OpenLayers.Control, {
    activate: function() {
        if (!this.layer) { 
            this.layer = new OpenLayers.Layer.Vector("Edit Layer", {displayInLayerSwitcher: false});
            // create feature store, binding it to the vector layer
            this.store = new GeoExt.data.FeatureStore({
                layer: this.layer,
                fields: [
                    {name: 'name', type: 'string'},
                    {name: 'description', type: 'string'}
                ]
            });

            // create grid panel configured with feature store
            this.gridPanel = new Ext.grid.EditorGridPanel({
                title: "Feature Grid",
                region: "south",
                store: this.store,
                width: 300,
                height: 400,
                clicksToEdit: 1,            
                columns: [{
                    header: "Name",
                    width: 100,
                    dataIndex: "name",
                    isCellEditable: true,
                    editor: new Ext.form.TextField({
                                allowBlank: false
                                                })
                }, {
                    header: "Description",
                    width: 180,
                    dataIndex: "description",
                    isCellEditable: true,
                    editor: new Ext.form.TextArea({
                                allowBlank: false
                                                })


                }],
                sm: new GeoExt.grid.FeatureSelectionModel() 
            });
            ltPanel.add(this.gridPanel);
            this.map.addLayer(this.layer);
        }
        ltPanel.doLayout();
        this.gridPanel.expand()
        this.toolbar = new H.EditToolbar(this.layer);
        this.map.addControl(this.toolbar);
    },
    deactivate: function() {
        ltPanel.items.items[0].expand();
        this.map.removeControl(this.toolbar);
    },
    CLASS_NAME: 'H.Edit'
});    

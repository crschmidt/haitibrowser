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
                width: 320,
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
                    width: 200,
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
        ltPanel.items.get(0).hide();
        ltPanel.items.get(1).show();
        ltPanel.doLayout();
        this.toolbar = new H.EditToolbar(this.layer);
        this.map.addControl(this.toolbar);
    },
    deactivate: function() {
        ltPanel.items.get(1).hide();
        ltPanel.items.get(0).show();
        this.map.removeControl(this.toolbar);
    },
    CLASS_NAME: 'H.Edit'
});    

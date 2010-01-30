if (!window.H) { H = {}; }
H.EditToolbar  = OpenLayers.Class(OpenLayers.Control.EditingToolbar, {
    geojson: null, 
    initialize: function(layer, options) {
        this.geojson = new OpenLayers.Format.GeoJSON({'internalProjection': new OpenLayers.Projection("EPSG:900913"), 'externalProjection': new OpenLayers.Projection("EPSG:4326")});
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
            for (var i = 0; i < this.layer.features.length; i++) {
                var f = this.layer.features[i];
                this.saveFeature(f);
            }
        }    
    },
    saveFeature: function(feature) {
        if (feature.state == OpenLayers.State.INSERT || feature.state == OpenLayers.State.UPDATE) {
            var f = this.geojson;
            feature.attributes.layers = [this.layer.remote_id];
            var data = f.write([feature]);
            var url = 'http://cmapdemo.labs.metacarta.com/featurestore/feature/';
            if (feature.fid) {
                url += feature.fid + '/';
            }
            feature.state = 0;
            var req = OpenLayers.Request.POST({
                url: url,
                data: data,
                callback: OpenLayers.Function.bind(this.handleFeature, {feature: feature, toolbar: this})
            });    
        }
    },
    handleFeature: function(resp) {
        var f = this.toolbar.geojson;
        var feats = f.read(resp.responseText);
        this.feature.fid = feats[0].fid;
    },
    handleNewLayer: function(response) {
        var f = new OpenLayers.Format.JSON();
        var data = f.read(response.responseText);
        this.layer.remote_id = data.id;
        for (var i = 0; i < this.layer.features.length; i++) {
            var f = this.layer.features[i];
            this.saveFeature(f);
        }
    },
    CLASS_NAME: 'OpenLayers.Control.EditingToolbar'
});
H.Edit = OpenLayers.Class(OpenLayers.Control, {
    activate: function() {
        HAITI.noPopups = true;
        if (!this.store) { 
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
            this.gridPanel.on("afteredit", function(edit) {
                edit.record.data.feature.state = OpenLayers.State.UPDATE;
            });    
            ltPanel.add(this.gridPanel);
        }
        ltPanel.doLayout();
        this.gridPanel.expand()
        this.toolbar = new H.EditToolbar(this.layer);
        this.map.addControl(this.toolbar);
    },
    deactivate: function() {
        if (this.layer.features.length) 
            this.toolbar.save();
        ltPanel.items.items[0].expand();
        for (var i = 0; i < this.toolbar.controls.length; i++) {
            this.toolbar.controls[i].deactivate();
            this.map.removeControl(this.toolbar.controls[i]);
            this.toolbar.controls[i].destroy();
        }

        this.map.removeControl(this.toolbar);
        this.toolbar.destroy();
        HAITI.sfc.deactivate();
        HAITI.sfc.activate();
        HAITI.noPopups = false;
    },
    CLASS_NAME: 'H.Edit'
});    

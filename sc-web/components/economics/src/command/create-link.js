EconomicsCommandCreateProcedure = function (x, y, scene) {
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.link = null;
};

EconomicsCommandCreateProcedure.prototype = {

    constructor: EconomicsCommandCreateProcedure,

    undo: function() {
        if (this.link.is_selected) {
            var idx = this.scene.selected_objects.indexOf(this.link);
            this.scene.selected_objects.splice(idx, 1);
            this.link._setSelected(false);
            this.scene.edit.onSelectionChanged();
        }
        this.scene.removeObject(this.link);
    },

    execute: function() {
        if (this.link == null){
            this.link = Economics.Creator.createProcedure(new Economics.Vector3(this.x, this.y, 0), '');
            this.scene.appendLink(this.link);
            this.scene.updateRender();
            this.scene.clearSelection();
            this.scene.appendSelection(this.link);
        } else {
            this.scene.appendLink(this.link);
            this.link.update();
        }
    }

};

EconomicsCommandCreateAction = function (x, y, scene) {
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.link = null;
};

EconomicsCommandCreateAction.prototype = {

    constructor: EconomicsCommandCreateAction,

    undo: function() {
        if (this.link.is_selected) {
            var idx = this.scene.selected_objects.indexOf(this.link);
            this.scene.selected_objects.splice(idx, 1);
            this.link._setSelected(false);
            this.scene.edit.onSelectionChanged();
        }
        this.scene.removeObject(this.link);
    },

    execute: function() {
        if (this.link == null){
            this.link = Economics.Creator.createAction(new Economics.Vector3(this.x, this.y, 0), '');
            this.scene.appendLink(this.link);
            this.scene.updateRender();
            this.scene.clearSelection();
            this.scene.appendSelection(this.link);
        } else {
            this.scene.appendLink(this.link);
            this.link.update();
        }
    }

};

EconomicsCommandCreateRegulator = function (x, y, scene) {
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.link = null;
};

EconomicsCommandCreateRegulator.prototype = {

    constructor: EconomicsCommandCreateRegulator,

    undo: function() {
        if (this.link.is_selected) {
            var idx = this.scene.selected_objects.indexOf(this.link);
            this.scene.selected_objects.splice(idx, 1);
            this.link._setSelected(false);
            this.scene.edit.onSelectionChanged();
        }
        this.scene.removeObject(this.link);
    },

    execute: function() {
        if (this.link == null){
            this.link = Economics.Creator.createRegulator(new Economics.Vector3(this.x, this.y, 0), '');
            this.scene.appendLink(this.link);
            this.scene.updateRender();
            this.scene.clearSelection();
            this.scene.appendSelection(this.link);
        } else {
            this.scene.appendLink(this.link);
            this.link.update();
        }
    }

};

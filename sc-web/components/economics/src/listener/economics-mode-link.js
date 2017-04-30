EconomicsLinkListener = function (scene) {
    this.scene = scene;
};

EconomicsLinkListener.prototype = {

    constructor: EconomicsLinkListener,

    onMouseMove: function (x, y) {
        return false;
    },

    onMouseDown: function (x, y) {
        return false;
    },

    onMouseDoubleClick: function (x, y) {
        if (this.scene.pointed_object) {
            return false;
        }
        this.scene.commandManager.execute(new EconomicsCommandCreateProcedure(x, y, this.scene));
        return true;
    },

    onMouseDownObject: function (obj) {
        return false;
    },

    onMouseUpObject: function (obj) {
        return true;
    },

    onKeyDown: function (event) {
        return false;
    },

    onKeyUp: function (event) {
        return false;
    }

};
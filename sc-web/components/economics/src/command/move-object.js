EconomicsCommandMoveObject = function (object, offset) {
    this.object = object;
    this.offset = offset;
};

EconomicsCommandMoveObject.prototype = {

    constructor: EconomicsCommandMoveObject,

    undo: function() {
        this.object.setPosition(this.object.position.clone().add(this.offset));
    },

    execute: function() {
        this.object.setPosition(this.object.position.clone().sub(this.offset));
    }

};

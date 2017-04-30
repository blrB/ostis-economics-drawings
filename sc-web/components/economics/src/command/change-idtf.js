EconomicsCommandChangeIdtf = function (object, newIdtf) {
    this.object = object;
    this.oldIdtf = object.text;
    this.newIdtf = newIdtf;
};

EconomicsCommandChangeIdtf.prototype = {

    constructor: EconomicsCommandChangeIdtf,

    undo: function() {
        this.object.setText(this.oldIdtf);
    },

    execute: function() {
        this.object.setText(this.newIdtf);
    }

};

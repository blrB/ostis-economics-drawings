
// ------------------------------

Economics.Widget = function(postition, size) {
}

Economics.Widget.prototype = {
    constructor: Economics.Widget
};

/// ------------------------------
Economics.Button = function(position, size) {
    Economics.Widget.call(this, position, size);
};

Economics.Button.prototype = Object.create( Economics.Widget.prototype );



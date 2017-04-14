Economics.Creator = {};

/**
 * Create new node
 * @param {Integer} sc_type Type of node
 * @param {Economics.Vector3} pos Position of node
 * @param {String} text Text assotiated with node
 *
 * @return Economics.ModelNode created node
 */
Economics.Creator.createNode = function(sc_type, pos, text) {
    return new Economics.ModelNode({
        position: pos.clone(),
        scale: new Economics.Vector2(20, 20),
        sc_type: sc_type,
        text: text
    });
};

Economics.Creator.createLink = function(pos, containerId) {
    var link = new Economics.ModelLink({
        position: pos.clone(),
        scale: new Economics.Vector2(50, 50),
        sc_type: sc_type_link,
        containerId: containerId
    });
    link.setContent("");
    return link;
};

/**
 * Create edge between two specified objects
 * @param {Economics.ModelObject} source Edge source object
 * @param {Economics.ModelObject} target Edge target object
 * @param {Integer} sc_type SC-type of edge
 *
 * @return Economics.ModelEdge created edge
 */
Economics.Creator.createEdge = function(source, target, sc_type) {
    return new Economics.ModelEdge({
        source: source,
        target: target,
        sc_type: sc_type ? sc_type : sc_type_edge_common
    });
};

Economics.Creator.createBus = function(source) {
    return new Economics.ModelBus({
        source: source
    });
};

Economics.Creator.createCounter = function(polygon) {
    return new Economics.ModelContour({
        verticies: polygon
    });
};

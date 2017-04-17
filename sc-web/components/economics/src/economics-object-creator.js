Economics.Creator = {};

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

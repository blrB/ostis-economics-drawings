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

Economics.Creator.createProcedure = function(pos, containerId) {
    var procedure = new Economics.ModelProcedure({
        position: pos.clone(),
        scale: new Economics.Vector2(50, 50),
        sc_type: sc_type_link,
        labelString: containerId
    });
    procedure.setContent("");
    procedure.type = EconomicsLayoutObjectType.ModelProcedure;
    return procedure;
};

Economics.Creator.createAction = function(pos, containerId) {
    var action = new Economics.ModelAction({
        position: pos.clone(),
        scale: new Economics.Vector2(50, 50),
        sc_type: sc_type_link,
        containerId: containerId
    });
    action.setContent("");
    action.type = EconomicsLayoutObjectType.ModelAction;
    return action;
};

Economics.Creator.createRegulator = function(pos, containerId) {
    var regulator = new Economics.ModelRegulator({
        position: pos.clone(),
        scale: new Economics.Vector2(50, 50),
        sc_type: sc_type_link,
        containerId: containerId
    });
    regulator.setContent("");
    // TODO regulator.type = EconomicsLayoutObjectType.ModelRegulator;
    return regulator;
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

var EconomicsLayoutObjectType = {
    ModelNULL: 0,
    ModelProcedure: 1,
    ModelAction: 2,
    ModelRegulator: 3
};

// Layout algorithms


/**
 * Base layout algorithm
 */
Economics.LayoutAlgorithm = function (nodes, edges, contours, onTickUpdate) {
    this.nodes = nodes;
    this.edges = edges;
    this.contours = contours;
    this.onTickUpdate = onTickUpdate;

    this.nodes.forEach(node => node.setPosition = (() => {
        let original = node.setPosition.bind(node);
        return position => {
            original(position);
            node.px = node.x;
            node.py = node.y;
            node.x = position.x;
            node.y = position.y;
        }
    })());
    this.nodes.forEach(node => node._setSelected = (() => {
        let original = node._setSelected.bind(node);
        return value => {
            original(value);
            node.fixed = value;
        }
    })());
};

Economics.LayoutAlgorithm.prototype = {
    constructor: Economics.LayoutAlgorithm
};

// --------------------------

Economics.LayoutAlgorithmForceBased = function (nodes, edges, contours, onTickUpdate, rect) {
    Economics.LayoutAlgorithm.call(this, nodes, edges, contours, onTickUpdate);
    this.rect = rect;
};

Economics.LayoutAlgorithmForceBased.prototype = Object.create(Economics.LayoutAlgorithm);

Economics.LayoutAlgorithmForceBased.prototype.destroy = function () {
    this.stop();
};

Economics.LayoutAlgorithmForceBased.prototype.stop = function () {
    if (this.force) {
        this.force.stop();
        delete this.force;
        this.force = null;
    }

};

Economics.LayoutAlgorithmForceBased.config = {
    friction: 0.9,
    gravity: 0.1,
    defaultDistance: 200,
    defaultStrength: 0.5,
    defaultCharge: -800,
    regulatorCharge: 0,
    linkCharge: 0,
    procedureCharge: 0,
    actionCharge: 0,
    regulatorDistance: 0,
    defaultChargeDistance: 500,
    edgeNodeChargeCoef: 1
};

Economics.LayoutAlgorithmForceBased.prototype.start = function () {

    this.stop();

    // init D3 force layout
    var self = this;


    this.force = d3.layout.force()
        .nodes(this.nodes)
        .links(this.edges)
        .size(this.rect)
        .friction(Economics.LayoutAlgorithmForceBased.config.friction)
        .gravity(Economics.LayoutAlgorithmForceBased.config.gravity)
        .chargeDistance(Economics.LayoutAlgorithmForceBased.config.defaultChargeDistance)
        .linkDistance(edge => edge.getDistance())
        .linkStrength(edge => edge.getStrength())
        .charge(node => node.getCharge())
        .on('tick', function () {
            self.onLayoutTick();
        })
        .start();
};

Economics.LayoutAlgorithmForceBased.prototype.onLayoutTick = function () {

    var dots = [];
    for (idx in this.nodes) {
        var node_layout = this.nodes[idx];

        node_layout.setPosition(new Economics.Vector3(node_layout.x, node_layout.y, 0))
    }

    // setup dot points positions 
    for (idx in dots) {
        var dot = dots[idx];

        var edge = dot.target;
        if (dot.source)
            edge = dot.source;

        dot.x = edge.position.x;
        dot.y = edge.position.y;
    }

    this.onTickUpdate();
};


// ------------------------------------

Economics.LayoutManager = function () {

};

Economics.LayoutManager.prototype = {
    constructor: Economics.LayoutManager
};

Economics.LayoutManager.prototype.init = function (scene) {
    this.scene = scene;
    this.nodes = null;
    this.edges = null;

    this.algorithm = null;
};

/**
 * Prepare objects for layout
 */
Economics.LayoutManager.prototype.prepareObjects = function () {

    this.nodes = [].concat(this.scene.nodes || [])
        .concat(this.scene.links || [])
        .concat(this.scene.contours || []);
    this.edges = [].concat(this.scene.edges || []);
};

let algorithm;

/**
 * Starts layout in scene
 */
Economics.LayoutManager.prototype.doLayout = function () {

    if (this.algorithm) {
        this.algorithm.stop();
        delete this.algorithm;
    }

    this.prepareObjects();
    this.algorithm = new Economics.LayoutAlgorithmForceBased(this.nodes, this.edges, null,
        $.proxy(this.onTickUpdate, this),
        this.scene.getContainerSize());
    algorithm = this.algorithm;
    this.algorithm.start();
};

Economics.LayoutManager.prototype.onTickUpdate = function () {
    this.scene.updateObjectsVisual();
    this.scene.pointed_object = null;
};

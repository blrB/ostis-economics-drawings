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
Economics.LayoutAlgorithm = function(nodes, edges, contours, onTickUpdate) {
    this.nodes = nodes;
    this.edges = edges;
    this.contours = contours;
    this.onTickUpdate = onTickUpdate;
};

Economics.LayoutAlgorithm.prototype = {
    constructor: Economics.LayoutAlgorithm
};

// --------------------------

Economics.LayoutAlgorithmForceBased = function(nodes, edges, contours, onTickUpdate, rect) {
    Economics.LayoutAlgorithm.call(this, nodes, edges, contours, onTickUpdate);
    this.rect = rect;
};

Economics.LayoutAlgorithmForceBased.prototype = Object.create( Economics.LayoutAlgorithm );

Economics.LayoutAlgorithmForceBased.prototype.destroy = function() {
    this.stop();
};

Economics.LayoutAlgorithmForceBased.prototype.stop = function() {
      if (this.force) {
        this.force.stop();
        delete this.force;
        this.force = null;
    }
  
};

Economics.LayoutAlgorithmForceBased.config = {
    friction: 0.9,
    gravity: 0.03,
    defaultDistance: 300,
    defaultStrength: 1,
    defaultCharge: 0
};

Economics.LayoutAlgorithmForceBased.prototype.start = function() {
    
    this.stop();
    
    // init D3 force layout
    var self = this;
    

    this.force = d3.layout.force()
    .nodes(this.nodes)
    .links(this.edges)
    .size(this.rect)
    .friction(Economics.LayoutAlgorithmForceBased.config.friction)
    .gravity(Economics.LayoutAlgorithmForceBased.config.gravity)
    .linkDistance(edge => edge.object.getDistance()/*function(edge){
        
        var p1 = edge.source.object.getConnectionPos(edge.target.object.position, edge.object.source_dot);
        var p2 = edge.target.object.getConnectionPos(edge.source.object.position, edge.object.target_dot);
        var cd = edge.source.object.position.clone().sub(edge.target.object.position).length();
        var d = cd - p1.sub(p2).length();
        
		if (edge.source.type == EconomicsLayoutObjectType.DotPoint ||
			edge.target.type == EconomicsLayoutObjectType.DotPoint) {
			return d + 250;
		}

		return 500 + d;
	}*/)
	.linkStrength(edge => edge.object.getStrength()/*function(edge){
		if (edge.source.type == EconomicsLayoutObjectType.DotPoint ||
			edge.target.type == EconomicsLayoutObjectType.DotPoint) {
			return 1;
		}

		return 0.3;
	}*/)
    .charge(node => node.object.getCharge()/*function(node) {
		if (node.type == EconomicsLayoutObjectType.DotPoint) {
            return 0;
		} else if (node.type == EconomicsLayoutObjectType.Link) {
            return -900;
        }
        
		return -700;
	}*/)
    .on('tick', function() {
        self.onLayoutTick();
    })
    .start();
};

Economics.LayoutAlgorithmForceBased.prototype.onLayoutTick = function() {
    
    var dots = [];
    for (idx in this.nodes) {
        var node_layout = this.nodes[idx];
        
        if (node_layout.type === EconomicsLayoutObjectType.Node) {
            node_layout.object.setPosition(new Economics.Vector3(node_layout.x, node_layout.y, 0));
        } else if (node_layout.type === EconomicsLayoutObjectType.Link) {
            node_layout.object.setPosition(new Economics.Vector3(node_layout.x, node_layout.y, 0));
        } else if (node_layout.type === EconomicsLayoutObjectType.DotPoint) {
            dots.push(node_layout);
        } else if (node_layout.type === EconomicsLayoutObjectType.Contour) {
            node_layout.object.setPosition(new Economics.Vector3(node_layout.x, node_layout.y, 0));
        }
    }
    
    // setup dot points positions 
    for (idx in dots) {
        var dot = dots[idx];
        
        var edge = dot.object.target;
        if (dot.source)
            edge = dot.object.source;
                
        dot.x = edge.position.x;
        dot.y = edge.position.y;
    }
    
    this.onTickUpdate();
};


// ------------------------------------

Economics.LayoutManager = function() {

};

Economics.LayoutManager.prototype = {
    constructor: Economics.LayoutManager
};

Economics.LayoutManager.prototype.init = function(scene) {
    this.scene = scene;
    this.nodes = null;
    this.edges = null;
    
    this.algorithm = null;
};

/**
 * Prepare objects for layout
 */
Economics.LayoutManager.prototype.prepareObjects = function() {

    this.nodes = new Array();
    this.edges = new Array();
    var objDict = {};
    
    // first of all we need to collect objects from scene, and build them representation for layout
    for (idx in this.scene.nodes) {
        var node = this.scene.nodes[idx];
        if (node.contour)
            continue;
        
        var obj = new Object();
        
        obj.x = node.position.x;
        obj.y = node.position.y;
        obj.object = node;
        obj.type = EconomicsLayoutObjectType.Node;
        
        objDict[node.id] = obj;
        this.nodes.push(obj);
    }
    
    for (idx in this.scene.links) {
        var link = this.scene.links[idx];
        if (link.contour)
            continue;
        
        var obj = new Object();
        
        obj.x = link.position.x;
        obj.y = link.position.y;
        obj.object = link;
        obj.type = EconomicsLayoutObjectType.Link;
        
        objDict[link.id] = obj;
        this.nodes.push(obj);
    }
    
    for (idx in this.scene.edges) {
        var edge = this.scene.edges[idx];
        if (edge.contour)
            continue;
        
        var obj = new Object();
        
        obj.object = edge;
        obj.type = EconomicsLayoutObjectType.Edge;
        
        objDict[edge.id] = obj;
        this.edges.push(obj);
    }
    
    for (idx in this.scene.contours) {
        var contour = this.scene.contours[idx];
        if (contour.contour)
            continue;
        
        var obj = new Object();
        
        obj.x = contour.position.x;
        obj.y = contour.position.y;
        obj.object = contour;
        obj.type = EconomicsLayoutObjectType.Contour;
        
        objDict[contour.id] = obj;
        this.nodes.push(obj);
    }
    
    // store begin and end for edges
    for (idx in this.edges) {
        edge = this.edges[idx];
        
        source = objDict[edge.object.source.id];
        target = objDict[edge.object.target.id];
        
        function getEdgeObj(srcObj, isSource) {
            if (srcObj.type == EconomicsLayoutObjectType.Edge) {
                var obj = new Object();
                obj.type = EconomicsLayoutObjectType.DotPoint;
                obj.object = srcObj.object;
                obj.source = isSource;
            
                return obj;
            }
            return srcObj;
        };
                
        edge.source = getEdgeObj(source, true);
        edge.target = getEdgeObj(target, false);
        
        if (edge.source != source)
            this.nodes.push(edge.source);
        if (edge.target != target)
            this.nodes.push(edge.target);
    }
    
};

let algorithm;

/**
 * Starts layout in scene
 */
Economics.LayoutManager.prototype.doLayout = function() {
    
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

Economics.LayoutManager.prototype.onTickUpdate = function() { 
    this.scene.updateObjectsVisual();
    this.scene.pointed_object = null;
};

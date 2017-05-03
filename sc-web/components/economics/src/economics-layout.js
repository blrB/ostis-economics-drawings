var EconomicsLayoutObjectType = {
    ModelNULL: 0,
    //TODO write real idf
    ModelProcedure: 'question_of_finding_definitional_domain',
    ModelAction: 'action.conclude_contract_for_maintenance_of_cash_register_equipment',
    ModelRegulator: 'action.develop_organization_charter',
    ModelTest:'questiond',
    ModelLegend: 4
};

var EconomicsLegend = {
    idf:[],
    objectsInScene:[],
    sysIdf:[],
    legendVisibel:false,
    loadIdf: function() {
        this.sysIdf = [EconomicsLayoutObjectType.ModelRegulator, EconomicsLayoutObjectType.ModelAction, EconomicsLayoutObjectType.ModelProcedure];
        var keynodes = this.sysIdf;
        this.idf=[];
        SCWeb.core.Server.resolveScAddr(keynodes, function (keynodes) {
            SCWeb.core.Server.resolveIdentifiers(keynodes, function (idf) {
                EconomicsLegend.sysIdf.forEach(function (obj) {
                    EconomicsLegend.idf.push(idf[keynodes [obj]]);
                });

            });

        });


    },
    createTable: function(scene) {
        this.setObjectInScene(scene.links);
        // this.findComment(12);
        var table='<table id=economic-legend-table> ';
        this.objectsInScene.forEach(function (obj) {
            table+=EconomicsLegend.addTR(obj);
        });
        table+='</table>';


        return table
    },
    updateTable(scene){
        $("#economic-legend-table").html(this.createTable(scene));
    },
//TODO not work and don't know why
    findComment: function(idf) {
        // return new Promise(function (resolve, reject) {
            window.sctpClient.iterate_constr(
                SctpConstrIter(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F,
                    [EconomicsLayoutObjectType.ModelTest,
                        sc_type_arc_common | sc_type_const,
                        sc_type_node | sc_type_const,
                        sc_type_arc_pos_const_perm,
                        'nrel_legend'
                    ],
                    {"empty_node1": 2}),
                SctpConstrIter(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F,
                    [   sc_type_node | sc_type_const,
                        sc_type_arc_common | sc_type_const,
                        "empty_node1",
                        sc_type_arc_pos_const_perm,
                        'nrel_sc_text_translation'
                    ],
                    {"empty_node2": 2}),
                SctpConstrIter(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F,
                    ["empty_node2",
                        sc_type_arc_common | sc_type_const,
                        sc_type_node | sc_type_const,
                        sc_type_arc_pos_const_perm,
                        'nrel_comment'
                    ],
                    {"comment": 2})
            ).done(function (results) {

                var procedures = [];
                console.log(results.results.length);
                // resolve(procedures);
            }).fail(function () {
                console.log("fail in Economics.EconomicsLegend.findComment");
                // resolve([]);
            });
        // });


    },

    setObjectInScene: function(links) {
        this.objectsInScene=[];
        this.sysIdf.forEach(function (obj) {
            var findObj =links.find(function (sceneObj){
                return sceneObj.type===obj;
            });
            if(findObj)
                EconomicsLegend.objectsInScene.push(obj)
        });
    },
    addTR: function(type) {
        if(type===EconomicsLayoutObjectType.ModelRegulator)
            return '<tr> ' +
                '<td><svg width='+100+' height='+50+'><rect width='+60+' stroke=rgb(119,119,119) stroke-width=2 height='+20+' x='+10+' y='+10+' rx='+10+' fill=rgb(255,255,255) /><svg></td> ' +
                '<td>-'+this.idf[0]+'</td> ' +
                '</tr> ' ;
        if(type===EconomicsLayoutObjectType.ModelAction)
            return '<tr> ' +
                '<td><svg width='+100+' height='+50+'><circle stroke=rgb(119,119,119) stroke-width=2 cx='+40+' cy='+25+' r='+22+' fill=rgb(204,218,169) /><svg></td> ' +
                '<td>-'+this.idf[1]+'</td> ' +
                '</tr> ' ;
        if(type==EconomicsLayoutObjectType.ModelProcedure)
            return '<tr> ' +
                '<td><svg width='+100+' height='+50+'><rect width='+60+' stroke=rgb(119,119,119) stroke-width=2 height='+30+' x='+10+' y='+10+'  fill=rgb(149,174,206) /><line x1='+20+' y1='+10+' x2='+20+' y2='+40+' stroke=rgb(0,0,0) stroke-width=1 /><line x1='+60+' y1='+10+' x2='+60+' y2='+40+' stroke=rgb(0,0,0) stroke-width=1 /><svg></td> ' +
                '<td>-'+this.idf[2]+'</td> ' +
                '</tr> ' ;


    }



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
    gravity: 0.2,
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

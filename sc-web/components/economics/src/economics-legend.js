
var EconomicsLegend = {

    idf: [],
    objectsInScene: [],
    sysIdf: [],
    sysIdfNo: {},
    legendVisibel: false,

    loadIdf: function() {
        this.idf=[];

        this.sysIdf = [
            EconomicsKeynodesHandler.scKeynodes.concept_regulator,
            EconomicsKeynodesHandler.scKeynodes.question,
            EconomicsKeynodesHandler.scKeynodes.concept_administrative_procedure
        ];

        this.sysIdfNo = {
            concept_regulator: 0,
            question: 1,
            concept_administrative_procedure: 2
        };

        var promises = this.sysIdf.map(addr => this.findComment(addr));

        return Promise.all(promises).then(result => {
            result.forEach(comment => {
                EconomicsLegend.idf.push(comment);
            });
        })
    },

    createTable: function(scene) {
        this.setObjectInScene(scene.links);
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

    findComment: function(addr) {
        return new Promise(function (resolve, reject) {
            window.sctpClient.iterate_constr(
                SctpConstrIter(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F,
                    [   addr,
                        sc_type_arc_common | sc_type_const,
                        sc_type_node | sc_type_const,
                        sc_type_arc_pos_const_perm,
                        EconomicsKeynodesHandler.scKeynodes.nrel_legend
                    ],
                    {"empty_node1": 2}),
                SctpConstrIter(SctpIteratorType.SCTP_ITERATOR_5A_A_F_A_F,
                    [   sc_type_node | sc_type_const,
                        sc_type_arc_common | sc_type_const,
                        "empty_node1",
                        sc_type_arc_pos_const_perm,
                        EconomicsKeynodesHandler.scKeynodes.nrel_sc_text_translation
                    ],
                    {"empty_node2": 0}),
                SctpConstrIter(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F,
                    [  "empty_node2",
                        sc_type_arc_common | sc_type_const,
                        sc_type_link,
                        sc_type_arc_pos_const_perm,
                        EconomicsKeynodesHandler.scKeynodes.nrel_comment
                    ],
                    {"comment": 2}),
                SctpConstrIter(SctpIteratorType.SCTP_ITERATOR_3F_A_F,
                    [   parseInt(SCWeb.core.Translation.getCurrentLanguage()),
                        sc_type_arc_pos_const_perm,
                        "comment"
                    ])
            ).done(function (results) {

                var comment = results.get(0, "comment");
                window.sctpClient.get_link_content(comment)
                    .done(function(res) {
                        resolve(res);
                    })
                    .fail(function() {
                        console.log("fail in findComment get_link_content");
                        resolve("---");
                    });
            }).fail(function () {
                console.log("fail in findComment");
                resolve("---");
            });
        });
    },

    setObjectInScene: function(links) {
        this.objectsInScene=[];
        var types = [EconomicsLayoutObjectType.ModelRegulator, EconomicsLayoutObjectType.ModelAction, EconomicsLayoutObjectType.ModelProcedure];
        types.forEach(function (obj) {
            var findObj = links.find(function (sceneObj){
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
                '<td>-'+this.idf[this.sysIdfNo.concept_regulator]+'<hr></td> ' +
                '</tr> ' ;
        if(type===EconomicsLayoutObjectType.ModelAction)
            return '<tr> ' +
                '<td><svg width='+100+' height='+50+'><circle stroke=rgb(119,119,119) stroke-width=2 cx='+40+' cy='+25+' r='+22+' fill=rgb(204,218,169) /><svg></td> ' +
                '<td>-'+this.idf[this.sysIdfNo.question]+'<hr></td> ' +
                '</tr> ' ;
        if(type==EconomicsLayoutObjectType.ModelProcedure)
            return '<tr> ' +
                '<td><svg width='+100+' height='+50+'><rect width='+60+' stroke=rgb(119,119,119) stroke-width=2 height='+30+' x='+10+' y='+10+'  fill=rgb(149,174,206) /><line x1='+20+' y1='+10+' x2='+20+' y2='+40+' stroke=rgb(0,0,0) stroke-width=1 /><line x1='+60+' y1='+10+' x2='+60+' y2='+40+' stroke=rgb(0,0,0) stroke-width=1 /><svg></td> ' +
                '<td>-'+this.idf[this.sysIdfNo.concept_administrative_procedure]+'<hr></td> ' +
                '</tr> ' ;
    }
};

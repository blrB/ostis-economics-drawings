Economics.TemplateFinder = function () {

    this.contour = null;
    this.editor = null;
    this.scene = null;
    this.render = null;
    this.templates = [];
};

Economics.TemplateFinder.prototype = {


    init: function (params) {

        this.contour = params.contour;
        this.editor = params.scene;
        this.scene = params.editor.scene;
        this.render = params.editor.render;
        this.templates = [];
        this.templates.push(Economics.ModelProcedure);
        this.templates.push(Economics.ModelAction);
        this.templates.push(Economics.ModelArrow);
        this.templates.push(Economics.ModelRegulator);
    },

    getAllObjectsByContour: function () {

        if (this.contour === null) {
            throw 'contour === null in Economics.TemplateFinder';
        }

        if (this.templates === []) {
            throw 'templates === [] in Economics.TemplateFinder';
        }

        var self = this;

        var templatePromises = [];

        this.templates.forEach(function (template) {
            var templatePromise = template.getAllObjectsByContour(self.contour);
            templatePromises.push(templatePromise);
        });

        return templatePromises;
    },

    drawByContour: function () {

        var self = this;

        var templatePromises = this.getAllObjectsByContour();

        Promise.all(templatePromises).then(function (data) {
            self.viewInEditor(data)
        });
    },

    viewInEditor: function(data) {

        function getRandomInt0to100() {
            return Math.floor(Math.random() * (100));
        }

        var scene = this.scene;
        data.forEach(function (template) {
            template.forEach(function (model) {
                var x = getRandomInt0to100();
                var y = getRandomInt0to100();
                if (model instanceof Economics.ModelProcedure || model instanceof Economics.ModelAction) {
                    var link;
                    if (model instanceof Economics.ModelProcedure) {
                        link = Economics.Creator.createProcedure(new Economics.Vector3(x, y, 0), '');
                    } else if (model instanceof Economics.ModelAction) {
                        link = Economics.Creator.createAction(new Economics.Vector3(x, y, 0), '');
                    }
                    link.addr = model.addr;
                    link.labelString = model.labelString;
                    link.labelAddr = model.labelAddr;
                    link.setContent(model.labelString);
                    scene.appendObject(link);
                } else if (model instanceof Economics.ModelArrow) {
                    var object = finder.findSourceAndTargetByModel(model);
                    if (object.target && object.source) {
                        var edge = Economics.Creator.createEdge(object.source, object.target, EconomicsTypeEdgeNow);
                    } else {
                        console.log("Error, can not create arrow " + model.source + " -> " + model.target);
                        console.log(object.source + " -> " + object.target)
                    }
                    scene.appendObject(edge);
                } else if (model instanceof Economics.ModelRegulatorHelper) {
                    var object = finder.findSourceAndTargetByModel(model);
                    if (!object.target) {
                        object.target = Economics.Creator.createRegulator(new Economics.Vector3(x, y, 0), '');
                        object.target.addr = model.target;
                        object.target.setContent(model.labelString);
                        scene.appendObject(object.target);
                    }
                    if (object.target && object.source) {
                        var edge = Economics.Creator.createEdge(object.target, object.source, EconomicsTypeEdgeRegulator);
                    } else {
                        console.log("Error, can not create arrow for regulator" + model.source + " -> " + model.target);
                        console.log(object.source + " -> " + object.target)
                    }
                    scene.appendObject(edge);
                }
            })
        });

        this.scene.layout();
        this.render.update();
    },

    findSourceAndTargetByModel: function (model) {

        var source;
        var target;

        source = this.scene.links.find(function (item) {
            return item.addr == model.source;
        });

        target = this.scene.links.find(function (item) {
            return item.addr == model.target;
        });

        return {
            source: source,
            target: target
        }
    }

};

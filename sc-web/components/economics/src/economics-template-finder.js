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
                if (model instanceof Economics.ModelProcedure || model instanceof Economics.ModelAction) {
                    var x = getRandomInt0to100();
                    var y = getRandomInt0to100();
                    var link = Economics.Creator.createLink(new Economics.Vector3(x, y, 0), '');
                    link.addr = model.addr;
                    link.setContent(model.labelString);
                    if (model instanceof Economics.ModelProcedure) {
                        link.type = EconomicsLayoutObjectType.ModelProcedure;
                    } else if (model instanceof Economics.ModelAction) {
                        link.type = EconomicsLayoutObjectType.ModelAction;
                    }
                    scene.appendObject(link);
                } else if (model instanceof Economics.ModelArrow) {
                    var object = finder.findSourceAndTargetByModel(model);
                    var edge = Economics.Creator.createEdge(object.source, object.target, EconomicsTypeEdgeNow);
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

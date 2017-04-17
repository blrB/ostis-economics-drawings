Economics.TemplateFinder = function () {

    this.contour = null;
    this.templates = [];
};

Economics.TemplateFinder.prototype = {


    init: function (params) {

        this.contour = params.contour;

        this.templates = [];
        this.templates.push(Economics.ModelProcedure);
        this.templates.push(Economics.ModelAction);
        this.templates.push(Economics.ModelArrow);
    },

    getAllObjectsByContour: function () {

        if (this.contour === null){
            throw 'contour === null in Economics.TemplateFinder';
        }

        if (this.templates === []){
            throw 'templates === [] in Economics.TemplateFinder';
        }

        var self = this;

        var templatePromises = [];

        this.templates.forEach(function (template) {
            var templatePromise = template.getAllObjectsByContour(self.contour);
            templatePromises.push(templatePromise);
        });

        return templatePromises;
    }

};

//TODO delete test

function templateTest() {

    function getRandomInt0to100() {
        return Math.floor(Math.random() * (100));
    }

    function viewInEditor(data) {
        var scene = testEditor.scene;
        data[0].forEach(function (model) {
            var x = getRandomInt0to100();
            var y = getRandomInt0to100();
            var link = Economics.Creator.createLink(new Economics.Vector3(x, y, 0), '');
            link.addr = model.addr;
            link.setContent(model.labelString);
            scene.appendProcedure(link);
        });
        data[1].forEach(function (model) {
            var x = getRandomInt0to100();
            var y = getRandomInt0to100();
            var link = Economics.Creator.createLink(new Economics.Vector3(x, y, 0), '');
            link.addr = model.addr;
            link.setContent(model.labelString);
            scene.appendAction(link);
        });
        data[2].forEach(function (model) {
            // var source = scene.procedures.find(function (item) {
            //     return item.addr == model.source;
            // });
            // var target = scene.procedures.find(function (item) {
            //     return item.addr == model.target;
            // });
            // var edge = Economics.Creator.createEdge(source, target, EconomicsTypeEdgeNow);
            // scene.appendObject(edge);
        });
        testEditor.scene.layout();
        testEditor.render.update();
    }

    SCWeb.core.Server.resolveScAddr(['test_economics'], function (keynodes) {
        contour = keynodes['test_economics'];

        finder = new Economics.TemplateFinder();
        finder.init({contour: contour});

        var templatePromises = finder.getAllObjectsByContour();

        Promise.all(templatePromises).then(function (data) {
            console.log(data);
            viewInEditor(data)
        });
    });
}
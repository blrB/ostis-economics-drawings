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

    SCWeb.core.Server.resolveScAddr(['test_economics'], function (keynodes) {
        contour = keynodes['test_economics'];

        finder = new Economics.TemplateFinder();
        finder.init({contour: contour});

        var templatePromises = finder.getAllObjectsByContour();

        Promise.all(templatePromises).then(function (data) {
            console.log(data);
        });
    });
}
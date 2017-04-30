EconomicsKeynodesHandler = {

    systemIds: [
        'nrel_goto',
        'nrel_inclusion',
        'nrel_regulator',
        'concept_administrative_procedure',
        'question'
    ],

    scKeynodes: {},

    load: false,

    initSystemIds: function (callback) {
        var self = this;
        SCWeb.core.Server.resolveScAddr(this.systemIds, function (keynodes) {
            Object.getOwnPropertyNames(keynodes).forEach(function (key) {
                console.log('Resolved keynode: ' + key + ' = ' + keynodes[key]);
                self.scKeynodes[key] = keynodes[key];
            });
            self.load = true;
            callback();
        });
    }

};

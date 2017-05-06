var ClarificationOfQuestion = {

    systemIds: [
        'concept_MinEco'
    ],

    scKeynodes: {},

    init : function () {
        var promiseIdf = this.initSystemIds();
        promiseIdf.then(() => {
            var addrForListener = ClarificationOfQuestion.scKeynodes.concept_MinEco;
            window.sctpClient.event_create(
                SctpEventType.SC_EVENT_ADD_OUTPUT_ARC,
                addrForListener,
                (addr, arg) => {
                    console.log("addr " + addr);
                    console.log("arg " + arg);
                }
            );
        })
    },

    initSystemIds: function () {
        return new Promise((resolve, reject) => {
            SCWeb.core.Server.resolveScAddr(this.systemIds, (keynodes) => {
                Object.getOwnPropertyNames(keynodes).forEach((key) => {
                    console.log('Resolved keynode: ' + key + ' = ' + keynodes[key]);
                    this.scKeynodes[key] = keynodes[key];
                });
                resolve();
            });
        });
    }

};

(()=>{
    SCWeb.core.Main.init = (()=>{
        let original = SCWeb.core.Main.init.bind(SCWeb.core.Main);
        return param => original(param).done(() => {
           ClarificationOfQuestion.init();
        })
    })();
})();

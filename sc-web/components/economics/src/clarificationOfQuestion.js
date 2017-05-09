var ClarificationOfQuestion = {

    systemIds: [
        'question_initiated',
        'action_select_one_from_alternatives',
        'nrel_object',
        'nrel_inclusion',
        'nrel_result',

        'test_for_action' // TODO delete
    ],

    scKeynodes: {},

    init: function () {
        this.userAddr = SCWeb.core.Main.user.sc_addr;

        var promiseIdf = this.initSystemIds();
        promiseIdf.then(() => {
            var addrForListener = ClarificationOfQuestion.scKeynodes.question_initiated;
            window.sctpClient.event_create(
                SctpEventType.SC_EVENT_ADD_OUTPUT_ARC,
                addrForListener,
                (addr, arg) => {
                    this.eventHandler(addr, arg);
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
    },

    eventHandler: function (addr, arg) {

        let modalPromise = alternatives => {
            return new Promise((resolve, reject) => {
                let chooses = Object.keys(alternatives)
                    .filter(key => key !== 'question' && key !== 'warning')
                    .map(key => `
<div class="radio">
  <label><input type="radio" name="optradio" class="alternative" option="${key}">${alternatives[key]}</label>
</div>`
                    )
                    .reduce((result, el) => result + el, '');
                $('body').append(`
<div class="modal fade" id="chooseAlternativeModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <!--<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>-->
        <h4 class="modal-title" id="myModalLabel">${alternatives.question.name}</h4>
        <div id="warning" class="alert alert-warning" hidden="">${alternatives.warning.name}</div>
      </div>
      <div class="modal-body">
        ${chooses}
      </div>
      <div class="modal-footer">
        <!--<button type="button" class="btn btn-default cancel" data-dismiss="modal">Close</button>-->
        <button type="button" class="btn btn-primary choose">Save changes</button>
      </div>
    </div>
  </div>
</div>`);
                let choosed = null;
                let modal = $('#chooseAlternativeModal');
                $('#chooseAlternativeModal .cancel').click(reject);
                $('#chooseAlternativeModal .choose').click((() => {
                    if (choosed) {
                        resolve({question: alternatives.question.idtf, target: choosed});
                        modal.modal('hide');
                    } else {
                        modal.find('#warning').show();
                    }
                }));
                $('#chooseAlternativeModal').modal({backdrop: 'static'});
                $('#chooseAlternativeModal').on('hidden.bs.modal', () => {
                    $('#chooseAlternativeModal').remove();
                    reject()
                });
                $('#chooseAlternativeModal .alternative').click(function () {
                    choosed = $(this).attr('option');
                });
            });
        };

        function handler(target) {
            var findSubclasses = new Promise((resolve, reject) => {
                window.sctpClient.iterate_constr(
                    SctpConstrIter(SctpIteratorType.SCTP_ITERATOR_3F_A_A,
                        [target,
                            sc_type_arc_pos_const_perm,
                            sc_type_node | sc_type_const
                        ],
                        {"class": 2}),
                    SctpConstrIter(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F,
                        ["class",
                            sc_type_arc_common | sc_type_const,
                            sc_type_node | sc_type_const,
                            sc_type_arc_pos_const_perm,
                            ClarificationOfQuestion.scKeynodes.nrel_inclusion
                        ],
                        {"subClass": 2})
                ).done((results) => {

                    var addrs = [];
                    var alternatives = {};
                    var name = results.get(0, "class");

                    for (var template = 0; template < results.results.length; template++) {
                        var subClass = results.get(template, "subClass");
                        addrs.push(subClass);
                    }

                    SCWeb.core.Server.resolveIdentifiers(addrs.concat([name]), function (idtfs) {
                        alternatives['question'] = {name: idtfs[name], idtf: name};
                        alternatives.warning = {name: 'warning'};
                        addrs.forEach(function (addr) {
                            alternatives[addr] = idtfs[addr];
                        });
                        resolve(alternatives);
                    });
                }).fail(() => {
                    console.log("ERROR. Not find template");
                });
            });

            findSubclasses.then((alternatives) => {
                console.log(alternatives);
                return alternatives;
            })
                .then(alternatives => modalPromise(alternatives))
                .then(result => {
                    this.generateArcForResult(result.question, result.target)
                });
        }

        window.sctpClient.get_arc(arg).done((array) => {

            var target = array[1];

            var isActionPromise = new Promise((resolve, reject) => {
                window.sctpClient.iterate_constr(
                    SctpConstrIter(SctpIteratorType.SCTP_ITERATOR_3F_A_F,
                        [ClarificationOfQuestion.scKeynodes.action_select_one_from_alternatives,
                            sc_type_arc_pos_const_perm,
                            target
                        ]),
                    SctpConstrIter(SctpIteratorType.SCTP_ITERATOR_5F_A_F_A_F,
                        [target,
                            sc_type_arc_common | sc_type_const,
                            ClarificationOfQuestion.userAddr,
                            sc_type_arc_pos_const_perm,
                            ClarificationOfQuestion.scKeynodes.nrel_object
                        ])
                ).done((results) => {
                    resolve(target);
                });
            });

            isActionPromise.then(handler.bind(this));
        });
    },

    generateArcForResult: function (questionAddr, chooseAddr) {
        window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, questionAddr, chooseAddr).done((arc_addr) => {
            window.sctpClient.create_arc(sc_type_arc_pos_const_perm, ClarificationOfQuestion.scKeynodes.nrel_result, arc_addr).done(() => {
                console.log("generate result");
            }).fail(() => console.log("fail when add nrel_result"));
        }).fail(() => console.log(`fail when add result [question: ${questionAddr}, choose: ${chooseAddr}]`));
    }

};

(() => {
    SCWeb.core.Main.init = (() => {
        let original = SCWeb.core.Main.init.bind(SCWeb.core.Main);
        return param => original(param).done(() => {
            ClarificationOfQuestion.init();
        })
    })();
})();


// TEST ----------------------------------------- delete in master and delete kb

function addUser() {
    window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, ClarificationOfQuestion.scKeynodes.test_for_action, ClarificationOfQuestion.userAddr).done(function (arc_addr) {
        window.sctpClient.create_arc(sc_type_arc_pos_const_perm, ClarificationOfQuestion.scKeynodes.nrel_object, arc_addr).done(function () {
            console.log("Add user : " + ClarificationOfQuestion.userAddr + " to " + ClarificationOfQuestion.scKeynodes.test_for_action);
        }).fail(() => console.log("fail when add nrel_object"));
    }).fail(() => console.log("fail when add user"));
}

function addQuestionInit() {
    window.sctpClient.create_arc(sc_type_arc_pos_const_perm, ClarificationOfQuestion.scKeynodes.question_initiated, ClarificationOfQuestion.scKeynodes.test_for_action).done(function () {
        console.log("Add question to " + ClarificationOfQuestion.scKeynodes.test_for_action);
    }).fail(() => console.log("fail when add question"));
}

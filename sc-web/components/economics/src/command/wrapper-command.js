EconomicsWrapperCommand = function (commands) {
    this.commands = commands;
};

EconomicsWrapperCommand.prototype = {

    constructor: EconomicsWrapperCommand,

    undo: function () {
        this.commands.forEach(function (command) {
            command.undo();
        });
    },

    execute: function () {
        this.commands.forEach(function (command) {
            command.execute();
        });
    }

};

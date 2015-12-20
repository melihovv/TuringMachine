'use strict';

import Backbone from 'backbone';
import _ from 'underscore';
import $ from 'jquery';

const TuringMachine = Backbone.Model.extend({
    defaults: {
        states: [],
        alphabet: [],
        commands: {},
        beginState: '',
        endState: '',
        tapeActivePos: 0,
        tape: new Array(20).fill('E'),
        currentState: '',
        nextCommand: '',
        stop: false
    },

    initialize: function () {
        // TODO remove later.
        this.on('invalid', function (model, error) {
            console.log(error);
        }, this);
    },

    step: function (silent = false) {
        if (this.get('currentState') === 'STOP' ||
            this.get('currentState') === this.get('endState')) {
            return 'Machine in final state';
        }

        const currentSymbol = this.get('tape')[this.get('tapeActivePos')];

        if (this.get('currentState') === '') {
            this.set({currentState: this.get('beginState')}, {silent: true});
        }
        const currentState = this.get('currentState');

        const command = this.get('commands')[currentSymbol + currentState];
        if (command === undefined) {
            return `There is no command that satisfy symbol '${currentSymbol}' and state '${currentState}'`;
        }

        let newPos;
        switch (command.shift) {
            case 'L':
                newPos = this.get('tapeActivePos') - 1;
                break;
            case 'R':
                newPos = this.get('tapeActivePos') + 1;
                break;
            case 'N':
                break;
        }
        if (newPos < 0 || newPos >= this.get('tape').length) {
            return 'Tape is over';
        }

        this.get('tape')[this.get('tapeActivePos')] = command.symbolToPlace;
        this.set({currentState: command.nextState}, {silent: silent});
        this.set({tapeActivePos: newPos}, {silent: silent});
    },

    play: function (callback) {
        let chunk = 9;
        this.set('stop', false);
        const _this = this;

        const doChunk = () => {
            if (_this.get('stop')) {
                _this.trigger('change:tapeActivePos');
                _this.trigger('change:currentState');
                return callback();
            }

            let cnt = chunk;
            let response = '';

            while (cnt-- && !response &&
                _this.get('currentState') !== _this.get('endState') &&
                _this.get('currentState') !== 'STOP' && !_this.get('stop')) {
                response = _this.step(true);

                if (response) {
                    _this.trigger('change:tapeActivePos');
                    _this.trigger('change:currentState');
                    return callback(response);
                }
            }

            if (!response &&
                _this.get('currentState') !== _this.get('endState') &&
                _this.get('currentState') !== 'STOP' && !_this.get('stop')) {
                setTimeout(doChunk, 1);
            } else {
                _this.trigger('change:tapeActivePos');
                _this.trigger('change:currentState');
                callback();
            }

            // Uncomment this to get interactivity.
            //_this.trigger('change:tapeActivePos');
            //_this.trigger('change:currentState');
            //callback();
        };

        doChunk();
    },

    break: function () {
        console.log('break');
        this.set('stop', true);
    }
});

const template = (id) => $('#' + id).html();

const download = (filename, text) => {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' +
        encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    } else {
        pom.click();
    }
};

const InfoView = Backbone.View.extend({
    el: '#info',

    initialize: function () {
        this.model.on(
            'change:tape change:tapeActivePos change:currentState change:nextCommand change:beginState change:commands',
            this.render,
            this
        );
        this.render();
    },

    template: _.template(template('infoTemplate')),

    render: function () {
        if (this.model.get('currentState') === '') {
            this.model.set({currentState: this.model.get('beginState')}, {silent: true});
        }
        const nextCommand = this.model.get('commands')[this.model.get('tape')[this.model.get('tapeActivePos')] + this.model.get('currentState')];
        if (nextCommand) {
            this.model.set({
                nextCommand: nextCommand.symbolToPlace + nextCommand.shift + nextCommand.nextState
            });
        } else {
            this.model.set({
                nextCommand: ''
            });
        }
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

const TapeView = Backbone.View.extend({
    id: 'tapeTable',
    className: 'table',
    tagName: 'id',

    initialize: function () {
        this.model.on('change:tapeActivePos change:tape', this.render, this);
        this.render();
    },

    template: _.template(template('tape')),

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    events: {
        'focusout input': function (e) {
            const $target = $(e.target);
            const $td = $($target.parent());
            const colNumber = $td.index();
            const symbol = $target.val();

            if (this.model.get('alphabet').indexOf(symbol) === -1) {
                alert('Invalid symbol');
                $target.val(this.model.get('tape')[colNumber]);
                return;
            }
            this.model.get('tape')[colNumber] = symbol;
            this.model.trigger('change:tape');
        },
        'keypress input': function (e) {
            if (e.keyCode !== 13) {
                return;
            }
            this.$el.find('.active').removeClass('active');
            const $target = $(e.target);
            const $td = $($target.parent());
            const colNumber = $td.index();
            $target.addClass('active');
            this.model.set({tapeActivePos: colNumber});
        }
    }
});

const BeginAndEndStatesView = Backbone.View.extend({
    id: 'beginAndEndStates',

    initialize: function () {
        this.model.on('change:beginState change:endState', this.render, this);
        this.render();
    },

    template: _.template(template('beginAndEndState')),

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.find('.import').bootstrapFileInput();
        return this;
    },

    events: {
        'click #step': function (e) {
            e.preventDefault();
            const message = this.model.step();
            if (message) {
                alert(message);
            }
        },
        'click #play': function (e) {
            e.preventDefault();
            this.model.play((message) => {
                if (message) {
                    alert(message);
                }
            });
        },
        'click #break': function (e) {
            e.preventDefault();
            this.model.break();
        },
        'focusout #beginStateInput': function () {
            const state = this.$el.find('#beginStateInput').val().trim();
            if (this.model.get('states').indexOf(state) === -1) {
                alert('Invalid begin state');
                this.render();
                return;
            }
            this.model.set({beginState: state});
            this.model.set({currentState: state});
        },
        'focusout #endStateInput': function () {
            const state = this.$el.find('#endStateInput').val().trim();
            if (this.model.get('states').indexOf(state) === -1) {
                alert('Invalid end state');
                this.render();
                return;
            }
            this.model.set({endState: state});
        },
        'change .importTable': function (e) {
            var reader = new FileReader();

            reader.onload = () => {
                const input = reader.result;
                try {
                    const obj = JSON.parse(input);

                    if (typeof obj.commands !== 'object' || !Array.isArray(obj.states) || !Array.isArray(obj.alphabet) ||
                        typeof obj.beginState !== 'string' ||
                        typeof obj.endState !== 'string'
                    ) {
                        alert('Invalid json file');
                        return;
                    }

                    if (obj.alphabet.indexOf('E') === -1) {
                        alert('Input file doesn\'t contain empty symbol');
                        return;
                    }

                    if (obj.alphabet.length !== new Set(obj.alphabet).size) {
                        alert('Input file contains invalid alphabet');
                        return;
                    }

                    for (const symbol of obj.alphabet) {
                        if (symbol.length !== 1) {
                            alert('Input file contains invalid alphabet');
                            return;
                        }
                    }

                    if (obj.states.indexOf('STOP') === -1) {
                        alert('Input file doesn\'t contain final state');
                        return;
                    }

                    if (obj.states.length !== new Set(obj.states).size) {
                        alert('Input file contains invalid states');
                        return;
                    }

                    if (obj.states.indexOf(obj.beginState) === -1) {
                        alert('Input file contains invalid begin state');
                        return;
                    }

                    if (obj.states.indexOf(obj.endState) === -1) {
                        alert('Input file contains invalid end state');
                        return;
                    }

                    for (const state of obj.states) {
                        if (state.length === 0) {
                            alert('Input file contains invalid states');
                            return;
                        }
                    }

                    for (const key in obj.commands) {
                        if (key.length < 2) {
                            alert('Input file contains invalid commands');
                            return;
                        }

                        const symbol = key[0];
                        if (obj.alphabet.indexOf(symbol) === -1) {
                            alert('Input file contains invalid commands');
                            return;
                        }

                        const state = key.slice(1);
                        if (obj.states.indexOf(state) === -1) {
                            alert('Input file contains invalid commands');
                            return;
                        }

                        const command = obj.commands[key];
                        if (obj.alphabet.indexOf(command.symbolToPlace) === -1) {
                            alert('Input file contains invalid commands');
                            return;
                        }
                        if (obj.states.indexOf(command.nextState) === -1) {
                            alert('Input file contains invalid commands');
                            return;
                        }
                        if (['L', 'R', 'N'].indexOf(command.shift) === -1) {
                            alert('Input file contains invalid commands');
                            return;
                        }
                    }

                    this.model.set({states: obj.states}, {silent: true});
                    this.model.set({alphabet: obj.alphabet}, {silent: true});
                    this.model.set({commands: obj.commands});
                    this.model.set({beginState: obj.beginState}, {silent: true});
                    this.model.set({currentState: obj.beginState}, {silent: true});
                    this.model.set({endState: obj.endState});
                } catch (exception) {
                    alert('Invalid json file');
                }
            };

            if (e.target.files.length > 0) {
                reader.readAsText(e.target.files[0]);
            }
        },
        'click .exportTable': function (e) {
            e.preventDefault();
            download('table.json', JSON.stringify(this.model, function (k, v) {
                return k === 'tape' || k === 'tapeActivePos' ? undefined : v;
            }, '\t'));
        },
        'click .exportTape': function (e) {
            e.preventDefault();
            download('tape.json', JSON.stringify({
                tapeActivePos: this.model.get('tapeActivePos'),
                tape: this.model.get('tape')
            }, null, '\t'));
        },
        'change .importTape': function (e) {
            var reader = new FileReader();

            reader.onload = () => {
                const input = reader.result;
                try {
                    const obj = JSON.parse(input);

                    if (!Array.isArray(obj.tape) ||
                        typeof obj.tapeActivePos !== 'number'
                    ) {
                        alert('Invalid json file');
                        return;
                    }

                    for (const symbol of obj.tape) {
                        if (this.model.get('alphabet').indexOf(symbol) === -1) {
                            alert('Input file contains invalid tape');
                            return;
                        }
                    }

                    if (obj.tapeActivePos < 0 ||
                        obj.tapeActivePos >= obj.tape.length) {
                        alert('Input file contains invalid tape active position');
                        return;
                    }

                    this.model.set({tape: obj.tape}, {silent: true});
                    this.model.set({tapeActivePos: obj.tapeActivePos});
                } catch (exception) {
                    alert('Invalid json file');
                }
            };

            if (e.target.files.length > 0) {
                reader.readAsText(e.target.files[0]);
            }
        }
    }
});

const CommandsView = Backbone.View.extend({
    tagName: 'table',
    className: 'table table-striped',
    id: 'commandsTable',

    initialize: function () {
        this.model.on('change:states change:alphabet change:commands',
            this.render, this);
        this.render();
    },

    template: _.template(template('transitionTable')),

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    events: {
        'focusout .command': function (e) {
            const $target = $(e.target);
            const $td = $($target.parent());
            const colNumber = $td.index();
            const rowNumber = $td.parent().index() + 1;

            const state = $('th:nth-child(' + (colNumber + 1) + ')')
                .text().trim();
            const symbol = this.$el
                .find('tr:eq(' + rowNumber + ') td:eq(0)').text().trim();

            const text = $target.val().replace(/\s+/g, '');
            if (text.length < 3) {
                alert('Invalid format of command');
                this.render();
                return;
            }

            const newSymbol = text[0];
            if (this.model.get('alphabet').indexOf(newSymbol) === -1) {
                alert(`Invalid symbol: ${newSymbol}`);
                this.render();
                return;
            }

            const newShift = text[1];
            if (['L', 'R', 'N'].indexOf(newShift) === -1) {
                alert(`Invalid shift direction: ${newShift}`);
                this.render();
                return;
            }

            const newState = text.slice(2);
            if (this.model.get('states').indexOf(newState) === -1) {
                alert(`Invalid state: ${newState}`);
                this.render();
                return;
            }

            this.model.get('commands')[symbol + state] = {
                symbolToPlace: newSymbol,
                nextState: newState,
                shift: newShift
            };
            this.model.trigger('change:commands');
        },
        'click .addState': function () {
            // Get state from user.
            let state = prompt('Enter state', '');
            if (state === null) {
                return;
            }
            if (state.length === 0) {
                alert('Invalid input');
                return;
            }

            state = state.trim();
            if (this.model.get('states').indexOf(state) !== -1) {
                alert('Not unique state');
                return;
            }

            // Add state to states.
            this.model.get('states').push(state);

            // Update view.
            this.render();
        },
        'click .addSymbol': function () {
            // Get symbol from user.
            let symbol = prompt('Enter symbol', '');
            if (symbol === null) {
                return;
            }
            if (symbol.length !== 1) {
                alert('Invalid input');
                return;
            }

            symbol = symbol.trim();
            if (this.model.get('alphabet').indexOf(symbol) !== -1) {
                alert('Not unique symbol');
                return;
            }

            // Add symbol to alphabet.
            this.model.get('alphabet').push(symbol);

            // Update view.
            this.render();
        },
        'click .removeState': function (e) {
            const colNumber = $($(e.target).parent()).index();

            // Get state.
            const state = $('th:nth-child(' + (colNumber + 1) + ')')
                .text().trim();

            // Remove all commands containing this state.
            this.model.get('alphabet').forEach((symbol) => {
                delete this.model.get('commands')[symbol + state];
            });

            // Remove state from states.
            const index = this.model.get('states').indexOf(state);
            this.model.get('states').splice(index, 1);

            // Update view.
            $('#commandsTable').find('tr')
                .find('td:eq(' + colNumber + '),th:eq(' + colNumber + ')')
                .remove();
        },
        'click .removeSymbol': function (e) {
            const rowNumber = $($(e.target).parent()).parent().index() + 1;

            // Get symbol.
            const symbol = this.$el
                .find('tr:eq(' + rowNumber + ') td:eq(0)').text().trim();

            // Remove all commands containing this symbol.
            this.model.get('states').forEach((state) => {
                delete this.model.get('commands')[symbol + state];
            });

            // Remove symbol from alphabet.
            const index = this.model.get('alphabet').indexOf(symbol);
            this.model.get('alphabet').splice(index, 1);

            // Update view.
            this.$el.find('tr:eq(' + rowNumber + ')').remove();
        }
    }
});

export {
    TuringMachine,
    CommandsView,
    BeginAndEndStatesView,
    TapeView,
    InfoView
};

'use strict';

import {
    TuringMachine,
    CommandsView,
    BeginAndEndStatesView,
    TapeView,
    InfoView
} from '../../lib/TuringMachine';

import $ from 'jquery';

window.$ = $;
window.jQuery = $;

$(() => {
    window.t = new TuringMachine({
        commands: {
            '1Q1': {
                symbolToPlace: '1',
                nextState: 'Q1',
                shift: 'R'
            },
            '0Q1': {
                symbolToPlace: '0',
                nextState: 'Q1',
                shift: 'R'
            },
            'EQ1': {
                symbolToPlace: 'E',
                nextState: 'Q2',
                shift: 'L'
            },
            '1Q2': {
                symbolToPlace: '0',
                nextState: 'Q2',
                shift: 'L'
            },
            '0Q2': {
                symbolToPlace: '1',
                nextState: 'Q3',
                shift: 'L'
            },
            'EQ2': {
                symbolToPlace: '1',
                nextState: 'STOP',
                shift: 'N'
            },
            '1Q3': {
                symbolToPlace: '1',
                nextState: 'Q3',
                shift: 'L'
            },
            '0Q3': {
                symbolToPlace: '0',
                nextState: 'Q3',
                shift: 'L'
            },
            'EQ3': {
                symbolToPlace: 'E',
                nextState: 'STOP',
                shift: 'R'
            }
        },
        states: [
            'Q1',
            'Q2',
            'Q3',
            'STOP'
        ],
        alphabet: [
            '0',
            '1',
            'E'
        ],
        beginState: 'Q1',
        endState: 'STOP',
        tapeActivePos: 7,
        tape: [
            'E',
            'E',
            'E',
            'E',
            'E',
            'E',
            'E',
            '1',
            '0',
            '1',
            '1',
            '1',
            'E',
            'E',
            'E',
            'E',
            'E',
            'E',
            'E',
            'E'
        ]
    });

    //// Case for infinity loop.
    //window.t = new TuringMachine({
    //    commands: {
    //        '1Q1': {
    //            symbolToPlace: '1',
    //            nextState: 'Q1',
    //            shift: 'R'
    //        },
    //        '0Q1': {
    //            symbolToPlace: '0',
    //            nextState: 'Q1',
    //            shift: 'L'
    //        }
    //    },
    //    states: [
    //        'Q1',
    //        'Q2',
    //        'STOP'
    //    ],
    //    alphabet: [
    //        '0',
    //        '1',
    //        'E'
    //    ],
    //    beginState: 'Q1',
    //    endState: 'STOP',
    //    tapeActivePos: 7,
    //    tape: [
    //        'E',
    //        'E',
    //        'E',
    //        'E',
    //        'E',
    //        'E',
    //        'E',
    //        '1',
    //        '0',
    //        '1',
    //        '1',
    //        '1',
    //        'E',
    //        'E',
    //        'E',
    //        'E',
    //        'E',
    //        'E',
    //        'E',
    //        'E'
    //    ]
    //});

    window.cv = new CommandsView({model: t});
    window.bsv = new BeginAndEndStatesView({model: t});
    window.tv = new TapeView({model: t});
    window.iv = new InfoView({model: t});
    $('#tapeWrapper').append(tv.el);
    $('.container-fluid').append(bsv.el).append(cv.el);
    //$('.import').bootstrapFileInput();
});

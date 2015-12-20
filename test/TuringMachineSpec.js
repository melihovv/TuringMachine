'use strict';

import {TuringMachine} from '../lib/TuringMachine';

/**
 * Sets comparison.
 * @param a Set.
 * @param b Another set.
 * @returns {boolean} Result of comparison.
 */
const setEql = (a, b) => {
    if (a.size !== b.size) {
        console.log(`size of 'a': ${a.size}`);
        console.log(`size of 'b': ${b.size}`);
        return false;
    }

    for (let p of a) {
        if (!b.has(p)) {
            console.log(`b doesn't have prop ${p}`);
            return false;
        }
    }

    return true;
};

describe('Turing machine', () => {
    it('must initialize its attrs', () => {
        const t = new TuringMachine();
        setEql(t.get('stateSet'), new Set()).must.be.truthy();
        setEql(t.get('alphabet'), new Set()).must.be.truthy();
        t.get('commands').must.eql([]);
        t.get('currentState').must.equal('');
        t.get('nextCommand').must.equal('');
        t.get('memoryTape').must.equal('');
    });

    describe('validation', () => {
        it('must validate commnads', () => {
            const t = new TuringMachine();
            t.set({commands: 'haha'}, {validate: true});
            t.get('commands').must.eql([]);
        });
    });
});

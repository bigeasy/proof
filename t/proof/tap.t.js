require('../..')(11, prove)

function prove (assert) {
    var tap = require('../../tap')
    assert(!tap.plan(''), 'no plan')
    assert(tap.plan('1..2'), { expected: 2 }, 'plan')
    assert(!tap.bailout(''), 'no bailout')
    assert(tap.bailout('Bail out!'), { message: null }, 'bailout')
    assert(tap.bailout('Bail out! Yoiks and away!'), { message: 'Yoiks and away!' }, 'bailout')
    assert(!tap.assertion(''), 'no assertion')
    assert(tap.assertion('ok 1'), {
        ok: true,
        message: null,
        comment: null,
        skip: false,
        todo: false
    },  'assertion no message')
    assert(tap.assertion('ok 1 okay'), {
        ok: true,
        message: 'okay',
        comment: null,
        skip: false,
        todo: false
    },  'assertion no comment')
    assert(tap.assertion('not ok 1 bad # very bad'), {
        ok: false,
        message: 'bad',
        comment: 'very bad',
        skip: false,
        todo: false
    },  'failed assertion message, comment')
    assert(tap.assertion('ok 12 skip # skip this'), {
        ok: true,
        message: 'skip',
        comment: 'this',
        skip: true,
        todo: false
    },  'skip assertion')
    assert(tap.assertion('ok 12 todo # todo this'), {
        ok: true,
        message: 'todo',
        comment: 'this',
        skip: false,
        todo: true
    },  'skip assertion')
}

#!/usr/bin/env node

require('../..')(10, function (assert) {
    var colorization = require('../../colorization')

    var options = { params: { monochrome: true } }
    var colors = colorization(options)

/*
    Uncomment and learn the different ways to invoke `assert`.

    assert(true, 'ok')              // boolean
    assert(false, 'not okay')       // failed boolean
    assert(1, 1, 'equal')           // equality
    assert(1, 2, 'equal')           // failed equality
    assert({ a: 1 }, { a: 2 }, 'deep equal') // failed deep equal, (equal is a deep equal).
*/

    assert(colorization(options), 'options true')
    assert(colors.red('test'), 'has monochrome red')
                           //  ^^^ what should `colors.red` return?
//    assert(colors.red('test'), 'argle-bargle', 'has monochrome red')
                             //  ^^^ does it return "argle-bargle"?
    assert(colors.green('test'), 'has monochrome green')
    assert(colors.blue('test'), 'has monochrome blue')
    assert(colors.gray('test'), 'has monochrome gray')

    options = { params: { monochrome: false } }
    colors = colorization(options)

    assert(colorization(options), 'options false')
    assert(colors.red('test'), 'has red')
    assert(colors.green('test'), 'has green')
    assert(colors.blue('test'), 'has blue')
    assert(colors.gray('test'), 'has gray')

})

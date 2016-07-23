#!/usr/bin/env node

require('../..')(8, function (assert) {
    var colorization = require('../../colorization')

    var colors = colorization({ monochrome: true })

    /*
    // Uncomment and learn the different ways to invoke `assert`.
    assert(true, 'ok')              // boolean
    assert(false, 'not okay')       // failed boolean
    assert(1, 1, 'equal')           // equality
    assert(1, 2, 'equal')           // failed equality
    assert({ a: 1 }, { a: 2 }, 'deep equal') // failed deep equal, (equal is a deep equal).
    */

    assert(colors.red('test'), 'test', 'equal')
    assert(colors.green('test'), 'test', 'equal')
    assert(colors.blue('test'),  'test', 'equal')
    assert(colors.gray('test'), 'test', 'equal')

    colors = colorization({ monochrome: false })
    assert(colors.red('test'), '\u001B[31mtest\u001B[0m', 'equal')
    assert(colors.green('test'), '\u001B[32mtest\u001B[0m', 'equal')
    assert(colors.blue('test'), '\u001B[34mtest\u001B[0m', 'equal')
    assert(colors.gray('test'), '\u001B[38;5;244mtest\u001B[0m', 'equal')
})

#!/usr/bin/env node

require('../..')(10, function (assert) {
    var colorization = require('../../colorization')

    var options = { params: { monochrome: true } }
    var colors = colorization(options)

    assert(colorization(options), 'options true')
    assert(colors.red('test'), 'has monochrome red')
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

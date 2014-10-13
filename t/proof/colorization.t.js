#!/usr/bin/env node

require('../..')(5, function (assert) {
    var colorization = require('../../colorization')

    var options = { params: { monochrome: true } }
    var colors = colorization(options)

    assert(colorization(options), 'options true')
    assert(colors.red('test'), 'has monochrome red')
    assert(colors.green('test'), 'has monochrome green')
    assert(colors.blue('test'), 'has monochrome blue')
    assert(colors.grey'test'), 'has monochrome grey')

})

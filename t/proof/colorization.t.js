#!/usr/bin/env node

require('../..')(3, function (assert) {
    var colorization = require('../../colorization')

    var options = { params: { monochrome: true } }
    var colors = colorization(options)

    assert(colorization(options), 'options true')
    assert(colors.red('test'), 'has monochrome red')
    // How come when these vvv tests are added to the program 
    // tcover does not return lcov-report?
    // assert(colors.green('test'), 'has monochrome green')
    // assert(colors.blue('test'), 'has monochrome blue')
    // assert(colors.grey'test'), 'has monochrome grey')

    options = { params: { monochrome: false } }
    colors = colorization(options)
    assert(colorization(options), 'options false')

})

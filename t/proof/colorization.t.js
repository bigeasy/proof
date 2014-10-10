#!/usr/bin/env node

require('../..')(2, function (assert) {
    var colorization = require('../../colorization')

    var options = { params: { monochrome: true } }
    var colors = colorization(options)

    //assert(options.params.monochrome == true, 'options.params.monochrome')
    assert(colorization(options), 'options true')
    assert(colors.red, 'has monochrome red')
    //assert(colorization(colors), 'has red')
    /*
    options = { params: { monochrome: false } }
    colors = colorization(options)
    assert(colorization(options), 'no options')
    assert(colors.red, 'has red')
    */

})

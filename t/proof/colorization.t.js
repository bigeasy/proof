#!/usr/bin/env node

require('../..')(1, function (assert) {
    var colorization = require('../../colorization')

    var options = { params: { monochrome: true } }
    var colors = colorization(options)

    //assert(options.params.monochrome == true, 'options.params.monochrome')
    assert(colorization(options), 'options true')
    assert(colors.red, 'has monochrome red')


})

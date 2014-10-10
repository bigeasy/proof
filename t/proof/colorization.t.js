#!/usr/bin/env node

require('../..')(1, function (assert) {
    var colorization = require('../../colorization')

    var options = { params: { monochrome: true } }
    var colors = colorization(options)

    assert(colorization(options), 'options true')


})

#!/usr/bin/env node

require('../..')(1, function (assert) {
    var colorization = require('../../colorization')

    var options = { params: { monochrome: true } }

    assert(options.params.monochrome == true, 'options.params.monochrome')

})

#!/usr/bin/env node

require('../..')(1, function (assert) {
    var colorization = require('../../colorization')
    assert(colorization, 'ok')
})

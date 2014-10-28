#!/usr/bin/env node

require('../..')(1, function (assert) {
    var count = require('../../count')
    var funcBuilder = require('../../funcBuilder')
    var arr = ["string"]

    var test = funcBuilder(count)
    assert(funcBuilder(count), 'ok')
})

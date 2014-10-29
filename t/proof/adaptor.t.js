#!/usr/bin/env node

require('../..')(1, function (assert) {
    var count = require('../../count')
    var adaptor = require('../../adaptor')
    var arr = ["string"]
    var string = '6\nstring\n'
    var test = adaptor(count)
    assert(test(arr), string, 'equal')
})

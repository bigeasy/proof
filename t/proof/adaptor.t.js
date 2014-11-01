#!/usr/bin/env node

require('../..')(2, function (assert) {
    var count = require('../../count')
    var adaptor = require('../../adaptor')
    var arg = "string"
    var string = '6\nstring\n'
    var test = adaptor(count)
    assert(test(arg), string, 'equal')
    assert(test(), '', 'equal')
})

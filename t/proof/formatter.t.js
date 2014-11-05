#!/usr/bin/env node

require('../..')(2, function (assert) {
    var count = require('../../count')
    var formatter = require('../../formatter')
    var arg = "string"
    var string = '6\nstring\n'
    var test = formatter(count)
    assert(test(arg), string, 'equal')
    assert(test(), '', 'equal')
})

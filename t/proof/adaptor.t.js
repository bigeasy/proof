#!/usr/bin/env node

require('../..')(3, function (assert) {
    var count = require('../../count')
    var adaptor = require('../../adaptor')
    var arg = "string"
    var string = '6\nstring\n'
    var empty = ''
    var test = adaptor(count)
    assert(test(arg), string, 'equal')
    assert(test(), '', 'equal')
    assert(test(empty), '\n', 'equal')
})

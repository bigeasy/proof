#!/usr/bin/env node

require('../..')(1, function (assert) {
    var count = require('../../count')
    var funcBuilder = require('../../funcBuilder')
    var arr = ["string"]
    var string = '6\nstring\n' // <- is an end line character desired after each string?
    var test = funcBuilder(count)
    assert(test(arr), string, 'equal') //<- what is my test?
})

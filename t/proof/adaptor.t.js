#!/usr/bin/env node

require('../..')(1, function (assert) {
    var count = require('../../count')
    var adaptor = require('../../adaptor')
    var arg = "string"
    var string = '6\nstring\n'
    var test = adaptor(count)
    console.log(count()) //<- []
    console.log(typeof(test())) // <- string
    test()
    assert(test(arg), string, 'equal')
    //assert(test(), '', 'equal')
})

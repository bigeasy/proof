#!/usr/bin/env node

require('../..')(3, function (assert) {
    var count = require('../../count')
    var adaptor = require('../../adaptor')
    var arg = "string"
    var string = '6\nstring\n'
    var empty = ''
    var test = adaptor(count)
    //console.log(count(empty)) // [ 0, '' ]
    //console.log(count(newline)) // [ 1, '\n' ]
    //console.log(test(empty)) // '0\n\n'
    assert(test(arg), string, 'equal')
    assert(test(), '', 'equal')
    assert(test(empty), '0\n\n', 'equal') // <- an empty string needs to return a newline
                                          //    No 0 and no additoinal newline
})

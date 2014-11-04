#!/usr/bin/env node

require('../..')(2, function (assert) {
    var printer = require('../../printer')
    var stream = require('stream')
    var test = new stream.PassThrough
    test.write('foo')
    function echo (string) { return string }
    var print = printer(echo)
    console.log(print(test.read().toString()))
    assert(typeof(printer), 'function', 'ok') 
    assert(print(test.read().toString()), 'foo', 'equal')

})

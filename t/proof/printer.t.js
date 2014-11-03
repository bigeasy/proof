#!/usr/bin/env node

require('../..')(1, function (assert) {
    var printer = require('../../printer')
    assert(typeof(printer), 'function', 'ok') 
})

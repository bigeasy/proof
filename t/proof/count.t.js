#!/usr/bin/env node

require('../..')(2, function (assert) {
    var count = require('../../count')
    var arr = "one"
    assert(count(arr), [ 3, 'one' ], 'add lengths')
    assert(count(), [], 'null value returns array')
})

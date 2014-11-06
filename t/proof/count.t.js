#!/usr/bin/env node

require('../..')(2, function (assert) {
    var count = require('../../count')
    var arr = "one"
    assert(count(arr), [ 3, '\n', 'one', '\n' ], 'adds length and newlines')
    assert(count(), [], 'null value returns array')
})

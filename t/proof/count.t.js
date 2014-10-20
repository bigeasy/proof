#!/usr/bin/env node

require('../..')(2, function (assert) {
    var count = require('../../count')
    var arr = [ "one", "two", "three" ]
    var arr2 = [ "one", "two", 3 ]
    assert(count(arr), [ 3, 'one', 3, 'two', 5, 'three' ], 'Add lengths')
    assert(count(arr2), e, 'tests a failure')
})

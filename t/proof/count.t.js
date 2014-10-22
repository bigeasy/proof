#!/usr/bin/env node

require('../..')(1, function (assert) {
    var count = require('../../count')
    var arr = [ "one", "two", "three" ]
    assert(count(arr), [ 3, 'one', 3, 'two', 5, 'three' ], 'Add lengths')
   
    /*
    var arr2 = [ "one", "two", 3 ]
    try { 
    assert.throws(!count(arr2) , e , 'throws an exception')
    } catch (e) { console.log(e) }
    */
})

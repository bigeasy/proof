#!/usr/bin/env node

require('../..')(1, function (assert) {
    var count = require('../../count')
    var arr = [ "one", "two", "three" ]
    assert(count(arr), [ 3, 'one', 3, 'two', 5, 'three' ], 'Add lengths')
   
    var arr2 = [ "one", "two", 3 ]

    // When working with assert, how do I position try/catch so it both catches the error
    // and allows assert to eveluate? 
    try { 
    // How does the throws method work? It isn't catching exceptions.   
        assert/*.throws*/(count(arr2), e, 'throws an exception')
    } catch (e) {
        console.log(e)
    }
    // MY LOGIC: 
    // With the exception being thrown from count, and the catch being placed after the test,
    // the stack starts to unwind before the evaluation of assert. This error must be caught
    // before the the assertion test evaluates, otherwise the test will continue to fail.
    //
    // FAILED ATTEMPTS: 
    //  - Place try/catch around assert. 
    //  - Place try/catch within assert so it tries count and catches before the evaluation.
    //  - Assign the try/ catch block to a variable. 
    //  - Use the the throws method.
    //  - Try multiple expected values like: e / Error / [Error: Array element not a string.]
})

#!/usr/bin/env node

require('../..')(5, function (assert) {
    var json = require('../../json')
    var stream = require('stream')

    var chunks = []
    
    // This function generates the expected array from `json` function based on the arguments used 
    // below in the `output` functions.
    function testmaker (test) {
        var arr = [ '{\n  "t/foo.t.js": {',
                     '\n    "time": 0,\n    "expected": 3,',
                     '\n    "tests": [', '\n      {\n        "message": "message",',
                     '\n        "time": 1,','\n        "passed": true,',
                     '\n        "skip": false,',
                     '\n        "todo": true,\n        "comment": "fix"',
                     '\n      }\n    ],\n    "actual": 1,\n    "duration": 2,\n    "code": 0\n  }\n}'
                  ].join('')
        test = [ arr ]
        test.push('\n')
        return test
    }

    var test = testmaker(test)


    var output = json()

    chunks = output({
                 type: 'run',
                 file: 't/foo.t.js',
                 time: 0,
                 expected: 3
             })

    assert(chunks, [], 'empty array')

    chunks = output({
                 type: 'plan',
                 file: 't/foo.t.js',
                 expected: 3
             })

    assert(chunks, [], 'empty array')

    chunks = output({
                 type: 'test',
                 file: 't/foo.t.js',
                 message: 'message',
                 time: 1,
                 passed: true,
                 skip: false,
                 todo: true,
                 comment: 'fix'
             })

    assert(chunks, [], 'empty array')

    chunks = output({
                 type: 'exit', // <- this type makes a call to extend.
                 file: 't/foo.t.js',
                 actual: 1,
                 start: 0,
                 time: 2,
                 code: 0
             })

    assert(chunks, [], 'empty array')

    chunks = output({
                 type: 'eof'
             })

    assert(chunks, test, 'arrays equal')
})

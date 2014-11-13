#!/usr/bin/env node

require('../..')(5, function (assert) {
    //var proof = require('../../proof')
    var json = require('../../json')
    var stream = require('stream')
    var out = new stream.PassThrough // <- may we take out the stream?

    var chunks = []
    // this is gross, how do I deal with it?
    var arr = [ '{\n  "t/foo.t.js": {',
                 '\n    "time": 0,\n    "expected": 3,',
                 '\n    "tests": [', '\n      {\n        "message": "message",',
                 '\n        "time": 1,','\n        "passed": true,',
                 '\n        "skip": false,',
                 '\n        "todo": true,\n        "comment": "fix"',
                 '\n      }\n    ],\n    "actual": 1,\n    "duration": 2,\n    "code": 0\n  }\n}'
              ].join('')
    
    var test = [ arr ]
    test.push('\n')

   // may we take this vvv out as well? 
    out.on('data', function (chunk) { chunks.push(chunk.toString()) })

    var output = json(out)// <-json encapsulates an object in its own scope that interacts with the
                          //   enclosed stream that is in this scope but passed into the function
                          //   as an argument.

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

    assert(chunks, test, 'equal')

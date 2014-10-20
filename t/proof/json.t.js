#!/usr/bin/env node

require('../..')(1, function (assert) {
    var proof = require('../../proof')
    var json = require('../../json')
    var stream = require('stream')
    var out = new stream.PassThrough
    var chunks = []
    out.on('data', function (chunk) { chunks.push(chunk.toString()) })
    var output = json(out)
    output({
        type: 'run',
        file: 't/foo.t.js',
        time: 0,
        expected: 3
    })
    output({
        type: 'plan',
        file: 't/foo.t.js',
        expected: 3
    })
    output({
        type: 'test',
        file: 't/foo.t.js',
        message: 'message',
        time: 1,
        passed: true,
        skip: false,
        todo: true,
        comment: 'fix'
    })
    output({
        type: 'exit',
        file: 't/foo.t.js',
        actual: 1,
        start: 0,
        time: 2,
        code: 0
    })
    output({
        type: 'eof'
    })
    assert(JSON.parse(chunks.join('')), {
      "t/foo.t.js": {
        "time": 0,
        "expected": 3,
        "tests": [
          {
            "message": "message",
            "time": 1,
            "passed": true,
            "skip": false,
            "todo": true,
            "comment": "fix"
          }
        ],
        "actual": 1,
        "duration": 2,
        "code": 0
      }
    }, 'json')
})

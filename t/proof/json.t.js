#!/usr/bin/env node

require('../..')(1, function (assert) {
    //var proof = require('../../proof')
    var json = require('../../json')
    var stream = require('stream')
    var out = new stream.PassThrough
    // ^^^ what is a Passthrough? 
    // FROM JOYANT: "This is a trivial implementation of a Transform stream
    // that simply passes the input bytes across to the output. Its purpose is mainly for
    // examples and testing, but there are occasionally use cases where it can come in 
    // handy as a building block for novel sorts of streams."

    var chunks = []
                    // vvv Anonymous function that takes an array
    out.on('data', function (chunk) { chunks.push(chunk.toString()) })

    var output = json(out)// <-json encapsulates an object in its own scope that interacts with the
                          //   enclosed stream that is in this scope but passed into the function
                          //   as an argument.

// There are five calls to output. One call for each type. These calls to output 
// are routed to different branches becuase of the switch in the json function. 
// (1)  
    output({
        type: 'run',
        file: 't/foo.t.js',
        time: 0,
        expected: 3
    })

//    console.log(chunks) // <- []
// (2)
    output({
        type: 'plan',
        file: 't/foo.t.js',
        expected: 3
    })

//    console.log(chunks) //<- empty array
// (3)
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

//    console.log(chunks) //<- empty array
// (4)
    output({
        type: 'exit', // <- this type makes a call to extend.
        file: 't/foo.t.js',
        actual: 1,
        start: 0,
        time: 2,
        code: 0
    })

//    console.log(chunks) //<- empty array
// (5)
    output({
        type: 'eof' // <- this is the branch of json that needs to change. look at parse.
                    //    this is also where chunks is filled
    })
/*
    console.log(out.on) // <- [Function]
    console.log(output) // <- [Function: addListener]
    console.log('\n')
    console.log(typeof(chunks)) // <- object
    console.log(Array.isArray(chunks)) //<- true
    console.log('\n')
    console.log(chunks)
    console.log('\n')
    console.log("chunks.join")
    console.log(chunks.join(''))
    console.log('\n')
    console.log(JSON.parse(chunks.join('')))
    console.log('\n')
    console.log(JSON.stringify(chunks.join('')))
    console.log('\n')
*/
    // vvv this test needs to change when the json function is changed.
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

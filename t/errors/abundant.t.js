var abundant = '\
\n\
> ✘ t/executable/abundant: expected 2 tests but got 3: exited with code 0\n\
\n\
'
var prove = require('cadence')(function (async, assert) {
    var fs = require('fs')
    var path = require('path')
    var stream = require('stream')
    var stdin = new stream.PassThrough
    var stdout = new stream.PassThrough
    var text = fs.readFileSync(path.join(__dirname, 'fixtures/abundant.txt'), 'utf8')
    var proof = require('../../proof.bin.js')
    process.exit = function (code) {}
    async(function () {
        proof({}, [ 'errors', '-M' ], { stdin: stdin, stdout: stdout }, async())
        stdin.write(text)
        stdin.end()
    }, function (code, signal) {
        assert(stdout.read().toString(), abundant, 'abundant')
        assert(code, 1, 'abundant exit')
    })
})

require('../..')(2, prove)

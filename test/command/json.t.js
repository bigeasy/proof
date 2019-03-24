var cadence = require('cadence')

var prove = cadence(function (async, assert) {
    var proof = require('../../proof.bin.js')
    var fs = require('fs')
    var path = require('path')
    var stream = require('stream')
    var stdin = new stream.PassThrough
    var stdout = new stream.PassThrough
    var input = fs.readFileSync(path.join(__dirname, 'fixtures', 'success.in.txt'), 'utf8')
    var output = fs.readFileSync(path.join(__dirname, 'fixtures', 'success.json.out.txt'), 'utf8')
    async(function () {
        async(function () {
            proof([ 'json' ], { $stdin: stdin, $stdout: stdout, $trap: false }, async())
            stdin.write(input)
            stdin.end()
        }, function (child) {
            child.exit(async())
        })
    }, function (code) {
        assert(stdout.read().toString(), output.toString(), 'success')
        assert(code, 0, 'success exit')
    })
})

require('../..')(2, prove)

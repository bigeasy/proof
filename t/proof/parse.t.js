var cadence = require('cadence')

var prove = cadence(function (async, assert) {
    var parse = require('../../parse')
    var fs = require('fs')
    var path = require('path')
    var stream = require('stream')
    var stderr

    async(function () {
        var input = fs.readFileSync(path.join(__dirname, 'fixtures', 'type.in.txt'), 'utf8')
        var stdin = new stream.PassThrough
        stderr = new stream.PassThrough
        parse({ stdin: stdin, stderr: stderr }, function () {}, async())
        stdin.write(input)
        stdin.end()
    }, function () {
        assert(stderr.read().toString(),
            'error: cannot parse runner output at line 3: unknown line type oops\n', 'unknown type')
        var input = fs.readFileSync(path.join(__dirname, 'fixtures', 'exit.in.txt'), 'utf8')
        var stdin = new stream.PassThrough
        stderr = new stream.PassThrough
        parse({ stdin: stdin, stderr: stderr }, function () {}, async())
        stdin.write(input)
        stdin.end()
    }, function () {
        assert(stderr.read().toString(),
            'error: cannot parse runner test exit code at line 4: exit code -\n', 'bad exit code')
    })
})

require('../..')(2, prove)

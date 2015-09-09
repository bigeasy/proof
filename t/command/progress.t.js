var cadence = require('cadence')

var prove = cadence(function (async, assert) {
    var proof = require('../../proof.bin.js')
    var fs = require('fs')
    var path = require('path')
    var stream = require('stream')
    var test = cadence(function (async, name, stdout) {
        stdout || (stdout = new stream.PassThrough)
        var stdin = new stream.PassThrough
        var input = fs.readFileSync(path.join(__dirname, 'fixtures', name + '.in.txt'), 'utf8')
        var output = fs.readFileSync(path.join(__dirname, 'fixtures', name + '.progress.out.txt'), 'utf8')
        async(function () {
            proof({ env: {} }, [ 'progress', '-t', '-M' ], { stdin: stdin, stdout: stdout }, async())
            stdin.write(input)
            stdin.end()
        }, function (code) {
            assert(stdout.read().toString().replace(/\d{3}/g, 'XXX'), JSON.parse(output), name)
            assert(code, 0, name + ' exit')
        })
    })
    test('success', async())
})

require('../..')(2, prove)

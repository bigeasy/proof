var cadence = require('cadence')

var prove = cadence(function (async, assert) {
    var proof = require('../../proof.bin.js')
    var fs = require('fs')
    var path = require('path')
    var stream = require('stream')
    var test = cadence(function (async, name, exit, argv, stdout) {
        stdout || (stdout = new stream.PassThrough)
        var stdin = new stream.PassThrough
        var input = fs.readFileSync(path.join(__dirname, 'fixtures', name + '.in.txt'), 'utf8')
        var output = fs.readFileSync(path.join(__dirname, 'fixtures', name + '.progress.out.txt'), 'utf8')
        async(function () {
            proof({ env: {} }, [ 'progress', '-t', '-M' ].concat(argv || []), { stdin: stdin, stdout: stdout }, async())
            stdin.write(input)
            stdin.end()
        }, function (code) {
            assert(stdout.read().toString(), JSON.parse(output), name)
            assert(code, exit, name + ' exit')
        })
    })
    async(function () {
        test('success', 0, async())
    }, function () {
        test('narrow', 0, [ '--digits', '1' ], async())
    }, function () {
        test('wide', 0, [ '--digits', '11' ], async())
    }, function () {
        test('bailout', 1, async())
    })
})

require('../..')(8, prove)

var cadence = require('cadence')

var prove = cadence(function (async, assert) {
    var proof = require('../../proof.bin.js')
    var fs = require('fs')
    var path = require('path')
    var stream = require('stream')
    var test = cadence(function (async, name, exit, argv, stdout) {
        stdout || (stdout = new stream.PassThrough)
        var stdin = new stream.PassThrough
        var stderr = new stream.PassThrough
        var input = fs.readFileSync(path.join(__dirname, 'fixtures', name + '.in.txt'), 'utf8')
        var output = fs.readFileSync(path.join(__dirname, 'fixtures', name + '.progress.out.txt'), 'utf8')
        async(function () {
            async(function () {
                proof([ 'progress', '-w76', '-t', '-M' ].concat(argv || []), {
                    $stdin: stdin,
                    $stdout: stdout,
                    $stderr: stderr,
                    $trap: false,
                    env: {}
                }, async())
                stdin.write(input)
                stdin.end()
            }, function (child) {
                child.exit(async())
            })
        }, function (code) {
            assert(stdout.read().toString(), JSON.parse(output), name)
            assert(code, exit, name + ' exit')
            return [ stderr ]
        })
    })
    async(function () {
        test('success', 0, async())
    }, function () {
        test('narrow', 0, [ '--digits', '1' ], async())
    }, function () {
        test('wide', 0, [ '--digits', '11' ], async())
    }, function () {
        test('time', 0, async())
    }, function () {
        test('after', 0, async())
    }, function () {
        test('abundant', 1, async())
    }, function () {
        test('failures', 1, async())
    }, function () {
        test('exit', 1, async())
    }, function () {
        test('signal', 1, async())
    }, function () {
        test('planless', 1, async())
    }, function () {
        test('overwrite', 1, async())
    }, function (stderr) {
        assert(stderr.read().toString(), 'error: cannot parse runner output at line 4: invalid syntax\n', 'overwrite stderr')
        test('error', 1, async())
    }, function (stderr) {
        assert(stderr.read().toString(), 'error: cannot parse runner output at line 5: invalid syntax\n', 'error stderr')
        test('parallel', 1, async())
    }, function () {
        test('bailout', 1, async())
    })
})

require('../..')(30, prove)

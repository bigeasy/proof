var cadence = require('cadence')

var prove = cadence(function (async, assert) {
    var proof = require('../../proof.bin.js')
    var fs = require('fs')
    var path = require('path')
    var stream = require('stream')
    var test = cadence(function (async, name, qualifier, exit, argv) {
        var stdin = new stream.PassThrough
        var stderr = new stream.PassThrough
        var stdout = new stream.PassThrough
        var output = fs.readFileSync(path.join(__dirname, 'fixtures', name + '.' + qualifier + '.out.txt'), 'utf8')
        async(function () {
            proof([ 'run' ].concat(argv || []).concat('test/command/fixtures/' + name), { stdout: stdout, stderr: stderr }, async())
        }, function (code) {
            assert(stdout.read().toString().replace(/^\d+/gm, 'x'), output.replace(/^\d+/gm, 'x'), name)
            assert(code, exit, name + ' exit')
            return [ stderr ]
        })
    })
    async([function () {
        proof([ 'run', 'space separated' ], {}, async())
    }, function (error) {
        assert(error.stderr, 'error: program names cannot contain spaces: space separated', 'spaces')
    }], [function () {
        proof([ 'run', 'test/command/fixtures/success', 'test/command/fixtures/success' ], {}, async())
    }, function (error) {
        assert(error.stderr, 'error: a program must only run once in a test run: test/command/fixtures/success', 'duplicates')
    }], function () {
        var stdout = new stream.PassThrough
        async(function () {
            proof([ 'run', 'test/command/fixtures/parallel/*.js' ], {
                stdout: stdout
            }, async())
        }, function () {
            var types = stdout.read().toString().split('\n').slice(0, 2).map(function (line) {
                return line.split(' ')[1]
            })
            assert(types, [ 'run', 'run' ], 'parallel')
        })
    }, function () {
        test('success', 'run', 0, [ '-p', 1 ], async())
    }, function () {
        test('output', 'run', 0, async())
    }, function () {
        test('bailout', 'run', 0, async())
    }, function () {
        test('signal', 'run', 0, async())
    }, function () {
        var prefix = /^v0\.10\./.test(process.version) ? 'run.0.10' : 'run'
        test('timeout', prefix, 0, [ '-t', 1 ], async())
    })
})

require('../..')(13, prove)

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
            proof({ env: {} }, [ 'run' ].concat(argv || []).concat('t/command/fixtures/' + name), { stdout: stdout, stderr: stderr }, async())
        }, function (code) {
            assert(stdout.read().toString().replace(/^\d+/gm, 'x'), output.replace(/^\d+/gm, 'x'), name)
            assert(code, exit, name + ' exit')
            return [ stderr ]
        })
    })
    async([function () {
        proof({ env: {} }, [ 'run', 'space separated' ], {}, async())
    }, function (error) {
        assert(error.stderr, 'error: program names cannot contain spaces: space separated', 'spaces')
    }], [function () {
        proof({ env: {} }, [ 'run', 't/command/fixtures/success', 't/command/fixtures/success' ], {}, async())
    }, function (error) {
        assert(error.stderr, 'error: a program must only run once in a test run: t/command/fixtures/success', 'spaces')
    }], function () {
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

require('../..')(12, prove)

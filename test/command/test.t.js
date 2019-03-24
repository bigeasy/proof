var output = '\
\n\
 ✓ test/command/fixtures/ok ............................ (1/1) 0.XXX Success\n\
                                  tests (1/1) assertions (1/1) 0.XXX Success\n\
\n'
var cadence = require('cadence')

var prove = cadence(function (async, assert) {
    var stream = require('stream')
    var proof = require('../../proof.bin.js')
    var stdout = new stream.PassThrough
    var stdin = new stream.PassThrough
    var stderr = new stream.PassThrough
    async(function () {
        proof([ 'test', '-p', '1', '-M', 'test/command/fixtures/ok' ], {
            $stdin: stdin,
            $stderr: stderr,
            $stdout: stdout,
            $trap: false
        }, async())
    }, function (child) {
        async(function () {
            child.exit(async())
        }, function (code) {
            assert(stderr.read(), null, 'stderr')
            assert(stdout.read().toString().replace(/\d{3}/g, 'XXX'), output, 'stdout')
            assert(code, 0, 'ran')
        })
    }, [function () {
        proof([ 'test', '-h' ], {}, async())
    }, function (error) {
        assert(/^bigeasy.arguable#abend/m.test(error.message), 'help')
    }])
})

require('../..')(4, prove)

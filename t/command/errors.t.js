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
        var output = fs.readFileSync(path.join(__dirname, 'fixtures', name + '.errors.out.txt'), 'utf8')
        async(function () {
            proof([ 'errors', '-M' ], { stdin: stdin, stdout: stdout }, async())
            stdin.write(input)
            stdin.end()
        }, function (code) {
            assert(stdout.read().toString(), output, name)
            assert(code, 1, name + ' exit')
        })
    })
    async(function () {
        test('abundant', async())
    }, function () {
        test('missing', async())
    }, function () {
        test('bailout', async())
    }, function () {
        test('planless', async())
    }, function () {
        test('exit', async())
    }, function () {
        test('failures', async())
    }, function () {
        var stdin = new stream.PassThrough
        var stdout = new stream.PassThrough
        var input = fs.readFileSync(path.join(__dirname, 'fixtures', 'success.in.txt'), 'utf8')
        async(function () {
            proof([ 'errors', '-M' ], { stdin: stdin, stdout: stdout }, async())
            stdin.write(input)
            stdin.end()
        }, function (code) {
            assert(stdout.read(), null, 'success')
            assert(code, 0, 'success exit')
        })
    })
})

require('../..')(14, prove)

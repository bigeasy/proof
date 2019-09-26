require('../..')(1, async (okay) => {
    const proof = require('../../proof.bin.js')
    const fs = require('fs').promises
    const path = require('path')
    const stream = require('stream')

    async function test (name, stderr = new stream.PassThrough) {
        const stdin = new stream.PassThrough
        const input = await fs.readFile(path.resolve(__dirname, 'fixtures', name + '.in.jsons'), 'utf8')
        const jsons = input.split('\n').filter(line => line).map(JSON.parse)
        const output = await fs.readFile(path.resolve(__dirname, 'fixtures', name + '.errors.out.txt'), 'utf8')

        // TODO Does ar
        const child = proof({ monochrome: true, stdin: true, errors: true, progress: false }, { $stdin: stdin, $stderr: stderr })
        await new Promise(resolve => setImmediate(resolve))
        child.options.$stdin.end(input)
        await child.promise
        okay(stderr.read().toString(), output, name)
        console.log('passed?')
    }

    await test('abundant')
})

return

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
            async(function () {
                proof([ 'errors', '-M' ], {
                    $stdin: stdin, $stdout: stdout, $trap: false
                }, async())
                stdin.write(input)
                stdin.end()
            }, function (child) {
                child.exit(async())
            })
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
            async(function () {
                proof([ 'errors', '-M' ], { $stdin: stdin, $stdout: stdout, $trap: false }, async())
                stdin.write(input)
                stdin.end()
            }, function (child) {
                child.exit(async())
            })
        }, function (code) {
            assert(stdout.read(), null, 'success')
            assert(code, 0, 'success exit')
        })
    })
})

require('../..')(14, prove)

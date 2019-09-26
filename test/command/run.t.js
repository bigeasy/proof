require('../..')(1, async (okay) => {
    const assert = require('assert')
    const proof = require('../../proof.bin.js')
    const stream = require('stream')
    const fs = require('fs').promises
    const path = require('path')
    const counts = {}
    function revert (line) {
        if (line == '') {
            return line
        }
        const json = JSON.parse(line)
        if (!(json.file in counts)) {
            counts[json.file] = 1
        }
        switch (json.type) {
        case 'run':
            return `run  ${json.file}`
            break
        case 'plan':
            return `plan ${json.file} ${json.message}`
            break
        case 'test':
            console.log(json.message)
            let string = `test ${json.file} ${json.message.ok ? 'ok' : 'not ok'} ${counts[json.file]++}`
            if (json.message.message != null) {
                string += ` ${json.message.message}`
            }
            return string
        case 'out':
            return `out  ${json.file} ${json.message}`
            break
        case 'err':
            return `err  ${json.file} ${json.message}`
            break
        case 'exit':
            return `exit ${json.file} ${json.message[0]} ${json.message[1]}`
            break
        case 'eof':
            return 'eof  *'
            break
        }
    }
    async function test (name, qualifier, exit, argv = []) {
        const stdin = new stream.PassThrough
        const stdout = new stream.PassThrough
        const stderr = new stream.PassThrough
        const input = path.join(__dirname, 'fixtures', name + '.' + qualifier + '.out.txt')
        const expected = (await fs.readFile(input, 'utf8')).replace(/^\d+ /mg, '')

        // TODO Does ar
        const child = proof([
            { stdout: true, progress: false },
            argv, path.join('test', 'command', 'fixtures', name)
        ], { $stdin: stdin, $stdout: stdout, $stderr: stderr })

        await child.promise

        const actual = stdout.read().toString()
                             .split('\n')
                             .map(revert)
                             .join('\n')
        console.log(actual)
        okay(actual.split('\n'), expected.split('\n'), name)

        return [ stderr ]
    }
    await test('output', 'run', 0)
})
return
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
            proof([ 'run' ].concat(argv || []).concat('test/command/fixtures/' + name), {
                $stdout: stdout, $stderr: stderr, $trap: false
            }, async())
        }, function (child) {
            child.exit(async())
        }, function (code) {
            assert(stdout.read().toString().replace(/^\d+/gm, 'x'), output.replace(/^\d+/gm, 'x'), name)
            assert(code, exit, name + ' exit')
            return [ stderr ]
        })
    })
    async([function () {
        async(function () {
            proof([ 'run', 'space separated' ], { $trap: false }, async())
        }, function (child) {
            child.exit(async())
        })
    }, function (error) {
        assert(error.stderr, 'error: program names cannot contain spaces: space separated', 'spaces')
    }], [function () {
        async(function () {
            proof([ 'run', 'test/command/fixtures/success', 'test/command/fixtures/success' ], { $trap: false }, async())
        }, function (child) {
            child.exit(async())
        })
    }, function (error) {
        assert(error.stderr, 'error: a program must only run once in a test run: test/command/fixtures/success', 'duplicates')
    }], function () {
        var stdout = new stream.PassThrough
        async(function () {
            async(function () {
                proof([ 'run', 'test/command/fixtures/parallel/*.js' ], {
                    $stdout: stdout,
                    $trap: false
                }, async())
            }, function (child) {
                child.exit(async())
            })
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

require('../..')(5, async (okay) => {
    const assert = require('assert')
    const proof = require('../../proof.bin.js')
    const stream = require('stream')
    const fs = require('fs').promises
    const path = require('path')
    let counts = {}
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
        case 'bail':
            return `bail ${json.file} Bail out! ${json.message.message}`
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
        okay(actual.split('\n'), expected.split('\n'), name)

        return [ stderr ]
    }
    await test('success', 'run', 0, [ '-p', 1 ])
    await test('output', 'run', 0)
    await test('bailout', 'run', 0)
    await test('signal', 'run', 0)
    await test('timeout', 'run', 0, [ '-t', 250 ])
})

require('../..')(6, async (okay) => {
    const proof = require('../../proof.bin.js')
    const fs = require('fs').promises
    const path = require('path')
    const stream = require('stream')
    const jsonify = require('./jsonify')

    async function test (name, stderr = new stream.PassThrough) {
        const stdin = new stream.PassThrough
        const input = await fs.readFile(path.resolve(__dirname, 'fixtures', name + '.in.txt'), 'utf8')
        const output = await fs.readFile(path.resolve(__dirname, 'fixtures', name + '.errors.out.txt'), 'utf8')

        const child = proof({ monochrome: true, stdin: true, errors: true, progress: false }, { $stdin: stdin, $stderr: stderr })
        await new Promise(resolve => setImmediate(resolve))
        child.options.$stdin.end(input.split('\n').map(jsonify).join('\n'))
        await child.promise
        okay(stderr.read().toString().split('\n'), output.split('\n'), name)
    }

    await test('abundant')
    await test('missing')
    await test('bailout')
    await test('planless')
    await test('exit')
    await test('failures')
    return
})

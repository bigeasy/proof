require('../..')(11, async (okay) => {
    const proof = require('../../proof.bin.js')
    const fs = require('fs').promises
    const path = require('path')
    const stream = require('stream')
    const jsonify = require('./jsonify')

    async function test (name, exit, argv, stderr = new stream.PassThrough) {
        const stdin = new stream.PassThrough
        const input = await fs.readFile(path.resolve(__dirname, 'fixtures', name + '.in.txt'), 'utf8')
        const output = await fs.readFile(path.resolve(__dirname, 'fixtures', `${name}.progress.out.txt`), 'utf8')

        const child = proof({ tty: true, monochrome: true, stdin: true }, { $stdin: stdin, $stderr: stderr, env: {} })
        await new Promise(resolve => setImmediate(resolve))
        child.options.$stdin.end(input.split('\n').map(jsonify).join('\n'))
        await child.promise
        okay(stderr.read().toString().split(/\n|\u001b/), JSON.parse(output).split(/\n|\u001b/), name)
    }

    await test('success', 0)
    await test('narrow', 0, [ '--digits', '1' ])
    await test('time', 0)
    await test('after', 0)
    await test('abundant', 1)
    await test('failures', 1)
    await test('exit', 1)
    await test('signal', 1)
    await test('planless', 1)
    await test('parallel', 1)
    await test('bailout', 1)
})

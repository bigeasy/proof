const path = require('path')
const fs = require('fs').promises
const coalesce = require('extant')
const children = require('child_process')
const once = require('prospective/once')
const tap = require('./tap')
const kill = require('./kill')
const Fracture = require('fracture')
const Readline = require('readline')

exports.run = async function (destructible, arguable, queue) {
    const params = arguable.ultimate

    if (!params.processes) params.processes = 1

    const programs = arguable.argv.map(program => {
        const file = path.resolve(program)
        const directory = path.dirname(file)
        return { directory, file, program }
    })

    destructible.increment(programs.length)

    const fracture = new Fracture(destructible, {
        turnstiles: coalesce(params.processes, 1),
        extractor: body => body.directory
    })

    const executable = require('./executable')
    async function run (value, state) {
        const stat = await fs.stat(value.program)
        const argv = executable(process, await fs.stat(value.program))
                   ? [ value.program ]
                   : [ 'node', value.program ]
        const child = children.spawn(argv.shift(), argv, { detached: true })
        let bailed = false, planned = false, plan
        const name = value.program
        let timer = null
        function shutdown () {
            timer = null
            // **TODO** Raise an exception if this doesn't do it.
            process.kill(child.pid, 'SIGTERM')
        }

        function emit (method, message = null) {
            if (timer) {
                clearTimeout(timer)
            }
            timer = setTimeout(shutdown, coalesce(params.timeout, 5000))
            queue.push({ time: Date.now(), file: name, type: method, message })
        }

        emit('run')

        const err =  Readline.createInterface({ input: child.stderr })
        err.on('line', function (buffer) {
            emit('err', buffer.toString())
        })

        const out =  Readline.createInterface({ input: child.stdout })
        out.on('line', function (buffer) {
            const line = buffer.toString()
            let message
            if (bailed) {
                emit('out', line)
            } else if (message = tap.assertion(line)) {
                emit('test', { ...message })
            } else if (!planned && (plan = tap.plan(line))) {
                planned = true
                emit('plan', plan.expected)
            } else if (message = tap.bailout(line)) {
                bailed = true
                emit('bail', message)
            } else {
                emit('out', line)
            }
        })

        emit('exit', await once(child, 'close').promise)
        clearTimeout(timer)
        destructible.decrement()
    }

    for (const program of programs) {
        fracture.enter(run, program)
    }

    await destructible.promise

    queue.push({ time: Date.now(), type: 'eof', message: null })
}

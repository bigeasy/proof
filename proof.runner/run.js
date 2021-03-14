const path = require('path')
const fs = require('fs').promises
const { coalesce } = require('extant')
const children = require('child_process')
const once = require('eject')
const tap = require('./tap')
const kill = require('./kill')
const Turnstile = require('turnstile')
const Fracture = require('fracture')
const Readline = require('readline')

exports.run = async function (destructible, arguable, queue) {
        const params = arguable.ultimate
        const switches = arguable.arrayed.node

        if (!params.processes) params.processes = 1

        const programs = arguable.argv.map(program => {
            const file = path.resolve(program)
            const directory = path.dirname(file)
            return { directory, file, program }
        })

        const executable = require('./executable')
        async function run ({ value }) {
            for (const program of value) {
                const stat = await fs.stat(program.program)
                const argv = executable(process, await fs.stat(program.program))
                           ? [ program.program ]
                           : [ 'node' ].concat(switches, program.program)
                const child = children.spawn(argv.shift(), argv, { detached: true })
                let bailed = false, planned = false, plan
                const name = program.program
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
            }
        }

        const turnstile = new Turnstile(destructible.durable('turnstile'), { strands: coalesce(params.processes, 1) })
        const fracture = new Fracture(destructible.durable('fracture'), {
            turnstile: turnstile,
            value: () => [],
            worker: run
        })

        const stack = Fracture.stack(), promises = new Set
        for (const program of programs) {
            promises.add(fracture.enqueue(stack, program.directory, value => value.push(program)))
        }

        for (const promise of promises) {
            await promise
        }


        queue.push({ time: Date.now(), type: 'eof', message: null })
        destructible.destroy()
}

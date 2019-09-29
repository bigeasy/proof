#!/usr/bin/env node

/*
___ usage ___ en_US ___
usage: proof run [options] [<test>...]

  Run test programs and emit unified runner output.

options:

    -h,   --help                  display this usage information
    -p,   --processes <count>     number of processes to run
    -T,   --tty
    -t,   --timeout <count>       when to stop waiting for process output,
                                  default 30 seconds
    -e,   --errors                report errors
    -i,   --stdin                 read from standard in
    -P,   --progress              display progress default true
    -m,   --monochrome
    -o,   --stdout

invocation:

  Runs zero or more tests emitting unified test output.

  `proof run` exits successfully, with an exit code of zero, regardless
  of test failures or abnormal exits.

description:

  The `proof run` runs zero or more test programs, gathering their
  output and emitting unified test output to STDOUT. It does not perform
  an error reporting itself.

  The test programs must emit valid Perl Test::Harness output.

  The output can be saved to file or piped back into proof with one of
  the other proof commands to report progress or emit alternate formats.

___ $ ___ en_US ___

  spaces:
    error: program names cannot contain spaces: %s

  once:
    error: a program must only run once in a test run: %s

___ . ___

*/
require('arguable')(module, {
    env: process.env,
    $trap: false
}, async arguable => {
    arguable.helpIf(arguable.ultimate.help)
    const coalesce = require('extant')
    const Destructible = require('destructible')
    const destructible = new Destructible('proof.bin')
    const run = require('./run').run
    const events = require('events')
    const ee = new events.EventEmitter
    const state = { code: 0 }
    const runners = []
    if (coalesce(arguable.ultimate.progress, true)) {
        runners.push(require('./progress')(arguable, state, arguable.stderr))
    }
    if (arguable.ultimate.errors) {
        runners.push(require('./errors')(arguable, state, arguable.stderr))
    }
    if (arguable.ultimate.stdout) {
        runners.push(function (line) {
            arguable.stdout.write(JSON.stringify(line) + '\n')
        })
    }
    if (runners.length > 0) {
        const accumulator = []
        const primary = runners.shift()
        ee.on('data', json => primary(json))
        if (runners.length > 0) {
            ee.on('data', json => accumulator.push(json))
        }
        if (arguable.ultimate.stdin) {
            const once = require('prospective/once')
            const Readline = require('readline')
            const input = Readline.createInterface({ input: arguable.stdin })
            input.on('line', line => {
                ee.emit('data', JSON.parse(line))
            })
            destructible.durable('stdin', once(input, 'close').promise)
        } else {
            run(destructible.durable('run'), arguable, {
                push: json => ee.emit('data', json)
            })
        }
        while (runners.length != 0) {
            const runner = runners.shift()
            for (const json of accumulator) {
                runner(json)
            }
        }
    }
    await destructible.promise
    return state.code
})

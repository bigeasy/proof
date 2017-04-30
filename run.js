var cadence = require('cadence')
var glob = require('expandable')
var path = require('path')
var shebang = require('./shebang')
var fs = require('fs')
var rescue = require('rescue')
var spawn = require('child_process').spawn
var Delta = require('delta')
var byline = require('byline')
var tap = require('./tap')
var Turnstile = require('turnstile')
Turnstile.Queue = require('turnstile/queue')

exports.run = cadence(function (async, program) {
    var programs = [], params = program.ultimate

    if (!params.processes) params.processes = 1

    program.argv.forEach(function (pattern) {
        var dirname
        if (/\s+/.test(pattern)) {
            program.abend('spaces', pattern)
        }
        glob(process.cwd(), [ pattern ])[0].files.forEach(function (_program) {
            if (programs.indexOf(_program) != -1) {
                program.abend('once', _program)
            }
            programs.push(_program)
        })
    })

    var directories = {}
    programs.forEach(function (program) {
        var programs = directories[path.dirname(program)] || []
        directories[path.dirname(program)] = programs
        programs.push(program)
    })

    var directory = cadence(function (async, envelope) {
        async(function () {
            var name = path.dirname(envelope.body[0])
            var proof = path.join(name, 'parallel.proof')
            async([function () {
                fs.readFile(proof, 'utf8', async())
            }, rescue(/^code:ENOENT$/, function () {
                return [ async.break, null ]
            })])
        }, function (parallel) {
            if (parallel == null) {
                async.forEach(function (program) {
                    queues.program.enqueue(program, async())
                })(envelope.body)
            } else {
                // TODO Add this to the Turnstile documentation, you use the
                // implicit loop here to populate the explicit loop, because it
                // is going take memory anyway.
                envelope.body.forEach(function (program) {
                    queues.program.enqueue(program, async())
                })
            }
        })
    })

    var run = cadence(function (async, envelope) {
        var program = envelope.body
        async(function () {
            shebang(process.platform, program, [], async())
        }, function (_program, parameters) {
            var executable = spawn(_program, parameters, {})

            var timer = null

            emit('run')

            async(function () {
                var delta = new Delta(async()), bailed = false, planned = false, plan

                byline.createStream(executable.stderr).on('data', function (line) {
                    emit('err', line)
                })

                byline.createStream(executable.stdout).on('data', function (line) {
                    if (bailed) {
                        emit('out', line)
                    } else if (tap.assertion(line)) {
                        emit('test', line)
                    } else if (!planned && (plan = tap.plan(line))) {
                        planned = true
                        emit('plan', plan.expected)
                    } else if (tap.bailout(line)) {
                        bailed = true
                        emit('bail', line)
                    } else {
                        emit('out', line)
                    }
                })

                delta.ee(executable.stdout)
                     .ee(executable.stderr)
                     .ee(executable).on('close')
            }, function (code, signal) {
                emit('exit', (code == null ? 'null' : code) + ' ' + (signal == null ? 'null' : signal))
                clearTimeout(timer)
                return []
            })

            function emit (type, message) {
                if (timer) {
                    clearTimeout(timer)
                }
                timer = setTimeout(kill, params.timeout ? params.timeout * 1000 : 30000)
                stamp(program, type, message)
            }

            function kill () {
                timer = null
                executable.kill()
            }
        })
    })


    var turnstiles = {
        directories: new Turnstile({ turnstiles: 1 }),
        programs: new Turnstile({ turnstiles: Infinity })
    }
    var queues = {
        directory: new Turnstile.Queue(directory, turnstiles.directories),
        program: new Turnstile.Queue(run, turnstiles.programs)
    }

    async(function () {
        Object.keys(directories).forEach(function (directory) {
            queues.directory.push(directories[directory])
        })
        queues.directory.wait(async())
    }, function () {
        stamp('*', 'eof')
        return 0
    })

    function stamp (_program, type, message) {
        message = message != null ? ' ' + message : ''
        type = ('' + type + '      ').slice(0, 4)
        program.stdout.write('' + Date.now() + ' ' + type + ' ' + _program + message + '\n')
    }
})

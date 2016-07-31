var cadence = require('cadence')
var expandable = require('expandable')
var path = require('path')
var shebang = require('./shebang')
var spawn = require('child_process').spawn
var Delta = require('delta')
var byline = require('byline')
var tap = require('./tap')
var Reactor = require('reactor')

var run = cadence(function (async, program) {
    var programs = [], params = program.ultimate

    if (!params.processes) params.processes = 1

    program.argv.forEach(function (glob) {
        var dirname
        if (/\s+/.test(glob)) {
            program.abend('spaces', glob)
        }
        expandable.glob(process.cwd(), [ glob ])[0].files.forEach(function (_program) {
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

    // Happens often enough that we shouldn't freak out.
    var operation = cadence(function (async, timeout, programs) {
        async(function () {
            async.forEach(function (program) {
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
            })(programs)
        })
    })

    var reactor = new Reactor(operation)

    async(function () {
        Object.keys(directories).forEach(function (directory) {
            reactor.push(directories[directory])
        })
        reactor.push([], async())
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

exports.run = run

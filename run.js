var cadence = require('cadence')
var expandable = require('expandable')
var path = require('path')
var shebang = require('./shebang')
var spawn = require('child_process').spawn
var Delta = require('delta')
var byline = require('byline')
var tap = require('./tap')
var turnstile = require('turnstile')

var execute = cadence(function (async, program) {
    async(function () {
        shebang(process.platform, program, [], async())
    }, function (program, parameters) {
        return spawn(program, parameters, {})
    })
})

var run = cadence(function (async, clock, execute, options) {
    var programs = []

    if (!options.params.processes) options.params.processes = 1

    options.argv.forEach(function (glob) {
        var dirname
        if (/\s+/.test(glob)) {
            options.abend('spaces', glob)
        }
        expandable.glob(process.cwd(), [ glob ])[0].files.forEach(function (program) {
            if (programs.indexOf(program) != -1) {
                options.abend('once', program)
            }
            programs.push(program)
        })
    })

    // Happens often enough that we shouldn't freak out.
    var operation = cadence(function (async, programs) {
        async(function () {
            async.forEach(function (program) {
                async(function () {
                    execute(program, async())
                }, function (executable) {
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
                                emit('bail', line)
                            } else {
                                emit('out', line)
                            }
                        })

                        delta.ee(executable.stdout)
                             .ee(executable.stderr)
                             .ee(executable).on('close')
                    }, function (code, signal) {
                        emit('exit', (code == null ? 'null' : code) + ' ' + (signal == null ? 'null' : 0))
                        clearTimeout(timer)
                    })

                    function emit (type, message) {
                        if (timer) {
                            clearTimeout(timer)
                        }
                        timer = setTimeout(kill, options.params.timeout * 1000 || 30000)
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

    var reservoir = new turnstile.Reservoir({
        turnstile: new turnstile.Turnstile({ workers: 1 }),
        groupBy: function (value) {
            return path.dirname(value)
        },
        operation: operation
    })

    async(function () {
        reservoir.write(programs, async())
    }, function () {
        stamp('*', 'eof')
    })

    function stamp (program, type, message) {
        message = message != null ? ' ' + message : ''
        type = ('' + type + '      ').slice(0, 4)
        options.stdout.write('' + clock() + ' ' + type + ' ' + program + message + '\n')
    }
})

exports.raw = run
exports.run = function (options, callback) {
    run(function () { return Date.now() }, execute, options, callback)
}

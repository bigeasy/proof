var cadence = require('cadence')
var expandable = require('expandable')
var path = require('path')
var shebang = require('./shebang')
var spawn = require('child_process').spawn
var byline = require('byline')
var tap = require('./tap')

var badabing = cadence(function (step, program, parameters, options) {
    step(function () {
        shebang(process.platform, program, parameters, step())
    }, function (program, parameters) {
        return [ spawn(program, parameters, options) ]
    })
})

function close (child, callback) {
    var count = 0
    var done
    function closed () {
        if (++count == 3) done()
    }
    if (child.stdout) child.stdout.on('close', closed)
    else count++
    if (child.stderr) child.stderr.on('close', closed)
    else count++
    child.on('exit', function (code, signal) {
        done = function () {
            callback(code, signal)
        }
        closed()
    })
}

function run (options) {
    var displayed = 0
    var failures = []
    var seen = {}
    var parallel = {}
    var i, next
    if (!options.params.processes) options.params.processes = 1
    options.argv.forEach(function (glob) {
        var dirname
        if (/\s+/.test(glob)) {
            options.abend('spaces', glob)
        }
        expandable.glob(process.cwd(), [ glob ])[0].files.forEach(function (program) {
            if (seen[program]) {
                options.abend('once', program)
            }
            seen[program] = true
            dirname = path.dirname(program)
            if (!parallel[dirname]) {
                parallel[dirname] = {
                    programs: [],
                    time: 0,
                    running: true
                }
            }
            parallel[dirname].programs.push(program)
        })
    })
    parallel = Object.keys(parallel).map(function (key) { return parallel[key] })
    // Happens often enough that we shouldn't freak out.
    process.stdout.on('error', function (error) {
        if (error.code == 'EPIPE')  process.exit(1)
    })
    function emit (file, type, message) {
        message = message != null ? ' ' + message : ''
        type = ('' + type + '      ').slice(0, 4)
        process.stdout.write('' + (+new Date()) + ' ' + type + ' ' + file + message + '\n')
    }
    function execute (program, index) {
        var bailed, err, out, test, planned; // after a test is emitted, any plans are just stdout
        emit(program, 'run')
        badabing(program, [], {}, function (error, test) {
            if (error) throw error
            var timer;
            function resetTimer() {
                if (timer) clearTimeout(timer)
                timer = setTimeout(function () {
                    test.kill();
                }, options.params.timeout * 1000 || 30000)
            }
            resetTimer()
            bailed = false
            err = ''
            test.stderr.setEncoding('utf8')
            test.stderr.on('data', function (chunk) {
                resetTimer()
                err += chunk
                var lines = err.split(/\n/)
                err = lines.pop()
                lines.forEach(function (line) { emit(program, 'err', line) })
            })
            out = ''
            var stdout = byline.createStream(test.stdout)
            stdout.on('data', function (line) {
                resetTimer()
                if (bailed) {
                    emit(program, 'out', line)
                } else if (tap.assertion(line)) {
                    emit(program, 'test', line)
                } else if (!planned && (plan = tap.plan(line))) {
                    planned = true
                    emit(program, 'plan', plan.expected)
                } else if (tap.bailout(line)) {
                    testing = true
                    emit(program, 'bail', line)
                } else {
                    emit(program, 'out', line)
                }
            })
            var version = process.versions.node.split('.')
            close(test, function (code, signal) {
                clearTimeout(timer)
                var time
                emit(program, 'exit', (code == null ? 'null' : code) + ' ' + (signal == null ? 'null' : 0))
                parallel[index].time = time = 0
                if (parallel[index].programs.length) {
                    execute(parallel[index].programs.shift(), index)
                } else {
                    parallel[index].running = false
                    if (next < parallel.length) {
                        if (displayed === index) {
                            displayed = next + 1
                        }
                        index = next++
                        execute(parallel[index].programs.shift(), index)
                    } else if (parallel.every(function (p) { return ! p.running })) {
                        emit('*', 'eof')
                    }
                }
            })
        })
    }
    next = options.params.processes
    for (i = 0; i < next; i++) {
        if (parallel[i]) {
            execute(parallel[i].programs.shift(), i)
        }
    }
}

module.exports = run

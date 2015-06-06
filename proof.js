var fs = require('fs')
var util = require('util')
var path = require('path')
var spawn = require('child_process').spawn
var arguable = require('arguable')
var expandable = require('expandable')
var cadence = require('cadence')
var candidate = require('./candidate')
var shebang = require('./shebang')
var __slice = [].slice
var overwrite = [ false ]
var extend = require('./extend')
var parser = require('./parser')
var parseRedux = require('./parse')
var jsonRedux = require('./json')
var formatter = require('./formatter')
var printer = require('./printer')
var _progress = require('./progress')
var _errors = require('./errors')

// Moved exports.json to its own file.
function json () {
    var formatterRedux = formatter(jsonRedux())
    process.stdin.resume()
    parse(process.stdin, printer(formatterRedux, process.stdout))
}

function progress (options) {
    var formatterRedux = formatter(_progress(options, overwrite))
    process.stdin.resume()
    parse(process.stdin, printer(formatterRedux, process.stdout))
}

function errors (options) {
    var formatterRedux = formatter(_errors(options))
    process.stdin.resume()
    parse(process.stdin, printer(formatterRedux, process.stdout))
}

var colorization = require('./colorization')


function Abend () { Error.call(this) }

function abend (message, use) {
    if (overwrite[0]) console.log('')
    if (message) console.error('error: ' + message)
    if (use) usage()
    process.on('exit', function () { process.exit(message ? 1 : 0) })
    throw new Abend(message)
}


function parse (stream, callback) {
    var programs = {}
    var out = [''][0]
    var count = 0
    var done = false
    var abended, data
    var done = [ false ]

    function abender (forward) {
        return function () {
            try {
                if (!abended) forward.apply(this, arguments)
            } catch (e) {
                if (!(e instanceof Abend)) throw e
                abended = true
                stream.destroy()
            }
        }
    }

    var parseLine = parseRedux(done, abend, parser, extend, callback)

    stream.setEncoding('utf8')
    stream.on('end', function () { if (data && !done[0]) { process.exit(1) } })
    stream.on('data', abender(function (chunk) {
        data = true

        var lines = (out += chunk).split(/\r?\n/)
        out = lines.pop()

        lines.forEach(parseLine) // <- the function which invokes the call back is invoked here.
    }))
}

var badabing = cadence(function (step, program, parameters, options) {
    step(function () {
        shebang(process.platform, program, parameters, step())
    }, function (program, parameters) {
        return [ spawn(program, parameters, options) ]
    })
})

function run (options) {
    var displayed = 0
    var failures = []
    var seen = {}
    var parallel = {}
    var i, next
    if (!options.params.processes) options.params.processes = 1
    argv.forEach(function (glob) {
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
            test.stdout.setEncoding('utf8')
            test.stdout.on('data', function (chunk) {
                resetTimer()
                out += chunk
                var lines = out.split(/\n/)
                out = lines.pop()
                lines.forEach(function (line) {
                    if (bailed) {
                        emit(program, 'out', line)
                    } else if (parser.assertion(line)) {
                        emit(program, 'test', line)
                    } else if (!planned && (plan = parser.plan(line))) {
                        planned = true
                        emit(program, 'plan', plan.expected)
                    } else if (parser.bailout(line)) {
                        testing = true
                        emit(program, 'bail', line)
                    } else {
                        emit(program, 'out', line)
                    }
                })
            })
            var version = process.versions.node.split('.')
            close(test, function (code) {
                clearTimeout(timer)
                var time
                emit(program, 'exit', code)
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

var argv = process.argv.slice(2)

function platform (options) {
    if (options.params.help) options.help()
    argv.forEach(function (platform) {
        if (process.platform == platform) process.exit(0)
    })
    process.exit(1)
}

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

function test (options) {
    var executable = path.join(__dirname, 'proof.bin.js')
    var progress = {}
    var run = {}
    options.given.forEach(function (name) {
        if ('help' == name) {
            options.usage()
        } else if (/^(monochrome|width|digits)$/.test(name)) {
            progress[name] = options.params[name]
        } else {
            run[name] = options.params[name]
        }
    })
    progress = spawn('node', arguable.flatten(executable, 'progress', progress),
                             { stdio: [ 'pipe', process.stdout, process.stderr ] })
    run = spawn('node', arguable.flatten(executable, 'run', run, options.argv),
                        { stdio: [ 'pipe', 'pipe', process.stderr ] })
    run.stdout.pipe(progress.stdin)

    var count = 0
    var code = 0
    function closed ($code) {
        if (!code) code = $code
        if (++count == 2) process.exit(code)
    }
    close(run, closed)
    close(progress, closed)
}

function main (options) {
    if (!options.command) {
        console.log(options.usage)
        process.exit(0)
    }
    var command = ({
        json: json,
        run: run,
        progress: progress,
        errors: errors,
        platform: platform,
        test: test
    })[options.command]

    if (command) {
        command(options)
    } else {
        var executable = argv.length && !/[-.\/]/.test(argv[0])
                       ? 'proof-' + (argv.shift())
                       : 'proof-default'
        candidate(process.env.PATH, executable, function (error, resolved) {
            badabing(resolved, argv, { customFds: [ 0, 1, 2 ] }, function (error, child) {
                close(child, function (code) { process.exit(code) })
            })
        })
    }
}

function abended (e) {
    process.stderr.write('error: ' + e.message + '\n')
    process.exit(1)
}

exports.main = main
exports.abended = abended

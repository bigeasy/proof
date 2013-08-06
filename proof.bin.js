#!/usr/bin/env node

/*

___ json _ usage: en_US ___
usage: proof json [<test>...]

  Display proof output as JSON.

options:

    -h,   --help                  display this usage information

invocation:

  If no proof runner output files are given, the JSON formatter listens
  for proof runner output on STDIN.

  `proof json` exits successfully, with an exit code of zero, regardless
  of failures in the proof runner output. It exists with a non-zero exit
  code only if it cannot parse the test runner output.

description:

  `proof json` converts proof unified test output into a JSON string for
  use with JavaScript utilities of your own creation; Node.js command
  line utilities or web applications.

___ progress _ usage: en_US ___
usage: proof progress [options] [<files>...]

  Display proof output using a colorized progress meter.

options:

    -d,   --digits    [count]     number of timing digits to display
    -h,   --help                  display this usage information
    -M,   --monochrome            do not display color
    -w,   --width     [count]     width in characters of progress display

invocation:

  If no proof runner output files are given, the progress meter listen
  for proof runner output on STDIN.

  If there are no errors, `proof progress` exits with a zero exit code,
  otherwise it returns a non-zero exit code.

description:

  `proof progress` displays a colorful, animated report of test
  progress. Output from `proof run` can be piped to `proof progress` to
  display the progress of a test run as it is running. Using a utility
  like `tee`, you can both pipe `proof run` output to `proof progress`
  and save it to file for later reporting.

___ run _ usage: en_US ___
usage: proof run [options] [<test>...]

  Run test programs and emit unified runner output.

options:

    -h,   --help                  display this usage information
    -p,   --processes <count>     number of processes to run

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

___ strings ___

  spaces:
    program names cannot contain spaces: %s

  once:
    a program must only run once in a test run: %s

___ errors _ usage: en_US ___
usage: proof errors [options] [<test>...]

  Display output of failed assertions.

options:

    -h,   --help                  display this usage information
    -M,   --monochrome            do not display color
    -p,   --processes <count>     number of processes to run

invocation:

  If no proof runner output files are given, the error reporter listens
  for proof runner output on STDIN.

  If there are no errors, `proof errors` exits with a zero exit code,
  otherwise it returns a non-zero exit code.

description:

  `proof errors` displays failure assertions and failure conditions in
  context, with the program output and error output that preceded and
  follow the failure.

___ platform _ usage: en_US ___
usage: platform [options] [<name>..]

  Exit success if running on one of the given platforms.

options:

    -h,   --help                  display this usage information

invocation:

  Exit success if running on one of the given platforms, exit failure otherwise.
  Known platforms include 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'

  If no platforms are listed, then the `proof platform` program exits failure.

description:

  `proof platform` simplifies cross-platform builds, giving you a reliable test
  to use in your `package.json` definition of your `test` script. I use it to
  invoke Proof directly on `win32` to take advantage of Proof's advanced
  globbing capabilities absent in Windows Power Shell, indirectly through a
  shell program that performs additional testing on UNIX platforms.

___ test _ usage: en_US ___
usage: proof test [options] [<files>...]

  Run tests and display progress a colorized progress meter.

options:

    -d,   --digits    [count]     number of timing digits to display
    -h,   --help                  display this usage information
    -M,   --monochrome            do not display color
    -p,   --processes [count]     number of processes to run
    -w,   --width     [count]     width in characters of progress display

invocation:

  If there are no errors, `proof` exits with a zero exit code, otherwise it
  returns a non-zero exit code.

description:

  `proof` runs a collection of tests and displays a colorful, animated
  report of test progress. Output from `proof run` can be piped to
  `proof progress` to display the progress of a test run as it is
  running. Using a utility like `tee`, you can both pipe `proof run`
  output to `proof progress` and save it to file for later reporting.

___ usage: en_US ___
usage: proof [command] <arguments> <tests>
___ usage ___
*/

var fs = require('fs')
var util = require('util')
var path = require('path')
var spawn = require('child_process').spawn
var arguable = require('arguable')
var expandable = require('expandable')
var cadence = require('cadence')
var __slice = [].slice
var overwrite

function say () {
    console.log.apply(console, __slice.call(arguments, 0))
}

function die () {
    console.log.apply(console, __slice.call(arguments, 0))
    process.exit(1)
}

function validator (callback) {
    if (typeof callback != 'function') throw new Error('no callback')
    return function (forward) { return check(callback, forward) }
}

function check (callback, forward) {
    if (typeof callback != 'function') throw new Error('no callback')
    if (typeof forward != 'function') throw new Error('no forward')
    return function (error) {
        if (error) {
            callback(error)
        } else {
            try {
                forward.apply(null, __slice.call(arguments, 1))
            } catch (error) {
                callback(error)
            }
        }
    }
}

function json () {
    var object = {}
    process.stdin.resume()
    parse(process.stdin, function (event) {
        var comment, file, message, passed, skip, time, todo
        switch (event.type) {
            case 'run':
                object[event.file] = {
                    time: event.time,
                    expected: event.expected,
                    tests: []
                }
            case 'plan':
                object[event.file].expected = event.expected
            case 'test':
                object[file].tests.push({
                    message: event.message,
                    time: event.time,
                    passed: event.passed,
                    skip: event.skip,
                    todo: event.todo,
                    comment: event.comment
                })
            case 'exit':
                extend(object[event.file], {
                    actual: event.actual,
                    duration: event.time - event.start,
                    code: event.code
                })
            case 'eof':
                process.stdout.write(JSON.stringify(object, null, 2))
                process.stdout.write('\n')
        }
    })
}

// Generate a set of colorization functions to colorize console output, or a set
// a no-op functions if the `--monochrome` switch is selected.
function colorization (options) {
    if (!options.params.monochrome) {
        options.params.monochrome = false
    }

    function monochrome (text) { return text }

    if (options.params.monochrome) {
        return {
            red: monochrome, green: monochrome, blue: monochrome, gray: monochrome
        }
    }

    function colorize (color) {
        return function (text) { return '' + color + text + '\u001B[0m' }
    }

    return {
        red: colorize('\u001B[31m'),
        green: colorize('\u001B[32m'),
        blue: colorize('\u001B[34m'),
        gray: colorize('\u001B[38;5;244m')
    }
}

function progress (options) {
    var colorize = colorization(options)
    var durations = {}
    var programs = {}
    var displayed

    function fill (character, count) {
        return Array(Math.max(count + 1, 0)).join(character)
    }

    function time (program) {
        var str, fit
        str = String(program.time - program.start)
        if (str.length < 4) {
            str = ('000' + str).slice(-4)
        }
        str = str.replace(/(\d{3})$/, '.$1')
        fit = ('        ' + str).slice(-(+options.params.digits + 1))
        if (fit.length < str.length) {
            options.params.digits = str.length - 1
            return str
        }
        return fit
    }

    function failed (program) {
        if (!(program.expected == '?' && program.type == 'run')) {
            if (program.actual > program.expected) return true
            if (program.passed < program.actual) return true
            if (program.bailed) return true
            if (program.planless) return true
            if (program.code != null) {
                if (program.code) return true
                if (program.actual != program.expected) return true
            }
        }
    }

    function bar (program, terminal) {
        if (failed(program)) {
            extend(program, { status: 'Failure', color: colorize.red, icon: '\u2718' })
        }

        var color = program.color
        var icon = program.icon
        var file = program.file
        var status = program.status

        var summary = '(' + program.passed + '/' + (program.expected || 0) + ') ' + (time(program))

        var dots = fill('.', options.params.width - 6 - file.length - summary.length - status.length)

        return ' ' + color(icon) + ' ' + file + ' ' + dots + ' ' + summary + ' ' + color(status) + terminal
    }

    options.params.width || (options.params.width = 76)

    options.params.digits || (options.params.digits = 4)
    if (options.params.digits < 4) {
        options.params.digits = 4
    }
    if (options.params.digits > 10) {
        options.params.digits = 10
    }

    process.stdin.resume()
    parse(process.stdin, function (event) {
        var program, status, summary, tests

        if (!displayed) displayed = event.file

        if (event.type == 'run') {
            if (programs[event.file] == null) {
                programs[event.file] = {
                    actual: 0,
                    expected: '?',
                    color: colorize.green,
                    file: event.file,
                    start: Number.MAX_VALUE,
                    status: 'Success',
                    time: 0,
                    passed: 0,
                    icon: '\u2713'
                }
            }
        }

        if (event.type == 'eof') {
            summary = {
                actual: 0,
                passed: 0,
                expected: 0,
                time: 0,
                start: Number.MAX_VALUE,
                count: 0,
                code: 0
            }
            tests = { actual: 0, passed: 0 }
            for (file in programs) {
                program = programs[file]
                if (program.code) {
                    summary.code = program.code
                }
                tests.actual++
                if (program.expected == program.passed) {
                    tests.passed++
                }
                summary.count++
                summary.actual += program.actual || 0
                summary.passed += program.passed || 0
                if (program.expected == '?') {
                    summary.planless = true
                } else {
                    summary.expected += program.expected
                }
                if (program.bailed) {
                    summary.bailed = true
                }
                if (!program.time) {
                    continue
                }
                summary.start = Math.min(summary.start, program.start)
                summary.time = Math.max(summary.time, program.time)
            }
            summary.file = 'tests (' + tests.passed + '/' + tests.actual + ') assertions'
            extend(summary, !failed(summary) ? {
                icon: '\u2713',
                status: 'Success',
                color: colorize.green
            } : {
                icon: '\u2718',
                status: 'Failure',
                color: colorize.red
            })

            var stats = '(' + summary.passed + '/' + summary.expected + ') ' + (time(summary))

            var color = summary.color
            var icon = summary.icon
            var file = summary.file
            var status = summary.status
            var dots = fill(' ', options.params.width - 6 - summary.file.length - stats.length - status.length)

            process.stdout.write(' ' + (color(' ')) + ' ' + dots + ' ' + file + ' ' + stats + ' ' + (color(status)) + '\n')

            overwrite = false
            if (summary.status == 'Failure') {
                process.on('exit', function () { process.exit(1) })
            }
        } else {
            programs[event.file].duration = event.time - event.start
            switch (event.type) {
                case 'run':
                    extend(programs[event.file], event)
                    if (event.file === displayed && process.stdout.isTTY && process.env['TRAVIS'] != 'true') {
                        overwrite = true
                        process.stdout.write(bar(programs[event.file], '\033[0G'))
                    }
                    break
                case 'plan':
                    programs[event.file].expected = event.expected
                    if (event.file === displayed && process.stdout.isTTY && process.env['TRAVIS'] != 'true') {
                        overwrite = true
                        process.stdout.write(bar(programs[event.file], '\033[0G'))
                    }
                    break
                case 'test':
                    extend(programs[event.file], event)
                    if (event.file === displayed && process.stdout.isTTY && process.env['TRAVIS'] != 'true') {
                        overwrite = true
                        process.stdout.write(bar(programs[event.file], '\033[0G'))
                    }
                    break
                case 'bail':
                    if (event.file === displayed) {
                        displayed = null
                    }
                    programs[event.file].bailed = true
                    break
                case 'exit':
                    if (event.file === displayed) {
                        displayed = null
                    }
                    program = extend(programs[event.file], event)
                    overwrite = false
                    process.stdout.write(bar(program, '\n'))
            }
        }
    })
}

// Problem with errors is that output can be interleaved, so we need to gather
// up the lines of output after a failed assertion, or else the output of other
// assertions get interleaved.
//
// The first formatting style that comes to mind would be one that grouped all
// the failed assertions under their failed test, but that means waiting for a
// full test to load. There are test with a great many failures, one of the
// automated tests, like the one in Timezone that tests every clock transition
// in the world since the dawn of standardized time. We might run out of memory
// if a test of that nature is really broken and really chatty about it.
//
// What we're going to do for a stab at this problem is create a queue, as we do
// with progress, and one go at a time. Chances are the queue will be empty. If
// there is one long running test interleaved with a quick test, then the quick
// test will be done quickly, and the long running test can take over. If two
// long running test are interleaved, then we might want to view the tests one
// at a time by piping the test through `grep`, or piping it through `sort`,
// before passing it to `proof errors`.
function errors (options) {
    var queue = []
    var failed = {}
    var prefix = ''
    var backlog = {}
    var offset = 2
    var colorize = colorization(options)

    process.stdin.resume()
    parse(process.stdin, function (event) {
        if (event.type === 'run') {
            planned = false
            backlog[event.file] = [
                {
                    type: 'out',
                    line: ''
                }, {
                    type: 'out',
                    line: '>--'
                }, {
                    type: 'out',
                    line: ''
                }
            ]
        }
        if (failed[event.file]) {
            failed[event.file].events.push(event)
            if (event.type === 'test' && event.ok) delete failed[event.file]
        } else if ((event.type === 'bail') ||
                   (event.type === 'test' && !(event.ok)) ||
                   (event.type === 'exit' && (event.code || !planned || (event.expected != event.actual)))) {
            queue.push(failed[event.file] = {
                events: backlog[event.file].concat([event])
            })
            if (event.type === 'test') {
                backlog[event.file].length = 3
            } else {
                delete backlog[event.file]
            }
        } else if (event.type === 'plan') {
            planned = true
        } else if (event.type === 'test') {
            backlog[event.file].length = 3
        } else if (event.type === 'exit') {
            delete backlog[event.file]
        } else if (event.type !== 'eof') {
            backlog[event.file].push(event)
        } else if (event.type === 'eof' && offset !== 2) {
            process.stdout.write('\n')
            process.on('exit', function () { process.exit(1) })
        }
        while (queue.length && queue[0].events.length) {
            event = queue[0].events.shift()
            if (offset-- > 0) {
                continue
            }
            switch (event.type) {
                case 'bail':
                    process.stdout.write('> ' + (colorize.red('\u2718')) + ' ' + event.file + ': Bail Out!\n')
                    break
                case 'test':
/*                    if (!planned) {
                        process.stdout.write('> ' + (colorize.red('\u2718')) + ' ' + event.file + ': no plan given: ' + event.message + '\n')
                        planned = true
                    } else */
                    if (event.ok) {
                        queue.shift()
                    } else {
                        process.stdout.write('> ' + (colorize.red('\u2718')) + ' ' + event.file + ': ' + event.message + '\n')
                    }
                    break
                case 'err':
                case 'out':
                    process.stdout.write('' + event.line + '\n')
                    prefix = ''
                    break
                case 'exit':
                    if (event.code || !planned || (event.actual != event.expected)) {
                        var line = []
                        line.push('> ' + (colorize.red('\u2718')) + ' ' + event.file)
                        if (!planned) {
                            line.push(': no plan given')
                        } else if (event.actual != event.expected) {
                            line.push(': expected ' + event.expected + ' test' + (event.expected == 1 ? '' : 's')  + ' but got ' + event.actual)
                        }
                        line.push(': exited with code ' + event.code)
                        process.stdout.write(line.join('') +  '\n')
                        prefix = '\n\n'
                    }
                    queue.shift()
                    break
            }
        }
    })
}

var parser = {
    plan: function (plan) {
        var $
        if ($ = /^1..(\d+)$/.exec(plan)) {
            return { expected: parseInt($[1], 10) }
        }
    },
    bailout: function (bailout) {
        var $
        if ($ = /^Bail out!(?:\s+(.*))?$/.exec(bailout)) {
            return { message: $[1] }
        }
    },
    assertion: function (assert) {
        var $, failed, message, ok, comment, skip, todo
        if ($ = /^(not\s+)?ok\s+\d+\s*(.*?)\s*$/.exec(assert)) {
            failed = $[1], message = $[2]
            ok = !failed
            comment = null, skip = false, todo = false
            if (message != null) {
                $ = message.split(/\s+#\s+/, 2), message = $[0], comment = $[1]
                if (comment != null) {
                    if (skip = ($ = /^skip\s(.*)$/i.exec(comment)) != null) {
                        comment = $[1]
                    }
                    if (todo = ($ = /^todo\s(.*)$/i.exec(comment)) != null) {
                        comment = $[1]
                    }
                }
            }
            return {
                ok: ok,
                message: message,
                comment: comment,
                skip: skip,
                todo: todo
            }
        }
    }
}

function extend (destination) {
    var sources = __slice.call(arguments, 1)
    var destination
    sources.forEach(function (source) {
        for (key in source) destination[key] = source[key]
    })
    return destination
}

function Abend () { Error.call(this) }

function abend (message, use) {
    if (overwrite) console.log('')
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

    stream.setEncoding('utf8')
    stream.on('end', function () { if (data && !done) { process.exit(1) } })
    stream.on('data', abender(function (chunk) {
        data = true

        var lines = (out += chunk).split(/\r?\n/)
        out = lines.pop()

        lines.forEach(function (line) {
            count++
            var $
            if (!($ = /^(\d+)\s+(\w+)\s+([^\s]+)\s?(.*)$/.exec(line))) {
                abend('cannot parse runner output at line ' + count + ': invalid syntax')
            }
            var time = parseInt($[1], 10)
            var type = $[2]
            var file = $[3]
            var rest = $[4]
            var event, program, expected, code
            if (!programs[file]) {
                programs[file] = {
                    passed: 0,
                    actual: 0
                }
            }
            program = programs[file]
            switch (type) {
                case 'test':
                    event = parser.assertion(rest)
                    program.actual++
                    if (event.ok) {
                        program.passed++
                    }
                    callback(extend(event, program, {
                        time: time,
                        file: file,
                        type: type
                    }))
                    break
                case 'run':
                    program.start = time
                    callback(extend(program, {
                        time: time,
                        type: type,
                        file: file
                    }))
                    break
                case 'plan':
                    expected = parseInt(rest, 10)
                    callback(extend(program, {
                        time: time,
                        file: file,
                        type: type,
                        expected: expected
                    }))
                    break
                case 'bail':
                    event = parser.bailout(rest)
                    program.bailed = true
                    callback(extend(event, program, {
                        time: time,
                        file: file,
                        type: type
                    }))
                    break
                case 'exit':
                    code = parseInt(rest, 10)
                    if (isNaN(code)) {
                        abend('cannot parse runner test exit code at line ' + count + ': exit code ' + rest)
                    }
                    callback(extend({}, program, {
                        code: code,
                        file: file,
                        type: type,
                        time: time
                    }))
                    break
                case 'err':
                case 'out':
                    callback({
                        time: time,
                        type: type,
                        file: file,
                        line: rest
                    })
                    break
                case 'eof':
                    callback({
                        time: time,
                        type: type
                    })
                    done = true
                    break
                default:
                    abend('cannot parse runner output at line ' + count + ': unknown line type ' + type)
            }
        })
    }))
}

// To do this right, we'd read through the Windows registry, but we really
// don't want to go digging into it a this point. Not that difficult, since
// there are command line utilities we can invoke to get a list of file
// associations.
function shebang (program, parameters, options, callback) {
    var buffer, first, $
    options || (options = {})
    if (process.platform.indexOf('win')) callback(null, spawn(program, parameters, options))
    else {
        switch (path.extname(program)) {
        case '.exe':
        case '.bat':
        case '.cmd':
            pathSearch(program, function (error, resolved) {
                callback(null, spawn(resolved, parameters, options))
            })
            break
        default:
            buffer = fs.readFileSync(program)
            if (buffer[0] == 0x23 && buffer[1] == 0x21
                    && (first = buffer.toString().split(/\n/).shift())) {
                if ($ = /^#!\/usr\/bin\/env\s+(\S+)/.exec(first)) {
                    parameters.unshift(program)
                    program = $[1]
                } else if ($ = /^#!\/.*\/(.*)/.exec(first)) {
                    parameters.unshift(program)
                    program = $[1]
                }
                pathSearch(program, function (error, resolved) {
                    shebang(resolved, parameters, options, callback)
                    //callback(null, spawn(resolved + '.cmd', parameters, options))
                })
            } else {
                callback(null, spawn(program, parameters, options))
            }
        }
    }
}

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
        shebang(program, [], {}, function (error, test) {
            bailed = false
            err = ''
            test.stderr.setEncoding('utf8')
            test.stderr.on('data', function (chunk) {
                err += chunk
                var lines = err.split(/\n/)
                err = lines.pop()
                lines.forEach(function (line) { emit(program, 'err', line) })
            })
            out = ''
            test.stdout.setEncoding('utf8')
            test.stdout.on('data', function (chunk) {
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

function pathSearch (executable, callback) {
    var env = {}
    var resolved = []
    var parts
    parts = process.env.PATH.split(process.platform === 'win32' ? ';' : ':')
    parts.push(__dirname)
    Object.keys(process.env).forEach(function (key) { env[key.toUpperCase()] = process.env[key] })
    parts.forEach(function (part) {
        resolved.push(path.resolve(part, executable + '.bat'))
        resolved.push(path.resolve(part, executable + '.cmd'))
        resolved.push(path.resolve(part, executable + '.exe'))
        resolved.push(path.resolve(part, executable))
    })
    cadence(function (step) {
        var shift
        step(shift = function () {
            if (!resolved.length) abend('cannot find executable: ' + executable)
        }, function () {
            fs.stat(resolved[0], step(Error))
        }, function (error) {
            resolved.shift()
            step(shift)(null)
        }, function (stat) {
            if (stat.isFile()) {
                return resolved[0]
            } else {
                resolved.shift()
                step(shift)(null)
            }
        })
    })(callback)
}

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
    progress = spawn('node', arguable.flatten(__filename, 'progress', progress),
                             { stdio: [ 'pipe', process.stdout, process.stderr ] })
    run = spawn('node', arguable.flatten(__filename, 'run', run, options.argv),
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
        var executable = argv.length && !/[-.\/]/.test(argv[0]) ? 'proof-' + (argv.shift())
                                                                                                                        : 'proof-default'
        pathSearch(executable, function (error, resolved) {
            shebang(resolved, argv, { customFds: [ 0, 1, 2 ] }, function (error, child) {
                close(child, function (code) { process.exit(code) })
            })
        })
    }
}

function abended (e) {
    process.stderr.write('error: ' + e.message + '\n')
    process.exit(1)
}

arguable.parse('en_US', __filename, process.argv.slice(2), main, abended)

/* vim: set ft=javascript: */

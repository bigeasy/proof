var colorization = require('./colorization')
var extend = require('./extend')

module.exports = function (options) {
    var colorize = colorization(options)
    var durations = {}
    var programs = {}
    var overwrite = [ false ] // todo: not an array
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
        fit = ('        ' + str).slice(-(+options.param.digits + 1))
        if (fit.length < str.length) {
            options.param.digits = str.length - 1
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
            if ('code' in program) {
                if (program.code !== 0) return true
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

        var dots = fill('.', options.param.width - 6 - file.length - summary.length - status.length)

        return ' ' + color(icon) + ' ' + file + ' ' + dots + ' ' + summary + ' ' + color(status) + terminal
    }

    options.param.width || (options.param.width = 76)

    options.param.digits || (options.param.digits = 4)
    if (options.param.digits < 4) {
        options.param.digits = 4
    }
    if (options.param.digits > 10) {
        options.param.digits = 10
    }

    var tty = options.param.tty || process.stdout.isTTY

    return function (event, state) {
        var program, status, summary, tests, array = [], array = []

        if (!displayed) displayed = event.file

        if (event.type == 'run') {
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
            var dots = fill(' ', options.param.width - 6 - summary.file.length - stats.length - status.length)

            array.push(' ' + (color(' ')) + ' ' + dots + ' ' + file + ' ' + stats + ' ' + (color(status)) + '\n')

            overwrite[0] = false
            if (summary.status == 'Failure') {
                state.code = 1
            }
        } else if (event.type == 'error') {
            if (overwrite[0]) {
                array.push('\n')
            }
        } else {
            programs[event.file].duration = event.time - event.start
            switch (event.type) {
                case 'run':
                    extend(programs[event.file], event)
                    if (event.file === displayed && tty && options.env['TRAVIS'] != 'true') {
                        overwrite[0] = true
                        array.push(bar(programs[event.file], '\033[0G'))
                    }
                    break
                case 'plan':
                    programs[event.file].expected = event.expected
                    if (event.file === displayed && tty && options.env['TRAVIS'] != 'true') {
                        overwrite[0] = true
                        array.push(bar(programs[event.file], '\033[0G'))
                    }
                    break
                case 'test':
                    extend(programs[event.file], event)
                    if (event.file === displayed && tty && options.env['TRAVIS'] != 'true') {
                        overwrite[0] = true
                        array.push(bar(programs[event.file], '\033[0G'))
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
                    overwrite[0] = false
                    array.push(bar(program, '\n'))
            }
        }
        return array
    }
}

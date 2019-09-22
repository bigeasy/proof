const colorization = require('./colorization')
const extend = require('./extend')
const coalesce = require('extant')
const ansi = require('./formatter')

module.exports = function (arguable, state, out) {
    var params = arguable.ultimate
    var colorize = colorization(params)
    var durations = {}
    var programs = {}
    var overwrite = false
    var displayed

    function fill (character, count) {
        return Array(Math.max(count + 1, 0)).join(character)
    }

    function _fill (character, width, left, right, terminal) {
        const visible = ansi.ascii(left).length + ansi.ascii(right).length
        const fill = (new Array(width - visible)).fill(character).join('')
        return `${ansi.monochrome(left)}${fill}${ansi.monochrome(right)}${terminal}`
    }

    function time (program) {
        var str, fit
        str = String(program.time - program.start)
        if (str.length < 4) {
            str = ('000' + str).slice(-4)
        }
        str = str.replace(/(\d{3})$/, '.$1')
        fit = ('        ' + str).slice(-(+params.digits + 1))
        if (fit.length < str.length) {
            params.digits = str.length - 1
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

    let count = 0
    function bar (program, terminal) {
        if (failed(program)) {
            extend(program, { status: 'Failure', c: 'red', color: colorize.red, icon: '\u2718' })
        }

        const { c, passed, expected, color, icon, file, status } = program

        const left = ` :${passed ? 'pass' : 'fail'}:. ${file} `
        const right = ` (${passed}/${expected}) ${time(program)} :${c}:${status}:.`

        return _fill('.', params.width, left, right, terminal)
    }

    const tty = coalesce(params.tty, process.stdout.isTTY, false)
    if (!params.width) {
        if (tty) {
            params.width = Math.min(process.stdout.columns - 1, 119)
        } else {
            params.width = 76
        }
    }

    params.digits || (params.digits = 4)
    if (params.digits < 4) {
        params.digits = 4
    }
    if (params.digits > 10) {
        params.digits = 10
    }

    return function (event) {
        var program, status, summary, tests, array = [], array = []

        if (!displayed) displayed = event.file

        if (event.type == 'run') {
            programs[event.file] = {
                actual: 0,
                expected: '?',
                color: colorize.green,
                c: 'green',
                file: event.file,
                start: event.time,
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
            for (const file in programs) {
                program = programs[file]
                summary.code = program.message[0]
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
            summary.file = `tests (${tests.passed}/${tests.actual}) assertions`
            extend(summary, !failed(summary) ? {
                icon: '\u2713',
                status: 'Success',
                color: colorize.green
            } : {
                icon: '\u2718',
                status: 'Failure',
                color: colorize.red
            })

            const stats = `(${summary.passed}/${summary.expected}) ${time(summary)}`

            const color = summary.color
            const icon = summary.icon
            const file = summary.file
            const status = summary.status
            const dots = fill(' ', params.width - 6 - summary.file.length - stats.length - status.length)

            array.push(` ${color(' ')} ${dots} ${file} ${stats} ${color(status)}\n`)

            overwrite = false
            if (summary.status == 'Failure') {
                state.code = 1
            }
        } else if (event.type == 'error') {
            if (overwrite) {
                array.push('\n')
            }
        } else {
            programs[event.file].duration = event.time - event.start
            switch (event.type) {
                case 'run':
                    extend(programs[event.file], event)
                    if (
                        event.file === displayed &&
                        tty &&
                        arguable.options.env['TRAVIS'] != 'true'
                    ) {
                        overwrite = true
                        array.push(bar(programs[event.file], '\u001b[0G'))
                    }
                    break
                case 'plan':
                    programs[event.file].expected = event.message
                    if (
                        event.file === displayed &&
                        tty &&
                        arguable.options.env['TRAVIS'] != 'true'
                    ) {
                        overwrite = true
                        array.push(bar(programs[event.file], '\u001b[0G'))
                    }
                    break
                case 'test':
                    extend(programs[event.file], event.message)
                    if (
                        event.file === displayed &&
                        tty &&
                        arguable.options.env['TRAVIS'] != 'true'
                    ) {
                        overwrite = true
                        array.push(bar(programs[event.file], '\u001b[0G'))
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
                    array.push(bar(program, '\n'))
            }
        }
        out.write(array.join(''))
    }
}

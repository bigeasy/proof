const colorization = require('./colorization')
const extend = require('./extend')
const coalesce = require('extant')
const Formatter = require('./formatter')

module.exports = function (arguable, state, out) {
    var params = arguable.ultimate
    var colorize = colorization(params)
    var durations = {}
    var programs = {}
    var overwrite = false
    var displayed

    const tty = coalesce(params.tty, process.stdout.isTTY, false)
    if (!params.width) {
        const width = coalesce(process.stdout.width, 77)
        if (tty) {
            params.width = Math.min(width - 1, 119)
        } else {
            params.width = 76
        }
    }

    const format = new Formatter({
        color: ! params.monochrome,
        progress: tty && arguable.options.env.TRAVIS != 'true',
        width: params.width,
        delimiter: '\u0000'
    })

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
    function bar (program) {
        if (failed(program)) {
            extend(program, { pass: false, status: 'Failure', color: 'red' })
        }

        const { pass, passed, expected, color, icon, file, status } = program

        return ` :${pass ? 'pass' : 'fail'}:. ${file} :pad:.:. (${passed}/${expected}) ${time(program)} :${color}:${status}:.`
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
                color: 'green',
                file: event.file,
                start: event.time,
                status: 'Success',
                time: 0,
                pass: true,
                passed: 0
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
                summary.code = program.code
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
                status: 'Success',
                color: colorize.green,
                color: 'green'
            } : {
                status: 'Failure',
                color: colorize.red,
                color: 'red'
            })

            const { color, icon, file, status } = summary

            const stats = `(${summary.passed}/${summary.expected}) ${time(summary)}`

            array.push(format.write(`:pad: :.${file} ${stats} :${color}:${status}:.`))

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
                    if (event.file === displayed) {
                        array.push(format.progress(bar(programs[event.file])))
                    }
                    break
                case 'plan':
                    programs[event.file].expected = event.message
                    if (event.file === displayed) {
                        array.push(format.progress(bar(programs[event.file])))
                    }
                    break
                case 'test':
                    programs[event.file].time = event.time
                    programs[event.file].actual++
                    if (event.message.ok) {
                        programs[event.file].passed++
                    }
                    if (event.file === displayed) {
                        array.push(format.progress(bar(programs[event.file])))
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
                    program.message = event.message
                    program.code = event.message[0]
                    overwrite = false
                    array.push(format.write(bar(program)))
            }
        }
        out.write(array.join(''))
    }
}

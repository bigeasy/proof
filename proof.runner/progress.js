const coalesce = require('extant')
const Formatter = require('./formatter')
const Progress = require('./tracker')

module.exports = function (arguable, state, out) {
    var params = arguable.ultimate
    var programs = {}
    var overwrite = false
    var displayed

    const tty = coalesce(params.tty, process.stdout.isTTY, false)
    if (!params.width) {
        const width = coalesce(process.stdout.columns, 77)
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
        str = String(program.duration)
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
        const { pass, status, color, icon } = failed(program) ? {
            pass: false, status: 'Failure', color: 'red', icon: 'fail'
        } : {
            pass: true, status: 'Success', color: 'green', icon: 'pass'
        }

        const { passed, expected, file } = program

        return ` :${pass ? 'pass' : 'fail'}:. ${file} :pad:.:. (${passed}/${expected}) ${time(program)} :${color}:${status}:.`
    }

    params.digits || (params.digits = 4)
    if (params.digits < 4) {
        params.digits = 4
    }
    if (params.digits > 10) {
        params.digits = 10
    }

    let prefix = out.npm ? '' : '\n'

    const progress = new Progress

    return function (event) {
        const array = []

        if (!displayed) displayed = event.file

        const program = progress.update(event)

        if (event.type == 'run') {
            array.push(prefix)
            prefix = ''
        }

        if (event.type == 'eof') {
            const summary = {
                actual: 0,
                passed: 0,
                expected: 0,
                time: 0,
                start: Number.MAX_VALUE,
                count: 0,
                code: 0
            }
            const tests = { actual: 0, passed: 0 }
            for (const file in progress.tests) {
                const program = progress.tests[file]
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
            summary.duration = summary.time - summary.start
            summary.file = `tests (${tests.passed}/${tests.actual}) assertions`
            const { icon, color, status } = (!failed(summary) ? {
                status: 'Success',
                color: 'green',
                icon: 'pass'
            } : {
                status: 'Failure',
                color: 'red',
                icon: 'fail'
            })

            const { file } = summary

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
            switch (event.type) {
                case 'run':
                    if (event.file === displayed) {
                        array.push(format.progress(bar(program)))
                    }
                    break
                case 'plan':
                    if (event.file === displayed) {
                        array.push(format.progress(bar(program)))
                    }
                    break
                case 'test':
                    if (event.file === displayed) {
                        array.push(format.progress(bar(program)))
                    }
                    break
                case 'bail':
                    if (event.file === displayed) {
                        displayed = null
                    }
                    break
                case 'exit':
                    if (event.file === displayed) {
                        displayed = null
                    }
                    overwrite = false
                    array.push(format.write(bar(program)))
            }
        }
        out.write(array.join(''))
    }
}

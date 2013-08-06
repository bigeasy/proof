var util    = require('util')
var assert  = require('assert')
var cadence = require('cadence')

var __slice = [].slice

var globals = Object.keys(global).concat([ 'errno' ])

function Bailout (vargs) {
    Error.call(this)
    this.vargs = vargs
}

function execute (expected, harnessCleanup, harness, programCleanup, program) {
    var actual = 0
    var passed = 0
    var callbacks = { results: {} }
    var exitCode = 0
    var timeout, untidy, name
    var context = { bailout: bailout, die: bailout, say: say, counter: counter }
    var cadences = []
    var janitors = []
    var delayedPlan = ~parameters(program).indexOf('counter')

    for (name in assert) {
        if (context[name] || name === 'AssertionError') {
            continue
        }
        context[name] = assertion(name, assert[name])
    }

    untidy = process.env.PROOF_NO_CLEANUP || process.env.UNTIDY
    untidy = untidy && !/^(0|no|false)$/.test(untidy)

    timeout = parseInt(process.env.PROOF_TIMEOUT)
    if (isNaN(timeout)) {
        timeout = parseInt(process.env.TIMEOUT)
    }
    if (isNaN(timeout)) {
        timeout = 30000
    }

    var timer = setTimeout(function () { abend(new Error('timeout')) }, 864e5)

    function resetTimeout () {
        clearTimeout(timer)
        timer = setTimeout(function () { abend(new Error('timeout')) }, timeout)
    }

    function counter (count) {
        expected += count 
    }

    cadence(function (step) {
        this.cadence = cadence
        this.step = step
        step(function () {
            step(function () {
                resetTimeout()
                harnessCleanup(step)
            }, function () {
                resetTimeout()
                return harness.apply(this, parameterize(harness, this))
            })
        }, function (object) {
            resetTimeout()
            object = typeof object == 'object' ? object : {}
            for (var key in object) {
                this[key] = object[key]
            }
            this.cadence = cadence
            this.step = step
        }, function () {
            programCleanup.apply(this, parameterize(programCleanup, this))
        }, function () {
            resetTimeout()
            if (!delayedPlan) {
                process.stdout.write('1..' + expected + '\n')
            }
            program.apply(this, parameterize(program, this))
        }, function () {
            resetTimeout()
            if (delayedPlan) {
                process.stdout.write('1..' + expected + '\n')
            }
            if (!untidy) {
                step(function () {
                    programCleanup.apply(this, parameterize(programCleanup, this))
                }, function () {
                    resetTimeout()
                    harnessCleanup(step)
                })
            }
        }, function () {
            resetTimeout()

            var leaked = Object.keys(global).filter(function (global) { return !~globals.indexOf(global); })
            if (leaked.length) {
                bailout('Variables leaked to global namespace.', leaked)
            }

            step(function (step) {
                if (!process.stdout.write('')) {
                    process.stdout.once('drain', step())
                }
                if (!process.stderr.write('')) {
                    process.stderr.once('drain', step())
                }
            }, function () {
                process.exit(passed == expected && actual == expected ? 0 : 1)
            })
        })
    }).call(context, function (error) {
        if (error) abend(error)
    })

    function parameters (program) {
        var $ = /^function\s*[^(]*\(([^)]*)\)/.exec(program.toString())
        assert.ok($, 'bad function')
        var params = $[1].trim().split(/\s*,\s*/)
        if (params.length == 1 && params[0] == '') return []
        return params
    }

    function parameterize (program, context) {
        return parameters(program).map(function (parameter) {
            return context[parameter]
        })
    }

    function comment (string) {
        var lines = string.split(/\n/).map(function (line) { return '# ' + line })
        lines.push('')
        process.stdout.write(lines.join('\n'))
    }

    function bailout () {
        throw new Bailout(__slice.call(arguments, 0))
    }

    function abend (error) {
        var drain, message, vargs

        if (error instanceof Bailout) {
            vargs = error.vargs
        } else {
            vargs = __slice.call(arguments, 0)
        }

        if (vargs.length == 1 && vargs[0] instanceof Error) {
            vargs = [ vargs[0].message, vargs[0].stack ]
        }

        if (typeof vargs[0] == 'string' && !/\n/.test(vargs[0])) {
            message = 'Bail out! ' + vargs.shift() + '\n'
        } else {
            message = 'Bail out!\n'
        }

        process.stdout.write(message)

        if (vargs.length) {
            comment(util.format.apply(util.format, vargs))
        }

        cadence(function (step) {
            if (!process.stdout.write('')) {
                process.stdout.once('drain', step())
            }
            if (!process.stderr.write('')) {
                process.stderr.once('drain', step())
            }
        }, function () {
            process.exit(1)
        })()
    }

    function say () {
        comment(util.format.apply(util.format, arguments))
    }

    function fail (message) {
        message = message == null ? '' : ' ' + message
        process.stdout.write('not ok ' + (++actual) + message + '\n')
    }

    function assertion (name, assertion) {
        return function () {
            resetTimeout()
            var EXPECTED, inspect, message, splat
            splat = 1 <= arguments.length ? __slice.call(arguments, 0) : []
            message = splat[splat.length - 1]
            try {
                assertion.apply(this, splat)
                process.stdout.write('ok ' + (++actual) + ' ' + message + '\n')
                ++passed
                return true
            } catch (e) {
                process.stdout.write('not ok ' + (++actual) + ' ' + e.message + '\n')
                EXPECTED = name === 'ok' ? true : splat[1]
                inspect = {
                    EXPECTED: EXPECTED,
                    GOT: splat[0]
                }
                inspect = require('util').inspect(inspect, null, Math.MAX_VALUE)
                comment(inspect)
                return false
            }
        }
    }
}

function noop () { return {} }

function proof () {
    var outer = __slice.call(arguments)
    if (isNaN(outer[0])) {
        if (outer.length == 1) outer.unshift(noop)
        return function (count) {
            var inner = __slice.call(arguments, 1)
            if (inner.length == 1) inner.unshift(noop)
            execute(count, outer[0], outer[1], inner[0], inner[1])
        }
    } else {
        proof.call(null, noop, noop).apply(null, outer)
    }
}

module.exports = proof

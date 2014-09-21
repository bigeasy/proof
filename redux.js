var util = require('util'), _assert = require('assert')
var globals = Object.keys(global).concat([ 'errno' ]), __slice = [].slice

module.exports = function (sigil, outer) {
    var context = {}, passed = 0, actual = 0
    var name, expected, delayedPlan, synchronicity

    for (name in _assert) {
        if (assert[name] || name === 'AssertionError') {
            continue
        }
        assert[name] = assertion(name, _assert[name])
    }

    assert.say = say
    assert.die = die
    assert.inc = inc

    try {
        switch (typeof sigil) {
        case 'object':
            sigil.exports = function (count, inner) {
                expected = expect(count)
                outer.call(context, inner, assert, callback)
                if (outer.length == 2) callback()
            }
            break
        case 'number':
            expected = expect(count)
            inner.call(context, assert, callback)
            if (inner.length == 1) callback()
            break
        default:
            throw new Error('unknown invocation')
        }
    } catch (e) {
        die(e)
    }

    if (synchronicity) {
        finish()
    } else {
        synchronicity = true
    }

    function expect (count) {
        delayedPlan = count < 1
        expected = Math.abs(count)
        if (!delayedPlan) {
            process.stdout.write('1..' + expected + '\n')
        }
    }

    function inc (count) {
        expected += count
    }

    function comment (string) {
        var lines = string.split(/\n/).map(function (line) { return '# ' + line })
        lines.push('')
        process.stdout.write(lines.join('\n'))
    }

    function say () {
        comment(util.format.apply(util.format, arguments))
    }

    function assert () {
        var vargs = __slice.call(arguments)
        if (vargs.length == 3) {
            assert.deepEqual(vargs[0], vargs[1], vargs[2])
        } else {
            assert.ok(vargs[0], vargs[1])
        }
    }

    function assertion (name, assertion) {
        return function () {
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

    function die (error) {
        var vargs = __slice.call(arguments), count = 0, message

        if (vargs[0] instanceof Error) {
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

        function tick () {
            if (++count == 2) {
                process.exit(1)
            }
        }

        function drain (stream) {
            if (stream.write('')) {
                tick()
            } else {
                stream.once('drain', tick)
            }
        }

        drain(process.stdout)
        drain(process.stderr)
    }

    function finish () {
        if (delayedPlan) {
            process.stdout.write('1..' + expected + '\n')
        }
        var leaked = Object.keys(global).filter(function (global) {
            return !~globals.indexOf(global)
        })
        if (leaked.length) {
            die('Variables leaked to global namespace.', leaked)
        }
    }

    function callback (error) {
        if (error) {
            die(error)
        } else {
            if (synchronicity) {
                finish()
            } else {
                synchronicity = true
            }
        }
    }
}

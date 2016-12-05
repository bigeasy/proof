var util = require('util'), _assert = require('assert'), __slice = [].slice

module.exports = function (sigil, outer) {
    if (typeof sigil != 'number') {
        throw new Error('invalid arguments')
    }
    // TODO Come back and implement with Cadence. Cadence will correctly recover
    // from an exception. Just as in Arguable, I can use Interrupt to throw and
    // catch namespaced exceptions.
    return function (globals, die, process) {
        var passed = 0, actual = 0
        var name, expected, invalid, delayedPlan, synchronicity

        for (name in _assert) {
            if (assert[name] || name === 'AssertionError') {
                continue
            }
            assert[name] = assertion(name, _assert[name])
        }

        assert.say = say
//        assert.die = die
        assert.inc = inc
        assert.leak = leak

        assert.die = die = require('./die')(comment, process)

        // Catching and wrapping exceptions causes them to lose context that
        // appears to only be emitted if the exception is handled by Node.js
        // itself. Although it is possible to have syntax error messages
        // interpreted as TAP output, the non-zero exit will prevent the test
        // runner from interpreting the test as successful.
        expected = expect(sigil)
        // TODO Do not pass callback when synchronous.
        outer.call(null, assert, callback)
        if (outer.length == 1) callback()


        if (synchronicity) {
            finish()
        } else {
            synchronicity = true
        }

        function expect (count) {
            var expected = Math.abs(count)
            if (!(delayedPlan = count < 1)) {
                process.stdout.write('1..' + expected + '\n')
            }
            return expected
        }

        function inc (count) {
            expected += count
        }

        function leak () {
            globals.push.apply(globals, arguments)
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
                var vargs = __slice.call(arguments), message = vargs[vargs.length - 1]
                try {
                    assertion.apply(this, vargs)
                    process.stdout.write('ok ' + (++actual) + ' ' + message + '\n')
                    ++passed
                    return true
                } catch (e) {
                    process.stdout.write('not ok ' + (++actual) + ' ' + e.message + '\n')
                    comment(util.inspect({
                        EXPECTED: name == 'ok' ? true : vargs[1],
                        GOT: vargs[0]
                    }, null, Math.MAX_VALUE))
                    return false
                }
            }
        }

        function finish () {
            if (delayedPlan) {
                process.stdout.write('1..' + expected + '\n')
            }
            var leaked = Object.keys(global).filter(function (global) {
                return !~globals.indexOf(global)
            })
            if (leaked.length) {
                die('Variables leaked into global namespace.', leaked)
            }
            var widths = [ expected, actual, passed ].map(function (number) { return String(number).length })
            var width = Math.max.apply(Math, widths)
            function pad (number) {
                number = String(number)
                return (new Array(width + 1).join(' ') + number).substr(-Math.max(width, number.length))
            }
            process.stdout.write('# expected ' + pad(expected) + '\n')
            process.stdout.write('# passed   ' + pad(passed) + '\n')
            if (passed < expected) {
                process.stdout.write('# failed   ' + pad(expected - passed) + '\n')
            }
        }

        function callback (error) {
            if (error) {
                throw error
            } else {
                if (synchronicity) {
                    finish()
                } else {
                    synchronicity = true
                }
            }
        }
    }
}

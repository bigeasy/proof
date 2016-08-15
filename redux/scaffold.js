var slice = [].slice
var BAILOUT = {}
var util = require('util')
var deepEqual = require('deep-equal')

function pad (number, width) {
    number = String(number)
    return (new Array(width + 1).join(' ') + number).substr(-Math.max(width, number.length))
}

module.exports = function (count, exit, test) {
    return function (globals, stream) {
        var expected = Math.abs(count), passed = 0, actual = 0, delayed

        function comment (lines) {
            lines = lines.split(/\n/).map(function (line) { return '# ' + line })
            lines.push('')
            return lines.join('\n')
        }

        function assert () {
            var vargs = slice.call(arguments), ok, message
            if (vargs.length == 3) {
                ok = deepEqual(vargs[0], vargs[1], { strict: true })
                message = ' ' + vargs[2]
            } else {
                ok = !! vargs[0]
                message = vargs.length == 2 ? (' ' + vargs[1]) : ''
            }
            if (ok) {
                passed++
                stream.write('ok ' + (++actual) + message + '\n')
            } else {
                stream.write('not ok ' + (++actual) + message + '\n')
                var detail = vargs.length == 3
                           ? { EXPECTED: vargs[1], GOT: vargs[0] }
                           : { FALSE: vargs[0] }
                stream.write(comment(util.inspect(detail, { depth: null })))
            }
        }

        assert.die = function () {
            throw { isBailout: BAILOUT, vargs: slice.call(arguments) }
        }

        assert.inspect = function (value, depth) {
            stream.write(comment(util.inspect(value, { depth: depth || null })))
        }

        assert.say = function () {
            stream.write(comment(util.format.apply(util.format, slice.call(arguments))))
        }

        assert.inc = function (count) {
            expected += count
        }

        assert.leak = function () {
            globals.push.apply(globals, arguments)
        }

        function callback (error) {
            if (error) {
                if (error.isBailout === BAILOUT) {
                    var message = typeof error.vargs[0] == 'string'
                                ? (' ' + error.vargs.shift())
                                : ''
                    stream.write('Bail out!' + message + '\n')
                    if (error.vargs.length != 0) {
                        assert.inspect(error.vargs.shift())
                    }
                } else {
                    stream.write('Bail out!\n')
                    if (error.stack) {
                        assert.say(error.stack)
                    } else {
                        assert.inspect(error)
                    }
                }
                exit(1)
            } else {
                if (delayed) {
                    stream.write('1..' + expected + '\n')
                }
                var leaked = Object.keys(global).filter(function (global) {
                    return !~globals.indexOf(global)
                })
                if (leaked.length) {
                    stream.write('Bail out! Variables leaked into global namespace.\n')
                    assert.inspect(leaked)
                    exit(1)
                } else {
                    var failed = actual - passed
                    var width = Math.max.apply(Math, [
                        expected, actual, passed
                    ].map(function (number) { return String(number).length }))
                    stream.write('# expected   ' + pad(expected, width) + '\n')
                    stream.write('# passed     ' + pad(passed, width) + '\n')
                    if (failed != 0) {
                        stream.write('# failed     ' + pad(failed, width) + '\n')
                    }
                    if (actual < expected) {
                        stream.write('# missing    ' + pad(expected - actual, width) + '\n')
                    } else if (actual > expected) {
                        stream.write('# unexpected ' + pad(actual - expected, width) + '\n')
                    }
                    exit(failed == 0 && passed == expected ? 0 : 1)
                }
            }
        }

        if (!(delayed = count < 1)) {
            stream.write('1..' + expected + '\n')
        }

        try {
            test.call(null, assert, callback)
            if (test.length == 1) callback()
        } catch (error) {
            callback(error)
        }
    }
}

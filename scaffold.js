var slice = [].slice
var BAILOUT = {}
var util = require('util')
var cadence = require('cadence')

// A strict implementation of deep equal  that will print a diff statement when
// comparisons fail.
var departure = require('departure')

function pad (number, width) {
    number = String(number)
    return (new Array(width + 1).join(' ') + number).substr(-Math.max(width, number.length))
}

module.exports = function (count, test) {
    return cadence(function (async, globals, stream) {
        if ('NYC_CONFIG' in process.env) {
            globals.push('__coverage__')
        }
        var expected = Math.abs(count), passed = 0, actual = 0, delayed

        function comment (lines) {
            lines = lines.split(/\n/).map(function (line) { return '# ' + line })
            lines.push('')
            return lines.join('\n')
        }

        function okay () {
            var vargs = slice.call(arguments), ok, message, detail = null
            if (vargs.length == 3) {
                detail = departure.compare(vargs[0], vargs[1])
                ok = detail == null
                message = ' ' + vargs[2]
            } else if (vargs.length == 2) {
                ok = !! vargs[0]
                message = ' ' + vargs[1]
            } else {
                ok = true
                message = ' ' + vargs[0]
            }
            if (ok) {
                passed++
                stream.write('ok ' + (++actual) + message + '\n')
            } else {
                stream.write('not ok ' + (++actual) + message + '\n')
            }
            if (detail != null) {
                stream.write(comment(detail))
            }
        }

        okay.die = function () {
            throw { isBailout: BAILOUT, vargs: slice.call(arguments) }
        }

        okay.inspect = function (value, depth) {
            stream.write(comment(util.inspect(value, { depth: depth || null })))
        }

        okay.say = function () {
            stream.write(comment(util.format.apply(util.format, slice.call(arguments))))
        }

        okay.inc = function (count) {
            expected += count
        }

        okay.leak = function () {
            globals.push.apply(globals, arguments)
        }

        if (!(delayed = count < 1)) {
            stream.write('1..' + expected + '\n')
        }

        // Found where line numbers are added, syntax context is added. Will
        // have to read carefully to see if we can recreate, but then it would
        // be Node.js/V8 specific, specific to Node.js. Although I have no
        // intention of running in other JavaScript environments, it is probably
        // best to treat the Proof scaffold as a minimal process wrapper, let
        // Node.js do its thing.
        //
        // https://github.com/nodejs/node/blob/4db97b832b2522551d1bfacc1b95e3cbbf2df097/src/node.cc#L1440
        // Hoplessness. Add answer.
        // http://stackoverflow.com/questions/13746831/how-can-i-get-the-line-number-of-a-syntaxerror-thrown-by-requireid-in-node-js
        // So, I'm removing a try/catch block here.
        async([function () {
            if (test.length == 1) test.call(null, okay)
            else test.call(null, okay, async())
        }, function (error) {
            if (error.isBailout === BAILOUT) {
                var message = typeof error.vargs[0] == 'string'
                            ? (' ' + error.vargs.shift())
                            : ''
                stream.write('Bail out!' + message + '\n')
                if (error.vargs.length != 0) {
                    okay.inspect(error.vargs.shift())
                }
            } else {
                stream.write('Bail out!\n')
                if (error.stack) {
                    throw error
                } else {
                    okay.inspect(error)
                }
            }
            return [ async.break, 1 ]
        }], function () {
            if (delayed) {
                stream.write('1..' + expected + '\n')
            }
            var leaked = Object.keys(global).filter(function (global) {
                return !~globals.indexOf(global)
            })
            if (leaked.length) {
                stream.write('Bail out! Variables leaked into global namespace.\n')
                okay.inspect(leaked)
                return 1
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
                return failed == 0 && passed == expected ? 0 : 1
            }
        })
    })
}

var util = require('util'), __slice = [].slice

module.exports = function (comment, process) {
    return function () {
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
            // fixme: probably just want to inspect, not format.
            // fixme: does format inspect?
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
}

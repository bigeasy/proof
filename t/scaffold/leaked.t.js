var globals = Object.keys(global).concat([ 'errno' ])

require('../..')(2, function (assert) {
    var stream = require('stream')
    var scaffold = require('../../scaffold')
    var stdout = new stream.PassThrough

    globals = globals.filter(function (global) { return global != 'process' })

    scaffold(1, function (assert) {
    }, globals, function () {
        return function (message, context) {
            assert(message, 'Variables leaked into global namespace.', 'message')
            assert(context, [ 'process' ], 'context')
        }
    }, {
        stdout: stdout
    })
})

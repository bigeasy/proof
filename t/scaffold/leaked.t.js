var globals = Object.keys(global).concat([ 'errno' ])

require('../..')(2, function (assert) {
    var stream = require('stream')
    var scaffold = require('../../scaffold')
    var stdout = new stream.PassThrough

    globals = globals.filter(function (global) { return global != 'process' })

    scaffold(1, function (assert) {
    })(globals, null, {
        stdout: stdout,
        stderr: new stream.PassThrough,
        exit: function (code) {
            assert(code, 1, 'exit')
        }
    })
    assert(stdout.read().toString(), '1..1\nBail out! Variables leaked into global namespace.\n# [ \'process\' ]\n# expected 1\n# passed   0\n# failed   1\n', 'message')
})

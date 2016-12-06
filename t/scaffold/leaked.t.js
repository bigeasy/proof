var globals = Object.keys(global).concat([ 'errno' ])

require('../..')(1, function (assert) {
    var stream = require('stream')
    var scaffold = require('../../scaffold')
    var stdout = new stream.PassThrough

    globals = globals.filter(function (global) { return global != 'process' })

    try {
        scaffold(1, function (assert) {
        })(globals, { stdout: stdout })
    } catch (error) {
        assert(/^proof#leaked$/m.test(error.message), 'leaked')
        console.log(error.stack)
    }
})

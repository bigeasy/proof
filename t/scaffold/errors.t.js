require('../..')(2, function (assert) {
    var stream = require('stream')
    var scaffold = require('../../scaffold')
    var stdout = new stream.PassThrough

    try {
        scaffold(1, function (assert) {
            throw new Error('exception')
        })([], null, {
            stdout: stdout
        })
    } catch (error) {
        assert(error.message, 'exception', 'exception')
    }

    try {
        scaffold(1, function (assert, callback) {
            callback(new Error('error'))
        })([], null, {
            stdout: stdout
        })
    } catch (error) {
        assert(error.message, 'error', 'error')
    }
})

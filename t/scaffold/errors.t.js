require('../..')(2, function (assert) {
    var stream = require('stream')
    var scaffold = require('../../scaffold')
    var stdout = new stream.PassThrough

    scaffold(1, function (assert) {
        throw new Error('exception')
    }, [], function () {
        return function (error) {
            assert(error.message, 'exception', 'exception')
        }
    }, {
        stdout: stdout
    })

    scaffold(1, function (assert, callback) {
        callback(new Error('error'))
    }, [], function () {
        return function (error) {
            assert(error.message, 'error', 'error')
        }
    }, {
        stdout: stdout
    })
})

require('../..')(3, prove)

function prove (assert) {
    var exit = require('../../exit')
    exit({
        version: 'v0.10.0',
        exit: function (exitCode) {
            assert(exitCode, 1, 'version 10 exit')
        }
    })(null, 1)
    var process = { version: 'v0.12.0' }
    exit(process)(null, 1)
    assert(process.exitCode, 1, 'version 12 exit')
    try {
        exit(process)(new Error('cause'))
    } catch (error) {
        assert(error.message, 'cause', 'thrown')
    }
}

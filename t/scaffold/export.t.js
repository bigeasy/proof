var globals = Object.keys(global).concat([ 'errno' ])

require('../..')(0, function (assert) {
    if (require.main == module) {
        var stream = require('stream')
        var stdout = new stream.PassThrough
        require('./import')(globals, function () { return function (e) { throw e } }, { stdout: stdout })
        assert.inc(1)
        assert(stdout.read().toString(), 'ok 1 called\n1..1\n# expected 1\n# passed   1\n', true)
    } else {
        assert.inc(1)
        assert(true, 'called')
    }
})

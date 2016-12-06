var globals = Object.keys(global).concat([ 'errno' ])

require('../..')(1, function (assert) {
    var stream = require('stream')
    var scaffold = require('../../scaffold')
    var stdout = new stream.PassThrough

    scaffold(1, function (assert) {
        assert.say(1, 2, 3)
    })(globals, {
        stdout: stdout,
        versions: { node: '4.2.0' }
    })

    assert(stdout.read().toString(), '1..1\n# 1 2 3\n# expected 1\n# passed   0\n# failed   1\n', 'say')
})

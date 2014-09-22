var globals = Object.keys(global).concat([ 'errno' ])

require('../../redux')(1, function (assert) {
    var stream = require('stream')
    var scaffold = require('../../scaffold')
    var stdout = new stream.PassThrough

    scaffold(1, function (assert) {
        assert.say(1, 2, 3)
    }, globals, function () {}, {
        stdout: stdout
    })

    assert(stdout.read().toString(), '1..1\n# 1 2 3\n', 'say')
})

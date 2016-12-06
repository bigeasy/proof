var globals = Object.keys(global).concat([ 'errno' ])

var expected = '\
1..1\n\
not ok 1 boolean\n\
# { EXPECTED: true, GOT: false }\n\
not ok 2 equal\n\
# { EXPECTED: 2, GOT: 1 }\n\
# expected 1\n\
# passed   0\n\
# failed   1\n\
'

require('../..')(4, function (assert) {
    var stream = require('stream')
    var scaffold = require('../../scaffold')
    var stdout = new stream.PassThrough

    scaffold(1, function (assert) {
        assert(false, 'boolean')
        assert(1, 2, 'equal')
    })(globals, {
        stdout: stdout
    })

    assert(stdout.read().toString(), expected, 'assert')

    assert.ok(true, 'truth works')
    assert.equal(1 + 1, 2, 'math works')
    assert.deepEqual('a b'.split(/\s/), [ 'a', 'b' ], 'strings work')
})

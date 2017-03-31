var globals = Object.keys(global).concat([ 'errno' ])

require('../..')(30, prove)

function prove (assert) {
    var scaffold = require('../../scaffold')

    var util = require('util')
    var stream = require('stream')
    var out = new stream.PassThrough

    function noop () {}

    var expected = { exitCode: 0, message: 'exit 0' }
    function exit (exitCode) {
        assert(exitCode, expected.exitCode, expected.message)
    }

    scaffold(3, function (_assert) {
        assert(out.read().toString(), '1..3\n', 'count')
        _assert.say('hello')
        assert(out.read().toString(), '# hello\n', 'say')
        _assert.inspect('hello')
        assert(out.read().toString(), '# \'hello\'\n', 'inspect')
        _assert.leak('hello')
        assert(globals[globals.length - 1], 'hello', 'leak')
        _assert(true, 'truth')
        assert(out.read().toString(), 'ok 1 truth\n', 'boolean test passed')
        _assert(true)
        assert(out.read().toString(), 'ok 2\n', 'boolean test passed no message')
        _assert({ a: 1 }, { a: 1 }, 'equal')
        assert(out.read().toString(), 'ok 3 equal\n', 'equal test passed')
    })(globals, out, function (error, code) {
        if (error) throw error
        assert(code, 0, 'exit 0')
        assert(out.read().toString(), '# expected   3\n# passed     3\n', 'ok summary')
    })

    scaffold(0, function (_assert) {
        assert(out.read(), null, 'defered')
        _assert.inc(1)
        _assert(true, 'truth')
    })(globals, out, function (error, code) {
        if (error) throw error
        assert(code, 0, 'exit 0 delayed')
        assert(out.read().toString(), 'ok 1 truth\n1..1\n# expected   1\n# passed     1\n', 'delayed summary')
    })

    scaffold(0, function (_assert) {
        _assert.inc(2)
        _assert(false, 'truth')
        assert(out.read().toString(), 'not ok 1 truth\n', 'boolean test failed')
        _assert(1, '1', 'equal')
        assert(out.read().toString(), 'not ok 2 equal\n# ACTUAL 1\n# EXPECTED \'1\'\n# DIFF [ { kind: \'E\', lhs: 1, rhs: \'1\' } ]\n', 'equal test failed')
    })(globals, out, function (error, code) {
        if (error) throw error
        assert(code, 1, 'exit 1 not ok summary')
        assert(out.read().toString(), '1..2\n# expected   2\n# passed     0\n# failed     2\n', 'not ok summary')
    })

    scaffold(0, function (_assert) {
        _assert.die('goodbye')
    })(globals, out, function (error, code) {
        if (error) throw error
        assert(code, 1, 'exit 1 die')
        assert(out.read().toString(), 'Bail out! goodbye\n', 'bail out')
    })

    scaffold(0, function (_assert) {
        _assert.die('goodbye', { a: 1 })
    })(globals, out, function (error, code) {
        if (error) throw error
        assert(code, 1, 'exit 1 bail out inspect')
        assert(out.read().toString(), 'Bail out! goodbye\n# { a: 1 }\n', 'bail out inspect')
    })

    var expected = { exitCode: 1, message: 'exit 1 leaked' }

    var shifted = globals.shift()
    scaffold(0, function (_assert) {
    })(globals, out, function (error, code) {
        assert(code, 1, 'exit 1 leaked')
        globals.unshift(shifted)

        var leaked = '1..0\nBail out! Variables leaked into global namespace.\n# ' +
            util.inspect([ shifted ]) + '\n'
        assert(out.read().toString(), leaked, 'leaked')
    })

    scaffold(0, function (_assert) {
        throw 1
    })(globals, out, function (error, code) {
        assert(code, 1, 'exit 1 throw integer')
        assert(out.read().toString(), 'Bail out!\n# 1\n', 'throw integer')
    })

    scaffold(0, function (_assert) {
        throw new Error('hello')
    })(globals, out, function (error) {
        assert(error.message, 'hello', 'throw error')
        assert(out.read().toString(), 'Bail out!\n', 'throw error bail out')
    })

    scaffold(1, function (_assert) {
    })(globals, out, function (error, code) {
        if (error) throw error
        assert(code, 1, 'exit 1 missing tests')
        assert(out.read().toString(), '1..1\n# expected   1\n# passed     0\n# missing    1\n', 'missing tests')
    })


    var expected = { exitCode: 1, message: 'exit 1 unexpected tests' }

    scaffold(0, function (assert) {
        assert(true, 'truth')
    })(globals, out, function (error, code) {
        assert(code, 1, 'exit 1 unexpected tests')
        assert(out.read().toString(), 'ok 1 truth\n1..0\n# expected   0\n# passed     1\n# unexpected 1\n', 'unexpected summary')
    })

}

require('../..')(8, function (assert, callback) {
    var stream = require('stream'), __slice = [].slice
    var process = {}, comments = [], comment = function () {
        comments.push(__slice.call(arguments))
    }
    var die = require('../../die')(comment, process)

    var exitCount = 0
    process.exit = function (code) {
        assert(code, 1, 'exit code ' + (++exitCount))

        if (exitCount == 3) {
            assert(done, 'drained')
        }
    }
    process.stdout = new stream.PassThrough
    process.stderr = new stream.PassThrough

    die(new Error('erroneous'))

    assert(process.stdout.read().toString(), 'Bail out! erroneous\n', 'exception message')
    assert(/die.t.js/.test(comments[0]), 'exception stack')

    comments.length = 0
    process.stdout = new stream.PassThrough

    die()
    assert(process.stdout.read().toString(), 'Bail out!\n', 'default message')
    assert(comments.length, 0, 'no context')

    var stderr = new stream.Writable({ highWaterMark: 1 })
    stderr._write = function write (chunk, encoding, callback) {
        setImmediate(callback)
    }

    process.stdout = new stream.PassThrough
    process.stderr = stderr

    stderr.write('abc')
    die()

    done = true
})

var path = require('path'),
    stream = require('stream')

function createWritable (write, highWaterMark) {
    var writable = new stream.Writable({ highWaterMark: highWaterMark || 1024 * 16 })
    writable._write = write
    return writable
}

function write (chunk, encoding, callback) {
    setImmediate(callack)
}

var proof = require('../../../redux'), cadence = require('cadence')
proof(2, cadence(function (step, assert) {
    var actual = process.stdout, pseudo = new stream.PassThrough, exited
    process.exit = function (exit) {
        exited = exit
    }
    process.__defineGetter__('stdout', function () {
        return pseudo
    })
    assert.die('abend')
    process.__defineGetter__('stdout', function () {
        return actual
    })
    assert(exited, 1, 'exited')
    assert(pseudo.read().toString(), 'Bail out! abend\n', 'message')
}))

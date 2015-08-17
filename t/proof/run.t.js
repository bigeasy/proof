var success = '\
0 run  t/proof/run.t.js\n\
0 exit t/proof/run.t.js 0 null\n\
0 eof  *\n\
'

require('../..')(1, prove)

function prove (assert) {
    var run = require('../../run').raw
    var EventEmitter = require('events').EventEmitter
    var PassThrough = require('stream').PassThrough
    var stdout = new PassThrough
    var executable
    run(function () {
        return 0
    }, function (program, callback) {
        executable = new EventEmitter
        executable.stderr = new PassThrough
        executable.stdout = new PassThrough
        executable.stdin = new PassThrough
        callback(null, executable)
    }, {
        params: { processes: 1 },
        argv: [ 't/proof/run.t.js' ],
        stdout: stdout
    }, function (error, code) {
        if (error) throw error
        assert(stdout.read().toString(), success, 'success')
    })

    executable.emit('close', 0, null)
}

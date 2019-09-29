require('../..')(2, prove)

function prove (assert) {
    var kill = require('../../kill')
    kill({
        kill: function (pid, signal) {
            assert({
                pid: pid,
                signal: signal
            }, {
                pid: 1,
                signal: 'SIGKILL'
            }, 'kill process')
        },
        platform: 'win32'
    }, 1, 'SIGKILL')
    kill({
        kill: function (pid, signal) {
            assert({
                pid: pid,
                signal: signal
            }, {
                pid: -1,
                signal: 'SIGKILL'
            }, 'kill group')
        },
        platform: 'darwin'
    }, 1, 'SIGKILL')
}

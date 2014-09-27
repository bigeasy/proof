require('../..')(3, function (assert) {
    var executable = require('../../executable')
    var process = {
        //gid = 100,
        getuid: function () {
                return 701
        },
        getgid: function(gid) {
                return gid
        }
    }
    assert(executable(null, { mode: 0x1 }), 'other execute')
    assert(executable(process, { mode: 0x40, uid: 701 }), 'other execute')
    assert(executable(process, { mode: 0x1, gid: 100 }), 'other execute')
    //assert(executable(process, { mode: 0x1 }), 'other execute')
})

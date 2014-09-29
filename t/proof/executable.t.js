require('../..')(3, function (assert) {
    var executable = require('../../executable')
    var stats = { mode: 0x8, gid: 100 }
    var process = {
        //gid = 100,
        getuid: function () {
                return 701
        },
        getgid: function () {
                return gid
        },
        getgroups: function () {
                 return [ 100, 33, 19 ]
        }

    }
    assert(executable(null, { mode: 0x1 }), 'other execute')
    assert(executable(process, { mode: 0x40, uid: 701 }), 'other execute')
    assert(executable(process, stats), 'other execute')
    //                  ^^^ DOES THIS NEED TO EXECPT THE 2ND ARG? 
    console.log(process.getgroups && process.getgroups().some(function (gid) { return gid == stats.gid }))
    //assert(executable(process, { mode: 0x1 }), 'other execute')
})

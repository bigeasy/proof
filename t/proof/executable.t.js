require('../..')(4, function (assert) {
    var executable = require('../../executable')
    var stats = { mode: 0x8, gid: 100 }
    var process = {
        getuid: function () {
                return 701
        },
        getgid: function () {
                return  stats  
        },
        getgroups: function () {
                 return [ 100, 33, 19 ]
        }

    }
    assert(executable(null, { mode: 0x1 }), 'other execute')
    assert(executable(process, { mode: 0x40, uid: 701 }), 'other execute')
    assert(executable(process, stats), 'other execute')
    assert(executable(process, stats), 'other execute') // does not pass
    console.log(process.getgid() == stats.gid && stats.mode & 0x8) 
    // ^^^ returns false 
})

require('../..')(4, function (assert) {
    var executable = require('../../executable')
    var stats = { mode: 0x8, gid: 100 }
     // ^^^ named `stat` not `stats`.
    var groups = [ 100, 33, 19 ]
    var process = {
        getuid: function () {
                return 701
        },
        getgid: function () {
                return stats.gid 
        },
        getgroups: function () {
                return groups
        }

    }
    assert(executable(null, { mode: 0x1 }), 'other execute')
    assert(executable(process, { mode: 0x40, uid: 701 }), 'other execute')
    assert(executable(process, stats), 'other execute')
    assert(executable(process, stats), 'other execute') // does not pass
    // how do I return both of the object elements?
    console.log(process.getgid() == stats.gid && stats.mode & 0x8) // returns 8 
    //order of operation         ^^ order 9   ^^ order 11   ^^order 10
})

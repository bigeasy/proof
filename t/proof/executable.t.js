require('../..')(4, function (assert) {
    var executable = require('../../executable')
    //var stat = { mode: 0x8, gid: 100 }
    //var groups = [ 100, 33, 19 ]
    // var process = {}
    //process.setuid(701)
    console.log(process.getuid())

    // passsing this set of tests results in the most coverage. The stat.mode branches
    // in the 2nd and 4th assertion, however, are not covered. The 2nd assertion
    // does not pass, while the rest do.
    assert(executable(null, { mode: 0x1 }), 'other execute')
    assert(executable(process, { mode: 0x40, uid: 701 }), 'other execute')
    assert(executable(process, { mode: 0x8, gid: 100 }), 'other execute')
    assert(executable(process, { mode: 0x8, gid: 100 }), 'other execute')
})

// may need to reuse this vvv.
    /*
    var process = {
        getuid: function () {
                return 701
        },
        getgid: function () {
                return 100 
        },
        getgroups: function () {
                return groups
        }
    }
    */

require('../..')(4, function (assert) {
    var executable = require('../../executable')
    //var stat = { mode: 0x8, gid: 100 }
    var groups = [ 100, 33, 19 ]
    // var process = {}
    //process.setuid(701)
    //console.log(process.getuid())
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

    // passsing this set of tests results in the most coverage. The stat.mode branches
    // in the 2nd and 4th assertion, however, are not covered. The 2nd assertion
    // does not pass, while the rest do.
    assert(executable(null, { mode: 0x1 }), 'other execute')
        // what is a bit mask?
        // you should translate 0x40 etc. to a bit mask.
    assert(executable(process, { mode: 0x40, uid: 701 }), '*who* executes?')
                            // ^^^ what does this test?
    assert(executable(process, { mode: 0x8, gid: 100 }), '*who* executes?')
                            // ^^^ what does this test?
    assert(executable(process, { mode: 0x8, gid: 100 }), 'other execute')
        // ^^^ trying to get the fourth branch.
        // '10111101001' & '1000'
        //
        // value & mask == mask <- is set?
        // '10111101001'
        //        '1000'
        // '00000001000' == '1000'
        //
        //  value | mask <- turn on
        // '10111101001'
        //        '1000'
        // '10111101001'
        //
        //  value & ~mask <- turn off
        // '10111101001' <-
        //~'11111110111' == ~'1000'
        // '10111100001' <-
})

// may need to reuse this vvv.

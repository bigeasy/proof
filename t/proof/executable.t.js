require('../..')(5, function (assert) {
    var executable = require('../../executable')
    var stat = { mode: 0x8, gid: 100 }
    var groups = [ 100, 33, 19, 10]
    var process = {
        getuid: function () {
            return 700
        },
        getgid: function () {
            return 10
        },
        getgroups: function () {
            return groups
        }
    }

    var process2 = {
        getuid: function () {
            return 700
        },
        getgid: function () {
            return 10
       },
    }

    assert(executable(null, { mode: 0x1 }), 'other execute')
    assert(executable(process, { mode: 0x40, uid: 700 }), 'uid execute')
    assert(executable(process, { mode: 0x8, gid: 10 }), 'groups execute')
    assert(executable(process2, { mode: 0x8, gid: 10 }), 'gid execute')
    assert(!executable(process2, { mode: 0x180, gid: 19}), 'cannot execute')

// LESSON:
    // what is a bit mask?
    // bit mask  0x1: 000000001
    // bit mask 0x40: 001000000
    // bit mask  0x8: 000001000

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

require('../..')(4, function (assert) {
    var executable = require('../../executable')
    var stat = { mode: 0x8, gid: 100 }
    var groups = [ 100, 33, 19 ]

    assert(executable(null, { mode: 0x1 }), 'other execute')
    assert(executable(process, { mode: 0x40, uid: 701 }), 'other execute')
    assert(executable(process, stat), 'other execute')
    assert(executable(process, { mode: 0x8, gid: 100 }), 'other execute') // does not pass
    // There is more covarage if the 2nd and 4th conditional are changed in `executable.js`
    // but that is not allowed. It does mean, however, that consideration must be paid to 
    // the order of the test. 
    // QUESTION: how come order of the conditionals in `executable.js` 
    // matters? 
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

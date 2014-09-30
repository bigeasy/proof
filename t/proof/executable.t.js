require('../..')(4, function (assert) {
    var executable = require('../../executable')
    var stat = { mode: 0x8, gid: 100 }
    var groups = [ 100, 33, 19 ]
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
    assert(executable(null, { mode: 0x1 }), 'other execute')
    assert(executable(process, { mode: 0x40, uid: 701 }), 'other execute')
    assert(executable(process, stat), 'other execute')
    assert(executable(process, { mode: 0x8, gid: 100 }), 'other execute') // does not pass
    // how come this ^^^ is not covered while the 2nd assertion is?
    // it is not the order in which process is called. See console.log below, and I changed the 
    // order in `executable.js`
    // does it have to do with uid vs. gid?

    //              vvv changing the order does not appear to keep these vvv from evaluating true
    console.log((process.getgid() == stat.gid && stat.mode & 0x8) == (stat.gid ==  process.getgid() && stat.mode & 0x8))  
    console.log((process.getgid() == stat.gid) == (stat.gid  == process.getgid()))  
})

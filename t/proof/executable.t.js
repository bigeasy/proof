require('../..')(4, function (assert) {
    var executable = require('../../executable')
    var stat = { mode: 0x8, gid: 100 }
    var groups = [ 100, 33, 19 ]
    var process = {
        getuid: function () {
                return 701
        },
        getgid: function () {
                return stat.gid 
        },
        getgroups: function () {
                return groups
        }

    }
    assert(executable(null, { mode: 0x1 }), 'other execute')
    assert(executable(process, { mode: 0x40, uid: 701 }), 'other execute')
    assert(executable(process, stat), 'other execute')
    assert(executable(process, stat), 'other execute') // does not pass

    // vvv Testing variables:
    console.log((stat.mode & 0x8) && (process.getgid() == stat.gid)) // returns 2nd test: true
    //order of operation  ^10     ^^ order 11          ^^order 9
    console.log((process.getgid() == stat.gid) && (stat.mode & 0x8)) // returns 2nd test: 8 
    console.log("stat.git", stat.gid)
    console.log("process.getgid()", process.getgid())
    console.log("stat.mode", stat.mode)
    console.log((stat.mode & 0x8) === 8) // <- this is true
    console.log(stat.mode === 8) // <- this is true 
    console.log(stat.mode === (stat.mode & 0x8)) // <- this is true
    console.log(stat.mode === (2*4)) // <- this is true 
    // vvv these evaluate to false. a comparison btw 2 are made evaluating to true
    //     true is then compared to 8, which is false. 
    console.log(stat.mode == (2*4) == 8) 
    console.log((16/2) == (2*4) == 8) 
    console.log(stat.mode == (stat.mode & 0x8) == 8) 
    // vvv this evalutes to true because 2 true comparisons are evaluated.
    console.log((stat.mode == (2*4)) == ((stat.mode & 0x8) == 8)) // <- this is false 
})

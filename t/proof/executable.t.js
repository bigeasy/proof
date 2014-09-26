require('../..')(2, function (assert) {
    var executable = require('../../executable')
    var process = {
        getuid: function () {
                    return 701
                }
            }
    assert(executable(null, { mode: 0x1 }), 'other execute')
    assert(executable(process, { mode: 0x40, uid: 701 }), 'other execute')
})

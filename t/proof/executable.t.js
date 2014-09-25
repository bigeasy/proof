require('../..')(1, function (assert) {
    var executable = require('../../executable')
    assert(executable(null, { mode: 0x1 }), 'other execute')
})

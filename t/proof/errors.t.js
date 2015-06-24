require('../..')(1, prove)

function prove (assert) {
    var errors = require('../../errors')({ params: {} })

    assert(errors({ type: 'run' }), [], 'run')
}

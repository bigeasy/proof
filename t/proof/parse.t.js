require('../..')(1, prove)

function prove (assert) {
    assert(require('../../parse'), 'require')
}

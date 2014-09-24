require('../..')(1, function (assert) {
    leak = true
    assert.leak('leak')
    assert(true, 'ok')
})

require('../..')(1, function (assert) {
    try {
        require('../..')([])
    } catch (e) {
        assert(e.message, 'invalid arguments', 'invalid arguments')
    }
})

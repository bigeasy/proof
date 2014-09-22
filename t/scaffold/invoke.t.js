require('../../redux')(1, function (assert) {
    try {
        require('../../redux')([])
    } catch (e) {
        assert(e.message, 'invalid arguments', 'invalid arguments')
    }
})

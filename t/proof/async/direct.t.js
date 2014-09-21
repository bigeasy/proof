require('../../../redux')(1, function (assert, callback) {
    assert(true, 'single assertion')
    callback()
})

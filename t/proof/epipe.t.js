require('../..')(2, prove)

function prove (assert) {
    var epipe = require('../../epipe')
    var error = new Error
    error.code = 'EPIPE'
    epipe({
        exit: function (code) {
            assert(code, 1, 'epipe caught')
        }
    })(error)

    try {
        epipe({})(new Error('uncaught'))
    } catch (error) {
        assert(error.message, 'uncaught', 'uncaught error')
    }
}

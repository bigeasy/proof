require('../..')(module, function (body, assert, callback) {
    require('cadence')(body).call(this, assert, callback)
})

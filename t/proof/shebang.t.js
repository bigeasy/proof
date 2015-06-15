require('../..')(3, require('cadence/redux')(prove))

function prove (async, assert) {
    var path = require('path')
    var shebang = require('../../shebang'), path = require('path')
    async(function () {
        shebang('unix', path.join(__dirname, 'fixtures/shebang/first/program'), [], async())
    }, function (program, parameters) {
        assert(path.basename(program), 'program', 'shebang program')
        assert(parameters, [], 'shebang parameters')
    }, [function () {
        shebang('unix', path.join(__dirname, 'fixtures/shebang/unset'), [], async())
    }, function (error) {
        assert(error.message, 'set execute bit to use shebang line', 'set execute bit')
    }])
}

require('../..')(2, require('cadence')(function (step, assert) {
    var path = require('path')
    var shebang = require('../../shebang'), path = require('path')
    step(function () {
        shebang('unix', path.join(__dirname, 'fixtures/shebang/first/program'), [], step())
    }, function (program, parameters) {
        assert(path.basename(program), 'program', 'shebang program')
        assert(parameters, [], 'shebang parameters')
    })
}))

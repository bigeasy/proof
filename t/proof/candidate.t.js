require('../..')(2, require('cadence')(function (step, assert) {
    var candidate = require('../../candidate'), path = require('path')
    step(function () {
        var base = path.join(__dirname, 'fixtures', 'candidate')
        var parts = [ 'first', 'second', 'third' ].map(function (part) {
            return path.join(base, part)
        })
        var PATH = parts.join(path.delimiter)

        step(function () {
            candidate(PATH, 'program', step())
        }, function (found) {
            assert(found, path.join(parts[2], 'program'), 'found')
        })

        step(function () {
            candidate(PATH, '_program', step())
        }, function (missing) {
            assert(!missing, 'missing')
        })
    })
}))

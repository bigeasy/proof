require('../..')(2, require('cadence')(prove))

function prove (async, assert) {
    var candidate = require('../../candidate'), path = require('path')
    async(function () {
        var base = path.join(__dirname, 'fixtures', 'candidate')
        var parts = [ 'first', 'second', 'third' ].map(function (part) {
            return path.join(base, part)
        })
        var PATH = parts.join(path.delimiter)

        async(function () {
            candidate(PATH, 'program', async())
        }, function (found) {
            assert(found, path.join(parts[2], 'program'), 'found')
        })

        async(function () {
            candidate(PATH, '_program', async())
        }, function (missing) {
            assert(!missing, 'missing')
        })
    })
}

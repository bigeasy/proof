require('../..')(2, require('cadence')(function (async, assert) {
    var pump = require('../../pump')
    var stream = require('stream')
    var input, output

    async(function () {
        input = new stream.PassThrough, output = new stream.PassThrough
        pump(input, output, function (line) {
            return [ '<' + line + '>' ]
        }, async())
        input.write('1')
        input.write('2')
        input.write('\n')
        input.write('3')
        input.end()
    }, [function () {
        assert(output.read().toString(), '<12>\n<3>\n', 'transformed')
        input = new stream.PassThrough, output = new stream.PassThrough
        pump(input, output, function (line) { throw new Error('e') }, async())
        input.write('1\n')
        input.write('3')
    }, function (errors, error) {
        assert(error.message, 'e', 'error')
    }])
}))

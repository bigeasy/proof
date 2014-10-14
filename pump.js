var byline = require('byline')
var cadence = require('cadence')
var ev = require('cadence/event')
var domain = require('domain')

module.exports = cadence(function (async, input, output, transform) {
    async(function () {
        var catcher = async(Error)
        var stream = byline(input, { keepEmptyLines: true })
        function data (line) {
            try {
                transform(line).forEach(function (line) {
                    output.write(line)
                    output.write('\n')
                })
            } catch (e) {
                catcher(e)
            }
        }
        stream.on('data', data)
        async([function () { stream.removeListener('data', data) }])
        async(ev, stream).on('end')
        // todo: async(ev, input, output, stream).on(Error)
        async(ev, input).on(Error)
        async(ev, output).on(Error)
        async(ev, stream).on(Error)
    })
})

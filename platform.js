var cadence = require('cadence')

exports.check = cadence(function (async, options, process) {
    for (var i = 0, I = options.argv.length; i < I; i++) {
        if (options.argv[i] == process.platform) {
            return 0
        }
    }
    return 1
})

exports.platform = function (options, callback) {
    if (options.params.help) options.help()
    exports.check(options, process, callback)
}

var cadence = require('cadence')

module.exports = cadence(function (async, options, process) {
    for (var i = 0, I = options.argv.length; i < I; i++) {
        if (options.argv[i] == process.platform) {
            return 0
        }
    }
    return 1
})

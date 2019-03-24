var cadence = require('cadence')

module.exports = cadence(function (async, arguable, process) {
    for (var i = 0, I = arguable.argv.length; i < I; i++) {
        if (arguable.argv[i] == process.platform) {
            arguable.exitCode = 0
            return []
        }
    }
    arguable.exitCode = 1
    return []
})

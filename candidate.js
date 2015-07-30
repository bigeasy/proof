var fs = require('fs'), path = require('path')
var cadence = require('cadence')

var candidate = cadence(function (async, PATH, executable) {
    var parts = PATH.split(path.delimiter), files = []
    parts.forEach(function (part) {
        files.push(path.resolve(part, executable + '.bat'))
        files.push(path.resolve(part, executable + '.cmd'))
        files.push(path.resolve(part, executable + '.exe'))
        files.push(path.resolve(part, executable))
    })
    var file = async(function () {
        if (!files.length) return [ file.break ]
    }, [function () {
        fs.stat(files[0], async())
    }, /^ENOENT$/, function () {
        files.shift()
        return [ file.continue ]
    }], function (stat) {
        if (stat.isFile()) {
            return [ file.break, files[0] ]
        } else {
            files.shift()
        }
    })()
})

module.exports = candidate

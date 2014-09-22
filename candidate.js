var fs = require('fs'), path = require('path')
var cadence = require('cadence'), ev = require('cadence/event')

var candidate = cadence(function (step, PATH, executable) {
    var parts = PATH.split(path.delimiter), files = []
    parts.forEach(function (part) {
        files.push(path.resolve(part, executable + '.bat'))
        files.push(path.resolve(part, executable + '.cmd'))
        files.push(path.resolve(part, executable + '.exe'))
        files.push(path.resolve(part, executable))
    })
    var file = step(function () {
        if (!files.length) return [ file ]
    }, [function () {
        fs.stat(files[0], step())
    }, /^ENOENT$/, function () {
        files.shift()
        return [ file() ]
    }], function (stat) {
        if (stat.isFile()) {
            return [ file, files[0] ]
        } else {
            files.shift()
        }
    })()
})

module.exports = candidate

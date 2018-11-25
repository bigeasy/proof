var fs = require('fs')
var path = require('path')
var cadence = require('cadence')

module.exports = cadence(function (async, PATH, executable) {
    var parts = PATH.split(path.delimiter), files = []
    parts.forEach(function (part) {
        files.push(path.resolve(part, executable + '.bat'))
        files.push(path.resolve(part, executable + '.cmd'))
        files.push(path.resolve(part, executable + '.exe'))
        files.push(path.resolve(part, executable))
    })
    async.loop([], function () {
        if (!files.length) return [ async.break ]
    }, [function () {
        fs.stat(files[0], async())
    }, /^ENOENT$/, function () {
        files.shift()
        return [ async.continue ]
    }], function (stat) {
        if (stat.isFile()) {
            return [ async.break, files[0] ]
        } else {
            files.shift()
        }
    })
})

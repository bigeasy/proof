var fs = require('fs'), path = require('path'), spawn = require('child_process').spawn
var cadence = require('cadence')
var candidate = require('./candidate')
var executable = require('./executable')

// To do this right, we'd read through the Windows registry, but we really
// don't want to go digging into it a this point. Not that difficult, since
// there are command line utilities we can invoke to get a list of file
// associations.
module.exports = cadence(function (async, platform, program, parameters) {
    var isWindows = ! platform.indexOf('win')
    if (isWindows) {
        switch (path.extname(program)) {
        case '.exe':
        case '.bat':
        case '.cmd':
            return [ program, parameters ]
        default:
            async(function () {
                fs.readFile(program, async())
                fs.stat(program, async())
            }, function (buffer, stat) {
                var resolve, first = '', $
                if (buffer[0] == 0x23 && buffer[1] == 0x21) {
                    var first = buffer.toString().split(/\n/).shift()
                }
                if ($ = /^#!\/usr\/bin\/env\s+(\S+)/.exec(first)) {
                    resolve = $[1]
                } else if ($ = /^#!\/.*\/(.*)/.exec(first)) {
                    resolve = $[1]
                } else {
                    return [ 'node', [ program ].concat(parameters) ]
                }
                async(function () {
                    candidate(process.env.PATH, resolve, async())
                }, function (resolved) {
                    return [ resolved, [ program ].concat(parameters) ]
                })
            })
        }
    } else {
        async(function () {
            fs.stat(program, async())
        }, function (stat) {
            if (executable(process, stat)) {
                return [ program, parameters ]
            }
            async(function () {
                fs.readFile(program, async())
            }, function (buffer) {
                // no exec bit, but there's a shebang line? I call shenanigans.
                if (buffer[0] == 0x23 && buffer[1] == 0x21) {
                    throw new Error('set execute bit to use shebang line')
                }
                parameters.unshift(program)
                return [ 'node', parameters ]
            })
        })
    }
})

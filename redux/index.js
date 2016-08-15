var scaffold = require('./scaffold')
var globals = Object.keys(global).concat([ 'errno' ])

function noop () {}

module.exports = function (module, count, test) {
    var isMainModule
    if (typeof module == 'object') {
        isMainModule = require.main === module
    } else {
        isMainModule = true
        test = count
        count = module
        module = {}
    }
    if (typeof count != 'number') {
        test = count
        count = 0
    }
    var scaffolded = scaffold(count, test)
    if (isMainModule) {
         scaffolded(globals, process.stdout, require('../exit'), noop)
    } else {
        module.exports = function (options, callback) {
            var run = {
                stream: options.stream || new stream.PassThrough,
                globals: options.globals || Object.keys(globals).concat([ 'errno' ]),
                exit: options.exit || function (exitCode) { run.exitCode = exitCode }
            }
            scaffolded(run.globals, run.stream, run.exit, callback || noop)
        }
    }
}

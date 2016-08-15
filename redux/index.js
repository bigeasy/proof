var scaffold = require('./scaffold')
var globals = Object.keys(global).concat([ 'errno' ])

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
    var prove = module.exports = scaffold(count, test)
    if (isMainModule) {
         prove(globals, process.stdout, require('../exit'))
    }
}

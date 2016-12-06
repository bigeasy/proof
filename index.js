var globals = Object.keys(global).concat([ 'errno' ])

module.exports = function () {
    var vargs = [].slice.call(arguments), module = null
    if (typeof vargs[0] == 'object') {
        module = vargs.shift()
    }
    var scaffold = require('./scaffold')(vargs[0], vargs[1])
    if (module) {
        module.exports = scaffold
    }
    if (!module || require.main === module) {
        scaffold(globals, process)
    }
}

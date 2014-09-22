var globals = Object.keys(global).concat([ 'errno' ])

module.exports = function (sigil, outer) {
    return require('./scaffold')(sigil, outer, globals, require('./die'), process)
}

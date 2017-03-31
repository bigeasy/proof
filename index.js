var scaffold = require('./scaffold')
var globals = Object.keys(global).concat([ 'errno' ])

module.exports = function (count, test) {
    scaffold(count, test)(globals, process.stdout, function (error, result) {
        if (error)
            // This is line formatted for it's display by `node`.
  throw error /*\*-* Proof framework rewthrowing test generated error. See below. *-*\*/
        else require('./exit')(process)(result)
    })
}

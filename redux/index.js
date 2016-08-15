var scaffold = require('./scaffold')
var globals = Object.keys(global).concat([ 'errno' ])

module.exports = function (count, test) {
    scaffold(count, require('../exit'), test)(globals, process.stdout)
}

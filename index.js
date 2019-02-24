var scaffold = require('./scaffold')
var globals = Object.keys(global).concat([ 'errno' ])

module.exports = function (count, test) {
    scaffold(count, test, {
        NYC_CONFIG: [ '__coverage__' ]
    })(globals, process.stdout, require('./exit')(process))
}

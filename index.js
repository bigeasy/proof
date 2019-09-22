var scaffold = require('./scaffold')
var globals = Object.keys(global).concat([ 'errno' ])

require('./reject')(process)

module.exports = async function (count, test) {
    process.exitCode = await scaffold(count, test, {
        NYC_CONFIG: [ '__coverage__' ]
    })(globals, process.stdout, require('./exit')(process))
}

var scaffold = require('./scaffold')
var globals = Object.keys(global).concat([ 'errno' ])

process.on('unhandledRejection', error => {
  throw error /*\*-* Proof framework rewthrowing test generated error. See below. *-*\*/
})
module.exports = async function (count, test) {
    process.exitCode = await scaffold(count, test, {
        NYC_CONFIG: [ '__coverage__' ]
    })(globals, process.stdout, require('./exit')(process))
}

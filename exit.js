module.exports = function (process) {
    return function (error, exitCode) {
        if (error) {
            // This is line formatted for it's display by `node`.
  throw error /*\*-* Proof framework rewthrowing test generated error. See below. *-*\*/
        } else if (/^v0\.10\./.test(process.version)) {
            // TODO Maybe bring your arguable exit code hack over here?
            process.exit(exitCode)
        } else {
            process.exitCode = exitCode
        }
    }
}

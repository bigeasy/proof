module.exports = function (process) {
    return /^v0\.10\./.test(process.version)
         ? function (exitCode) { process.exit(exitCode) }
         : function (exitCode) { process.exitCode = exitCode }
}

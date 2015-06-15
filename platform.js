function platform (options) {
    if (options.params.help) options.help()
    options.argv.forEach(function (platform) {
        if (process.platform == platform) process.exit(0)
    })
    process.exit(1)
}

module.exports = platform

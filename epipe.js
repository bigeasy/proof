module.exports = function (exitable) {
    return function (error) {
        if (error.code == 'EPIPE') {
            exitable.exit(1)
        } else {
            throw error
        }
    }
}

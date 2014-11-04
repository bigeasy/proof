module.exports = function (func, stream) {
    return function(arg) {
            var written = func(arg)
            return stream.write(written/*func(arg)*/)
    }
}

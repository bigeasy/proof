module.exports = function (func, stream) {
    return function(arg) {
        stream.write(func(arg))
    }
}

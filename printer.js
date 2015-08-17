module.exports = function (func, out, err) {
    return function(arg) {
        out.write(func(arg))
    }
}

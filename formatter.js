module.exports = function (func) {
    return function (arg) {
        var arr = func(arg)
        return arr.join('')
    }
}

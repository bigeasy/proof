module.exports = function (func) {
    return function(arg) {
        return func(arg)
    }
}

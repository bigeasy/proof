module.exports = function (func) {
    return function (event, state) {
        var arr = func(event, state)
        return arr.join('')
    }
}

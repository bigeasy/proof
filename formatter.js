module.exports = function (func) {
    return function (event, state) {
        return func(event, state).join('')
    }
}

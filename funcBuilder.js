module.exports = function (func) {
    return function (arr) {
        return func(arr).join('\n') + ('\n')
    } 
}

module.exports = function (func) {
    return function (arg) {
        var arr = [ arg ]
        return func(arr).join('\n') + ('\n')
    } 
}

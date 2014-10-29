module.exports = function (func) {
    return function (arg) { // <- wrapper
        var arr = [ arg ]
        return func(arr).join('\n') + ('\n')
    } 
}

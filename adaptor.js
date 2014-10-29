// This generates a function, which accepts a single argument (what do `you` mean as a scalar argument?)
module.exports = function (func) {
    return function (arg) { // <- wrapper
        var arr = [ arg ]
        return func(arr).join('\n') + ('\n')
    } 
}

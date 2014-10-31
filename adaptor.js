module.exports = function (func) {
    return function (arg) {
        //var arr = [ arg ] // <- does not need to wrap arg in a array
        return func(arg).join('\n') + ('\n')
    } 
}

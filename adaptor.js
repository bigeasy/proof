module.exports = function (func) {
    return function (arg) {
        return ((func(arg).join('\n') + ('\n')) == '\n' ) ? ('') : func(arg).join('\n') + ('\n') 
    } 
}

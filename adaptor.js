module.exports = function (func) {
    return function (arg) {
        return (arg == null) ? ('') : func(arg).join('\n') + ('\n')
    } 
}

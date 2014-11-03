module.exports = function (func) { // adaptor cannot be wrapper specific.
    return function (arg) {
        return ((func(arg).join('\n') + ('\n')) == '\n' ) ? ('') : func(arg).join('\n') + ('\n') 
        //if (func(arg).join('\n') + ('\n')) == '\n' ) return ('')
        //else if (
    } 
}

module.exports = function (func) {
    return function (arg) {

        if (func(arg).length == 0) {
            return ('')
        } 
        
        for (var i = 0; i < func(arg).length; i++) {
            if (String(func(arg)[i]).length == 0) {
                return ('\n')
            }
        }
        
        return func(arg).join('\n') + ('\n')
    }
}

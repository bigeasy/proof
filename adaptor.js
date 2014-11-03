module.exports = function (func) {
    return function (arg) {
        var arr = func(arg)

        if (arr.length == 0) {
            return ('')
        } 
        
        return arr.join('\n') + ('\n')

    }
}

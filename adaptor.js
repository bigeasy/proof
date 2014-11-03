module.exports = function (func) { // adaptor cannot be wrapper specific.
    return function (arg) {
        var arr = func(arg)

        if (arr.length == 0) {
            return ('')
        } 
        
        for (var i = 0; i < arr.length; i++) {
            if (String(arr[i]).length == 0) {
                return ('\n')
            }
        }
        
        return arr.join('\n') + ('\n')

    }
}

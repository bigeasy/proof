module.exports = function (arr) {
    var e = new Error('Array element not a string')

    function addLength(arr, e) {
        var e = new Error('Array element not a string')
        var a = []
        var i = 0 
        for (i; i < arr.length; i++) {
            if (typeof(arr[i]) != 'string') {
                throw e
            } else {
                a.push(arr[i].length, arr[i])
            }   
        }
        return a
    }

    try {
        var a = addLength(arr)
        return a
    } catch (e) {throw e}

}

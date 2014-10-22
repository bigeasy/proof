module.exports = function (arr) {

        var a = []
        var i = 0 
        for (i; i < arr.length; i++) {
            if (typeof(arr[i]) != 'string') {
                throw new Error('Array element not a string.')
            } else {
                a.push(arr[i].length, arr[i])
            }   
        }
        return a
}

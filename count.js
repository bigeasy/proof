module.exports = function (arr) {
    var i = 0 
    var a = []
    for (i; i < arr.length; i++) {
        if (typeof(arr[i]) != 'string') {
            return console.log( arr[i] + " element not a string.")
        } else {
            a.push(arr[i].length, arr[i])
        }   
    }
    return a
}

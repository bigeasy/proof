module.exports = function (func) {
    return function (arr) {
    // Use the array join method.
        var a = func(arr)
        var lastElement = a.pop()
        var push = lastElement.concat('\n') 
        a.push(push)
        return a.toString().replace(/,/g, '\n')
    } 
}

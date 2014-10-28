module.exports = function (func) {
    return function (arr) {
        var a = func(arr)
        var lastElement = a.pop()
        var push = lastElement.concat('\n') 
        a.push(push)
        return a.toString().replace(/,/g, '\n')
    } 
}

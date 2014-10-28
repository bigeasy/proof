module.exports = function (func) {
    return function (arr) {
        var a = func(arr).join() + ('\n')
        return a.replace(/,/g, '\n')
    } 
}

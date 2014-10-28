module.exports = function (func) {
    return function (arr) {
        return func(arr).toString().replace(',', '\n')
    } 
}

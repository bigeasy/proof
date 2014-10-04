var __slice = [].slice

module.exports = function (destination) {
    var sources = __slice.call(arguments, 1)
    var destination
    sources.forEach(function (source) {
        for (var key in source) destination[key] = source[key]
    })
    return destination
}

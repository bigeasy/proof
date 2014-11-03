module.exports = function (arg) {
    return (arg == null) ? [] : [String(arg).length, String(arg)]
}

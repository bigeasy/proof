module.exports = function (arg) {
    return (arg == null) ? [] : [String(arg).length, '\n', String(arg), '\n']
}

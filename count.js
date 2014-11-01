module.exports = function (arg) {
        if (arg == null) {
            return []
        } else {
            arg = String(arg)
            return [arg.length, arg]
        }
}

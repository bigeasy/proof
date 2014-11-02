module.exports = function (arg) {
        if (arg == null) {
            return [] // this is returned when no arguments. see adaptor test.
        } else {
            arg = String(arg)
            return [arg.length, arg]
        }
}

module.exports = function (arg) {
        var i = 0 
        if (arg == null) {
            return []
        } else {
            arg = String(arg)
            return [arg.length, arg]
        }
}

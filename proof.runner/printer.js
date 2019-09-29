module.exports = function (func, out, err) {
    return function(event, state) {
        out.write(func(event, state))
    }
}

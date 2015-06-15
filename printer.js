module.exports = function (func, out, err) {
    return function(arg) {
        out.write(func(arg))
        if (arg.type === 'error') {
            err.write('error: ' + arg.message + '\n')
        }
    }
}

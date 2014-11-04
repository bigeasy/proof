module.exports = function (func, stream) {
    return function(arg) {
            stream.write(arg)
            return func(stream.read().toString()) 
    }
}

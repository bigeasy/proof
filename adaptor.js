module.exports = function (func) {
    console.log("func " + typeof(arg))
    return function (arg) {
        console.log("Inside adaptor. Testing arg type: " + typeof(arg))
        return (arg == []) ? ('') : func(arg).join('\n') + ('\n') //<- this arg needs to be an array
    } 
}
// The adaptor function does not make any decisions based on arguments.
// The adaptor does not inspect the arguments.
// The adaptor formats an array of lines for printing.
//

module.exports = function (func) { // <- this is taking count. 
    // anything here will be executed when adaptor takes its function argument.
    // it does not carry into the scope below.
    return function (arg) {
        console.log("Inside adaptor. Testing arg type: " + arg)
        return (arg == []) ? ('') : func(arg).join('\n') + ('\n') //<- this arg needs to be an array
    } 
}
// The adaptor function does not make any decisions based on arguments.
// The adaptor does not inspect the arguments.
// The adaptor formats an array of lines for printing.
//

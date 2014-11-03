module.exports = function (func) { // <- this is taking count. 
    // anything here will be executed when adaptor takes its function argument.
    // it does not carry into the scope below.
    return function (arg) { //<- if this arg is left empty...
        console.log("Inside adaptor. Testing arg type: " + arg) //... then this is undefined 
        return (arg == []) ? ('') : func(arg).join('\n') + ('\n') //<-ternary op needs to be removed 
        // ^^^ does not make any decisions nor inspect the args.
    } 
}
// The adaptor function does not make any decisions based on arguments.
// The adaptor does not inspect the arguments.
// The adaptor formats an array of lines for printing.
//

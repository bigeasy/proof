module.exports = function (func) {
    return function (arg) {
        return  func(arg).join('\n') + ('\n') 
                                              //    the func returns an array. the join method
                                              //    uses newline as a deliminator. It then adds
                                              //    a new line to the end. If the array is empty
                                              //    there is no join, but it adds a newline. 
                                              //    Instead of a newline I want to add ('').
                                              //    How is this done w/ the restraints below?
    } 
}
// The adaptor function does not make any decisions based on arguments.
// The adaptor does not inspect the arguments.
// The adaptor formats an array of lines for printing.
//

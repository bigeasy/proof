var extend = require('./extend')// <-THIS IS IN PROOF and JSON 
// ^^^ this is also module.exports


// 'exports collects properties and attaches them to module.exports if module.exports
// doesn't have something on it already. If there is something attached to module.-
// exports already, everything in exports is ignored.'
//
// how should this be exported? In Proof it  was export will change this to module.exports
// in order to stay consistent with extend.
module.exports = function (out) { // <- takes a stream
    var object = {}
    return function (event) {
        var comment, file, message, passed, skip, time, todo
        switch (event.type) {
            case 'run':
                object[event.file] = {
                    time: event.time,
                    expected: event.expected,
                    tests: []
                }
                break
            case 'plan':
                object[event.file].expected = event.expected
                break
            case 'test':
                object[event.file].tests.push({
                    message: event.message,
                    time: event.time,
                    passed: event.passed,
                    skip: event.skip,
                    todo: event.todo,
                    comment: event.comment
                })
                break
            case 'exit':
                extend(object[event.file], {
                    actual: event.actual,
                    duration: event.time - event.start,
                    code: event.code
                })
                break
            case 'eof':
                // vv this needs to change
                console.log(object)
                out.write(JSON.stringify(object, null, 2)) // how does this make it to chunks?
                out.write('\n') // what is the newline character for in this case? A newline a the end?
                // there is no difference in the assertion test if it is there or not. 
                break
        }
    }
}

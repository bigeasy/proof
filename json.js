var printer = require('./printer')
var extend = require('./extend')

module.exports = function (out) { // <- takes a stream
    var object = {}
    var arr = [] // <- this is my array
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
                // NEEDS TO RETURN AN ARRAY. Does it need to have a stream enclosed in it? 

                // vvv ONE:
                //arr.push(JSON.stringify(object, null, 2))
                //arr.push('\n')

                // vvv TWO:
                // Each call to push vvv, pushes the string from write as well as a boolean.  
                // These 2 function produce an array with 4 elements.
                //arr.push(out.write(JSON.stringify(object, null, 2)))
                //arr.push(out.write('\n'))

                // vvv OLD:
                out.write(JSON.stringify(object, null, 2))
                out.write('\n')
                break
        }
        //return arr // <- it is returned everytime.
    }
}

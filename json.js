
exports.json = function (out) {
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
                out.write(JSON.stringify(object, null, 2))
                out.write('\n')
                break
        }
    }
}

function json () {
    process.stdin.resume()
    parse(process.stdin, exports.json(process.stdout))
}

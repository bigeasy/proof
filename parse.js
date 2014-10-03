module.exports = function (done, abend, parser, extend, callback) {
    var programs = {}
    var out = [''][0]
    var count = 0
    return function (line) {
        count++
        var $
        if (!($ = /^(\d+)\s+(\w+)\s+([^\s]+)\s?(.*)$/.exec(line))) {
            abend('cannot parse runner output at line ' + count + ': invalid syntax')
        }
        var time = parseInt($[1], 10)
        var type = $[2]
        var file = $[3]
        var rest = $[4]
        var event, program, expected, code
        if (!programs[file]) {
            programs[file] = {
                passed: 0,
                actual: 0
            }
        }
        program = programs[file]
        switch (type) {
            case 'test':
                event = parser.assertion(rest)
                program.actual++
                if (event.ok) {
                    program.passed++
                }
                callback(extend(event, program, {
                    time: time,
                    file: file,
                    type: type
                }))
                break
            case 'run':
                program.start = time
                callback(extend(program, {
                    time: time,
                    type: type,
                    file: file
                }))
                break
            case 'plan':
                expected = parseInt(rest, 10)
                callback(extend(program, {
                    time: time,
                    file: file,
                    type: type,
                    expected: expected
                }))
                break
            case 'bail':
                event = parser.bailout(rest)
                program.bailed = true
                callback(extend(event, program, {
                    time: time,
                    file: file,
                    type: type
                }))
                break
            case 'exit':
                code = parseInt(rest, 10)
                if (isNaN(code)) {
                    abend('cannot parse runner test exit code at line ' + count + ': exit code ' + rest)
                }
                callback(extend({}, program, {
                    code: code,
                    file: file,
                    type: type,
                    time: time
                }))
                break
            case 'err':
            case 'out':
                callback({
                    time: time,
                    type: type,
                    file: file,
                    line: rest
                })
                break
            case 'eof':
                callback({
                    time: time,
                    type: type
                })
                done[0] = true
                break
            default:
                abend('cannot parse runner output at line ' + count + ': unknown line type ' + type)
        }
    }
}

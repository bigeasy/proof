var byline = require('byline')
var extend = require('./extend')
var tap = require('./tap')

function parse (stream, consumer) {
    var count = 0, eof = false, programs = {}

    stream = byline.createStream(stream)

    stream.on('end', function () {
        if (count && !eof) {
            process.exit(1)
        }
    })

    stream.on('data', data)

    function abend (message) {
        consumer({ type: 'error', message: message })
    }

    function data (line) {
        if (!consume(line)) {
            stream.removeListener('data', data)
        }
    }

    function consume (line) {
        count++
        var $
        if (!($ = /^(\d+)\s+(\w+)\s+([^\s]+)\s?(.*)$/.exec(line))) {
            // todo: use sprintf
            return abend('cannot parse runner output at line ' + count + ': invalid syntax')
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
                event = tap.assertion(rest)
                program.actual++
                if (event.ok) {
                    program.passed++
                }
                consumer(extend(event, program, {
                    time: time,
                    file: file,
                    type: type
                }))
                break
            case 'run':
                program.start = time
                consumer(extend(program, {
                    time: time,
                    type: type,
                    file: file
                }))
                break
            case 'plan':
                expected = parseInt(rest, 10)
                consumer(extend(program, {
                    time: time,
                    file: file,
                    type: type,
                    expected: expected
                }))
                break
            case 'bail':
                event = tap.bailout(rest)
                program.bailed = true
                consumer(extend(event, program, {
                    time: time,
                    file: file,
                    type: type
                }))
                break
            case 'exit':
                var exit = /^([0-9]+|null) (.*)$/.exec(rest)
                if (exit) {
                    if (exit[1] === 'null') {
                        code = null
                        signal = exit[1]
                    } else {
                        signal = null
                        code = parseInt(exit[0], 10)
                    }
                } else {
                    return abend('cannot parse runner test exit code at line ' + count + ': exit code ' + rest)
                }
                consumer(extend({}, program, {
                    code: code,
                    signal: signal,
                    file: file,
                    type: type,
                    time: time
                }))
                break
            case 'err':
            case 'out':
                consumer({
                    time: time,
                    type: type,
                    file: file,
                    line: rest
                })
                break
            case 'eof':
                consumer({
                    time: time,
                    type: type
                })
                eof = true
                break
            default:
                return abend('cannot parse runner output at line ' + count + ': unknown line type ' + type)
        }
        return true
    }
}

module.exports = parse

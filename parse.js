var byline = require('byline')
var Delta = require('delta')
var extend = require('./extend')
var tap = require('./tap')
var cadence = require('cadence')

var parse = cadence(function (async, options, consumer) {
    var count = 0, eof = false, programs = {}, failed = false, delta, stream

    async(function () {
        stream = byline.createStream(options.stdin)
        delta = new Delta(async())
        delta.ee(stream).on('data', data).on('end')
    }, function () {
        if (!count || eof) {
            return
        }
        options.abend()
    })

    function abend (message) {
        consumer({ type: 'error' })
        options.stderr.write(message)
        options.stderr.write('\n')
    }

    function data (line) {
        if (!consume(line)) {
            // delta.off('data')
            // delta.off('data', data)
            delta.off(stream, 'data')
        }
    }

    function consume (line) {
        count++
        var $
        if (!($ = /^(\d+)\s+(\w+)\s+([^\s]+)\s?(.*)$/.exec(line))) {
            // todo: use sprintf
            return abend('error: cannot parse runner output at line ' + count + ': invalid syntax')
        }
        var time = parseInt($[1], 10)
        var type = $[2]
        var file = $[3]
        var rest = $[4]
        var event, program, expected, code, signal
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
                    return abend('error: cannot parse runner test exit code at line ' + count + ': exit code ' + rest)
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
                return abend('error: cannot parse runner output at line ' + count + ': unknown line type ' + type)
        }
        return true
    }
})

module.exports = parse

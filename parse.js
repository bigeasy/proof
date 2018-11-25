var byline = require('byline')
var Delta = require('delta')
var extend = require('./extend')
var tap = require('./tap')
var cadence = require('cadence')
var Staccato = require('staccato')

var parse = cadence(function (async, program, consumer) {
    var count = 0, eof = false, programs = {}, failed = false, stream, state = {}
    async(function () {
        var stream = byline.createStream(program.stdin, { encoding: 'utf8' })
        stream.on('end', function () { stream.emit('readable') })
        var staccato = new Staccato.Readable(stream)
        async.loop([], function () {
            async(function () {
                staccato.read(async())
            }, function (line) {
                if (line == null) {
                    return [ async.break ]
                }
                consume(line)
                if (eof) {
                    return [ async.break ]
                }
            })
        })
    }, function () {
        if (state.code != null) return state.code
        return (!count || eof) ? 0 : 1
    })

    function abend (message) {
        consumer({ type: 'error' }, state)
        program.stderr.write(message)
        program.stderr.write('\n')
    }

    function consume (line) {
        count++
        var $
        if (!($ = /^(\d+)\s+(\w+)\s+([^\s]+)\s?(.*)$/.exec(line))) {
            // TODO Use sprintf.
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
                }), state)
                break
            case 'run':
                program.start = time
                consumer(extend(program, {
                    time: time,
                    type: type,
                    file: file
                }), state)
                break
            case 'plan':
                expected = parseInt(rest, 10)
                consumer(extend(program, {
                    time: time,
                    file: file,
                    type: type,
                    expected: expected
                }), state)
                break
            case 'bail':
                event = tap.bailout(rest)
                program.bailed = true
                consumer(extend(event, program, {
                    time: time,
                    file: file,
                    type: type
                }), state)
                break
            case 'exit':
                var exit = /^([0-9]+|null) (.*)$/.exec(rest)
                if (exit) {
                    if (exit[1] === 'null') {
                        code = null
                        signal = exit[2]
                    } else {
                        signal = null
                        code = parseInt(exit[1], 10)
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
                }), state)
                break
            case 'err':
            case 'out':
                consumer({
                    time: time,
                    type: type,
                    file: file,
                    line: rest
                }, state)
                break
            case 'eof':
                consumer({
                    time: time,
                    type: type
                }, state)
                eof = true
                break
            default:
                return abend('error: cannot parse runner output at line ' + count + ': unknown line type ' + type)
        }
        return true
    }
})

module.exports = parse

var extend = require('./extend')
var tap = require('./tap')

function Parse (consumer, abend) {
    this.count = 0
    this._programs = {}
    this._consumer = consumer
    this._abend = abend
    this.eof = true
}

module.exports = Parse

Parse.prototype.consumeLine = function (line, abend) {
    this.count++
    var $
    if (!($ = /^(\d+)\s+(\w+)\s+([^\s]+)\s?(.*)$/.exec(line))) {
        this._abend('cannot parse runner output at line ' + this.count + ': invalid syntax')
    }
    var time = parseInt($[1], 10)
    var type = $[2]
    var file = $[3]
    var rest = $[4]
    var event, program, expected, code
    if (!this._programs[file]) {
        this._programs[file] = {
            passed: 0,
            actual: 0
        }
    }
    program = this._programs[file]
    switch (type) {
        case 'test':
            event = tap.assertion(rest)
            program.actual++
            if (event.ok) {
                program.passed++
            }
            this._consumer(extend(event, program, {
                time: time,
                file: file,
                type: type
            }))
            break
        case 'run':
            program.start = time
            this._consumer(extend(program, {
                time: time,
                type: type,
                file: file
            }))
            break
        case 'plan':
            expected = parseInt(rest, 10)
            this._consumer(extend(program, {
                time: time,
                file: file,
                type: type,
                expected: expected
            }))
            break
        case 'bail':
            event = tap.bailout(rest)
            program.bailed = true
            this._consumer(extend(event, program, {
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
                this._abend('cannot parse runner test exit code at line ' + this.count + ': exit code ' + rest)
            }
            this._consumer(extend({}, program, {
                code: code,
                signal: signal,
                file: file,
                type: type,
                time: time
            }))
            break
        case 'err':
        case 'out':
            this._consumer({
                time: time,
                type: type,
                file: file,
                line: rest
            })
            break
        case 'eof':
            this._consumer({
                time: time,
                type: type
            })
            this.eof = true
            break
        default:
            this._abend('cannot parse runner output at line ' + this.count + ': unknown line type ' + type)
    }
}

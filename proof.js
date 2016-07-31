var fs = require('fs')
var cadence = require('cadence')
var util = require('util')
var path = require('path')
var test = require('./test')
var spawn = require('child_process').spawn
var arguable = require('arguable')
var expandable = require('expandable')
var cadence = require('cadence')
var candidate = require('./candidate')
var shebang = require('./shebang')
var __slice = [].slice
var byline = require('byline')
var extend = require('./extend')
var tap = require('./tap')
var parse = require('./parse')
var jsonRedux = require('./json')
var formatter = require('./formatter')
var printer = require('./printer')
var _progress = require('./progress')
var _errors = require('./errors')
var run = require('./run').run
var platform = require('./platform').platform

// Moved exports.json to its own file.
function json (program, callback) {
    var formatterRedux = formatter(jsonRedux())
    program.stdin.resume()
    parse(program, printer(formatterRedux, program.stdout, program.stderr), callback)
}

function progress (program, callback) {
    var formatterRedux = formatter(_progress(program))
    program.stdin.resume()
    parse(program, printer(formatterRedux, program.stdout, program.stderr), callback)
}

function errors (program, callback) {
    var formatterRedux = formatter(_errors(program))
    program.stdin.resume()
    parse(program, printer(formatterRedux, program.stdout, program.stderr), callback)
}

exports.main = cadence(function (async, program) {
    program.helpIf(program.ulimate.help)

    var command = ({
        json: json,
        run: run,
        progress: progress,
        errors: errors,
        platform: platform,
        test: test
    })[program.command.command.name]

    command(program, async())
})

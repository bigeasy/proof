var fs = require('fs')
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
var run = require('./run')
var platform = require('./platform')

// Moved exports.json to its own file.
function json () {
    var formatterRedux = formatter(jsonRedux())
    process.stdin.resume()
    parse(process.stdin, printer(formatterRedux, process.stdout, process.stderr))
}

function progress (options) {
    var formatterRedux = formatter(_progress(options))
    process.stdin.resume()
    parse(process.stdin, printer(formatterRedux, process.stdout, process.stderr))
}

function errors (options) {
    var formatterRedux = formatter(_errors(options))
    process.stdin.resume()
    parse(process.stdin, printer(formatterRedux, process.stdout, process.stderr))
}

function main (options) {
    if (!options.command) {
        console.log(options.usage)
        process.exit(0)
    }
    var command = ({
        json: json,
        run: run,
        progress: progress,
        errors: errors,
        platform: platform,
        test: test
    })[options.command]

    command(options)
}

function abended (e) {
    process.stderr.write('error: ' + e.message + '\n')
    process.exit(1)
}

exports.main = main
exports.abended = abended

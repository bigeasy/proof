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
function json (options, callback) {
    var formatterRedux = formatter(jsonRedux())
    options.stdin.resume()
    parse(options, printer(formatterRedux, options.stdout, options.stderr), callback)
}

function progress (options, callback) {
    var formatterRedux = formatter(_progress(options))
    options.stdin.resume()
    parse(options, printer(formatterRedux, options.stdout, options.stderr), callback)
}

function errors (options, callback) {
    var formatterRedux = formatter(_errors(options))
    options.stdin.resume()
    parse(options, printer(formatterRedux, options.stdout, options.stderr), callback)
}

exports.main = cadence(function (async, options) {
    if (!options.command) {
        options.help()
    }

    var command = ({
        json: json,
        run: run,
        progress: progress,
        errors: errors,
        platform: platform,
        test: test
    })[options.command]

    command(options, async())
})

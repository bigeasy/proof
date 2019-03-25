var cadence = require('cadence')
var spawn = require('child_process').spawn
var path = require('path')
var run = require('./proof.run.js')
var progress = require('./proof.progress.js')
var errors = require('./proof.errors.js')
var stream = require('stream')
var delta = require('delta')
var byline = require('byline')

var test = cadence(function (async, arguable) {
    arguable.helpIf(arguable.ultimate.help)
    var parameters = { progress: {}, run: {}  }
    arguable.parameters.forEach(function (parameter) {
        var program = /^(monochrome|width|digits)$/.test(parameter.name) ? 'progress' : 'run'
        parameters[program][parameter.name] = parameter.value
    })

    arguable.stdout.write('\n')
    var programs, stdin, tee, exitCode = 0
    async(function () {
        tee = new stream.PassThrough({ highWaterMark: 1024 * 1024 * 1024 * 4 })
        stdin = new stream.PassThrough
        cadence(function (async) {
            async(function () {
                progress([ parameters.progress ], {
                    $stdin: stdin,
                    $stdout: arguable.stdout,
                    $stderr: arguable.stderr,
                    $trap: false,
                    env: arguable.options.env
                }, async())
            }, function (child) {
                child.exit(async())
            })
        })(async())
        cadence(function (async) {
            async(function () {
                run([ parameters.run, arguable.argv ], {
                    $stdout: new stream.PassThrough,
                    $stdin: arguable.stdin,
                    $stderr: arguable.stderr,
                    $trap: false
                }, async())
            }, function (child, options) {
                child.options.$stdout.pipe(tee)
                child.options.$stdout.pipe(stdin)
                child.exit(async())
            })
        })(async())
    }, function (code) {
        arguable.exitCode = code
        if (code == 0) {
            arguable.stdout.write('\n')
        } else {
            cadence(function (async) {
                async(function () {
                    errors([], {
                        $stdin: tee,
                        $stdout: arguable.stdout,
                        $stderr: arguable.stderr,
                        $trap: false
                    }, async())
                }, function (child, options) {
                    child.exit(async())
                })
            })(async())
        }
    })
})

module.exports = test

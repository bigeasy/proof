var cadence = require('cadence')
var spawn = require('child_process').spawn
var path = require('path')
var run = require('./proof.run.js')
var progress = require('./proof.progress.js')
var errors = require('./proof.errors.js')
var stream = require('stream')
var delta = require('delta')
var byline = require('byline')

var test = cadence(function (async, program) {
    program.helpIf(program.ultimate.help)
    var parameters = { progress: {}, run: {}  }
    program.parameters.forEach(function (parameter) {
        var program = /^(monochrome|width|digits)$/.test(parameter.name) ? 'progress' : 'run'
        parameters[program][parameter.name] = parameter.value
    })

    process.stdout.write('\n')
    var programs, tee
    async(function () {
        programs = {
            progress: progress([parameters.progress], {
                stderr: program.stderr,
                stdout: program.stdout,
                env: program.env
            }, async()),
            run: run([parameters.run, program.argv], {
                stdin: program.stdin,
                stderr: program.stderr,
                env: program.env
            }, async())
        }
        tee = new stream.PassThrough({ highWaterMark: 1024 * 1024 * 1024 * 4 })
        programs.run.stdout.pipe(tee)
        programs.run.stdout.pipe(programs.progress.stdin)
        delta(async()).ee(programs.run.stdout).on('end')
    }, function (code) {
        if (code == 0) {
            process.stdout.write('\n')
        } else {
            programs.errors = errors([], {
                stderr: program.stderr,
                stdout: program.stdout,
                env: program.env
            }, async())
            tee.pipe(programs.errors.stdin)
        }
        return [ code ]
    })
})

module.exports = test

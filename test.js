var cadence = require('cadence')
var spawn = require('child_process').spawn
var path = require('path')
var run = require('./proof.run.js')
var progress = require('./proof.progress.js')

var test = cadence(function (async, program) {
    program.helpIf(program.ultimate.help)
    var parameters = { progress: {}, run: {}  }
    program.parameters.forEach(function (parameter) {
        var program = /^(monochrome|width|digits)$/.test(parameter.name) ? 'progress' : 'run'
        parameters[program][parameter.name] = parameter.value
    })
    var programs = {
        run: run([parameters.run, program.argv], {
            stdin: program.stdin,
            stderr: program.stderr,
            process: program
        }, async()),
        progress: progress([parameters.progress], {
            stderr: program.stderr,
            stdout: program.stdout,
            process: program
        }, async())
    }
    programs.run.stdout.pipe(programs.progress.stdin)
})

module.exports = test

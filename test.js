var cadence = require('cadence')
var spawn = require('child_process').spawn
var path = require('path')
var Delta = require('delta')

var test = cadence(function (async, options) {
    if (options.command.param.help) options.help()
    var executable = path.join(__dirname, 'proof.bin.js')
    var progress = [ executable, 'progress' ], run = [ executable, 'run' ]
    options.command.given.forEach(function (name) {
        if (/^(monochrome|width|digits)$/.test(name)) {
            progress.push('--' + name, options.command.param[name])
        } else {
            run.push('--' + name, options.command.param[name])
        }
    })
    run.push.apply(run, options.argv)
    progress = spawn('node',  progress, { stdio: [ 'pipe', 'pipe', 'pipe' ] })
    run = spawn('node', run, { stdio: [ 'pipe', 'pipe', 'pipe' ] })
    run.stdout.pipe(progress.stdin)
    run.stderr.pipe(options.stderr)
    progress.stdout.pipe(options.stdout)
    progress.stderr.pipe(options.stderr)
    async(function () {
        var delta = new Delta(async())
        delta.ee(run).on('close')
        delta.ee(progress).on('close')
    }, function (runCode, runSignal, progressCode, progressSignal) {
        return runCode || progressCode
    })
})

module.exports = test

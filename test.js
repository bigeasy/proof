var cadence = require('cadence')
var spawn = require('child_process').spawn
var path = require('path')
var Delta = require('delta')

function test (options) {
    _test(options, function (error) { if (error) throw error })
}

var _test = cadence(function (async, options) {
    var executable = path.join(__dirname, 'proof.bin.js')
    var progress = [ executable, 'progress' ], run = [ executable, 'run' ]
    options.given.forEach(function (name) {
        if ('help' == name) {
            options.usage()
        } else if (/^(monochrome|width|digits)$/.test(name)) {
            progress.push('--' + name, options.params[name])
        } else {
            run.push('--' + name, options.params[name])
        }
    })
    run.push.apply(run, options.argv)
    progress = spawn('node',  progress, { stdio: [ 'pipe', process.stdout, process.stderr ] })
    run = spawn('node', run, { stdio: [ 'pipe', 'pipe', process.stderr ] })
    run.stdout.pipe(progress.stdin)
    async(function () {
        var delta = new Delta(async())
        delta.ee(run).on('close')
        delta.ee(progress).on('close')
    }, function (runCode, runSignal, progressCode, progressSignal) {
        async(function () {
            new Delta(async()).ee(process).on('exit')
        }, function () {
            process.exit(runCode || progressCode)
        })
    })
})

module.exports = test

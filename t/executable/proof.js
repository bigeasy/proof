#!/usr/bin/env node

var spawn = require('child_process').spawn
var path = require('path'), stderr = []

// FIXME: NO! Make this a real Cadnece function. Bad!
function execute (proc, input, step) {
    step(function () {
        proc.stderr.setEncoding('utf8')
        proc.stdout.setEncoding('utf8')
        proc.on('close', step(null))
        proc.on('error', step(Error))
        proc.stdout.on('data', step(null, []))
        proc.stdout.on('error', step(Error))
        proc.stderr.on('data', step(null, []))
        proc.stderr.on('error', step(Error))
        proc.stdin.on('error', step(Error))
        proc.on('error', function (error) { throw error })
        if (typeof input == "string") {
            proc.stdin.write('%t\n')
            proc.stdin.end()
        } else if (input != null) {
            input.pipe(proc.stdin)
        }
    }, function (code, signal, stdout, stderr) {
        return [ code, stdout.join(''), stderr.join('') ]
    })
}

require('../../redux')(module, function (body, assert, callback) {
    var proof = path.resolve(__dirname, '..', '..', 'proof.bin.js')
    require('cadence')(body).call(this, assert, execute, proof, callback)
})

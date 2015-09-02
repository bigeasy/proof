#!/usr/bin/env node

var spawn = require('child_process').spawn
var path = require('path'), stderr = []
var Delta = require('delta')

// FIXME: NO! Make this a real Cadnece function. Bad!
function execute (proc, input, async) {
    var stdout = [], stderr = []
    async(function () {
        var delta = new Delta(async())
        delta.ee(proc).on('close')
        delta.ee(proc.stderr)
             .on('data', function (chunk) { stderr.push(chunk.toString()) })
             .on('close')
        delta.ee(proc.stdout)
             .on('data', function (chunk) { stdout.push(chunk.toString()) })
             .on('close')
        if (typeof input == "string") {
            proc.stdin.write('%t\n')
            proc.stdin.end()
        } else if (input != null) {
            input.pipe(proc.stdin)
        }
    }, function (code, signal) {
        return [ code, stdout.join(''), stderr.join('') ]
    })
}

require('../..')(module, function (body, assert, callback) {
    var proof = path.resolve(__dirname, '..', '..', 'proof.bin.js')
    require('cadence')(body).call(this, assert, execute, proof, callback)
})

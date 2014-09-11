#!/usr/bin/env node

var spawn = require('child_process').spawn
var path = require('path'), stderr = []

function execute (proc, input, step) {
    step(function () {
        proc.stderr.setEncoding('utf8')
        proc.stdout.setEncoding('utf8')
        proc.on('close', step(-1))
        proc.on('error', step(Error))
        proc.stdout.on('data', step(-1, []))
        proc.stdout.on('error', step(Error))
        proc.stderr.on('data', step(-1, []))
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
        console.log(code, stdout.join(''))
        return [ code, stdout.join(''), stderr.join('') ]
    })
}

module.exports = require('../..')(function () {
    return {
        execute: execute,
        proof: path.resolve(__dirname, '..', '..', 'proof.bin.js')
    }
})

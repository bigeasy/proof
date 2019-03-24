#!/usr/bin/env node

/*
___ usage ___ en_US ___
usage: proof [command] <arguments> <tests>
___ . ___

*/
require('arguable')(module, require('cadence')(function (async, destructible, arguable) {
    var coalesce = require('extant')
    arguable.helpIf(arguable.ultimate.help)
    var command = coalesce(arguable.argv[0], 'platform')
    var argv = arguable.argv.slice(1)
    var delegate = arguable.delegate(require, './proof.%s', command)
    var cadence = require('cadence')
    async(function () {
        destructible.ephemeral([ 'run', command ], cadence(function (async, destructible) {
            delegate(argv, {
                $destructible: destructible,
                $trap: false,
                $stdin: arguable.stdin,
                $stdout: arguable.stdout,
                $stderr: arguable.stderr
            }, async())
        }), async())
    }, function(child) {
        cadence(function () {
            child.exit(async())
        }, function (exitCode) {
            arguable.exitCode = exitCode
            return []
        })(destructible.durable('exitCode'))
        return []
    })
}))

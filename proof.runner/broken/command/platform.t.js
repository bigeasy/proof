var cadence = require('cadence')

var prove = cadence(function (async, assert) {
    var check = require('../../platform')
    var proof = require('../../proof.bin.js')
    var arguable = { argv: [ 'dos', 'osx' ], exitCode: null }
    async(function () {
        check(arguable, { platform: 'osx' }, async())
    }, function () {
        assert(arguable.exitCode, 0, 'platform matches')
        async(function () {
            proof([ 'platform' ], { $trap: false }, async())
        }, function (child) {
            child.exit(async())
        })
    }, function (code) {
        assert(code, 1, 'no platoform match')
    }, [function () {
        proof([ 'platform', '-h' ], { $trap: false }, async())
    }, function (error) {
        assert(error.qualified, 'bigeasy\.arguable#abend', 'help')
    }])
})

require('../..')(3, prove)

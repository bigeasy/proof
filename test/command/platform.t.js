var cadence = require('cadence')

var prove = cadence(function (async, assert) {
    var check = require('../../platform')
    var proof = require('../../proof.bin.js')
    async(function () {
        check({ argv: [ 'dos', 'osx' ] }, { platform: 'osx' }, async())
    }, function (code) {
        assert(code, 0, 'platform matches')
        proof([ 'platform' ], {}, async())
    }, function (code) {
        assert(code, 1, 'no platoform match')
    }, [function () {
        proof([ 'platform', '-h' ], {}, async())
    }, function (error) {
        assert(error.qualified, 'bigeasy.arguable#help', 'help')
    }])
})

require('../..')(3, prove)
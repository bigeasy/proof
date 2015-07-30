require('../..')(14, require('cadence')(prove))

function prove (async, assert) {
    var path = require('path')
    var shebang = require('../../shebang'), path = require('path')
    async(function () {
        shebang('unix', path.join(__dirname, 'fixtures/shebang/env'), [], async())
    }, function (program, parameters) {
        assert(path.basename(program), 'env', 'shebang program')
        assert(parameters, [], 'shebang parameters')
    }, [function () {
        shebang('unix', path.join(__dirname, 'fixtures/shebang/unset'), [], async())
    }, function (error) {
        assert(error.message, 'set execute bit to use shebang line', 'set execute bit')
    }], function () {
        shebang('unix', path.join(__dirname, 'fixtures/shebang/blank'), [], async())
    }, function (program, parameters) {
        assert(program, 'node', 'unix sip no execute no shebang')
        assert(path.basename(parameters[0]), 'blank', 'unix no execute no shebang parameters')
        shebang('win', path.join(__dirname, 'fixtures/shebang/env'), [], async())
    }, function (program, parameters) {
        assert(path.basename(program), 'node', 'windows sip env')
        assert(path.basename(parameters[0]), 'env', 'windows sip env parameters')
        shebang('win', path.join(__dirname, 'fixtures/shebang/unset'), [], async())
    }, function (program, parameters) {
        assert(path.basename(program), 'node', 'windows sip absolute')
        assert(path.basename(parameters[0]), 'unset', 'windows sip absolute parameters')
        shebang('win', path.join(__dirname, 'fixtures/shebang/blank'), [], async())
    }, function (program, parameters) {
        assert(program, 'node', 'windows sip no shebang')
        assert(path.basename(parameters[0]), 'blank', 'windows sip no shebang parameters')
        shebang('win', path.join(__dirname, 'fixtures/shebang/windows.exe'), [], async())
    }, function (program, parameters) {
        assert(path.basename(program), 'windows.exe', 'windows.exe')
        shebang('win', path.join(__dirname, 'fixtures/shebang/windows.bat'), [], async())
    }, function (program, parameters) {
        assert(path.basename(program), 'windows.bat', 'windows.bat')
        shebang('win', path.join(__dirname, 'fixtures/shebang/windows.cmd'), [], async())
    }, function (program, parameters) {
        assert(path.basename(program), 'windows.cmd', 'windows.cmd')
    })
}

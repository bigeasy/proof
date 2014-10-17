// What is required? vvv these are in parse. 
var fs = require('fs') // <- dont see it.
var util = require('util') // <- dont see it.
var path = require('path') // <- dont see it.
var spawn = require('child_process').spawn // <- dont see it.
var arguable = require('arguable') // <- dont see it.
var expandable = require('expandable') // <- dont see it.
var cadence = require('cadence') // <- dont see it.
var candidate = require('./candidate') // <- dont see it.
var shebang = require('./shebang') // <- dont see it.
var __slice = [].slice // <- dont see it.
var overwrite // <- dont see it.
var extend = require('./extend')// <-THIS IS IN HERE
var parser = require('./parser') // <- dont see it.
var parseRedux = require('./parse') // <- dont see it.


// how should this be exported?
exports.json = function (out) {
    var object = {}
    return function (event) {
        var comment, file, message, passed, skip, time, todo
        switch (event.type) {
            case 'run':
                object[event.file] = {
                    time: event.time,
                    expected: event.expected,
                    tests: []
                }
                break
            case 'plan':
                object[event.file].expected = event.expected
                break
            case 'test':
                object[event.file].tests.push({
                    message: event.message,
                    time: event.time,
                    passed: event.passed,
                    skip: event.skip,
                    todo: event.todo,
                    comment: event.comment
                })
                break
            case 'exit':
                extend(object[event.file], {
                    actual: event.actual,
                    duration: event.time - event.start,
                    code: event.code
                })
                break
            case 'eof':
                out.write(JSON.stringify(object, null, 2))
                out.write('\n')
                break
        }
    }
}

function json () {
    process.stdin.resume()
    parse(process.stdin, exports.json(process.stdout))
}

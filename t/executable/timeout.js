#!/usr/bin/env node

require('../..')(1, function (callback) {
    setTimeout(function () { callback() }, 6e4)
})

#!/usr/bin/env node

require('../..')(1, function (step) {
    step(function () {
        setTimeout(step(), 6e4)
    })
})

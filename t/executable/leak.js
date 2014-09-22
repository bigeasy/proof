#!/usr/bin/env node

var test = require('../../redux')

a = 1

test(1, function (ok) { ok(true, 'test truth') })

#!/usr/bin/env node

var test = require("../../..")

test(1, function (ok) { ok(true, "test truth") })

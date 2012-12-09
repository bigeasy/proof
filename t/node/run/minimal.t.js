#!/usr/bin/env node

var test = require("../../../lib/proof");

test(1, function (ok) { ok(true, "test truth") });

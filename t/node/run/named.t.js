#!/usr/bin/env node

var test = require("../../../lib/proof");

function asynchronous (callback) { callback(null, true) }

test(1, function (step) {
  asynchronous(step("named"));
}, function (ok, named) {
  ok(named, "named and returned");
});

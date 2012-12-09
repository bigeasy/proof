#!/usr/bin/env node

var test = require("../../../lib/proof");

function asynchronous (callback) { callback(null, true) }

test(1, function (async) {
  asynchronous(async("named"));
}, function (ok, named) {
  ok(named, "named and returned");
});

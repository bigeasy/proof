#!/usr/bin/env node

test = require("../../../lib/proof");

function asynchronous (callback) { callback(null, true) }

test(1, function (callback) {
  asynchronous(callback("named"));
}, function (ok, named) {
  ok(named, "named and returned");
});

#!/usr/bin/env node

var test = require("../../../lib/proof");

function asynchronous (callback) { callback(null, true) }

test(1, function (callback, ok) {
  callback(function a () {
    asynchronous(callback("named"));
  }, function b (named) {
    ok(named, "nested was called");
  });
});

#!/usr/bin/env node

var test = require("../../../lib/proof");

function asynchronous (callback) { callback(null, true) }

test(1, function (step, ok) {
  step(function a () {
    asynchronous(step());
  }, function b (named) {
    ok(named, "nested was called");
  });
});

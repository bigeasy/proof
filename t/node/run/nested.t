#!/usr/bin/env node

var test = require("../../../lib/proof");

function asynchronous (callback) { callback(null, true) }

test(1, function (async, ok) {
  async(function a () {
    asynchronous(async("named"));
  }, function b (named) {
    ok(named, "nested was called");
  });
});

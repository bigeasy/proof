#!/usr/bin/env node

require("../../..")(0, function (counter, ok) {
  counter(1);
  ok(true, 'got');
});

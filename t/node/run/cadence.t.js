#!/usr/bin/env node

require("../../..")(1, function (ok, cadence) {
  cadence(function (step) {
    ok(step, 'export cadence');
  })();
});

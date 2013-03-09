#!/usr/bin/env node

require("../../../lib/proof")(1, function (ok, cadence) {
  cadence(function (step) {
    ok(step, 'export cadence');
  })();
});

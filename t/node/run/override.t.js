#!/usr/bin/env node

require("./override.js")(2, function (equal, ok) {
  equal("overridden", "overridden");
  ok(1, "ok");
});

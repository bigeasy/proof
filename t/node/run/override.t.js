#!/usr/bin/env node

require("./override.js")(1, function (equal, ok) {
  ok(equal("overridden"), "overridden");
});

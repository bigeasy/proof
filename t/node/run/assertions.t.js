#!/usr/bin/env node

require("../../..")(5, function (ok, equal, deepEqual, assert) {
    ok(true, "truth works")
    equal(1 + 1, 2, "math works")
    deepEqual("a b".split(/\s/), [ "a", "b" ], "strings work")
    assert({ a: 1 }, { a: 1 }, "assert as deep equal")
    assert(true, "assert as ok")
})

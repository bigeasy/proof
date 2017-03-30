## Wed Mar 29 23:12:29 CDT 2017

Trying to get to a release of 3.0.0. Wondering if the new scaffold interface has
stabilized. Looking over the new scaffold I see an option to export the test as
a module that I do not have any use for as of yet. The idea was to make modules
exportable so that you could use tests as benchmarks, running them repeatedly so
that they would have a change to get optimized by the JIT compiler.

At the moment, this is just a lot of dead code though. I'm not using it
anywhere. I'm not testing it. Thus, I'm going to put the code here for now.

```javascript
var scaffold = require('./scaffold')
var globals = Object.keys(global).concat([ 'errno' ])

function noop () {}

module.exports = function (module, count, test) {
    var isMainModule
    if (typeof module == 'object') {
        isMainModule = require.main === module
    } else {
        isMainModule = true
        test = count
        count = module
        module = {}
    }
    // TODO No, let's always insist that this is explicit.
    if (typeof count != 'number') {
        test = count
        count = 0
    }
    var scaffolded = scaffold(count, test)
    if (isMainModule) {
         scaffolded(globals, process.stdout, function (error, result) {
            if (error)
    // This is line formatted for it's display by `node`.
  throw error /*\*-* Proof framework rewthrowing test generated error. See below. *-*\*/
            else require('../exit')(process)(result)
         })
    } else {
        module.exports = function (options, callback) {
            var run = {
                stream: options.stream || new stream.PassThrough,
                globals: options.globals || Object.keys(globals).concat([ 'errno' ]),
                exit: options.exit || function (exitCode) { run.exitCode = exitCode }
            }
            scaffolded(run.globals, run.stream, run.exit, callback || noop)
        }
    }
}
```

This can be a 3.2 feature. It can be implemented without breaking existing
tests.


## Thu Dec 22 08:57:02 EST 2016

For a time this project was building on Circle CI as a part of an evaluation of
Circle CI, but that evaluation did not result in adoption, and those build hooks
have been removed.

---

Thought about creating a bogus stdout for Proof that tracks whether or not
you've written a new line, if the cursor is at the start of a line. I'm not
going to do this. I'm actually wondering if errors shouldn't be written to
stdout, because the progress runner is such a special snowflake, but they
shouldn't.

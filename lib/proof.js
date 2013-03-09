var util = require("util")
  , assert = require("assert")
  , globals = Object.keys(global).concat([ "errno" ])
  , assertion
  , name
  , __slice = [].slice
  ;

function Bailout (vargs) {
  Error.call(this);
  this.vargs = vargs;  
}

function execute (expected, setup, run) {
  var actual = 0
    , passed = 0
    , callbacks = { results: {} }
    , exitCode = 0
    , timeout
    , context =
      { bailout: bailout
      , die: bailout
      , say: say
      }
    , cadences = []
    , janitors = []
    , cleaning = false
    , untidy
    , cadence = require('cadence')({ wrap: { cleanup: janitor }, alias: 'async' })
    ;

  if (setup.length) run.unshift(function (async) {
    async(setup);
  }, function (object, async) {
    if (typeof object == "object") async(object);
  });

  process.stdout.write("1.." + expected + "\n");

  untidy = process.env.PROOF_NO_CLEANUP || process.env.UNTIDY;
  untidy = untidy && !/^(0|no|false)$/.test(untidy);

  if (!untidy) run.push(tidy);

  for (name in assert) {
    if (context[name] || name === "AssertionError") {
      continue;
    }
    context[name] = assertion(name, assert[name]);
  }

  timeout = +(process.env[process.env['PROOF_TIMEOUT'] != null ? 'PROOF_TIMEOUT' : 'TIMEOUT'] || 30000);
  if (isNaN(timeout)) timeout = 0;

  cadence({ context: context }).apply(null, run)(function (error) { if (error) abend(error) });

  function janitor (janitor) {
    if (!cleaning) janitors.push(janitor);
    return janitor;
  }

  function tidy (async) {
    cleaning = true;
    async(function () { async(janitors) }, function () { async(exit) });
  }

  function exit (async) {
    var leaked = Object.keys(global).filter(function (global) { return !~globals.indexOf(global); });
    if (leaked.length) {
      bailout("Variables leaked to global namespace.", leaked);
    }

    async(function (async) {
      if (!process.stdout.write('')) {
        process.stdout.once('drain', async());
      }
      if (!process.stderr.write('')) {
        process.stderr.once('drain', async());
      }
    }, function () {
      process.exit(passed == expected && actual == expected ? 0 : 1);
    });
  }

  // Print a string to standard out as a comment, prepending each line in the
  // string with a hash mark.
  function comment (string) {
    var lines = string.split(/\n/).map(function (line) { return "# " + line });
    lines.push("");
    process.stdout.write(lines.join("\n"));
  }

  // Send a `Test::Harness` Bail Out! message to stdout. This is a message sent
  // when further testing is impossible. Use it when a valuable resource is
  // missing, or everything in the world is just plain wrong. It is sent as a
  // result of uncaught exceptions, test timeouts.

  //
  function bailout () { throw new Bailout(__slice.call(arguments, 0)) }

  function abend (error) {
    var drain, message, vargs;
    if (error instanceof Bailout) vargs = error.vargs;
    else vargs = __slice.call(arguments, 0);
    if (vargs.length == 1 && vargs[0] instanceof Error) {
      vargs = [ vargs[0].message, vargs[0].stack ];
    }
    if (typeof vargs[0] == "string" && !/\n/.test(vargs[0])) {
      message = "Bail out! " + vargs.shift() + "\n";
    } else {
      message = "Bail out!\n";
    }
    process.stdout.write(message);
    if (vargs.length) comment(util.format.apply(util.format, vargs));

    cadence(function (cadnece) {
      if (!process.stdout.write('')) {
        process.stdout.once('drain', cadence());
      }
      if (!process.stderr.write('')) {
        process.stderr.once('drain', cadence());
      }
    }, function () {
      process.exit(1);
    });
  }


  function say () { comment(util.format.apply(util.format, arguments)) }

  function fail (message) {
    message = message == null ? "" : " " + message;
    process.stdout.write("not ok " + (++actual) + message + "\n");
  }

  // Generate assertion member methods for the Test class from the assert library.
  function assertion (name, assertion) {
    return function () {
      var EXPECTED, inspect, message, splat;
      splat = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      message = splat[splat.length - 1];
      try {
        assertion.apply(this, splat);
        process.stdout.write("ok " + (++actual) + " " + message + "\n");
        ++passed;
        return true;
      } catch (e) {
        process.stdout.write("not ok " + (++actual) + " " + e.message + "\n");
        EXPECTED = name === "ok" ? true : splat[1];
        inspect = {
          EXPECTED: EXPECTED,
          GOT: splat[0]
        };
        inspect = require("util").inspect(inspect, null, Math.MAX_VALUE);
        comment(inspect);
        return false;
      }
    }
  }
}

// We only export one method to both define harnesses and run tests.
module.exports = proof;

function proof () {
  var context, outer = __slice.call(arguments, 0);
  if (isNaN(outer[0])) {
    return function () {
      var inner = __slice.call(arguments, 0);
      execute(inner.shift(), outer,inner);
    };
  } else {
    execute(outer.shift(), [], outer);
  }
}

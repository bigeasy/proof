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

function execute (expected, harnessCleanup, harness, programCleanup, program) {
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
    , untidy
    , cadence = require('cadence')
    ;

  for (name in assert) {
    if (context[name] || name === "AssertionError") {
      continue;
    }
    context[name] = assertion(name, assert[name]);
  }

  untidy = process.env.PROOF_NO_CLEANUP || process.env.UNTIDY;
  untidy = untidy && !/^(0|no|false)$/.test(untidy);

  process.stdout.write("1.." + expected + "\n");

  timeout = +(process.env[process.env['PROOF_TIMEOUT'] != null ? 'PROOF_TIMEOUT' : 'TIMEOUT'] || 30000);
  if (isNaN(timeout)) timeout = 0;

  cadence(function (step) {
    context.cadence = cadence;
    context.step = step;
    step(function () {
      step(function () {
        harnessCleanup(step);
      }, function () {
        return harness.apply(null, parameterize(harness, context));
      });
    }, function (object) {
      object = typeof object == "object" ? object : {};
      for (var key in object) {
        context[key] = object[key];
      }
      context.cadence = cadence;
      context.step = step;
      return context;
    }, function () {
      programCleanup.apply(null, parameterize(programCleanup, context));
    }, function () {
      program.apply(null, parameterize(program, context));
    }, function () {
      if (!untidy) {
        step(function () {
          programCleanup.apply(null, parameterize(programCleanup, context));
        }, function () {
          harnessCleanup(step);
        });
      }
    }, function () {
      var leaked = Object.keys(global).filter(function (global) { return !~globals.indexOf(global); });
      if (leaked.length) {
        bailout("Variables leaked to global namespace.", leaked);
      }

      step(function (step) {
        if (!process.stdout.write('')) {
          process.stdout.once('drain', step());
        }
        if (!process.stderr.write('')) {
          process.stderr.once('drain', step());
        }
      }, function () {
        process.exit(passed == expected && actual == expected ? 0 : 1);
      });
    });
  })(function (error) {
    if (error) abend(error);
  });

  function parameterize (program, context) {
    var $ = /^function\s*[^(]*\(([^)]*)\)/.exec(program.toString());
    require('assert').ok($, "bad function");
    return $[1].trim().split(/\s*,\s*/).map(function (parameter) {
      return context[parameter];
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

    cadence(function (step) {
      if (!process.stdout.write('')) {
        process.stdout.once('drain', step());
      }
      if (!process.stderr.write('')) {
        process.stderr.once('drain', step());
      }
    }, function () {
      process.exit(1);
    })();
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

function noop () { return {} }

function proof () {
  var outer = __slice.call(arguments);
  if (isNaN(outer[0])) {
    if (outer.length == 1) outer.unshift(noop);
    return function (count) {
      var inner = __slice.call(arguments, 1);
      if (inner.length == 1) inner.unshift(noop);
      execute(count, outer[0], outer[1], inner[0], inner[1]);
    };
  } else {
    proof.call(null, noop, noop).apply(null, outer);
  }
}

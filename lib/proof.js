var util = require("util")
  , assert = require("assert")
  , globals = Object.keys(global).concat([ "errno" ])
  , assertion
  , name
  , __slice = [].slice
  ;

function execute (expected, steps) {
  var timer
    , actual = 0
    , passed = 0
    , callbacks = { results: {} }
    , exitCode = 0
    , context =
      { bailout: bailout
      , die: bailout
      , say: say
      , callback: callback
      }
    , cadences = []
    , untidy
    ;

  process.stdout.write("1.." + expected + "\n");

  steps = [ steps.map(parameterize), [] ];

  untidy = process.env.PROOF_NO_CLEANUP || process.env.UNTIDY;
  untidy = untidy && !/^(0|no|false)$/.test(untidy);

  if (untidy) {
    steps[1].push(parameterize(function () { process.exit() }));
  }

  for (name in assert) {
    if (context[name] || name === "AssertionError") {
      continue;
    }
    context[name] = assertion(name, assert[name]);
  }

  invoke();

  // Print a string to standard out as a comment, prepending each line in the
  // string with a hash mark.
  function comment (string) {
    var lines = string.split(/\n/).map(function (line) { return "# " + line });
    lines.push("");
    process.stdout.write(lines.join("\n"));
  }

  // Set and reset a thirty second timeout between assertions.
  function timeout () {
    if (timer) clearTimeout(timer);
    if (process.env['TIMELESS'] == null || !/^(0|no|false)$/.test(process.env['TIMELESS'])) {
      timer = setTimeout(function () { bailout("Timeout!") }, 30000);
    }
  }

  // Send a `Test::Harness` Bail Out! message to stdout. This is a message sent
  // when further testing is impossible. Use it when a valuable resource is
  // missing, or everything in the world is just plain wrong. It is sent as a
  // result of uncaught exceptions, test timeouts.

  //
  function bailout () {
    var drain, message, vargs = __slice.call(arguments, 0);
    if (timer) clearTimeout(timer);
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
    require("fs").writeSync(1, "", 0);
    process.exit(1);
  }


  function say () { comment(util.format.apply(util.format, arguments)) }

  function fail (message) {
    message = message == null ? "" : " " + message;
    process.stdout.write("not ok " + (++actual) + message + "\n");
  }

  function thrown (error) {
    if (steps.length && steps[0].length && ~steps[0][0].parameters.indexOf("error")) {
      context.error = error;
    } else {
      bailout(error);
    }
  }

  function callback () {
    var varg = __slice.call(arguments, 0);
    if (!varg.length || (varg.length == 1 && typeof varg[0] == "string")) {
      var name = varg.shift();
      callbacks.count++;
      return (function (error, result) {
        if (error) {
          thrown(error);
        } else if (name) {
          callbacks.results[name] || (callbacks.results[name] = []);
          callbacks.results[name].push(result);
        } else if (callbacks.count == 2 && result && typeof result == "object") {
          for (var key in result) context[key] = result[key];
        }
        if (++callbacks.called == callbacks.count) {
          invoke();
        }
      }).bind(this);
    } else while (varg.length) {
      cadences.push(parameterize(varg.shift()));
    }
  }

  function parameterize (f) {
    var $ = /^function\s*[^(]*\(([^)]*)\)/.exec(f.toString());
    if (!$) throw new Error("bad function");
    f.parameters = $[1].split(/\s*,\s/);
    return f;
  }

  // Generate assertion member methods for the Test class from the assert library.
  function assertion (name, assertion) {
    return function () {
      var EXPECTED, inspect, message, splat;
      splat = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      message = splat[splat.length - 1];
      timeout();
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

  // Test if a program name matches one of our special names. We support
  // Streamline.js by also accepting a function whose name has been mangled in a
  // Streamline.js fashion.

  //
  function named (proc, name) {
    return proc.name == name || (proc.name && !proc.name.indexOf(name + '__'));
  }

  function invoke () {
    var arg
      , args = []
      , done = false
      , match
      , parameter, parameters
      , i, I
      , calledback
      , step, key, next
      , leaked
      , result
      , value
      ;

    timeout();

    while (cadences.length) {
      steps[0].unshift(cadences.pop());
    }

    for (;;) {
      if (! steps.length) {
        process.exit(passed == expected && actual == expected ? 0 : 1);
      }
      if (steps[0].length) {
        break;
      }
      leaked = Object.keys(global).filter(function (global) { return !~globals.indexOf(global); });
      if (leaked.length) {
        bailout("Variables leaked to global namespace.", leaked);
      }
      steps.shift();
    }
    for (key in (callbacks.results || {})) {
      value = callbacks.results[key];
      context[key] = value && value.length == 1 ? value[0] : value;
    }
    step = steps[0].shift();
    // Register a cleanup function to run at exit, invoking it immediately to
    // cleanup a possible failed previous run.
    if (named(step, "cleanup") && steps.length > 1) {
      steps[1].push(step);
    }
    callbacks = { count: 0, called: 0, results: {} };
    for (i = 0, I = step.parameters.length; i < I; i++) {
      parameter = step.parameters[i];
      // Did not know that `/^_|done$/` means `^_` or `done$`.
      done = /^(_|done)$/.test(parameter);
      if (done) {
        arg = callback();
      } else {
        arg = context[parameter];
        if (arg == null) {
          arg = typeof this[parameter] == "function" ? this[parameter].bind(this)
                                                     : this[parameter];
        }
      }
      args.push(arg);
    }
    delete context.error;
    next = callback();
    try {
      result = step.apply(this, args);
      if (callbacks.count == 1) {
        if (typeof result == "object") {
          for (var key in result) if (result.hasOwnProperty(key)) context[key] = result[key];
        }
      }
      next(null);
    } catch (error) {
      thrown(error);
      invoke();
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
      execute(inner.shift(), outer.concat(inner));
    };
  } else {
    execute(outer.shift(), outer);
  }
};

var assertion, name, util, _fn, _ref, __slice = [].slice;

util = require("util");

function die () {
  var splat;
  splat = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  if (splat.length) {
    console.log.apply(console, splat);
  }
  return process.exit(1);
};

function say () {
  var splat;
  splat = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return console.log.apply(console, splat);
};

function Test (expected) {
  this.__proof__expected = expected;
  this.__proof__actual = 0;
  this.__proof__timeout();
  this.context = {};
  this.__proof__callbacks = { results: {} };
  this.__proof__exitCode = 0;
  process.stdout.write("1.." + this.__proof__expected + "\n");
}

// Print a string to standard out as a comment, prepending each line in the
// string with a hash mark.
Test.prototype.__proof__comment = function (string) {
  var i, lines, _i, _ref;
  lines = string.split(/\n/);
  for (i = _i = 0, _ref = lines.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    lines[i] = "# " + lines[i];
  }
  lines.push("");
  return process.stdout.write(lines.join("\n"));
};

// Set and reset a thirty second timeout between assertions.
Test.prototype.__proof__timeout = function () {
  if (this._timer) clearTimeout(this._timer);
  if (!process.env.TIMELESS || /^(0|no|false)$/.test(process.env.TIMELESS))
    this._timer = setTimeout(this.bailout.bind(this, "Timeout!"), 30000);
};

// A `throws` assertion that is Streamline.js aware. The final argument is a
// function that is expected to throw an exception.
Test.prototype.throws = function () {
  var block, callback, expected, invoke, splat, _callback, _i,
    _this = this;
  expected = arguments[0], splat = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), block = arguments[_i++];
  // If the function accepts an argument, that means it is asynchronous. The
  // argument is the asynchronous callback. In this case, the last parameter in
  // the splat will the caller's asynchronous callback.
  invoke = function (callback) {
    try {
      if (block.length === 1) {
        return block(callback);
      } else {
        block();
        return callback(null);
      }
    } catch (error) {
      return callback(error);
    }
  };
  // If the block is synchronous we warp it in a callback function so we can
  // call it with the same logic for asynchronous blocks. Otherwise, we wrap the
  // caller's callback, so that we return the caught exception as the return
  // value, instead of as the error value.
  //
  // Both of these wrappers, when called, will return the caught exception to
  // the caller, or null if no exception was caught. The caller can perform
  // additional assertions to check exception properties other than the
  // assertion message.
  if (block.length === 1) {
    _callback = splat.pop();
    callback = function (error) {
      return _callback(null, error);
    };
  } else {
    callback = function (error) {
      return error;
    };
  }
  // The splat may also contain an optional assertion message. If not, we use
  // the string value of the expected message. The expected message can either
  // be a string for comparison, or a regular expression to test against the
  // exception message.
  return invoke(function (error) {
    if (error) {
      if (typeof expected === "string") {
        _this.equal(error.message, expected, splat.pop() || expected);
      } else {
        _this.ok(expected.test(error.message), splat.pop() || expected.toString());
      }
      return callback(error);
    } else {
      _this.ok(false, splat.pop() || expected.toString());
      return callback(null);
    }
  });
};

// Send a `Test::Harness` Bail Out! message to stdout. This is a message sent
// when further testing is impossible. Use it when a valuable resource is
// missing, or everything in the world is just plain wrong. It is sent as a
// result of uncaught exceptions, test timeouts.

//
Test.prototype.die = Test.prototype.bailout = function () {
  var drain, message, vargs = __slice.call(arguments, 0);
  if (this._timer) clearTimeout(this._timer);
  if (vargs.length == 1 && vargs[0] instanceof Error) {
    vargs = [ vargs[0].message, vargs[0].stack ];
  }
  if (typeof vargs[0] == "string" && !/\n/.test(vargs[0])) {
    message = "Bail out! " + vargs.shift() + "\n";
  } else {
    message = "Bail out!\n";
  }
  process.stdout.write(message);
  if (vargs.length) this.say.apply(this, vargs);
  require("fs").writeSync(1, "", 0);
  process.exit(1);
};

Test.prototype.say = function (object) {
  return this.__proof__comment(util.format.apply(this, arguments));
};

// Streamline.js flavor of cleanup, using the Streamline.js underscore suffix
// nomenclature.
Test.prototype.cleanup_ = function (done, cleaner) {
    var wrapper = function (done) { try { cleaner(done) } catch (e) { done(e) } };
    this.__proof__steps[1].push(parameterize(wrapper));
    wrapper(done);
};

// Silly to call this directly. It doesn't fit with the way Proof tests are
// organized.
Test.prototype.fail = function (expected, actual, message, operator, comment) {};

Test.prototype.callback = function () {
  var varg = __slice.call(arguments, 0);
  if (!varg.length || (varg.length == 1 && typeof varg[0] == "string")) {
    var name = varg.shift();
    this.__proof__callbacks.count++;
    return (function (error, result) {
      if (error) {
        if (this.__proof__steps.length && this.__proof__steps[0].length && ~this.__proof__steps[0][0].parameters.indexOf("error")) {
          name = "error", result = error;
        } else {
          this.bailout(error);
        }
      }
      if (name) {
        this.__proof__callbacks.results[name] || (this.__proof__callbacks.results[name] = []);
        this.__proof__callbacks.results[name].push(result);
      } else if (this.__proof__callbacks.count == 2 && result && typeof result == "object") {
        for (var key in result) this.context[key] = result[key]
      }
      if (++this.__proof__callbacks.called == this.__proof__callbacks.count) {
        this.__proof__invoke();
      }
    }).bind(this);
  } else while (varg.length) {
    this.__proof__steps[0].unshift(parameterize(varg.shift()));
  }
};

function parameterize (f) {
  var $ = /^function\s*[^(]*\(([^)]*)\)/.exec(f.toString());
  if (!$) throw new Error("bad function");
  f.parameters = $[1].split(/\s*,\s/);
  return f;
}

Test.prototype.__proof__invoke = function () {
  var arg
    , args = []
    , done = false
    , match
    , parameter, parameters
    , i, I
    , calledback
    , callback
    , step, key;
  delete this.context.error;
  this.__proof__timeout();
  for (;;) {
    if (! this.__proof__steps.length) {
      process.exit(this.__proof__actual == this.__proof__expected ? 0 : 1);
    }
    if (this.__proof__steps[0].length) {
      break;
    }
    this.__proof__steps.shift();
  }
  for (key in (this.__proof__callbacks.results || {})) {
    value = this.__proof__callbacks.results[key];
    this.context[key] = value && value.length == 1 ? value[0] : value;
  }
  step = this.__proof__steps[0].shift();
  // Register a cleanup function to run at exit, invoking it immediately to
  // cleanup a possible failed previous run.
  if (step.name == "cleanup" && this.__proof__steps.length > 1) {
    this.__proof__steps[1].push(step);
  }
  this.__proof__callbacks = { count: 0, called: 0, results: {} };
  for (i = 0, I = step.parameters.length; i < I; i++) {
    parameter = step.parameters[i];
    if (/^__proof__/.test(parameter[i])) continue;
    // Did not know that `/^_|done$/` means `^_` or `done$`.
    if (/^(_|done)$/.test(parameter)) {
      done = true;
      parameter = "__proof__done";
    }
    if (parameter == "__proof__done") {
      arg = this.callback();
    } else {
      arg = this.context[parameter];
      if (arg == null) {
        arg = typeof this[parameter] == "function" ? this[parameter].bind(this)
                                                   : this[parameter];
      }
    }
    args.push(arg);
  }
  // TODO Outgoing!
  switch (step.parameters.length) {
    case 1:
      if (args[0] == null && step.parameters[0] != "error") args[0] = this.context;
      break;
    case 2:
      if (done) {
        if (args[0] == null && step.parameters[0] != "error") {
          args[0] = this.context;
        } else if (args[1] == null && step.parameters[1] != "error") {
          args[1] = this.context;
        }
      }
  }
  callback = this.callback();
  try {
    result = step.apply(this, args);
  } catch (e) {
    this.bailout(e);
  }
  if (this.__proof__callbacks.count == 1) {
    if (typeof result == "object") {
      for (var key in result) {
        this.context[key] = result[key];
      }
    }
  }
  callback(null);
};

Test.prototype.__proof__execute = function (steps) {
  var i, I;
  for (i = 0, I = steps.length; i < I; i++) parameterize(steps[i]);
  this.__proof__steps = [ steps, [] ];
  untidy = process.env.PROOF_NO_CLEANUP || process.env.UNTIDY;
  untidy = untidy && /^(0|no|false)$/.test(untidy);
  if (untidy) {
    this.__proof__steps[1].push(parameterize(function () { process.exit() }));
  }
  this.__proof__invoke();
}

_ref = require("assert");

// Generate assertion member methods for the Test class from the assert library.
_fn = function (name, assertion) {
  return Test.prototype[name] = function () {
    var EXPECTED, inspect, message, splat;
    splat = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this.__proof__timeout();
    message = splat[splat.length - 1];
    try {
      assertion.apply(this, splat);
      return process.stdout.write("ok " + (++this.__proof__actual) + " " + message + "\n");
    } catch (e) {
      process.stdout.write("not ok " + (++this.__proof__actual) + " " + e.message + "\n");
      EXPECTED = name === "ok" ? true : splat[1];
      inspect = {
        EXPECTED: EXPECTED,
        GOT: splat[0]
      };
      inspect = require("util").inspect(inspect, null, Math.MAX_VALUE);
      return this.__proof__comment(inspect);
    }
  };
};

for (name in _ref) {
  assertion = _ref[name];
  if (Test.prototype[name] || name === "AssertionError") {
    continue;
  }
  _fn(name, assertion);
}

// We only export one method to both define harnesses and run tests.
module.exports = function () {
  var context, outer = __slice.call(arguments, 0);
  if (typeof outer[0] == "number") {
    (new Test(outer.shift())).__proof__execute(outer);
  } else {
    return function () {
      var inner = __slice.call(arguments, 0);
      (new Test(inner.shift())).__proof__execute(outer.concat(inner));
    };
  }
};

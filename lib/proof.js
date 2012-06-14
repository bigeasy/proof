var Test, assertion, die, execution, harness, name, say, util, _fn, _ref,
  __slice = [].slice;

util = require("util");

die = function () {
  var splat;
  splat = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  if (splat.length) {
    console.log.apply(console, splat);
  }
  return process.exit(1);
};

say = function () {
  var splat;
  splat = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return console.log.apply(console, splat);
};

function Test (_expected) {
  this._expected = _expected;
  this._housekeepers = [];
  this._actual = 0;
  this._timeout();
  process.stdout.write("1.." + this._expected + "\n");
}

// Print a string to standard out as a comment, prepending each line in the
// string with a hash mark.
Test.prototype._comment = function (string) {
  var i, lines, _i, _ref;
  lines = string.split(/\n/);
  for (i = _i = 0, _ref = lines.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    lines[i] = "# " + lines[i];
  }
  lines.push("");
  return process.stdout.write(lines.join("\n"));
};

// Set and reset a thirty second timeout between assertions.
Test.prototype._timeout = function () {
  var _this = this;
  if (this._timer) {
    clearTimeout(this._timer);
  }
  return setTimeout((function () {
    return _this.bailout("Timeout!");
  }), 30000);
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
Test.prototype.bailout = function (error) {
  var detail, lines, mesage, message;
  if (error instanceof Error) {
    mesage = error.message;
    detail = error.stack;
  } else if (error) {
    message = error.toString();
  }
  if (message != null) {
    lines = message.split(/\n/);
    if (lines.length > 1 && !(detail != null)) {
      detail = message;
    }
    message = "Bail out! " + lines[0] + "\n";
  } else {
    message = "Bail out!\n";
  }
  process.stdout.write(message);
  if (detail != null) {
    this._comment(detail);
  }
  return this._tidy(1);
};

Test.prototype.say = function (object) {
  var inspection;
  inspection = util.inspect.call(util.inspect, object, false, 1024);
  return this._comment(inspection);
};

// Register a cleanup function to run at exit, invoking it immediately to
// cleanup a possible failed previous run.
Test.prototype.cleanup = function () {
  var callback, housekeeper, _i;
  callback = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), housekeeper = arguments[_i++];
  this._housekeepers.push(function (callback) {
    try {
      if (housekeeper.length === 1) {
        return housekeeper(callback);
      } else {
        callback();
        return housekeeper(null);
      }
    } catch (e) {
      return callback(e);
    }
  });
  try {
    if (housekeeper.length === 1) {
      return housekeeper(function (error) {
        return callback[0](error);
      });
    } else {
      return housekeeper();
    }
  } catch (e) {
    return this.bailout(e);
  }
};

// Try to run the cleanup functions and bailout if any fail in any way. We copy
// the housekeepers property and empty it so we don't run more housekeepers from
// a bailout we invoke.
Test.prototype._tidy = function (code) {
  var housekeepers, tidy, untidy,
    _this = this;
  housekeepers = [];
  untidy = process.env.PROOF_NO_CLEANUP || process.env.UNTIDY;
  if (!(untidy && /^(0|no|false)$/.test(untidy))) {
    housekeepers = this._housekeepers.splice(0);
  }
  tidy = function () {
    var housekeeper;
    if (housekeeper = housekeepers.shift()) {
      return housekeeper(function (error) {
        if (error) {
          return _this.bailout(error);
        } else {
          return tidy();
        }
      });
    } else {
      return process.exit(code);
    }
  };
  return tidy();
};

// A healthy end to our test program. Call any teardown hooks set by the test
// harness and then exit reflecting the pass/fail state of the program.
Test.prototype._end = function () {
  if (this._timer) {
    clearTimeout(this._timer);
  }
  return this._tidy(this._expected === this._actual ? 0 : 1);
};

// Silly to call this directly. It doesn't fit with the way Proof tests are
// organized.
Test.prototype.fail = function (expected, actual, message, operator, comment) {};

Test.prototype.store = function (name) {
  var callback, _base;
  this._callbacks || (this._callbacks = {});
  (_base = this._callbacks)[name] || (_base[name] = {
    count: 0,
    results: []
  });
  this._callbacks[name].count++;
  callback = function (error, result) {
    var key, value, _ref;
    if (error) {
      this.bailout(error);
    }
    this._callbacks[name].results.push(result);
    if (!--this._callbacks.count) {
      _ref = this._callbacks;
      for (key in _ref) {
        value = _ref[key];
        if (value.count === 1) {
          this.context[key] = value.results[0];
        } else {
          this.context[key] = value.results;
        }
      }
      return this._invoke();
    }
  };
  return callback.bind(this);
};

Test.prototype._invoke = function () {
  var arg, args, calledback, match, parameter, parameters, _i, _len, _ref, _ref1, _ref2;
  if (this._procedures.length === 0) {
    return this._callback();
  } else {
    match = /^function\s*[^(]*\(([^)]*)\)/.exec(this._procedures[0].toString());
    if (!match) {
      throw new Error("bad function");
    }
    args = [];
    calledback = false;
    parameters = match[1].split(/\s*,\s/);
    for (_i = 0, _len = parameters.length; _i < _len; _i++) {
      parameter = parameters[_i];
      switch (parameter) {
        case "callback":
        case "_":
          args.push((function (error) {
            if (error) {
              return this.bailout(error);
            } else {
              return this._invoke();
            }
          }).bind(this));
          calledback = true;
          break;
        default:
          arg = this.context[parameter];
          if (arg == null) {
            arg = typeof this[parameter] === "function" ? this[parameter].bind(this) : void 0;
          }
          args.push(arg);
      }
    }
    switch (parameters.length) {
      case 1:
        if (!calledback) {
          if ((_ref = args[0]) == null) {
            args[0] = this.context;
          }
        }
        break;
      case 2:
        if (calledback) {
          if ((_ref1 = args[0]) == null) {
            args[0] = this.context;
          }
          if ((_ref2 = args[1]) == null) {
            args[1] = this.context;
          }
        }
    }
    this._callbacks = null;
    try {
      this._procedures.shift().apply(this, args);
      if (!(calledback || this._callbacks)) {
        return this._invoke();
      }
    } catch (e) {
      return this.bailout(e);
    }
  }
};

_ref = require("assert");

// Generate assertion member methods for the Test class from the assert library.
_fn = function (name, assertion) {
  return Test.prototype[name] = function () {
    var EXPECTED, inspect, message, splat;
    splat = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this._timeout();
    message = splat[splat.length - 1];
    try {
      assertion.apply(this, splat);
      return process.stdout.write("ok " + (++this._actual) + " " + message + "\n");
    } catch (e) {
      process.stdout.write("not ok " + (++this._actual) + " " + e.message + "\n");
      EXPECTED = name === "ok" ? true : splat[1];
      inspect = {
        EXPECTED: EXPECTED,
        GOT: splat[0]
      };
      inspect = require("util").inspect(inspect, null, Math.MAX_VALUE);
      return this._comment(inspect);
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

execution = function () {
  var callback, callbacks, context, splat, test, _context;
  test = arguments[0], splat = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  if (splat.length === 1) {
    callback = splat[0];
    try {
      if (callback.length === 1) {
        return callback.call(test, function (error) {
          if (error) {
            return test.bailout(error);
          } else {
            return test._end();
          }
        });
      } else {
        callback.call(test);
        return test._end();
      }
    } catch (error) {
      return test.bailout(error);
    }
  } else {
    context = splat[0], callbacks = splat[1];
    if (typeof context === "function") {
      try {
        if (context.length === 0) {
          _context = context.call(test);
          return execution(test, _context, callbacks);
        } else {
          return context.call(test, function (error, _context) {
            if (error) {
              return test.bailout(error);
            } else {
              return execution(test, _context, callbacks);
            }
          });
        }
      } catch (error) {
        return test.bailout(error);
      }
    } else {
      try {
        return execution(test, function (callback) {
          test._procedures = callbacks;
          test._callback = callback;
          test.context = context;
          return test._invoke();
        });
      } catch (error) {
        return test.bailout(error);
      }
    }
  }
};

// We only export one method to both define harnesses and run tests.
module.exports = harness = function () {
  var callback, context, expected, splat;
  splat = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  if (splat.length === 1) {
    context = splat[0];
    return function () {
      var callbacks, expected;
      expected = arguments[0], callbacks = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return execution(new Test(expected), context, callbacks);
    };
  } else {
    expected = splat[0], callback = splat[1];
    return execution(new Test(expected), callback);
  }
};

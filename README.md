# Proof &#x2713; [![Build Status](https://secure.travis-ci.org/bigeasy/proof.png?branch=master)](http://travis-ci.org/bigeasy/proof)

A cross-platform UNIX way test non-framework for JavaScript.

## Questions?

If you have a general question, please ask it. I've created a [issue to discuss
Proof](https://github.com/bigeasy/proof/issues/96) to notify you of updates. Use
it to discuss what version 0.2.0 should be.

Please ask questions in the issue, on the Node.js listserv or come find me, in
IRC on freenode as `prettyrobots`, I'm there most of the time.

## Philosophy

Proof is a UNIX way test non-framework for the mightily lazy programmer.

In Proof, a **unit test** is a **program**. It does not need a runner to run. A
program emits minimal `Perl` `Test::Harness` output. Failed assertions appear as
comments in the file output.

**You write your quick and dirty diagnostics to standard error.** The test
runner will hide it from you during normal test runs. If there is a test failure
you can run the test program directly to see the error spew.

The Proof test runner execute test programs as child processes. **If a test fails,
even catastrophically, the test runner tests on.**

**Let the operating system do set up and tear down.** When a test process exits,
even when it fails catastrophically, resources are freed for the next test
process. The test runner does not load or evaluate JavaScript, set tests up up
or tear tests down. Why count on what amounts to a fragile program loader, when
you've got a full blown operating system at your disposal?

When there is housekeeping to be done &mdash; databases to be reset, temporary
files to be deleted &mdash; we still don't clean up after ourselves. **We clean
up before ourselves.** You use Proof harnesses to clean up after the *previous*
test process at the start of the *next* test process, when everything is stable.

With this in place, you are encouraged to **be a slob** in your test code.  Each
test is a short lived process, so feel free to suck up memory, leave file
handles open, and leave sockets open. The operating system knows how to close
them when your program exits. It won't affect the test runner, or test
performance.

Well, you'll probably always **be a meticulous programmer**, who would never
leave a file handle open, but still; you don't have to develop a strategy for
error handling in code that is supposed to exercise edge cases. You don't have
to *try* to *catch* the crazy monkey bananas thrown from code in development.
You have a simple, universal strategy that works for normal operation, all tests
passed, as well at the who-would-ever-have-imagined-that failures.

And that's not all.

Proof is convention over configuration until configuration is zero. Programs are
organized into directories, which act as suites. The test runner will run suites
in parallel, one test at a time from each suite. **You don't have to think about
parallel to get parallel.** Your operating system does parallel for you just
fine, so we use the operating system.

Proof is a ***parallel*** test runner, with a ***terse*** syntax that runs
***tests that are programs***, and can ***handle almost any exception*** and
keep running tests.

### Install

Via NPM.

```
npm install proof
```

To test via NPM, by extension [Travis CI](http://travis-ci.org/), create a
`package.json` for your project that includes the following properties.

```json
{   "name":             "fibonacci"
,   "version":          "1.0.3"
,   "author":           "Alan Gutierrez"
,   "directories":      { "lib" : "./lib" }
,   "devDependencies":  { "proof": ">=0.0.1" }
,   "scripts":          { "test": "proof t/*/*.t" }
,   "main":             "./lib/fibonacci"
}
```

Now you can run `npm test` to test your project.

### Every Test is a Program

Every test is a program.

Place your test in a file under a test directory in your project. Add a shebang
line and make the file executable.

By convention, all tests are given a `.t` file extension, regardless of the
language the test is written in. By convention, the test directory is named
`./t` relative to the project root, but `./test` is good too.

Minimal unit test.

```javascript
#!/usr/bin/env node
require('proof')(1, function (ok) {
  ok(true, 'true is true');
});
```

The first argument to test is the number of tests to expect. If to many
or too few tests are run, the test runner will detect it and report it.

The call to `require('proof')` returns a function. You can call
it immediately. That makes your test preamble quick and to the point.

This is analogous to the above.

```javascript
#!/usr/bin/env node
var test = require('proof');

test(1, function (ok) {
  ok(true, 'true is true');
});
```

Here's a test with two assertions.

```javascript
#!/usr/bin/env node
require('proof')(2, function (ok, equal) {
  ok(true, 'true is true');
  equal(2 + 2, 4, 'test addition');
});
```

You can see that the second argument to `test` is your program. All of the
assertions in [`require("assert")`](http://nodejs.org/api/assert.html) are
available to your test function, all you need to do is ask for them in your
function arguments. Proof with give them to you as you need them.

### Step by Step Asynchronous Tests

Proof has a built in control flow library ala Step, that simplifies testing of
asynchronous code. Most of the time, you're going to simply want to step through
a series of calls and bail out on the slightest error. Proof is ergnomoically
optimized for this common case.

```javascript
#!/usr/bin/env node
var fs = require('fs');

require('proof')(1, function (step) {

  fs.readFile(__filename, step());

}, function (body, ok) {

  ok(/proof/.test(body), 'found proof');

});
```

For basic asynchronous testing, there's no need to nest your code into a temple
of doom. The control flow library is there to keep your control flow shallow.

When you do need to some serious asynchronous spelukning, Proof also supports
supports complicated asynchronous concepts like parallelism and branching.

```javascript
#!/usr/bin/env node
var fs = require('fs');

// Antidisestablishmentarianism

require('proof')(1, function (step) {

  var tree = [ __dirname ], count;

  step(function nextDirectory () {

    if (tree.length) return tree.shift();
    else step(null, count);

  }, function (directory) {

    fs.readdir(directory, step());

  }, function nextEntry (list, directory, nextDirectory) {

    if (list.length) return path.resolve(directory, file);
    else step(nextDirectory)();

  }, function (file) {

    fs.stat(file, step());

  }, function (stat, file, nextEntry) {

    if (stat.isDirectory()) {
      tree.push(file);
      step(nextEntry)();
    } else {
      fs.readFile(file, 'utf8', step());
    }

  }, function (body, nextEntry) {

    if (/Antidisestablishmentarianism/.test(body)) count++;
    step(nextEntry)();

  });

}, function (count) {

  ok(count, 1, 'one file contains possible seditious and blasphemous language');

});
```

The test above walks through the test directory asynchronously, looking for the
word "Antidisestablishmentarianism" in the files it encounters. The above test
proceeds through the directory tree serially, using named functions as branch
labels to repeatedly visit each directory and file.

### Shebang all the Langauges

Actually, you an use any langauge with Proof. Emit TAP. Proof will report it.

```bash
#/bin/bash

echo "1..1"

true && echo "ok 1 truth is true"
```

You can use Proof to test your next C project, one that that has a dozens of
little test programs that emit simple TAP.

You can use other languages to verify the integrity of your JavaScript library.

In [Timezone](https://github.com/bigeasy/timezone), for example, I verify that
my  JavaScript time zone compiler correctly parses the IANA Timezone database
using Ruby's `strftime` implementation. I wrote a Ruby program that emits TAP
and tests each clock transition in the database.

### Create More Tests More Frequently With Harnesses

With an Proof harness you can give a test everything it needs to run with as
little as two lines of code.

Write a harness that does the setup for a test.  It will load the libraries
necessary to write a test against a subsystem of your project.

By convention, we name give our test harnesses a file name with a base of
`proof`. This allows us to continue to `require("./proof")`, which is such a
clever thing to say. The test harness file should have an extension of one of
the supported languages, either `.coffee`, `` ._coffee ``, `.js` or `` ._js ``.

In the harness you create a context `Object` and stuff it with useful bits and
pieces for your test.

```javascript
module.exports = require('proof')(function () {
  context = {}
  context.example = { firstName: "Alan", lastName: "Gutierrez" }
  context.model = require("../../lib/model")
  return context;
});
```

You would place the above in a file named `proof.js`, for example.

Now you can write tests with a mere two lines of preamble. The common setup for
the tests in your test suite is in your harness.

```javascript
#!/usr/bin/env node
require('./proof')(2, function (example, model, equal) {
  equal(model.fullName(exmaple), "Alan Gutierrez", "full name");
  equal(model.lastNameFirst(exmaple), "Gutierrez, Alan", "last name first");
});
```

### Asynchronous Harnesses

Some setup will require asynchronous calls. Database connections are a common
case. You can create asynchronous harnesses by providing a callback function
instead of an object to the require method in your harness.

The callback function will itself get a callback that is used to return an
object that is given to the test program.

```javascript
#!/usr/bin/env node

var mysql = require('mysql'), fs = require('fs');

module.exports = require('proof')(function (step) {

  fs.readFile('./configuration.json', 'utf8', step());

}, function (file) {

  var db = new mysql.Database(JSON.stringify(file));
  db.connect(step());

}, function (connection) {

  return { connection: connection };

});
```

The test itself is no more complicated.

```javascript
#!/usr/bin/env _coffee
require('./proof')(1, function (connection, step) {

  step(function () {

    connection.sql("SELECT COUNT(*) AS num FROM Employee", step());

  }, function (results) {

    equal(12, results[0].num, "employee count");

    connection.close(step());

  });
});
```

Note that, you can use asynchronous harnesses with synchronous tests, and create
asynchronous tests from synchronous harnesses.

### Assertions

Proof defines the assertions `ok`, `equal`, `notEqual`, `deepEqual`,
`notDeepEqual`, `strictEqual`, and `notStrictEqual`. They are identical to the
assertions of the same named defined in the
[assert](http://nodejs.org/api/assert.html) Node.js module, except that they
print a message to `stdout`, instead of throwing an exception.

```javascript
#!/usr/bin/env node
require('proof')(3, funciton (ok, equal, deepEqual) {
  ok(true, 'truth works');
  equal(1 + 1, 2, 'math works');
  deepEqual('a b'.split(/\s/), [ "a", "b" ], 'strings work');
});
```

Proof does not define a `throws` assertion. Instead, it uses the asynchronous
control flow to test assertions.

When a step function in the control flow starts with the argument `error`, it
indicates that this is an error handling step.

```javascript
#!/usr/bin/env node
require('proof')(1, function () {

  throw new Error('oops');

}, function (error, equal) {

  equal(error.message, 'oops', 'error thrown');

});
```

If no error is thrown, the assertion is not test, the count of passed tests is
wrong and the test fails.

You can test asynchrnonous error the same way.

```javascript
#!/usr/bin/env node

var fs = require('fs');

require('proof')(1, function (step, say) {

  say('testing file not found'); // be chatty, why not?
  fs.readFile(__dirname + '/i-do-not-exist.txt', step());

}, function (error, equals) {

  equals(error.code, 'ENOENT', 'file does not exist');

});
```

Try not to worry about failure being inferred from count. It is actually really
easy to see what what went wrong with a test with you keep your tests programs
unit focused.

### Exception Handling

When a test is healthy, it is healthy for the test to release resources. When a
test fails catastrophically, Proof lets the operating system do the hard work of
releasing system resources, such as memory, sockets and file handles.

Here's a test that opens a file handle, then closes it like a good citizen.

```javascript
#!/usr/bin/env node

require('./proof')(1, function (step) {

  var buffer = new Buffer(2), fs = require('fs');

  step(function () {

    fs.open(__filename, "r", step());

  }, function (fd) {

    fs.read(fd, buffer, 0, buffer.length, 0, step());

  }, function (equal) {

    equal(buffer.readInt16BE(0), 0x2321, 'shebang magic number');

    fs.close(fd, step())

  });
});
```

But, what if there is a catastrophic error? Let's say that in the code above,
the `Buffer` cannot be allocated because the system is out of memory. What
happens? An exception is thrown, the process exits, and the operating system
closes the file handle.

The operating system? Aren't we always supposed to close our own file handles?

Well, we could register an error handler to run at the last minute, or we could
create a towering pyramid of try/catch blocks, but why bother? None of that will
matter if your test has hung and you feed it a `kill -9`.

Trying to write exception handlers that account for every possible error that a
test might find in code that is under active development is a tall order and a
not a good use of your time.

Test code is supposed to raise unexpected exceptions. It is supposed to discover
the unexpected. Let your tests find the exceptions. Let your operating system
clean up after your tests when the exceptions are found.

### Housekeeping

Because each test is a short lived program, we can count on the operating system
to reclaim resources like memory, file handles, and sockets when exceptions
occur. But there is state that will not be reclaimed automatically. The most
obvious example is temporary files and directories. We reclaim these using
***cleanup functions***.

We're so meticulous, we run our cleanup functions twice for each test. Rather
than counting on our test to clean up after itself, when it might be in bad
shape due to some unforeseen error state, we count on it to always ***cleanup
before itself***, at the start of the test program, when it is most stable.

We do try to run our test again at exit. What we don't do is jump through hoops
to ensure that our cleanup functions are called at exit. We could register exit
handlers and create intricate try/catch blocks, but the test still might not run
its cleanup functions at exit if the test exhausts system memory, segfaults, or
gets a `kill -9`. We can't guarantee a cleanup at exit, so we don't count on it.

Because your cleanup functions are run twice, they must be **idempotent**, as
the kids like to say. You must be able to run a cleanup function over and over
again and get the same results.  If a cleanup function deletes a temporary file,
for example, it can't complain if the temporary file has already been deleted.

```javascript
#!/usr/bin/env node

var mysql = require('mysql'), fs = require('fs');

module.exports = require('proof')(function (step) {
  var tmp = __dirname + '/tmp';

  step(function cleanup () { // named cleanup, so run again at exit

    // nested step delete of tmp directory and contents.
    step(function () {
      fs.readdir(tmp, step());
    }, function (error) {
      if (error.code == 'ENOENT') step(); // done
      else throw error; // unexpected
    }, function (list) {
      list.forEach(function (file) {
        fs.unlink(path.resolve(tmp, file), step());
      });
    }, function () {
      fs.rmdir(tmp, step());
    }

  }, function () {

    // create a new tmp directory for our test
    fs.mkdir(tmp, 0755, step());

  }, function () {

    // give our test the tmp directory
    return { tmp: tmp };

  })
});
```

When we register a cleanup function, the cleanup function is called upon
registration. Cleanup functions are run at the start of a test to cleanup in
case our last test run exited abnormally. As long as the test does not exit
abnormally, the cleanup function is called again at exit.

In the harness above, we register a cleanup function that deletes files in a
temporary directory, then deletes the temporary directory. If the directory
doesn't exist, that's okay, we catch the `ENOENT` exception and return. Because
the cleanup function is called when we pass it to `step`, we're assured a clean
slate. We call `fs.mkdir` without checking to see if it already exists. We know
that it doesn't.

Now we can use our temporary directory in a test. The test doesn't have to
perform any housekeeping. We can write test after test in the same suite, each
one making use of this temporary directory, because it is cleaned up after or
before every run.

```javascript
#!/usr/bin/env node

var fs = require('fs'), exec = require('child_process').exec;

require('./proof')(1, function (tmp, step) {
  var program = tmp + '/example.sh'

  step(function () {
    fs.writeFile(program, '#!/bin/bash\nexit 1\n', 'utf8', step());
  }, function () {
    fs.chmod(program, 0755, step());
  }, function () {
    exec(program, step());
  }, function (error, equal) {
    equal(error.code, 1, 'exit code');
  });
});
```

In the test above, we create a bash program to to test that error codes work
correctly. If no exception is thrown, the test runner will report that a test
was missed.

Tests can register cleanup functions too. It is generally easier to keep them in
the harnesses, but its fine to use them in tests as well.

```javascript
#!/usr/bin/env node

var fs = require('fs'), exec = require('child_process').exec;

require('./proof')(1, function (tmp, step) {
  var program = __dirname + '/example.sh'

  step(function cleanup() {
    step(function () {
      fs.unlink(program, step());
    }, function (error) {
      if (error.code != 'ENOENT') throw error;
    });
  }, function () {
    fs.writeFile(program, '#!/bin/bash\nexit 1\n', 'utf8', step());
  }, function () {
    fs.chmod(program, 0755, step());
  }, function () {
    exec(program, step());
  }, function (error, equal) {
    equal(error.code, 1, 'exit code');
  });
});
```

Here our test creates a temporary file in the same directory as the test,
instead of in a harness provided temporary directory. It registers a cleanup
function that deletes the file, so that the file is deleted before and after we
write to it.

A useful pattern falls out of cleanup before. You may want to skip cleanup at
exit so you can inspect the file output of a test. If so, you can set the
environment variable `UNTIDY=1` before running an individual test. It will
cleanup before the test but not after. Now you can go through an edit, test,
inspect cycle and watch how the output changes.

We count on cleanup before a test to allow us to keep running our tests until
they pass, without having us have to stop and cleanup cruft after each because a
test is exiting abnormally. If tests are exiting normally, regardless of whether
they pass or fail, they will clean up after themselves, leaving your project
directory nice and tidy after each run.

### Running Tests

A test is a program. You can run a test to see its output.

```
$ t/logic/minimal.t
1..2
ok 1 true is true
ok 2 test arithmetic
$
```

By immutable convention, tests are grouped together by directory. The tests
within a directory are considered a suite of tests. Test suites are generally
kept in a directory `t` off the root of the project.

```
$ find t
t/logic/minimal.t
t/regex/minimal.t
t/regex/complex.t
$
```

You can run a test with the proof test runner to get gaudy console output with
colors and non-ASCII characters (approximated below).

<pre>
$ proof t/logic/minimal.t
 &#x2713; t/logic/minimal.t ....................................... (2/2) 0.230 Success
                                      tests (1/1) assertions (2/2) 0.230 Success
$
</pre>

Each test you pass to the test runner is will be run by the test runner. Tests
in separate suites are run in parallel.

<pre>
$ proof t/logic/minimal.t t/regex/minimal.t
 &#x2713; t/logic/minimal.t ....................................... (2/2) 0.230 Success
 &#x2713; t/regex/minimal.t ....................................... (2/2) 0.331 Success
                                      tests (2/2) assertions (4/4) 0.561 Success
$
</pre>

### Tests Run in Parallel

As above.

<pre>
$ proof t/logic/minimal.t t/regex/minimal.t t/regex/complex.t
 &#x2713; t/logic/minimal.t ....................................... (2/2) 0.230 Success
 &#x2713; t/regex/minimal.t ....................................... (2/2) 0.331 Success
 &#x2713; t/regex/complex.t ....................................... (2/2) 1.045 Success
                                      tests (3/3) assertions (6/6) 1.606 Success
$
</pre>

Because each test is a program, parallelism is simply a matter of running more
than one test program at once. The default mode of the proof runner is to run four
test programs a time.

The runner will run a test program from each suite, for up to four programs
running at once. When a suite it complete, it moves onto the next one.

Tests within suites are run one after another, in the order in which they were
specified on the command line.

If you design your tests so that they can run in any order, then you can run an
entire suite of tests with globbing.

<pre>
$ proof t/*/*.t
 &#x2713; t/logic/minimal.t ....................................... (2/2)  .230 Success
 &#x2713; t/regex/minimal.t ....................................... (2/2)  .331 Success
 &#x2713; t/regex/complex.t ....................................... (2/2) 1.045 Success
                                      tests (3/3) assertions (6/6) 1.606 Success
$
</pre>

Generally avoid making tests depend on being run in a specific order. That way
you can get parallelism easily.

Suites run in parallel. You can group your tests however you like, by feature,
subsystem, stages of workflow.

Make sure they can run in parallel though. You may have a single MySQL database
to use for testing. You'll have to  group all your MySQL tests in a suite, you
can be sure that they won't stomp on each other. If your application supports
either MySQL or PostgreSQL, you could run those tests in parallel.

If every test expects to hit a MySQL database, then create a separate MySQL
database for each suite. Not a big deal, really, and then you have your tests
running in parallel.

### Continuous Integration With Travis CI

For an example of Travis CI output, you can look at the [output from Proof
itself](http://travis-ci.org/#!/bigeasy/proof).

With a minimal `.travis.yml` and Proof will work with Travis CI.

```
language: node_js

node_js:
  - 0.6

before_install:
  - npm install --dev
  - git submodule init && git submodule update
```

However, `npm install --dev` will recursively install development dependencies,
bringing in all of CoffeeScript, which is not necessary. Explicitly installing
your development dependencies makes your Travis CI output much less verbose.

```
language: node_js

node_js:
  - 0.6

before_install:
  - npm install
  - npm install proof coffee-script streamline
  - git submodule init && git submodule update
```

If you are not using Streamline.js exclude `streamline`. If you are not using
CoffeeScript exclude `coffee-script`. Add additional development dependencies to
suit your project's needs.

## Change Log

Changes for each release.

### Version 0.0.27

Thu Mar 21 08:54:41 UTC 2013

 * Implement execute in tests using Cadence events. #147.
 * Upgrade Cadence to 0.0.15.
 * Upgrade Arguable to 0.0.8.
 * Replace `exit` event of child processes with `close`. #149.
 * Move binary and library into the root of the project directory. #148.
 * Git rid of default action, report usage instead. #146.
 * Rename default action to `test` and move it into the main binary. #145.

### Version 0.0.26

Tue Mar 19 04:57:56 UTC 2013

 * Meld harness and program into single cadence. #144.

### Version 0.0.25

Mon Mar 18 07:20:00 UTC 2013

 * Tidy `lib/proof.js` variable names for harness and program functions. #143.
 * Pass named parameters into harness functions. #142.
 * Generalize `parameterize` function in `lib/proof.js`. #141.
 * Allow user to override assertions. #139.
 * Fix export of `say` and `die`. #137.

### Version 0.0.24

Sun Mar 17 06:28:06 UTC 2013

 * Upgrade Cadence to 0.0.13.
 * Add contribution guide.

### Version 0.0.23

Sat Mar 16 06:03:02 UTC 2013

 * Upgrade Cadence to 0.0.12.
 * Remove dependency on Cadence hidden context. #136.

### Version 0.0.22

Tue Mar 12 08:00:30 UTC 2013

 * Remove arity from `t/node/cleanup/test.t.js`. #132.
 * Upgrade Cadence to 0.0.11. #135.

### Version 0.0.21

Tue Mar 12 06:52:06 UTC 2013

 * Upgrade Cadence to 0.0.10. #134.
 * Export Cadence. #127.
 * Flatten arguments to Cadence. #131.

### Version 0.0.20

Tue Mar  5 03:50:01 UTC 2013

 * Add `proof platform` Arguable usage message. #130.

### Version 0.0.19

Tue Mar  5 03:22:27 UTC 2013

 * Upgrade Cadence to rename `async` to `step`. #129.

### Version 0.0.18

Fri Mar  1 03:45:03 UTC 2013

 * Tidy.
 * Upgrade Arguable to 0.0.6. #120.
 * Upgrade Cadence to 0.0.7. #110.
 * Drop support for Node.js 0.6. #124.
 * Wait on test program `close` instead of `exit`. #123.

### Version 0.0.17

Mon Feb 18 07:42:56 UTC 2013

 * Report missing tests from errors/progress runners. #121.

### Version 0.0.16

Sun Dec  9 17:25:16 UTC 2012

 * Unclutter root of project directory. #118. #119.
 * Progress runner exits with success when no input is given. #114.
 * Unclutter package.json. #114.
 * Add Node.js 0.8 to Travis CI build. #117.
 * Add source language file suffix to test program files. #115.
 * Rewrite `README.md`. #85. #107. #108.

### Version 0.0.15

Fri Jul 13 17:00:01 UTC 2012

 * Upgrade to Cadence 0.0.5. #104.

### Version 0.0.14

Thu Jul 12 01:50:03 UTC 2012

 * Platform detection program. #102.
 * Animate Windows. #103.
 * Print summary on `run` and `plan`. #28.

### Version 0.0.13

Wed Jul 11 22:43:24 UTC 2012

 * Run on Windows. #101. #99. #98. #47.

### Version 0.0.12

Sun Jul  8 05:58:51 UTC 2012

 * Upgrade to Cadence 0.0.2. #100.

### Version 0.0.11

Sun Jul  8 05:24:13 UTC 2012

 * Extract Cadence control flow library. #97. #90. #52.
 * Convert to closure style removing `Test` class. #91.
 * The `fail` method will print a `not ok`. #94.
 * `UNTIDY` is working again. #92.
 * Removed the Streamline.js specific `throws` and `` cleanup_ `` functions. #93.
 * Removed the implicit `context` argument that was used with structured
   assignment in CoffeeScript tests. #80.

### Version 0.0.10

Sat Jun 30 16:41:44 UTC 2012

 * `proof progress` exits non-zero for any failure. #87.

### Version 0.0.9

Fri Jun 29 13:59:21 UTC 2012

 * Preserve leading whitespace in output parsing. #27.
 * Usage messages for all commands. #23.
 * Nested control flow. #51.
 * Detect variables leaked to the global namespace. #54.
 * Variable argument say. #30.
 * Create `die` as alias of `bailout`. #31.
 * Use inspector for recursive dump of `say` and `bailout`. #33.
 * Report failure if actual tests exceed expected tests. #77
 * Add switch to `proof progress` to disable colorization. #76.
 * Detect tests without plans. #75.
 * Display compilation error output. #22.

### Version 0.0.8

Thu Jun 28 21:05:46 UTC 2012

 * Wait on pending output before exit. #72.

### Version 0.0.7

Wed Jun 27 18:22:41 UTC 2012

 * Fixed `this` binding error in `bailout`. #68.
 * Development dependencies in `pacakage.json` only. #66.
 * Populated `.npmignore`. #67.
 * Increase digit width to fit. #26.

### Version 0.0.6

Wed Jun 27 17:08:41 UTC 2012

 * Added `TIMELESS` environment variable switch to disable timeouts. #60.
 * Fix named callbacks. #57.
 * Ensure that step finished before next step begins when generated callback is
   called. #50.
 * Restore animation through inherited stdio. #38.
 * `getopt` like option parser. #49.
 * Nicer error messages. #17.
 * Named cleanup functions. #48.

### Version 0.0.5

Sat Jun 16 10:01:21 UTC 2012

 * Exit non-zero if actual does not equal expxected. #46.
 * Hide `Test` private members. #45.
 * Using JavaScript flows everywhere. #44. #43. #41. #40.
 * Orgnaize tests by language. #42.
 * Convert to JavaScript. #37.
 * Extracting context into callback parameters. #39.
 * Step-like asynchronous flow utility. #14.
 * Pipeline scaffolding. #18.
 * Build CoffeeScript with Makefile. #32.
 * `proof-errors` non-zero exit. #34.
 * `UNTIDY` alias for `` PROOF_NO_CLEANUP ``. #29.

### Version 0.0.4

Sun May 13 19:43:30 UTC 2012

 * Showing standard error and standard output prior to a failed test or a bail
   out in failed assertions display. #24.

### Version 0.0.3

Sun May 13 17:24:09 UTC 2012

 * `proof errors` displays bail outs. #20.
 * Created `proof errors` to display the failed assertions of a failed test run. #5.
 * Fail on when passed tests exceed expected tests. #6.
 * Correctly reporting tests that fail before they start, like failure to
   compile. #8.
 * Set width of progress display using `--width` option. #19.
 * Set width of progress timing display using `--digits` option. #16.
 * Fixed spelling in documentation and comments, cleanup documentation. #10. #9.
 * Abend when test is specified twice in a run. #4.
 * Spell check `README.md`.

### Version 0.0.2

Wed May  9 03:52:57 UTC 2012

 * Correctly summing assertions. #13.
 * Failed assertions no longer repeat message. #11.
 * Initial release.

# Proof &#x2713; [![Build Status](https://secure.travis-ci.org/bigeasy/proof.png?branch=master)](http://travis-ci.org/bigeasy/proof)

A test non-framework for CoffeeScript and Streamlined CoffeeScript.

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

Proof is a ***parallel*** test runner, with a ***terse*** syntax and
***generated*** scaffolding, that runs ***tests that are programs***, and can
***handle almost any exception*** and keep running tests.

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

```coffeescript
#!/usr/bin/env coffee
require("proof") 1, -> @ok true, "true is true"
```

The first argument to test is the number of tests to expect. If to many
or too few tests are run, the test runner will detect it and report it.

The call to `require("proof")` returns a function. You can call
it immediately. That makes your test preamble quick and to the point.

This is analogous to the above.

```coffeescript
#!/usr/bin/env coffee
test = require "proof"

test 1, ->
  @ok true, "true is true"
```

Here's a test with two assertions.

```coffeescript
#!/usr/bin/env coffee
require("proof") 2, ->
  @ok true, "true is true"
  @equal 2 + 2, 4, "test addition"
```

You can see that the second argument to `test` is your program. All of the
assertions in [`require("assert")`](http://nodejs.org/api/assert.html) are
available to your test function. They are bound to `this` so you can get to them
using the `@` operator in CoffeeScript.

### Streamline Auto-Detected

Minimal streamlined unit test. Simply add a callback parameter to your callback
and your test is called asynchronously.

```coffeescript
#!/usr/bin/env _coffee
fs   = require "fs"
require("proof") 1, (_) ->
    found = /test/.test(fs.readFile(__filename, "utf8", _))
    @ok found, "found the word test"
```

When you give a test a callback with a single parameter, it calls that function
with a `function (error) {}`. This is the callback function is required by
Streamline.js.

No shims for Streamline.js code. Proof is Streamline.js friendly.

### Create More Tests More Frequently With Harnesses

With an Proof harness you can give a test everything it needs to run with as
little as two lines of code.

Write a harness that does the setup for a test.  It will load the libraries
necessary to write a test against a subsystem of your project.

By convention, we name give our test harnesses a file name with a base of
`proof`. This allows us to continue to `require("./proof")`, which is such a
clever thing to say. The test harness file should have an extension of one of
the supported languages, either `.coffee`, `._coffee`, `.js` or `._js`.

In the harness you create a context `Object` and stuff it with useful bits and
pieces for your test. 

```coffeescript
context = {}
context.example = { firstName: "Alan", lastName: "Gutierrez" }
context.model = require("../../lib/model")
module.exports = require("proof") context
```

You would place the above in a file named `proof.coffee`, for example.

Now you can write tests with a mere two lines of preamble. The common setup for
the tests in your test suite is in your harness.

```coffeescript
#!/usr/bin/env coffee
require("./proof") 2, ({ example, model }) ->
  @equal model.fullName(exmaple), "Alan Gutierrez", "full name"
  @equal model.lastNameFirst(exmaple), "Gutierrez, Alan", "last name first"
```

### Auto-Generate Test Skeletons From Harnesses

Once you have a harness, you can use `proof create` to generate tests based on
your harness.

```
$ proof create t/model/formats.t model example
$
```

You'll have a new test harness. The execute bit is set. It is ready to go.

```coffeescript
#!/usr/bin/env coffee
require("./proof") 0, ({ example, model }) ->

  # Here be dragons.
```

Now you can write your test.

Proof assumes that you've created a harness in the target directory named
`proof.js`, `proof._js`, `proof.coffee` or `proof._coffee`. You might decide to
have different name or path for your harness, or you might want to use
streamline, or specify a starting number of tests. Just type it out and proof
will figure it out.

```
$ proof create t/model/formats.t 2 db ../db-harness _
$
```

Would generate.

```coffeescript
#!/usr/bin/env _coffee
require("./proof") 2, ({ db }, _) ->

  # Here be dragons.
```

If your harness is written in Streamline.js or you provide an underscore on the
command then, then Proof uses `_coffee` as the executable in the shebang line.
Otherwise it uses `coffee`.

### Asynchronous Harnesses

Some setup will require asynchronous calls. Database connections are a common
case. You can create asynchronous harnesses by providing a callback function
instead of an object to the require method in your harness.

The callback function will itself get a callback that is used to return an
object that is given to the test program.

```coffeescript
#!/usr/bin/env _coffee
mysql   = require "mysql"
fs      = require "fs"
module.exports = require("proof") (callback) ->
  fs.readFile "./configuration.json", "utf8", (error, file) ->
    if error
      callback error
    else
      mysql = new mysql.Database(JSON.stringify file)
      mysql.connect (error, connection) ->
        if error
          callback error
        else
          callback null, { connection }
```

Or streamlined.

```coffeescript
#!/usr/bin/env _coffee
mysql   = require "mysql"
fs      = require "fs"
module.exports = require("proof") (_) ->
  file = fs.readFile "./configuration.json", "utf8", _
  mysql = new mysql.Database(JSON.stringify file)
  conneciton = mysql.connect _
  { connection }
```

The test itself is no more complicated.

```coffeescript
#!/usr/bin/env _coffee
require("./proof") 1, ({ connection }, _) ->
  results = connection.sql("SELECT COUNT(*) AS num FROM Employee", _)
  @equal 12, results[0].num, "employee count"
  connection.close()
```

Note that, you can use asynchronous harnesses with synchronous tests, and create
asynchronous tests from synchronous harnesses.

### Assertions

Proof defines the assertions `ok`, `equal`, `notEqual`, `deepEqual`,
`notDeepEqual`, `strictEqual`, and `notStrictEqual`. They are identical to the
assertions of the same named defined in the
[assert](http://nodejs.org/api/assert.html) Node.js module, except that they
print a message to `stdout`, instead of throwing an exception.

```coffeescript
#!/usr/bin/env coffee
require("proof") 3, ->
  @ok true, "truth works"
  @equal 1 + 1, 2, "math works"
  @deepEqual "a b".split(/\s/), [ "a", "b" ], "strings work"
```

Proof also defines a `throws` assertion, one that supports Streamline.js. It is
different from the Node.js `throws`.

When used with or without Streamline.js, the block comes last.

```coffeescript
#!/usr/bin/env coffee
require ("proof") 1, ->
  @throws "oops", -> throw new Error "oops"
```

The expected exception message is used as the assertion message by default. You
can also provide an explicit assertion message.

```coffeescript
#!/usr/bin/env coffee
require ("proof") 1, ->
  @throws "oops", "exception thrown", -> throw new Error "oops"
```

With Streamline.js, you define a callback with an underscore, and pass in the
underscore before the callback.

```coffeescript
#!/usr/bin/env _coffee
require ("proof") 1, (_) ->
  @throws "oops", _, (_) -> throw new Error "oops"
```

Here's a practical example of a Streamline.js `throws` assertion.

```coffeescript
#!/usr/bin/env _coffee
require ("proof") 1, (_) ->
  fs = require "fs"
  error = @throws /not defined/, "failed open message", _, (_) ->
    fs.open("./missing", "r", _)
  @equal error?.code, "ENOENT", "failed open code"
```

As you can see, the `throws` method returns the caught exception. With it, you
can assert that additional exception properties are set correctly.

### Exception Handling

When a test is healthy, it is healthy for the test to release resources. When a
test fails catastrophically, Proof lets the operating system do the hard work of
releasing system resources, such as memory, sockets and file handles.

Here's a test that opens a file handle, then closes it like a good citizen.

```coffeescript
#!/usr/bin/env _coffee
require("./proof") 1, ({ fs, tmp }, _) ->
  fs.open(__filename, "r", _)

  buffer = new Buffer(2)
  fs.read(fd, buffer, 0, buffer.length, 0, _)
  @equal buffer.readInt16BE(0), 0x2321, "shebang magic number"

  fs.close(fd, _)
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

```coffeescript
#!/usr/bin/env _coffee
mysql   = require "mysql"
fs      = require "fs"
{exec}  = require "child_process"
module.exports = require("proof") (_) ->
  tmp = "#{__dirname}/tmp"
  @cleanup _, (_) ->
    try
      fs.unlink "#{tmp}/#{file}", _ for file in fs.readdir tmp, _
      fs.rmdir tmp, _
    catch e
      throw e if e.code isnt "ENOENT"
  fs.mkdir tmp, 0755, _
  { fs, exec, tmp }
```

When we register a cleanup function, the cleanup function is called immediately
upon registration. Cleanup functions are run at the start of a test to cleanup
in case our last test run exited abnormally. As long as the test does not exit
abnormally, the cleanup function is called again at exit.

In the harness above, we register a cleanup function that deletes files in a
temporary directory, then deletes the temporary directory. If the directory
doesn't exist, that's okay, we catch the `ENOENT` exception and return. Because
the cleanup function is called immediately when we pass it to `@cleanup`, we're
assured a clean slate. We call `fs.mkdir` without checking to see if it already
exists. We know that it doesn't.

Now we can use our temporary directory in a test. The test doesn't have to
perform any housekeeping. We can write test after test in the same suite, each
one making use of this temporary directory, because it is cleaned up after or
before every run.

```coffeescript
#!/usr/bin/env _coffee
require("./proof") 1, ({ fs, exec, tmp }, _) ->
  program = "#{tmp}/example.sh"

  fs.writeFile program, "#!/bin/bash\nexit 1\n", "utf8", _
  fs.chmod program, 0755, _

  try
    exec program, _
  catch e
    @equal e.code, 1, "exit code"
```

In the test above, we create a bash program to to test that error codes work
correctly. If no exception is thrown, the test runner will report that a test
was missed.

Tests can register cleanup functions too. It is generally easier to keep them in
the harnesses, but its fine to use them in tests as well.

```coffeescript
#!/usr/bin/env _coffee
require("proof") 1, (_) ->
  fs = require "fs"
  {exec} = require "child_process"

  program = "#{__dirname}/example.sh"

  @cleanup _, (_) ->
    try
      fs.unlink program, _
    catch e
      throw e if e.code isnt "ENOENT"

  fs.writeFile program, "#!/bin/bash\nexit 1\n", "utf8", _
  fs.chmod program, 0755, _

  try
    exec program, _
  catch e
    @equal e.code, 1, "exit code"
```

Here our test creates a temporary file in the same directory as the test,
instead of in a harness provided temporary directory. It registers a cleanup
function that deletes the file, so that the file is deleted before and after we
write to it.

A useful pattern falls out of cleanup before. You may want to skip cleanup at
exit so you can inspect the file output of a test. If so, you can set the
environment variable `PROOF_NO_CLEANUP=1` before running an individual test. It
will cleanup before the test but not after. Now you can go through an edit,
test, inspect cycle and watch how the output changes.

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
$ proof t/logic/minimal.t.coffee
 &#x2713; t/logic/minimal.t.coffee ................................ (2/2) 0.230 Success
                                      tests (1/1) assertions (2/2) 0.230 Success
$
</pre>

Each test you pass to the test runner is will be run by the test runner. Tests
in separate suites are run in parallel.

<pre>
$ proof t/logic/minimal.t.coffee t/regex/minimal.t.coffee
 &#x2713; t/logic/minimal.t.coffee ................................ (2/2) 0.230 Success
 &#x2713; t/regex/minimal.t.coffee ................................ (2/2) 0.331 Success
                                      tests (2/2) assertions (4/4) 0.561 Success
$
</pre>

### Tests Run in Parallel

As above.

<pre>
$ proof t/logic/minimal.t.coffee t/regex/minimal.t.coffee t/regex/complex.t.coffee
 &#x2713; t/logic/minimal.t.coffee ................................ (2/2) 0.230 Success
 &#x2713; t/regex/minimal.t.coffee ................................ (2/2) 0.331 Success
 &#x2713; t/regex/complex.t.coffee ................................ (2/2) 1.045 Success
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
$ proof t/*/*.t.coffee
 &#x2713; t/logic/minimal.t.coffee ................................ (2/2)  .230 Success
 &#x2713; t/regex/minimal.t.coffee ................................ (2/2)  .331 Success
 &#x2713; t/regex/complex.t.coffee ................................ (2/2) 1.045 Success
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

### Version 0.0.11 - Sun Jul  8 05:24:13 UTC 2012

 * Extract Cadence control flow library. #97. #90. #52.
 * Convert to closure style removing `Test` class. #91.
 * The `fail` method will print a `not ok`. #94.
 * `UNTIDY` is working again. #92.
 * Removed the Streamline.js specific `throws` and `cleanup_` functions. #93.
 * Removed the implicit `context` argument that was used with structured
   assignment in CoffeeScript tests. #80.

### Version 0.0.10 - Sat Jun 30 16:41:44 UTC 2012

 * `proof progress` exits non-zero for any failure. #87.

### Version 0.0.9 - Fri Jun 29 13:59:21 UTC 2012

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

### Version 0.0.8 - Thu Jun 28 21:05:46 UTC 2012

 * Wait on pending output before exit. #72.

### Version 0.0.7 - Wed Jun 27 18:22:41 UTC 2012

 * Fixed `this` binding error in `bailout`. #68.
 * Development dependencies in `pacakage.json` only. #66.
 * Populated `.npmignore`. #67.
 * Increase digit width to fit. #26.

### Version 0.0.6 - Wed Jun 27 17:08:41 UTC 2012

 * Added `TIMELESS` environment variable switch to disable timeouts. #60.
 * Fix named callbacks. #57.
 * Ensure that step finished before next step begins when generated callback is
   called. #50.
 * Restore animation through inherited stdio. #38.
 * `getopt` like option parser. #49.
 * Nicer error messages. #17.
 * Named cleanup functions. #48.

### Version 0.0.5 - Sat Jun 16 10:01:21 UTC 2012

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
 * `UNTIDY` alias for `PROOF_NO_CLEANUP`. #29.

### Version 0.0.4 - Sun May 13 19:43:30 UTC 2012

 * Showing standard error and standard output prior to a failed test or a bail
   out in failed assertions display. #24.

### Version 0.0.3 - Sun May 13 17:24:09 UTC 2012
 
 * `proof errors` displays bail outs. #20.
 * Created `proof errors` to display the failed assertions of a failed test run.
   #5.
 * Fail on when passed tests exceed expected tests. #6.
 * Correctly reporting tests that fail before they start, like failure to
   compile. #8.
 * Set width of progress display using `--width` option. #19.
 * Set width of progress timing display using `--digits` option. #16.
 * Fixed spelling in documentation and comments, cleanup documentation. #10. #9.
 * Abend when test is specified twice in a run. #4.
 * Spell check `README.md`.
 
### Version 0.0.2 - Wed May  9 03:52:57 UTC 2012

 * Correctly summing assertions. #13.
 * Failed assertions no longer repeat message. #11.
 * Initial release.

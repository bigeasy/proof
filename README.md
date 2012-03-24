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

When there is housekeeping to be done, databases to be reset, temporary files to
be deleted, we still don't clean up after ourselves. **We clean up before
oursleves.** You use Proof harnesses to clean up after the last test process at
the start of the next test process, when everything is stable.

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

```
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

```
#!/usr/bin/env coffee
require("proof") 1, -> @ok true, "true is true"
```

The first argument to test is the number of tests to expect. If to many
or too few tests are run, the test runner will detect it and report it.

The call to `require("proof")` returns a function. You can call
it immediately. That makes your test preamble quick and to the point.

This is analogous to the above.

```
#!/usr/bin/env coffee
test = require "proof"

test 1, ->
  @ok true, "true is true"
```

Here's a test with two assertions.

```
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

```
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

```
context = {}
context.example = { firstName: "Alan", lastName: "Gutierrez" }
context.model = require("../../lib/model")
module.exports = require("proof") context
```

You would place the above in a file named `proof.coffee`, for example.

Now you can write tests with a mere two lines of preamble. The common setup for
the tests in your test suite is in your harness.

```
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

```
#!/usr/bin/env coffee
require("./proof") 0, ({ example, model }) ->

  # Here be dragons.
```

Now you can write your test.

Proof assumes that you've created a harness in the target directory named
`proof.js`, `proof._js`, `proof.coffee` or `proof._coffee'. You might decide to
have different name or path for your harness, or you might want to use
streamline, or specify a starting number of tests. Just type it out and proof
will figure it out.

```
$ proof create t/model/formats.t 2 db ../db-harness _
$
```

Would generate.

```
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

You'll note that, if you add a member to the object named `$teardown` that has a
function value, that function will be called at teardown time.

```
#!/usr/bin/env _coffee
mysql   = require "mysql"
fs      = require "fs"
module exports = require("proof") (callback) ->
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

```
#!/usr/bin/env _coffee
mysql   = require "mysql"
fs      = require "fs"
module exports = require("proof") (_) ->
  file = fs.readFile "./configuration.json", "utf8", _
  mysql = new mysql.Database(JSON.stringify file)
  conneciton = mysql.connect _
  { connection }
```

The test itself is no more complicated.

```
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

```
#!/usr/bin/env coffee
require("proof") 3, ->
  @ok true, "truth works"
  @equal 1 + 1, 2, "math works"
  @deepEqual "a b".split(/\s/), [ "a", "b" ], "strings work"
```

Proof also defines a `throws` assertion, one that supports Streamline.js. It is
different from the Node.js `throws`.

When used with or without Streamline.js, the block comes last.

```
#!/usr/bin/env coffee
require ("proof") 1, ->
  @throws "oops", -> throw new Error "oops"
```

The expected exception message is used as the assertion message by default. You
can also provide an explicit assertion message.

```
#!/usr/bin/env coffee
require ("proof") 1, ->
  @throws "oops", "exception thrown", -> throw new Error "oops"
```

With Streamline.js, you define a callback with an underscore, and pass in the
underscore before the callback.

```
#!/usr/bin/env _coffee
require ("proof") 1, (_) ->
  @throws "oops", _, (_) -> throw new Error "oops"
```

Here's a practical example of a Streamline.js `throws` assertion.

```
#!/usr/bin/env _coffee
require ("proof") 1, (_) ->
  fs = require "fs"
  error = @throws /not defined/, "failed open message", _, (_) ->
    fs.open("./missing")
  @equal error?.code, "ENOENT", "failed open code"
```

As you can see, the `throws` method returns the caught exception. With it, you
can assert that additional exception properties are set correctly.

### Exception Handling

When a test is healthy, it is healthy for the test to release resources. When a
test fails catastrophically, Proof lets the operating system to hard work of
releasing system resources, such as memory, sockets and file handles.

Here's a test that opens a file handle, then closes it like a good citizen.

```
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

Trying to write tests that account for every possible error in code that is
under active development is a waste of your time.

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

```
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
temporary directory, then deletes the temporary directory. Because the cleanup
function is called immediately when we pass it to `@cleanup`, we call `fs.mkdir`
without checking to see if it already exists. We know that it doesn't.

Now we can use our temporary directory in a test. The test doesn't have to
perform any housekeeping. We can write test after test in the same suite, each
one making use of this temporary directory, because it is cleaned up after or
before every run.

```
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

```
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
ok 1 - true is true
ok 2 - test arithmetic
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
 &#x2713; t/logic/minimal.t.coffee ......................... (2/2)  .230 Success
$
</pre>

Each test you pass to the test runner is will be run by the test runner. Tests
in separate suites are run in parallel.

<pre>
$ proof t/logic/minimal.t.coffee t/regex/minimal.t.coffee
 &#x2713; t/logic/minimal.t.coffee ......................... (2/2)  .230 Success
 &#x2713; t/regex/minimal.t.coffee ......................... (2/2)  .331 Success
$
</pre>

### Tests Run in Parallel

As above.

<pre>
$ proof t/logic/minimal.t.coffee t/regex/minimal.t.coffee t/regex/complex.t.coffee
 &#x2713; t/logic/minimal.t.coffee ......................... (2/2)  .230 Success
 &#x2713; t/regex/minimal.t.coffee ......................... (2/2)  .331 Success
 &#x2713; t/regex/complex.t.coffee ......................... (2/2) 1.045 Success
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
 &#x2713; t/logic/minimal.t.coffee ......................... (2/2)  .230 Success
 &#x2713; t/regex/minimal.t.coffee ......................... (2/2)  .331 Success
 &#x2713; t/regex/complex.t.coffee ......................... (2/2) 1.045 Success
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
itself](http://travis-ci.org/#!/bigeasy/ace).

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
CoffeeScript exclude `coffee-script`. Add additional development dependencies as
to suit your project's needs.

## Why I Wrote My Own (Non-)Framework

This is my test framework. There are many like it, but this one is mine.

The catalyist was Streamline.js. The frameworks that exist generally group tests
into a object or the functional programming equavalent. Each test is a function.
A suite is a class or other grouping of functions.

The function may provide a callback, but the callback isn't in the `function
(error, result) {}` format that works with Streamline.js.

Of course, once I was done writing this, it occured to me that callback
signature differences are easily shimmed, but it was too late by then.

There is a lot of extra stuff your grarden variety test frameworks. Folks put a
lot of thought into testing, which is an area that invites over-thinking.

I don't want to pay for those features; compatability with CI frameworks I don't
use, compatability with IDEs I don't use, histograms that I'll never look at.

I've never thought to myself, boy, if only I could see my test results in XML,
JSON, RDF and YAML, then I'd really get to the bottom of this pesky bug.

I don't want to depend on a test runner to run my tests.  The test runner here
runs tests, it does not load them, set them up and tear them down. It just runs
them and reports on how they ran.

I don't want to have fiddle with a test runner to run a specific test. I want a
each test to be a a program. I want to group my tests into suites by grouping my
test programs into directories. When I want to run a specific test, I'll just
run the test program directly.

I'm happy to pay the extra millis to spawn a process per test, because it is so
much easier to write a test program, with a clean program state, and not have to
worry about teardown. I don't want my test runner to manage memory, file handles
and sockets. Let the operating system to do that.

I do want pretty green check marks. Those are *very* important to me. You'll see
that my check marks are green and they use UNICODE check marks. I splurged on
the check marks. They make me happy.

## Un-Filtered Blather

 * Deeply nested try/catch blocks.
 * Frameworks group assertions into tests and tests into suites. A suite is a
   file containing test. To run a test you need to run it through the test
   runner. Proof has the same grouping this too, but a suite is a directory, a
   test is a program.  Thus, to run a specific test, you run that program. No
   special switches to the test runner to pluck out the test you want to run.
 * *We cleanup at setup instead of tearing down.* You can be loosey goosey about
   resources in your tests because they are short lives programs, but if you
   need to have a an empty directory, or a reset a database state, do it at test
   start, and leave it a mess for the next run to cleanup. If you want to be
   tidy, you can have a cleanup function that you run at the end, but run it at
   the begining as well in case the last run ended early.
 * Tests are meant to exercise the demons in our software. We're not surprised
   when they fail catastrohpically. Why do we try to register last minute
   callbacks to do housekeeping in a process that might have just decided to
   kill itself rather than go on? Why do try to run test after test in a single
   long-running test runner process, when we know that an error most likely
   means resources left unused, yet uncollected?
 * Do we want to manage all the failure states for code in development? A long
   running test runner is a horrible model for a test framework.
 * We write tests because we know that static analysis is not enough to ensure
   quality.  We write tests to exercise the demons from our software. We should
   not be surprised when our tests fail in ways that we cannot imagine. We
   should not feel ashamed that we could never imagine the failure states that
   our tests uncover. We should be humble before the complexity of software. We
   should accept that it is more than we can hold in our head at once.
 * To think otherwise is to expect oneself to be omnicient.
 * Moreover, why do you need a plan to turn off every light switch on your way
   out the door when the house is burning down? Dont' worry. The fire will take
   care of it for you.

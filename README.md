# Ace &#9824; [![Build Status](https://secure.travis-ci.org/bigeasy/ace.png?branch=master)](http://travis-ci.org/bigeasy/ace)

A test non-framework for CoffeeScript and Streamlined CoffeeScript.

## Philosophy

Ace is a UNIX way test non-framework for the mightily lazy programmer.

In Ace, **a unit test is a program**. It does not need a runner to run. A
program emits minimal `Perl` `Test::Harness` output. Failed assertions appear as
comments in the file output.

**You write your quick and dirty diagnostics to standard error.** The test
runner will hide it from you during normal test runs. If there is a test failure
you can run the test program directly to see the error spew.

The Ace test runner execute test programs as child processes. **If a test fails,
even catastrophically, the test runner tests on.**

The test runner does not load or evaluate JavaScript, set tests up up or tear
tests down. Why have the test runner load programs, manage memory, file handles
and sockets? Why count on what amounts to a fragile program loader, when you've
got a full blown operating system at your disposal? **Let the operating system
do set up and tear down.** When a test process exits, even when it fails
catastrohically, resources are freed for the next test process.

When there is housekeeping to be done, databases to be reset, temporary files to
be deleted, we still don't clean up after ourselves. **We clean up before
oursleves.** You use Ace harneses to clean up after the last test process at the
start of the next test process, when everything is stable.

With this in place, you are encouraged to **be a slob** in your test code.  Each
test is a short lived process, so feel free to suck up memory, leave file
handles open, and leave sockets open. The operating system knows how to close
them when your program exits. It won't affect the test runner, or test
performance. 

Well, you should always close your file handles, and you will. You don't have to
write deeply nested try/catch blocks, however. You don't have to worry if your
cleanup is missed. You can assume the best, because we have a universal plan for
the worst. More below. (I'll tighten this up.)

Ace is convention over configuration until configuration is zero. Programs are
organized into directories, which act as suites. The test runner will run suites
in parallel. **You don't have to think about parallel to get parallel.** Your
operating system does parallel just fine.

### Install

NPM repository install will come after release. For now you can install using
[npm link](https://github.com/isaacs/npm/blob/master/doc/cli/link.md).

Get a copy of the source.

```
$ git clone git://github.com/bigeasy/ace.git
$ cd ace
$ cake compile
$ npm link
```

In any directory outside of the source tree, use `npm link` to link globally.

```
$ npm link ace
```

### Every Test is a Program

Every test is a program. Add a shebang line and make the file executable. 

Minimal unit test.

```
#!/usr/bin/env coffee
test = require "ace.is.aces.in.my.book"

test 1, -> @ok true, "true is true"
```

The first argument to test is the number of tests to expect. If to many
or too few tests are run, the test runner will detect it and report it.

```
test = require "ace.is.aces.in.my.book"

test 1, -> @ok true, "true is true"

```

Here's a test with two assertions.

```
#!/usr/bin/env coffee
test = require "ace.is.aces.in.my.book"

test 2, ->
  @ok true, "true is true"
  @equal 2 + 2, 4, "test addition"
```

You can see that the second argument to `test` is your program. All of the
assertions in `require("assert")` are bound to `this`.

### Streamline Auto-Detected

Minimal streamlined unit test. Simply add a callback parameter to your callback
and your test is called asynchronously.

```
#!/usr/bin/env coffee-streamline
return if not require("streamline/module")(module)
test = require "ace.is.aces.in.my.book"
fs   = require "fs"

test 1, (_) ->
    found = /test/.test(fs.readFile(__filename, "utf8", _))
    @ok found, "found the word test"
```

When you give a test a callback with a single parameter, it calls that function
with a `function (error) {}`. This is the callback function is required by
Streamline.js. 

### Create More Tests More Frequently With Harnesses

With an Ace harness you can start a test in as little as two lines and in as
many as three.

Write a harness that does the setup for a test.  It will load the libraries
necessary to write a test against the a subsystem of your project.

You add a shebang line here, not to run this harness program, but to give a hint
to the test generator. See the test generattion section below.

```
#!/usr/bin/env coffee
context = {}
context.example = { firstName: "Alan", lastName: "Gutierrez" }
context.model = require("../../lib/model")
module.exports = require("ace.is.aces.in.my.book") context
```

Now you can write a test with a mere two lines of preamble.

```
#!/usr/bin/env coffee
require("./harness") 2, ({ example, model }) ->
  @equal model.fullName(exmaple), "Alan Gutierrez", "full name"
  @equal model.lastNameFirst(exmaple), "Gutierrez, Alan", "last name first"
```

### Asynchronous Harnesses

Some setup will require asynchronous calls. Database connections require it. You
can create asynchrous harnesses by providing a callback function instead of an
object to the require method in your harness.

The callback function will itself get a callback that is used to return an
object that is given to the test program.

You'll note that, if you add a member to the object named `$teardown` that has a
function value, that function will be called at teardown time.

```
#!/usr/bin/env coffee
mysql   = require "mysql"
fs      = require "fs"
module exports = require("ace.is.aces.in.my.book") (callback) ->
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
#!/usr/bin/env coffee-streamline
return if not require("streamline/module")(module)
mysql   = require "mysql"
fs      = require "fs"
module exports = require("ace.is.aces.in.my.book") (_) ->
  file = fs.readFile "./configuration.json", "utf8", _
  mysql = new mysql.Database(JSON.stringify file)
  conneciton = mysql.connect _
  { connection }
```

The test itself is no more complicated.

```
#!/usr/bin/env coffee-streamline
return if not require("streamline/module")(module)
require("./harness") 1, ({ connection }, _) ->
  results = connection.sql("SELECT COUNT(*) AS num FROM Employee", _)
  @equal 12, results[0].num, "employee count"
  connection.close()
```

Note that, you can use asynchronous harnesses with synchronous tests, and create
asynchronous tests from synchronous harnesses.

### Housekeeping

Hmm...

*Please skip to next section for more useful documentation. Housekeeping is
working fine, but this documentation is in awful shape.*

Dumping a lot here, because most frameworks have a test runner process, and
tests are loaded by the test runner process, so they have to have a lot of
robust setup and teardown, to keep from killing the test runner process.

I want to keep a novice programmer (or programming pedant) from freaking out on
me when I talk about being a slob, letting the program exit, and letting the
operating system cleanup.

I'm not saying you shouldn't close your handles. I'm saying it is stupid to
imagine that a test process that is crashing is supposed to have the same level
error handling as a production process. I might have to tone down the notion of
being a slob, which amuses me, but might fan flames.

Tests are meant to exercise the demons in our software. We're not surprised when
they fail catastrohpically. Why do we try to register last minute callbacks to
do housekeeping in a process that might have just decided to kill itself rather
than go on? Why do try to run test after test in a single long-running test
runner process, when we know full well that the failure states of code in
development are unimaginable?

We set up our tests to fail. But then, why do we try to clean up after a test,
within a process that we know might fail?

The Ace way is to cleanup after the last test at the start of the next test.

We do this by using harnesses. You create a harness that cleans up after the
last test, and gets things ready for the current test, at the start of a new
process when everything is stable. With harnesses and 2 to 4 lines of
boilerplate, you can wrap your test logic in housekeeping and resource
management. 

Tests will require housekeeping.
The Ace way is to cleanup after the last test in the next test.
After a test is set up and running, it is supposed to
exericse demons.

```
TK: Example that maybe cleans out a working directory.
```

If it fails catastrophically, Ace lets the operating system to hard work of
releasing system resources, such as memory, sockets and file handles. When a
test is healthy, it is healthy for the test to release resources. However, we
don't count on in-process cleanup handlers that are supposed to be run at the
last minute, even if the test process is so unstable it cannot proceed with
testing normally.

Close your file handles, for example.

```
#!/usr/bin/env coffee-streamline
return if not require("streamline/module")(module)
require("./harness") 1, ({ fs }, _) ->
  fd = fs.open(__filename, "r", _)

  buffer = new Buffer(2)
  fs.read(fd, buffer, 0, buffer.length, 0, _)
  @equal buffer.readInt16BE(0), 0x2321, "shebang magic number"

  fs.close(fd, _)
```

Let's say that in the code above, the `Buffer` cannot be allocated because the
system is out of memory. What happens? An exception is thrown, the process
exits, and the operating system closes the file handle.

The test does the right thing when it is healthy, but it doesn't bother with
some sort of fail-safe cleanup code that runs at exit. Tests are supposed to
exercise demons and encounter catastrophic errors that you could never imagine
in a million years of static analysis. If something so horrible happens in this
test that it cannot reach the last line, how is it going to be able to run last
minute teardown callbacks?

Instead of reling on a on a terminal, unstable process for housekeeping,
housekeeping should be done at test startup.

```
#!/usr/bin/env coffee
mysql   = require "mysql"
fs      = require "fs"
module exports = require("ace.is.aces.in.my.book") (callback) ->
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
#!/usr/bin/env coffee-streamline
return if not require("streamline/module")(module)
mysql   = require "mysql"
fs      = require "fs"
module exports = require("ace.is.aces.in.my.book") (_) ->
  file = fs.readFile "./configuration.json", "utf8", _
  mysql = new mysql.Database(JSON.stringify file)
  conneciton = mysql.connect _
  { connection }
```

The test itself is no more complicated.

```
#!/usr/bin/env coffee-streamline
return if not require("streamline/module")(module)
require("./harness") 1, ({ connection }, _) ->
  results = connection.sql("SELECT COUNT(*) AS num FROM Employee", _)
  @equal 12, results[0].num, "employee count"
  connection.close()
```


### Auto-Generate Test Skeletons From Harnesses

Once you have a harness, you can use `ace create` to generate tests based on
your harness.

```
$ ace create t/model/formats.t.coffee model example
$
```

You'll have a new test harness. The execute bit is set. It is ready to go.

```
#!/usr/bin/env coffee
require("./harness") 0, ({ example, model }) ->

  # Here be dragons.
```

Now you can write your test.

You might decide to have different name or path for your harness, or you might
want to use streamline, or specify a starting number of tests. Just type it out
and ace will figure it out.

```
$ ace create t/model/formats.t.coffee 2 db ./db-harness _
$
```

Would generate.

```
#!/usr/bin/env coffee-streamline
return if not require("streamline/module")(module)
require("./harness") 2, ({ db }, _) ->

  # Here be dragons.
```

Check the docs for details.

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

You can run a test with the ace test runner to get gaudy console output with
colors and non-ASCII characters (approximated below).

```
$ ace t/logic/minimal.t.coffee
 x t/logic/minimal.t.coffee ...... (2/2)  .230 Success
$
```

Each test you pass to the test runner is will be run by the test runner. Tests
in separate suites are run in parallel.

```
$ ace t/logic/minimal.t.coffee t/regex/minimal.t.coffee
 x t/logic/minimal.t.coffee ...... (2/2)  .230 Success
 x t/regex/minimal.t.coffee ...... (2/2)  .331 Success
$
```

Run all the tests in your project with a glob.

```
$ ace t/*/*.t.coffee
 x t/logic/minimal.t.coffee ...... (2/2)  .230 Success
 x t/regex/minimal.t.coffee ...... (2/2)  .331 Success
 x t/regex/complex.t.coffee ...... (2/2) 1.045 Success
$
```

### Tests Run in Parallel

As above.

```
$ ace t/*/*.t.coffee
 x t/logic/minimal.t.coffee ...... (2/2)  .230 Success
 x t/regex/minimal.t.coffee ...... (2/2)  .331 Success
 x t/regex/complex.t.coffee ...... (2/2) 1.045 Success
$
```

Because each test is a program, parallelism is simply a matter of running more
than one test program at once. The default mode of the ace runner is to run four
test programs a time.

The runner will run a test program from each suite, for up to four programs
running at once. When a suite it complete, it moves onto the next one.

Tests within suites are run one after another, in the order in which they were
specified on the command line.

If order matters you are doing it wrong. You should be able to run tests in
isolation. But, should is pedants. I don't want to be one of those. You do
what's right for you. Whatever makes you happy.

Suites run in parallel. You can group your tests however you like, by feature,
subsystem, stages of workflow.

Make sure they can run in parallel though. You may have a single MySQL database
to use for testing. You'll have to  group all your MySQL tests in a suite, you
can be sure that they won't stomp on each other. If your application supports
either MySQL or PostgreSQL, you could run those tests in parallel.

If every test expects to hit a MySQL database, then create a separate MySQL
database for each suite. Not a big deal, really, and then you have your tests
running in parallel.

## Shorter

The Shame of Programming... Probably a good title for a blog post. Java:
Programming Made Shameful. Or Programing Java Considered Shameful. But, yet, I
write a lot of stuff, or think hard, about what is expected. (Need to put this
somewhere else. It is a shame to have it here. A crying shame.)

That above is from sumbling on the word shame below...

We write tests because we know that static analysis is not enough to ensure
quality.  We write tests to exercise the demons from our software. We should not
be surprised when our tests fail in ways that we cannot imagine. We should not
feel ashamed that we could never imagine the failure states that our tests
uncover. We should be humble before the complexity of software. We should accept
that it is more than we can hold in our head at once.

To think otherwise is to expect oneself to be omnicient.

Moreover, why do you need a plan to turn off every light switch on your way out
the door when the house is burning down? Dont' worry. The fire will take care of
it for you.

Uh, not shorter. Try...

Ace uses the operating system as the fail-safe for resource management, so that
you are unlikely to reach a point where you cannot run your tests because Ace is
resource starved. In your tests you can show discipline and release resources
when they are no longer needed, but you don't have plan for every contingency
with deeply nested try/catch blocks. You shouldn't. Testing is supposed to
reveal the error states you can't begin to imagine, so how do you plan for
those?  It's not a good use of your time to devise a resource management
strategy for the closing millis in the quarter-second life of a test program
that has raised an exception.

If you feel strongly that punting cleanup to the operating system is shameful,
I'm probably going to argue that you're repeating something you've read a lot
but don't really understand.

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

This part here are bits that need a place to go. I'm writing the documentation
and rewriting it daily.

Write messy little one off tests. Be a slob with open file handles lying around
like so many pizza boxes.

You don't have to be a slob to appreciate the resource management capabilities
of your operating system. Do be meticulous about releasing your resources. Do
not waste your time with deeply nested try/catch blocks that gaurd against every
contingency in a program that won't live a quarter of a second. Allow your tests
to fail if they need to fail. You don't have to give the same amount of care to
exceptinal conditions in test code that you have to give to exceptional
conditions in production code.

At least not with Ace. You'll hopfully never find yourself in a situation where
you're debugging your tests because they exhaust system resources.

Frameworks group assertions into tests and tests into suites. A suite is a file
containing test. To run a test you need to run it through the test runner. Ace
has the same grouping this too, but a suite is a directory, a test is a program.
Thus, to run a specific test, you run that program. No special switches to the
test runner to pluck out the test you want to run.

*We cleanup at setup instead of tearing down.* You can be loosey goosey about
resources in your tests because they are short lives programs, but if you need
to have a an empty directory, or a reset a database state, do it at test start,
and leave it a mess for the next run to cleanup. If you want to be tidy, you
can have a cleanup function that you run at the end, but run it at the begining
as well in case the last run ended early.

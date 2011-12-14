# ACE

A test non-framework for CoffeeScript and Streamlined CoffeeScript.

## Philosophy

Ace is a UNIX way test non-framework for the mightily lazy programmer.

An Ace unit test is a program. It does not need a runner to run. A program emits
minimal `Perl` `Test::Harness` output. Failed assertions appear as comments in
the file output.

You write your quick and dirty diagnostics to standard error. The test runner
will hide it from you. If there is a test failure you can run the test program
directly for the error spew.

The Ace test runner executes the test programs.  If a test fails, even
catastrophically, the test runner tests on.  The test runner does not load
tests, set them up, tear them down, etc. Why have the test runner load programs,
manage memory, file handles and sockets?  Let the operating system do that.

You are encouraged to **be a slob** in your test code. Each test is a short
lived process, so feel free to suck up memory, leave file handles open, and
leave sockets open. The operating system knows how to close them when your
program exits. It won't affect the test runner, or test performance. 

Ace is convention over configuration until configuration is zero. Programs are
organized into directories, which acts as suites. The test runner will run
suites in parallel. You don't have to think about parallel to get parallel. Your
operating system does parallel just fine.

## Overview.

Every test is a program. Add a shebang line and make the file executable. 

Minimal unit test.

```
#!/usr/bin/env coffee
test = require "ace.is.aces.in.my.book"

test 1, -> @ok true, "true is true"
```

The first argument to test is the number of tests to expect. If to many
or too few tests are run, the test runner will detect it and report it.

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

Minimal streamlined unit test.

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

A test is a program. Because it is a program it will have its own program state.

When the test is over, the program exits, so you don't have to sweat test
teardown. Yes it is good to clean up after yourself, but if you trigger a
catastrophic error, the operating system will clean up after you, and the test
runner can keep on running.

A test is a program. A test contains assertions. Tests are grouped into directories.
The directories act as test suites. Ace convention dicates that tests are placed
in your project in a directory named `t`. In the `t` directory, there is a directory
for each test suite. In the suite directories are your tests.

```
$ find t
t/logic/minimal.t
t/regex/minimal.t
$
```

Running a minimal test.

```
$ t/logic/minimal.t
1..2
ok 1 - true is true
ok 2 - test arithmetic
$
```

Using the test runner.

```
$ ace t/logic/minimal.t.coffee
 x t/logic/minimal.t.coffee ...... (2/2)  .230 Success
$
```

Running multiple tests with the test runner.

```
$ ace t/logic/minimal.t.coffee t/regex/minimal.t.coffee
 x t/logic/minimal.t.coffee ...... (2/2)  .230 Success
 x t/minimal/minimal.t.coffee .... (2/2)  .230 Success
$
```

Running all the tests in your project.

```
$ ace t/*/*.t.coffee
 x t/logic/minimal.t.coffee ...... (2/2)  .230 Success
 x t/minimal/minimal.t.coffee .... (2/2)  .230 Success
$
```

The easier it is to get a test started, the more and better tests you're going
to write. The minimal Ace tests above require that you type out the the same
requires to pull in the libraries you need. You might even start to wish you
had a test framework that let you group all your tests in one file.

With an Ace harness you can start a test in as little as two lines and in as
many as three.

Write a harness that does the setup for a test. Usually you create a harness per
suite directory. It will load the libraries necessary to write a test against
the a subsystem of your project.

You add a shebang line here, not to run this harness program, but to tell the
generator what to use for a shebang line.

```
#!/usr/bin/env coffee
context = {}
context.example = { firstName: "Alan", lastName: "Gutierrez" }
context.model = require("../../lib/model")
module.exports = require("ace.is.aces.in.my.book") context
```

Now you can generate a harness. There is no type checking to make sure that
the parameters are correct, but you can fix a goof like that in your editor.

```
$ ace --generate t/model/formats.t.coffee model example
$
```

You'll have a new test harness. The execute bit is set. It is ready to go.

```
#!/usr/bin/env coffee
require("./harness") 0, ({ example, model }) ->
```

Now you can write your test.

```
#!/usr/bin/env coffee
require("./harness") 2, ({ example, model }) ->
  @equal model.fullName(exmaple), "Alan Gutierrez", "full name"
  @equal model.lastNameFirst(exmaple), "Gutierrez, Alan", "last name first"
```

You might decide to have different name or path for your harness, or you might
want to use streamline, or specify a starting number of tests. Just type it out
and ace will figure it out. Check the docs for details.

```
$ ace --generate t/model/formats.t.coffee 2 db ./db-harness _
$
```

Running in parallel.

Ace follows the following conventions.
Here are the conventions.

 * A test is a program.
 * To debug a bug found by a test, you run the test program.
 * We cleanup at setup instead of tearing down.
 * Programs are organized into directories.
 * A directory represents a subsystem.
 * Tests within a subsystem cannot be run in parallel.
 * Tests within a sybsystem can be run in parallel with tests in a different
    subsystem. 
 * A subsystem can define a harness or harnesses so that that test file preamble
    is reduced to two lines of code.

*A test is a program.* Because it is a program, you start out with a clean
program state. Did you forget to close a file or a database connection?
Fugetabout it. It won't effect the other tests down the line. Write messy little
one off tests. Be a slob with open file handles lying around like so many pizza
boxes. Don't spend time debugging resource issues in your test code. A test
can fail spectacularly and it won't bring the test runner down.

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

*Programs are organized into directories.* A directory is a suite.

*A directory represents a subsystem.* It is a subsystem or set of functionality
in the program that you want to test. 

*Tests within a subsystem cannot be run in parallel.* Well, maybe, technically
they can, but they won't be run in parallel. If you have a set of tests that
hit a database, and expect the database to be in a certian start state, put them 
all in the same directory and they won't set on each other.

*Tests within a sybsystem can be run in parallel with tests in a different
subsystem.* This means that different directories can run in parallel, so we can
use all these cores to get through those tests as quickly as possible. You don't
have to do anything special to get parallel processing.

*A subsystem can define a harness or harnesses so that that test file preamble
is reduced to two lines of code.* When you create a harness.

Here is what's right about Ace.
 
 * Ace organizes tests into files with minimal boilerplate, so you can create a new test quickly.
 * Ace tests are programs, so you can run them directly to see what's wrong with
    a failed test.
 * Ace runs tests in parallel.
 * Can test anything as long as it emits the Perl Test::Harness output format.

All I've ever cared about is whether or not the tests pass. The only report I've
wanted was a boolean report, a yes or no. I do like runner output, with colors,
because green feels good.

You see, when *I* run tests, it am interested in boolean report. They pass or they do not
pass. Much of the trickery of your garden variety test framework is lost on me.
I rarely find myself with a burning desire to see my test output in XML. If my
tests don't pass, please let me run just the test that didn't pass, so I can run
it, debug it, and make it pass.

I might be interested in grouping tests, according to the functionality that
they test. If I'm editing said functionality, I would like to run the test for
that functionality frequently, quickly, and without waiting for the entire suite
of tests.

Other than grouping, I don't need special output, nor do I need to build a
database of test results, or any of the other fancy things that a test frameowrk
does. I'm so not interested in programming my test framework, so that I feel
that any overhead in the framework for features that I don't want, it too
costly.

In fact, whenever I'm working with a framework, I'm far more likely to, instead
of creating a test, create a command line program that exercises the component
that I want to develop. I then fire off the program. It runs just the code that
I need to test, I don't have to wait for it pass through a dozen other tests to
get there.

The only thing I might be intereted in doing is grouping them, so that I
know that of this group they pass or do not pass.

The easiest way to group them is by a file, so I make the expression of a test
as simple as possible. In other frameworks, there is overhead to creating a test
rig, declaring a class, imports, setup and teardown declarations, so you end up
appending tests to a file you already have going.

Spigot wants to make it easy to declare a test so it is as simple as...

```
test = require("spigot")

test 1, ->
    @ok true, "passed"
```

If you are testing a subsystem, and you have common tear up and tear down, then
you can put that in file you require.

```
context = {}
context.example = { firstName: "Alan", lastName: "Gutierrez" }
context.model = require("../../lib/model")
module.exports = require("ace.is.aces.in.my.book") context
```

Now you can create a test quickly with this import.

```
require("./harness") 2, ({ example, model }) ->
  @equal model.fullName(exmaple), "Alan Gutierrez", "full name"
  @equal model.lastNameFirst(exmaple), "Gutierrez, Alan", "last name first"
```

```
require("./harness") 4, ({ example }) ->
```

Using this organization, setup and teardown looks like this.

```
fs = require "mysql"
module exports = require("ace.is.aces.in.my.book") (callback) ->
  fs.readFile "./configuration.json", "utf8", (error, file) ->
    if error
      callback error
    else
      mysql = new mysql.Database(JSON.stringify file)
      mysql.connect (error) ->
        if error
          callback error
        else
          $teardown = ->
          callback null, { mysql, $teardown }
```

```
require("./harness") 2, ({ mysql }) ->
{ test, db, teardown } = require("./common")
test 2, ->
    @equal model.fullName(exmaple), "Alan Gutierrez", "full name"
    @equal model.lastNameFirst(exmaple), "Gutierrez, Alan", "last name first"
```

Notes:

Using inspect to display failures when comparing objects. It seems like one
could switch to JSON and be one step closer to creating a testing API, but there
are some details lost in JSON output, like `undefined`, which are necessary for
debugging.

Maybe it is pipes. First to a runner that will normalize the output of a
directory, then to something that will transform that output, pretty print it,
or turn it into JSON, or sed, whatever.

Yeah, that right. And then we try to perserve output. Becasue it needs to be a
grepable, awkable, sedable file, if a test is really screwed up, we ignore it.
If it starts to emit non-printable characters, if it has zeros or bells, and
stuff, we ignore it, or hey, we let that test run be ruined.

The default ace runner is going to spawn and pipe itself to a pretty printer.

Raw output would stream raw output, but you would be able to pipe it to some
place else, or it could pretty print and pipe, or you could interleave the
output file, where each line is a "filename std(err|out)", or better still,
filename (std(err|out)|exit), of better still "epoch filename
(std(err|out)|exit)", which just captures all about the run.

The ace program has switches a plenty, "ace progress", "ace run", "ace cut",
"ace json", that last bit being unlikley, the default is "ace run | ace
progress".

A run is going to have to interleave the children. Oh, wait, it already does.
That's done then.

Progress is only shown when we're piping, but that can only go in with a switch.

Much easier to test when it emits structure.

## Why I Wrote My Own Framework

Specifically, I ran into a problem where Streamline's magic must be in a
function that provides a `function (error, result) {}` callback. Frameworks want
you to write your tests in a function that they specify. If you program with
Streamline, then you realize you're always going to have a certain amount extra
cruft to get a test going. I find that the more cruft there is, the less likely it
is that I'll write a test. I'm more likely to write a one liner program. This made
we want a test framework that worked with one (or two, three, seven) liner programs.
It made me want to use a test harness that gave me a blank slate.

This is my test framework. There are many like it, but this one is mine.

There is a lot of extra stuff your grarden variety test frameworks. Folks put a
lot of thought into testing, which is an area that invites over-engineering. The
prefect bicycle shed.

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

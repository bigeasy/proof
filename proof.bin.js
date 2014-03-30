#!/usr/bin/env node

/*

___ json _ usage: en_US ___
usage: proof json [<test>...]

  Display proof output as JSON.

options:

    -h,   --help                  display this usage information

invocation:

  If no proof runner output files are given, the JSON formatter listens
  for proof runner output on STDIN.

  `proof json` exits successfully, with an exit code of zero, regardless
  of failures in the proof runner output. It exists with a non-zero exit
  code only if it cannot parse the test runner output.

description:

  `proof json` converts proof unified test output into a JSON string for
  use with JavaScript utilities of your own creation; Node.js command
  line utilities or web applications.

___ progress _ usage: en_US ___
usage: proof progress [options] [<files>...]

  Display proof output using a colorized progress meter.

options:

    -d,   --digits    [count]     number of timing digits to display
    -h,   --help                  display this usage information
    -M,   --monochrome            do not display color
    -w,   --width     [count]     width in characters of progress display

invocation:

  If no proof runner output files are given, the progress meter listen
  for proof runner output on STDIN.

  If there are no errors, `proof progress` exits with a zero exit code,
  otherwise it returns a non-zero exit code.

description:

  `proof progress` displays a colorful, animated report of test
  progress. Output from `proof run` can be piped to `proof progress` to
  display the progress of a test run as it is running. Using a utility
  like `tee`, you can both pipe `proof run` output to `proof progress`
  and save it to file for later reporting.

___ run _ usage: en_US ___
usage: proof run [options] [<test>...]

  Run test programs and emit unified runner output.

options:

    -h,   --help                  display this usage information
    -p,   --processes <count>     number of processes to run
    -t,   --timeout <count>       when to stop waiting for process output,
                                  default 30 seconds

invocation:

  Runs zero or more tests emitting unified test output.

  `proof run` exits successfully, with an exit code of zero, regardless
  of test failures or abnormal exits.

description:

  The `proof run` runs zero or more test programs, gathering their
  output and emitting unified test output to STDOUT. It does not perform
  an error reporting itself.

  The test programs must emit valid Perl Test::Harness output.

  The output can be saved to file or piped back into proof with one of
  the other proof commands to report progress or emit alternate formats.

___ strings ___

  spaces:
    program names cannot contain spaces: %s

  once:
    a program must only run once in a test run: %s

___ errors _ usage: en_US ___
usage: proof errors [options] [<test>...]

  Display output of failed assertions.

options:

    -h,   --help                  display this usage information
    -M,   --monochrome            do not display color
    -p,   --processes <count>     number of processes to run

invocation:

  If no proof runner output files are given, the error reporter listens
  for proof runner output on STDIN.

  If there are no errors, `proof errors` exits with a zero exit code,
  otherwise it returns a non-zero exit code.

description:

  `proof errors` displays failure assertions and failure conditions in
  context, with the program output and error output that preceded and
  follow the failure.

___ platform _ usage: en_US ___
usage: platform [options] [<name>..]

  Exit success if running on one of the given platforms.

options:

    -h,   --help                  display this usage information

invocation:

  Exit success if running on one of the given platforms, exit failure otherwise.
  Known platforms include 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'

  If no platforms are listed, then the `proof platform` program exits failure.

description:

  `proof platform` simplifies cross-platform builds, giving you a reliable test
  to use in your `package.json` definition of your `test` script. I use it to
  invoke Proof directly on `win32` to take advantage of Proof's advanced
  globbing capabilities absent in Windows Power Shell, indirectly through a
  shell program that performs additional testing on UNIX platforms.

___ test _ usage: en_US ___
usage: proof test [options] [<files>...]

  Run tests and display progress a colorized progress meter.

options:

    -d,   --digits    [count]     number of timing digits to display
    -h,   --help                  display this usage information
    -M,   --monochrome            do not display color
    -p,   --processes [count]     number of processes to run
    -t,   --timeout   [count]     when to stop waiting for process output,
                                  default 30 seconds
    -w,   --width     [count]     width in characters of progress display

invocation:

  If there are no errors, `proof` exits with a zero exit code, otherwise it
  returns a non-zero exit code.

description:

  `proof` runs a collection of tests and displays a colorful, animated
  report of test progress. Output from `proof run` can be piped to
  `proof progress` to display the progress of a test run as it is
  running. Using a utility like `tee`, you can both pipe `proof run`
  output to `proof progress` and save it to file for later reporting.

___ usage: en_US ___
usage: proof [command] <arguments> <tests>
___ usage ___
*/

var arguable = require('arguable')
var proof = require('./proof')

arguable.parse('en_US', __filename, process.argv.slice(2), proof.main, proof.abended)

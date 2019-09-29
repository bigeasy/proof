/*
___ usage ___ en_US ___
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

___ $ ___ en_US ___

  spaces:
    error: program names cannot contain spaces: %s

  once:
    error: a program must only run once in a test run: %s

___ . ___

*/
require('arguable')(module, require('cadence')(function (async, destructible, arguable) {
    arguable.helpIf(arguable.ultimate.help)
    var run = require('./run').run
    run(arguable, process, destructible.durable('run'))
    return []
}))

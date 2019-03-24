/*
___ usage ___ en_US ___
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

___ . ___
*/
require('arguable')(module, require('cadence')(function (async, destructible, arguable) {
    arguable.helpIf(arguable.ultimate.help)
    var test = require('./test')
    test(arguable, destructible.durable('test'))
    return []
}))

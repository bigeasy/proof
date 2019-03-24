/*

___ usage ___ en_US ___
usage: proof progress [options] [<files>...]

  Display proof output using a colorized progress meter.

options:

    -d,   --digits    [count]     number of timing digits to display
    -h,   --help                  display this usage information
    -M,   --monochrome            do not display color
    -t,   --tty                   force tty output
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

___ . ___

*/
require('arguable')(module, require('cadence')(function (async, destructible, arguable) {
    var formatterRedux = require('./formatter')
    var _progress = require('./progress')
    var parse = require('./parse')
    var printer = require('./printer')

    arguable.helpIf(arguable.ultimate.help)

    var formatterRedux = formatterRedux(_progress(arguable))
    parse(arguable, arguable.stdin, arguable.stderr, printer(formatterRedux, arguable.stdout, arguable.stderr), destructible.durable('progress'))
    return []
}))

/*

___ usage ___ en_US ___
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

___ . ___
*/
require('arguable')(module, require('cadence')(function (async, program) {
    var formatterRedux = require('./formatter')
    var _errors = require('./errors')
    var parse = require('./parse')
    var printer = require('./printer')

    program.helpIf(program.ultimate.help)

    var formatterRedux = formatterRedux(_errors(program))
    parse(program, printer(formatterRedux, program.stdout, program.stderr), async())
}))

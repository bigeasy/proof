/*
___ usage ___ en_US ___
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

___ . ___
*/

require('arguable')(module, require('cadence')(function (async, program) {
    var formatterRedux = require('./formatter')
    var jsonRedux = require('./json')
    var parse = require('./parse')
    var printer = require('./printer')

    program.helpIf(program.command.param.help)

    var formatterRedux = formatterRedux(jsonRedux())
    program.stdin.resume()
    parse(program, printer(formatterRedux, program.stdout, program.stderr), async())
}))

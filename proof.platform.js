/*
___ usage ___ en_US ___
usage: proof platform [options] [<name>..]

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

___ . ___
*/

require('arguable')(module, require('cadence')(function (async, destructible, arguable) {
    arguable.helpIf(arguable.ultimate.help)
    var check = require('./platform')
    check(arguable, process, async())
    destructible.destroy()
}))

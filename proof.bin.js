#!/usr/bin/env node

/*
___ usage ___ en_US ___
usage: proof [command] <arguments> <tests>
___ . ___

*/

require('arguable')(module, require('cadence')(function (async, program) {
    program.helpIf(program.command.param.help)
    program.delegate(require, './proof', async())
}))

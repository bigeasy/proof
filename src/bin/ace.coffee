#!/usr/bin/env coffee
{spawn} = require "child_process"

colorize  = (color) -> (text) -> "#{color}#{text}\u001B[39m"
red       = colorize("\u001B[31m")
green     = colorize("\u001B[32m")

programs = process.argv.slice(2)
parallel = [ ]
for program in programs
  dirname = /^(.*)\/.*/.exec(program)[1]
  parallel[dirname] or= { programs: [], time: 0, running: true }
  parallel[dirname].programs.push program
parallel = (value for key, value of parallel)
failures = []
displayed = 0

run = (program, index) ->
  [ actual, passed, end, expected, out ] = [ 0, 0, false, null, "" ]
  [ status, color, icon ] = [ "Success", green, "\u2713" ]

  styling = ->
    if passed < actual
      [ status, color, icon ] = [ "Failure", red, "\u2718" ]

    time = "     #{+(new Date()) - start}".replace(/(\d{3})$/, ".$1").slice(-5)
    summary = "(#{passed}/#{expected}) #{time}"
    dots = Array(Math.max(66 - program.length - summary.length, 0)).join "."
    styled = " #{color icon} #{program} #{dots} #{summary} #{color(status)}\r"
    
    console.error "BUFFERED" if not process.stdout.write styled

  tattled = {}
  tattle = (message) ->
    if not tattled[message]
      process.stderr.write "\n#{message}"
      tattled[message] = true

  start = +(new Date())

  test = spawn program

  test.stderr.setEncoding "utf8"
  test.stderr.on "data", (chunk) -> process.stderr.write chunk

  test.stdout.setEncoding "utf8"
  test.stdout.on "data", (chunk) ->
    out  += chunk
    lines = out.split /\n/
    out   = lines.pop()
    for line in lines
      continue if /^(?:\s*|\s*#.*)$/.test line
      parallel[index].time = +(new Date()) - start
      if end
        tattle "test is writing after completion"
      else if match = /^1..(\d+)$/.exec line
        if expected?
          tattle "test sent multiple plans"
        else
          expected = parseInt match[1], 10
          end = actual isnt 0
      else if match = /^(not\s+)?ok\s+(\d+)(?:\s+-\s*(.*?)\s*)?$/.exec line
        [ failed, message ] = match.slice(1)
        passed++    unless failed
        end = true  if ++actual is expected
        styling()   if displayed is index
      else if match = /^Bail out!(?:\s+(.*?)\s*)?$/.exec line
        process.stdout.write "\nBail out! #{match[1]}\n"
        tattle = ->
      else
        tattle "test is writing out jibberish\n"

  test.on "exit", (code) ->
    styling()
    process.stdout.write "\n"

    parallel[index].time = time = 0
    for program_, i in parallel
      if program_.time > time
        time = program_.time
        displayed = i

    if passed isnt expected or code isnt 0
      failures.push { program, passed, expected, time, code }
    if parallel[index].programs.length
      run(parallel[index].programs.shift(), index)
    else if next < parallel.length
      parallel[index].running = false
      displayed = next + 1 if displayed is index
      index = next++
      run(parallel[index].programs.shift(), index)
    else if not (value for value of parallel when value.running).length
      for failure in failures
        time = +(new Date()) - start
        { program, code, passed, expected, time } = failure
        process.stdout.write "\n#{program} exited: #{code} (#{passed}/#{expected}) in #{time} ms\n"

next = 1
for i in [0...next]
  run(parallel[i].programs.shift(), i) if parallel[i]

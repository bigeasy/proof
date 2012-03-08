#!/usr/bin/env coffee
fs = require "fs"

say = (splat...) -> console.error.apply null, splat
die = (splat...) ->
  console.error.apply null, splat if splat.length
  process.exit 1

{spawn} = require "child_process"
{OptionParser}  = require "coffee-script/lib/coffee-script/optparse"

options =
  create: []
  json: []
  run: [ [ "-p", "--processes [COUNT]", "run multiple processes" ] ]
  progress: []

args = process.argv.slice(2)

if opts = options[args[0]]
  action = args.shift()
else
  action = "piped"
  opts = options.run

parser = new OptionParser opts

usage = (message) ->
  process.stderr.write "error: #{message}\n"
  process.stderr.write parser.help()
  process.stderr.write "\n"
  process.exit 1

try
  options = parser.parse args
catch e
  usage "Invalid arguments."

piped = ->
  formatter = spawn __filename, [ "progress" ], customFds: [ -1, 1, 2 ]
  formatter.on "exit", (code) -> process.exit code if code isnt 0
  runner = spawn __filename, [ "run" ].concat args
  runner.stderr.on "data", (chunk) ->
  runner.stdout.pipe(formatter.stdin)
  runner.on "exit", (code) -> process.exit code if code isnt 0

json = ->
  object = {}
  process.stdin.resume()
  parse process.stdin, (program) ->
    switch program.type
      when "run"
        object[program.file] =
          time: program.time
          expected: program.expected
          tests: []
      when "plan"
        object[program.file].expected = program.expected
      when "test"
        { message, file, time, passed, skip, todo, comment } = program
        object[file].tests.push { message, time, passed, skip, todo, comment }
      when "exit"
        extend object[program.file],
          actual: program.actual
          duration: program.time - program.start
          code: program.code
      when "eof"
        process.stdout.write JSON.stringify object, null, 2
        process.stdout.write "\n"

progress = do ->
  # Colorization.
  colorize  = (color) -> (text) -> "#{color}#{text}\u001B[39m"
  red       = colorize("\u001B[31m")
  green     = colorize("\u001B[32m")

  # Visual queue for table layout.
  dotted = (count) -> Array(Math.max(count - 1, 0)).join "."

  styling = (program, terminal) ->
    if program.passed < program.actual or program.bailed
      extend program, status: "Failure", color: red, icon: "\u2718"

    # Format time.
    time = "#{program.time - program.start}"
    time = "00#{time}".slice(-3) if time.length < 3
    time = "     #{time}".replace(/(\d{3})$/, ".$1").slice(-5)

    # Format summary.
    summary = "(#{program.passed}/#{program.expected}) #{time}"

    dots = dotted(66 - program.file.length - summary.length)

    { color, icon, file, status } = program
    " #{color icon} #{file} #{dots} #{summary} #{color(status)}#{terminal}"

  return ->
    # Consume test output from standard input.
    process.stdin.resume()

    durations = {}
    displayed = null
    programs = {}


    failed = []
    parse process.stdin, (program) ->
      # If the type is run, we're starting up a new test, create a new program
      # structure to gather the test output.
      if program.type is "run"
        displayed or= program.file
        programs[program.file] ?= {
          actual: 0
          color: green
          file: program.file
          start: Number.MAX_VALUE
          status: "Success"
          time: 0
          passed: 0
          expected: program.expected
          icon: "\u2713"
        }

      # At the end of all tests, we print our summary, otherwise we print .
      if program.type is "eof"
        summary =
          actual: 0
          passed: 0
          expected: 0
          time: 0
          start: Number.MAX_VALUE
          count: 0

        for file, program of programs
          summary.count++
          summary.actual += program.actual or 0
          summary.passed += program.passed or 0
          summary.expected += program.expected or 0
          continue if not program.time
          summary.start = Math.min(summary.start, program.start)
          summary.time = Math.max(summary.time, program.time)

        summary.file = "Total tests: #{summary.count}"

        extend summary, if summary.passed is summary.expected
          { icon: "\u2713", status: "Success", color: green }
        else
          { icon: "\u2718", status: "Failure", color: red }

        process.stdout.write Array(79).join("_") + "\n"
        process.stdout.write styling(summary, "\n")

      # Otherwise update duration.
      else
        programs[program.file].duration = program.time - program.start
        switch program.type
          when "test"
            if file is displayed and process.stdout.isTTY and process.env["TRAVIS"] isnt "true"
              process.stdout.write styling(programs[program.file], "\r")
          when "bail"
            programs[program.file].bailed = true
          when "exit"
            extend programs[program.file], program
            process.stdout.write styling(programs[program.file], "\n")
            if program.code isnt 0
              failed.push program
            candidates = (v for k, v of programs)
            candidates.sort (a, b) -> a.duration - b.duration
            displayed = candidates.pop()?.file

parser =
  plan: (plan) ->
    if match = /^1..(\d+)$/.exec plan
      expected = match[1]
    if expected
      expected = parseInt(expected, 10)
    if not isNaN(expected)
      { expected: parseInt(match[1], 10) }
  bailout: (bailout) ->
    if match = /^Bail out!(?:\s+(.*))?$/.exec bailout
      message = match[1]
      { message }
  assertion: (assert) ->
    if match = /^(not\s+)?ok\s+\d+\s*(.*?)\s*$/.exec assert
      [ failed, message ] = match.slice(1)
      ok = not failed?
      [ comment, skip, todo ] = [ null, false, false, ]
      if message?
        [ message, comment ] = message.split /\s+#\s+/, 2
        if comment?
          if skip = (match = /^skip\s(.*)$/i.exec comment)?
            comment = match[1]
          if todo = (match = /^todo\s(.*)$/i.exec comment)?
            comment = match[1]
      { ok, message, comment, skip, todo }

extend = (destination, sources...) ->
  for source in sources
    destination[key] = value for key, value of source
  destination

parse = (stream, callback) ->
  programs = {}
  [ out ] = [ "" ]
  count = 0
  stream.setEncoding "utf8"
  stream.on "data", (chunk) ->
    out  += chunk
    lines = out.split /\n/
    out   = lines.pop()
    for line in lines
      count++
      if not match = ///
        ^
        (\d+)       # time
        \s+
        (\w+)       # type
        \s+
        ([^\s]+)    # file
        \s*
        (.*)        # rest
        $
      ///.exec line
        throw new Error "cannot parse line #{count}"
      [ time, type, file, rest ] = match.slice(1)
      time = parseInt time
      program = programs[file] or= {
        passed: 0
        actual: 0
      }
      switch type
        when "test"
          record = parser.assertion rest
          program.actual++
          program.passed++ if record.ok
          extend record, program, { time, file, type }
          callback record
        when "run"
          program.start = time
          callback extend program, { time, type, file }
        when "plan"
          expected = parseInt rest, 10
          callback extend program, { time, file, type, expected }
        when "bail"
          record = parser.bailout rest
          program.bailed = true
          extend record, program, { time, file, type }
          callback record
        when "exit"
          code = parseInt rest, 10
          if isNaN code
            throw new Error "cannot read exit code #{code} on line #{count}"
          record = extend {}, program, { code, file, type, time }
          callback record
        when "err", "out"
          callback({ time, type, file, line: rest })
        when "eof"
          callback({ time, type })
        else
          throw new Error "unknown type #{type}"

run = ->
  programs = options.arguments
  parallel = {}
  for program in programs
    if /\s+/.test program
      throw new Error "program names cannot contain spaces: #{program}"
    dirname = /^(.*)\/.*/.exec(program)[1]
    parallel[dirname] or= { programs: [], time: 0, running: true }
    parallel[dirname].programs.push program
  parallel = (value for key, value of parallel)
  failures = []
  displayed = 0

  emit = (file, type, message) ->
    message = if message? then " #{message}" else ""
    type = "#{type}      ".slice(0, 4)
    process.stdout.write "#{+new Date()} #{type} #{file}#{message}\n"

  execute = (program, index) ->
    emit(program, "run")
    test = spawn program
    bailed = false

    err = ""
    test.stderr.setEncoding "utf8"
    test.stderr.on "data", (chunk) ->
      err  += chunk
      lines = err.split /\n/
      err   = lines.pop()
      for line in lines
        emit(program, "err", line)

    out = ""
    test.stdout.setEncoding "utf8"
    test.stdout.on "data", (chunk) ->
      out  += chunk
      lines = out.split /\n/
      out   = lines.pop()
      for line in lines
        if bailed
          emit program, "out", line
        else if parser.assertion(line)
          emit program, "test", line
        else if plan = parser.plan(line)
          emit program, "plan", plan.expected
        else if parser.bailout(line)
          emit program, "bail", line
        else
          emit program, "out", line

    test.on "exit", (code) ->
      emit(program, "exit", code)
      parallel[index].time = time = 0
      if parallel[index].programs.length
        execute(parallel[index].programs.shift(), index)
      else if next < parallel.length
        parallel[index].running = false
        displayed = next + 1 if displayed is index
        index = next++
        execute(parallel[index].programs.shift(), index)
      else
        emit("*", "eof")

  next = options.processes or 1
  for i in [0...next]
    execute(parallel[i].programs.shift(), i) if parallel[i]

create = ->
  signature = []
  plan = 0
  async = ""
  harness = "./harness"
  for argument in options.arguments
    if argument is "_"
      async = ", _"
    else if /^t(?:est)?\//.test argument
      name = argument
    else if /^\./.test argument
      harness = argument
    else if /^\d+/.test argument
      plan = parseInt argument, 10
    else
      signature.push argument
  try
    if fs.statSync name
      die "test file already exists: #{name}"
  catch e
    throw e unless e.code is "ENOENT"
  [ directory, file ] = /^(.*)\/(.*)/.exec(name)[1..]
  harnessFile = "#{directory}/#{harness}.coffee"
  try
    stat = fs.statSync harnessFile
  catch e
    if e.code is "ENOENT"
      die "cannot find harness #{harnessFile}"
    throw e
  shebang = /^(.*)\n/.exec(fs.readFileSync(harnessFile, "utf8"))[1]
  fs.writeFileSync name, """
    #{shebang}
    require("#{harness}") 0, (context) ->
      process.stdout.write JSON.stringify Object.keys context
      process.stdout.write "\\n"

  """, "utf8"
  fs.chmodSync name, 0755
  output = ""
  inspect = spawn name
  inspect.stdout.setEncoding "utf8"
  inspect.stdout.on "data", (chunk) -> output += chunk
  inspect.on "exit", (code) ->
    fs.unlinkSync name
    if code isnt 0
      die "cannot generate inspection program"
    if async
      shebang += """
        \nreturn if not require("streamline/module")(module)
      """
    json = JSON.parse output.split(/\n/)[1]
    missing = []
    for arg in signature
      if json.indexOf(arg) is -1
        missing.push arg
    if missing.length
      die """
        harness does not provide #{missing.join(", ")}
        try: #{json.join(", ")}
      """
    fs.writeFileSync name, """
      #{shebang}
      require("#{harness}") #{plan}, ({ #{signature.join(", ")} }#{async}) ->

        # Here be dragons.\n
    """, "utf8"
    fs.chmodSync name, 0755

({ create, piped, json, run, progress })[action]()

#!/usr/bin/env coffee
fs = require "fs"
path = require "path"

say = (splat...) -> console.error.apply null, splat
die = (splat...) ->
  console.error.apply null, splat if splat.length
  process.exit 1

{spawn} = require "child_process"

# Verbose usage specific to each action.
options =
  create: """
    usage: proof create [test] [harness] [<parameter>...] [_] [count]

    test:
      Name of the test.
    harness:
      Name and path to test harness relative to test file. By default the
      generator will look for a source file with a base name of `./proof`
      relative to the test file. The file is expected to have an extension of
      one of the Proof supported languages, either `.coffee`, `._coffee`, `.js`
      or `._js`.
    parameter:
      One or more parameters to extract from the test context.
    _:
      Test is a Streamline.js test, so pass in an underscore.
    expected:
      The number of tests expected.
  """
  json: """
    usage: proof json [<test>...]
  """
  progress: """
    usage: proof progress [<test>...]
  """
  run: """
    usage: proof run [options] [<test>...]

    options:
      -p,   --processes [count]     number of processes to run
  """

# Choose an option based on an action name. The default action is `run`.
argv = process.argv.slice(2)
if opts = options[argv[0]]
  action = argv.shift()
else
  action = "piped"
  opts = options.run

# If we can't figure out what the user wants, we print usage and die.
usage = ->
  console.log opts
  process.exit 1

# Extract the action specific options from the command line arguments. We parse
# our usage text to get our long and short option names.
[ options, argv ]  = do ->
  # Options, option names.
  [ options, flag, full ]  = [ {}, {}, {} ]
  # Map option descriptions to conversion functions. We use the arity of the
  # conversion function to determine if an option takes a parameter.
  converter =
    count: (name, next) -> not isNaN(@[name] = parseInt next, 10)
    path: (name, next) -> @[name] = next
    none: (name) -> (@[name] = not @[name])?
  # Split out usage text and grep for long and short option names. Create a few
  # maps of names to converters.
  for opt in opts.split /\n/
    if match = ///
        \s*(?:(-\w),)?        # short option
        \s*(--\w+)            # long option
        \s*(?:\[([^\]]+)\])?  # parameter
      ///.exec(opt)
      [ short, long, param ] = match[1..]
      flag[short] = flag[long] = converter[param]
      full[short] = long
  # Pull options off the front of argv. Convert the option parameter, if it
  # takes a parameter.
  while conv = flag[argv[0]]
    name = argv.shift()
    name = (full[name] or name).substring(2)
    length = conv.length - 1
    usage() if argv.length < length
    usage() unless conv.apply options, [ name ].concat(argv.splice(0, length))
  # Return the options and the remaining arguments.
  [ options, argv ]

piped = ->
  formatter = spawn __filename, [ "progress" ], customFds: [ -1, 1, 2 ]
  formatter.on "exit", (code) -> process.exit code if code isnt 0
  runner = spawn __filename, [ "run" ].concat argv
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
  fill = (filler, count) -> Array(Math.max(count - 1, 0)).join filler

  # Format time.
  time = (program) ->
    str = "#{program.time - program.start}"
    str = "00#{str}".slice(-3) if str.length < 3
    str = "0#{str}" if str.length < 4
    str = "      #{str}".replace(/(\d{3})$/, ".$1")
    str.replace(/^\s{6}/, '')

  styling = (program, terminal) ->
    if program.passed < program.actual or program.bailed
      extend program, status: "Failure", color: red, icon: "\u2718"

    # Format summary.
    summary = "(#{program.passed}/#{program.expected}) #{time program}"

    dots = fill(".", 66 - program.file.length - summary.length)

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
      # Display the output if nothing else is being displayed.
      displayed or= program.file

      # If the type is run, we're starting up a new test, create a new program
      # structure to gather the test output.
      if program.type is "run"
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

        tests = { actual: 0, passed: 0 }
        for file, program of programs
          tests.actual++
          tests.passed++ if program.expected is program.passed
          summary.count++
          summary.actual += program.actual or 0
          summary.passed += program.passed or 0
          summary.expected += program.expected or 0
          continue if not program.time
          summary.start = Math.min(summary.start, program.start)
          summary.time = Math.max(summary.time, program.time)

        summary.file = "tests (#{tests.passed}/#{tests.actual}) assertions"

        extend summary, if summary.passed is summary.expected
          { icon: "\u2713", status: "Success", color: green }
        else
          { icon: "\u2718", status: "Failure", color: red }

        # Format summary.
        stats = "(#{summary.passed}/#{summary.expected}) #{time summary}"

        dots = fill(" ", 66 - summary.file.length - stats.length)

        { color, icon, file, status } = summary
        process.stdout.write " #{color ' '} #{dots} #{file} #{stats} #{color(status)}\n"

        process.exit 1 if summary.passed isnt summary.expected

      # Otherwise update duration.
      else
        programs[program.file].duration = program.time - program.start
        switch program.type
          when "plan"
            programs[program.file].expected = program.expected
          when "test"
            extend programs[program.file], program
            if program.file is displayed and process.stdout.isTTY and process.env["TRAVIS"] isnt "true"
              process.stdout.write styling(programs[program.file], "\r")
          when "bail"
            displayed = null if program.file is displayed
            programs[program.file].bailed = true
          when "exit"
            displayed = null if program.file is displayed
            extend programs[program.file], program
            process.stdout.write styling(programs[program.file], "\n")
            if program.code isnt 0
              failed.push program

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
  programs = argv
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
  harness = "./proof"
  for argument in argv
    if argument is "_"
      async = ", _"
    # TODO Document.
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
  directory = path.dirname(name)
  file = path.basename(name)
  isHarness = new RegExp("^#{path.basename(harness)}")
  for harnessFile in fs.readdirSync path.resolve directory, path.dirname harness
    if isHarness.test(harnessFile)
      resolvedHarness = harnessFile
      break
  if not resolvedHarness
    die "cannot find harness #{harness}"
  executable = if async or path.extname(resolvedHarness)[0] is "_"
    "_coffee"
  else
    "coffee"
  fs.writeFileSync name, """
    #!/usr/bin/env #{executable}
    require("#{harness}") 0, (context) ->
      process.stdout.write JSON.stringify Object.keys context
      process.stdout.write "\\n"

  """, "utf8"
  fs.chmodSync name, 0o755
  output = ""
  inspect = spawn name
  inspect.stderr.setEncoding "utf8"
  inspect.stderr.on "data", (chunk) -> process.stdout.write chunk
  inspect.stdout.setEncoding "utf8"
  inspect.stdout.on "data", (chunk) -> output += chunk
  inspect.on "exit", (code) ->
    fs.unlinkSync name
    if code isnt 0
      say output
      die "cannot generate inspection program"
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
      #!/usr/bin/env #{executable}
      require("#{harness}") #{plan}, ({ #{signature.join(", ")} }#{async}) ->

        # Here be dragons.\n
    """, "utf8"
    fs.chmodSync name, 0o755

({ create, piped, json, run, progress })[action]()

# Some decisions. Note that by we, I mean me. The royal me. As I considered this
# project, it seemed that there were a lot of ways to make it complicated. 
# 
# *Standard error and standard out are separate channels.* This means that we're
# not going to try to preserve the interleaving of writes to standard error and
# standard out when we save our output for posterity. The real time test runner
# will attempt to display the standard and error as they occur, assuming that a
# debugging developer will want to see these in order. A continuous integration
# system will simply record them separately.
#
# *Standard output is canonical.* To display details about a test, we can just
# run the caputred standard output back through a runner. Thus, if we're
# generating a database of test runs, we store the output as it is. If we want
# to see the raw output, we can simply view the raw output.
#
# *We are not interested in garbage output.* When we run a test, we clump lines
# that do not parse as output from the last test.
#
# *To focus an test for development, create a new file that contains only the
# test of interest.* This instead of creating a complicated test runner with
# nested tests and the like. Sometimes you want to debug a broken test, but it
# comes after a dozen tests in the same file. 
#
# Getting to the point where I'm only interested in tiggering the runner. I'm
# trying to imagine where 
class Test
  constructor: (@_expected) ->
    @_actual = 0
    @_timeout()
    process.stdout.write "1..#{@_expected}\n"
  _indent: (start, prefix, string) ->
    lines = string.split /\n/
    for i in [start...lines.length]
      lines[i] = "#{prefix}#{lines[i]}"
    lines.push ""
    lines.join "\n"
  _timeout: ->
    clearTimeout @_timer if @_timer
    setTimeout (=> @bailout("Timeout!")), 30000
  bailout: (error) ->
    clearTimeout @_timer if @_timer
    if typeof error is "object"
      detail = error.stack
      error = error.message
    # Maybe a multiline error all goes on the subsequent line.
    if error?
      message = "Bail out! #{@_indent(1, "  ", error)}\n"
    else
      message = "Bail out!\n"
    process.stdout.write message
    if detail?
      process.stdout.write "#{@_indent(0, "# ", detail)}\n"
    process.exit 1
  end: ->
    process.exit if @_expected is @_actual then 0 else 1

for name, assertion of require("assert")
  do (name, assertion) ->
    Test.prototype[name] = (splat...) ->
      @_timeout()
      @_actual++
      try
        assertion.apply @, splat
        process.stdout.write "ok #{@_actual} #{splat[splat.length - 1]}\n"
      catch e
        process.stdout.write "not ok #{@_actual} #{e.message}\n"
        if assertion.length is 3
          inspect = { EXPECTED: splat[1], GOT: splat[0] }
          inspect = require("util").inspect inspect, null, Math.MAX_VALUE
          process.stdout.write @_indent 0, "# ", inspect

async = new Object
module.exports = harness = (splat...) ->
  if splat.length is 1
    [ context ] = splat
    (expected, callback) ->
      try
        harness expected, (_callback) ->
          callback.call @, context, _callback
          _callback() if callback.length is 1
      catch error
        callback(error)
  else
    [ expected, callback ] = splat
    test = new Test(expected)
    try
      done = false
      callback.apply test, [].concat (error) ->
        if error
          test.bailout(error)
        else
          test.end()
      test.end() unless callback.length is 1
    catch error
      test.bailout(error)

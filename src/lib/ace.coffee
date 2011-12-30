class Test
  constructor: (@_expected) ->
    @_actual = 0
    @_teardowns = []
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
  teardown: (method) ->
    @_teardowns.push method
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

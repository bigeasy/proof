# **Test** 
#
# And instance of this class is bound to the test method. It provides assertions
# and tracks the progress of the test.
util = require "util"

# `class Test`
class Test
  # Construct a test that expects the given number of tests.
  constructor: (@_expected, housekeepers) ->
    @_housekeepers = []
    @_actual = 0
    @_timeout()
    process.stdout.write "1..#{@_expected}\n"

  # Print a string to standard out as a comment, prepending each line in the
  # string with a hash mark.
  _comment: (string) ->
    lines = string.split /\n/
    for i in [0...lines.length]
      lines[i] = "# #{lines[i]}"
    lines.push ""
    process.stdout.write lines.join "\n"

  # Set and reset a thirty second timeout between assertions.
  _timeout: ->
    clearTimeout @_timer if @_timer
    setTimeout (=> @bailout("Timeout!")), 30000

  # Send a `Test::Harness` Bail Out! message to stdout. This is a message sent
  # when futher testing is impossible. Use it when a valuable resource is
  # missing, or everyting in the world is just plain wrong. It is sent as a
  # result of uncaught exceptions, test timeouts.
  #
  # We do not call `_teardown` on bailout. We are leaving now, hotel room
  # trashed, to get to the airport, before the Sheriff comes, and our attorneys
  # will have to handle the bill and maybe fight extradition. Yes, it is that
  # bad. What are you still standing there for? Let's go!
  #
  # Tests are supposed to exercise demons. If we must Bail Out! of a test, we
  # assume that we are in a state were normal execution is impossible, therefore
  # normal cleanup is impossible.
  #
  # We only offer teardown because when tests are healthy, teardown is healthy,
  # and reflects normal system operation. Teardown should close database
  # connections, or close file handles, but it shouldn't attempt to restore a
  # database or save important data to file. It really shouldn't.
  #
  # Finally, as an implementation issue, exiting the process immediately stops
  # forward motion of the test. Our teardown is involved, giving the
  # teardown method an opportuntiy to run asynchrnously, so now we have to set a
  # timer on the teardown, and if that timesout, to we just skip the bad
  # teardown method, but try the next?
  #
  # We'll get frequent catastrophic errors that cause two minute shutdowns of a
  # dozen tests. People will wake up in the morning to find their continuous
  # integration system is still waiting as Proof slowly shuts down one failed
  # little test after another.
  #
  # Younger programmers are going to be afraid to not do everything they can to
  # handle an error in a suicidal process. (Yes, Bail Out! is process suicide,
  # so the process is unstable both phyically and emotionally, and probably not
  # in a mood to tidy up.) I hope we're not teaching them the same Pavlovian
  # responses to exceptional conditions that we were teaching ten years ago.
  #
  # You might leave resources in a dirty state for a new test process, but new
  # test processes should clean up before running. You might leave a resource in
  # a locked state, but Proof ensures that processes in a suite run serially, so
  # subsequent test harnesses can confidentally break those locks.
  #
  # This will all be moved to a rationale section of the Proof documentation.

  # `@bailout([error])`
  bailout: (error) ->
    # Show stack trace as a comment if error is an exception.
    if error instanceof Error
      mesage = error.message
      detail = error.stack
    else if error
      message = error.toString()

    # Only print first line of message. If it is multi line, we'll reprint the
    # full message as a comment below the Bail Out!
    if message?
      lines = message.split /\n/
      if lines.length > 1 and not detail?
        detail = message
      message = "Bail out! #{lines[0]}\n"
    else
      message = "Bail out!\n"
    process.stdout.write message
    if detail?
      @_comment(detail)
    @_tidy 1

  say: (object) ->
    inspection = util.inspect.call util.inspect, object, false, 1024
    @_comment(inspection)

  # Register a cleanup function to run at exit, invoking it immediately to
  # cleanup a possible failed previous run.
  cleanup: (callback..., housekeeper) ->
    @_housekeepers.push (callback) ->
      try
        if housekeeper.length is 1
          housekeeper callback
        else
          callback()
          housekeeper null
      catch e
        callback e
    try
      if housekeeper.length is 1
        housekeeper (error) -> callback[0](error)
      else
        housekeeper()
    catch e
      @bailout e

  # Try to run the cleanup functions and bailout if any fail in any way. We copy
  # the housekeepers property and empty it so we don't run more housekeepers
  # from a bailout we invoke.
  _tidy: (code) ->
    housekeepers = @_housekeepers.splice(0)
    if not process.env.PROOF_NO_CLEANUP
      tidy = =>
        if housekeeper = housekeepers.shift()
          housekeeper (error) => if error then @bailout error else tidy()
        else
          process.exit code
      tidy()

  # A healthy end to our test program. Call any teardown hooks set by the test
  # harness and then exit reflecting the pass/fail state of the program.
  _end: ->
    # In case teardowns are async, we don't want to bailout while waiting.
    clearTimeout @_timer if @_timer
    @_tidy if @_expected is @_actual then 0 else 1


# Generate asssertion member methods for the Test class from the assert library.
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
          @_comment(inspect)

execution = (test, splat...) ->
  if splat.length is 1
    [ callback ] = splat
    try
      if callback.length is 1
        callback.call test, (error) ->
          if error
            test.bailout error
          else
            test._end()
      else
        callback.call test
        test._end()
    catch error
      test.bailout error
  else
    [ context, callback ] = splat
    if typeof context is "function"
      try
        context.call test, (error, _context) ->
          if error
            test.bailout error
          else
            execution test, _context, callback
      catch error
        test.bailout error
    else
      try
        execution test, (_callback) ->
          if callback.length is 2
            callback.call @, context, _callback
          else
            callback.call @, context
            _callback()
      catch error
        test.bailout error
    
# We only export one method to both define harnesses and run tests.
module.exports = harness = (splat...) ->
  if splat.length is 1
    [ context ] = splat
    (expected, callback) ->
      execution(new Test(expected), context, callback)
  else
    [ expected, callback ] = splat
    execution(new Test(expected), callback)
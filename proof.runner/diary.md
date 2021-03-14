## Sun Mar 14 12:56:14 CDT 2021

If you really want to support Node.js 10 you can re-release 8.0.1 as 9 and leave
it and use 10 for future development. Okay, let's do that. But, I don't see the
point. The only older module you want to support is Cadence and Node.js 10 is
quite modern compared to the ancients that would still work with Cadence.

Since Proof runs processes, you could do something like install Node.js 0.2 and
run Cadence tests with that executable using whatever the latest proof runner
is.

In any case, we do need to do a version bump since we broke against 10.

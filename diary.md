Thu Dec 22 08:57:02 EST 2016

For a time this project was building on Circle CI as a part of an evaluation of
Circle CI, but that evaluation did not result in adoption, and those build hooks
have been removed.

---

Thought about creating a bogus stdout for Proof that tracks whether or not
you've written a new line, if the cursor is at the start of a line. I'm not
going to do this. I'm actually wondering if errors shouldn't be written to
stdout, because the progress runner is such a special snowflake, but they
shouldn't.

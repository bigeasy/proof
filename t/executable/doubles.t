#!/bin/bash

echo "1..1"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

proof="$DIR/../../bin/proof"
out=$($proof run t/foo.t t/foo.t 2>&1 >&-)

echo "#" "$out"
if [ "$out" == "error: a program must only run once in a test run: t/foo.t" ]; then
  echo "ok 1 doubles"
else
  echo "not ok 1 doubles"
fi

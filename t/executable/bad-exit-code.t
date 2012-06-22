#!/bin/bash

echo "1..1"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

proof="$DIR/../../bin/proof"
out=$(cat "$DIR/fixtures/bad-error-code.out" | $proof progress 2>&1 >&-)

echo "#" "$out"
if [ "$out" == "error: cannot parse runner test exit code at line 5: exit code X" ]; then
  echo "ok 1 exit code"
else
  echo "not ok 1 exit code"
fi

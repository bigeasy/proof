#!/bin/bash

echo "1..1"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

proof="$DIR/../../bin/proof"
out=$(echo "%t" | $proof progress 2>&1 >&-)

echo "#" "$out"
if [ "$out" == "error: cannot parse runner output at line 1: invalid syntax" ]; then
  echo "ok 1 invalid line"
else
  echo "not ok 1 invalid line"
fi

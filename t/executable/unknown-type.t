#!/bin/bash

echo "1..1"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

proof="$DIR/../../bin/proof"
out=$(cat "$DIR/fixtures/unknown-type.out" | $proof progress 2>&1 >&-)

echo "#" "$out"
if [ "$out" == "error: cannot parse runner output at line 2: unknown line type x" ]; then
  echo "ok 1 unknown type"
else
  echo "not ok 1 unknown type"
fi

#!/bin/bash

echo "1..1"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

proof="$DIR/../../bin/proof"
out=$($proof run 't/a b.t' 2>&1 >&-)

echo "#" "$out"
if [ "$out" == "error: program names cannot contain spaces: t/a b.t" ]; then
  echo "ok 1 spaces"
else
  echo "not ok 1 spaces"
fi

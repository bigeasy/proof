#!/bin/bash

echo "1..2"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

PATH="$DIR/../../bin":$PATH
out=$(proof -M 't/executable/garbage')

# Without the dot, leading whitespace is stripped. I cannot find anyone saying
# that it's supposed to do that, but it does.
read -r -d '' VAR <<EOF
.
 ✘ t/executable/garbage ................................ (X/X) X.XXX Failure
                                  tests (X/X) assertions (X/X) X.XXX Failure
EOF

if [ "$(echo "$VAR" | sed -e 1d)" == "$(echo "$out" | sed -e 's/[0-9]/X/g')" ]; then
  echo "ok 1 garbage progress"
else
  echo "not ok 1 garbage progress"
  echo "$out"
fi

out=$(proof run 't/executable/garbage' | proof errors -M)

read -r -d '' VAR <<EOF
.

> ✘ t/executable/garbage: no plan given: exited with code 1
EOF

if [ "$(echo "$VAR" | sed -e 1d)" == "$out" ]; then
  echo "ok 1 garbage errors"
else
  echo "not ok 1 garbage errors"
  echo "$VAR"
  echo "$out"
fi

#!/bin/bash

echo "1..4"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

PATH="$DIR/../../bin":$PATH
out=$(proof -M 't/executable/bailout')
if [ $? -ne 0 ]; then
  echo "ok 1 bailout progress exit"
else
  echo "not ok 1 bailout progress exit"
fi

# Without the dot, leading whitespace is stripped. I cannot find anyone saying
# that it's supposed to do that, but it does.
read -r -d '' VAR <<EOF
.
 ✘ t/executable/bailout ................................ (X/X) X.XXX Failure
                                  tests (X/X) assertions (X/X) X.XXX Failure
EOF

if [ "$(echo "$VAR" | sed -e 1d)" == "$(echo "$out" | sed -e 's/[0-9]/X/g')" ]; then
  echo "ok 2 bailout progress"
else
  echo "not ok 2 bailout progress"
fi

out=$(proof run 't/executable/bailout' | proof errors -M)
if [ $? -ne 0 ]; then
  echo "ok 3 bailout errors exit"
else
  echo "not ok 3 bailout errors exit"
fi

read -r -d '' VAR <<EOF
.

> ✘ t/executable/bailout: Bail Out!
EOF

if [ "$(echo "$VAR" | sed -e 1d)" == "$out" ]; then
  echo "ok 4 bailout errors"
else
  echo "not ok 4 bailout errors"
fi

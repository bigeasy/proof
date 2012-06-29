#!/bin/bash

echo "1..2"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

PATH="$DIR/../../bin":$PATH
out=$(proof -M 't/executable/blather')

# Without the dot, leading whitespace is stripped. I cannot find anyone saying
# that it's supposed to do that, but it does.
read -r -d '' VAR <<EOF
.
 ✘ t/executable/blather ................................ (X/X) X.XXX Failure
                                  tests (X/X) assertions (X/X) X.XXX Failure
EOF

if [ "$(echo "$VAR" | sed -e 1d)" == "$(echo "$out" | sed -e 's/[0-9]/X/g')" ]; then
  echo "ok 1 blather"
else
  echo "not ok 1 blather progress"
fi

out=$(proof run 't/executable/blather' | proof errors -M)

read -r -d '' VAR <<EOF
.

Hello. So... What did you want me to do?
> ✘ t/executable/blather: no plan given: exited with code 0
EOF

if [ "$(echo "$VAR" | sed -e 1d)" == "$out" ]; then
  echo "ok 1 planless errors"
else
  echo "not ok 1 blather errors"
fi

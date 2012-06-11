#!/bin/bash

opts=`proof-getopt -o p:d:w: -l processes:,digits:,width: -- "$@"`

if [ $? -ne 0 ]; then
  echo "unrecognized option"
  exit 1
fi

eval set -- "$opts"

run=()
progress=()

while [ $1 != "--" ];  do
  case "$1" in
    -p|--p*) run+=(--processes "$2"); shift;;
    -w|--w*) progress+=(--width "$2"); shift;;
    -d|--d*) progress+=(--digits "$2"); shift;;
  esac
  shift;
done

shift

run+=("$@")

proof run "${run[@]}" | proof progress "${progress[@]}"

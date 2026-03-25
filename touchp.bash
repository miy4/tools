#!/usr/bin/env bash
set -euo pipefail

while (( $# > 0 )); do
    file="$1"
    dir=$(dirname "$1")

    mkdir -p "$dir" || exit 1

    if [[ -e $file ]]; then
        printf 'You already have: %s\n' "$file" >&2
    else
        touch "$file"
    fi

    shift
done

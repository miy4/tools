#!/usr/bin/env bash

touchp() {
    local file dir

    while (( $# > 0 )); do
        file=$1
        dir=$(dirname "$1")

        mkdir -p "$dir" || return 1

        if [[ -e $file ]]; then
            printf "You already have: %s\n" "$file" >&2
        else
            touch "$file"
        fi

        shift
    done
}

touchp "$@"


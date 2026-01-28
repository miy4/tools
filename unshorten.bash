#!/usr/bin/env bash

if ! command -v curl >/dev/null 2>&1; then
    printf 'Command not found: curl\n' >&2
    exit 127
fi

if [ $# -ne 1 ]; then
    printf 'Usage: %s <url>\n' "$0" >&2
    exit 2
fi

curl \
  --silent \
  --show-error \
  --fail \
  --location \
  --output /dev/null \
  --write-out '%{url_effective}\n' \
  "$1"

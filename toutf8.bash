#!/usr/bin/env bash
set -euo pipefail

command -v uchardet >/dev/null 2>&1 || { printf 'command not found: uchardet\n' >&2; exit 127; }
command -v iconv   >/dev/null 2>&1 || { printf 'command not found: iconv\n' >&2; exit 127; }

input="${1:-}"

if [[ ! -t 0 ]]; then
    tmpfile=$(mktemp)
    trap 'rm -f "$tmpfile"' EXIT
    cat >"$tmpfile"
    input="$tmpfile"
fi

encoding=$(uchardet "$input" | tr -d '\n')

if [[ "${encoding,,}" == "unknown" ]]; then
    printf 'failed to detect encoding\n' >&2
    exit 1
fi

iconv -f "$encoding" -t UTF-8 "$input"

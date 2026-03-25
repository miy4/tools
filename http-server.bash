#!/usr/bin/env bash
set -euo pipefail  # Exit on error, undefined vars, pipe failures

http_port="${1:-8080}"

if command -v python3 >/dev/null 2>&1; then
    python3 -m http.server "$http_port"
elif command -v python >/dev/null 2>&1; then
    python -m http.server "$http_port"
elif command -v php >/dev/null 2>&1; then
    php -S "localhost:$http_port"
else
    printf 'No usable HTTP server found\n' >&2
    exit 1
fi

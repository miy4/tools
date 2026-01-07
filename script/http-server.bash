#!/bin/bash
set -euo pipefail  # Exit on error, undefined vars, pipe failures
IFS=$'\n\t'       # Better word splitting

#
# Script: http-server
# Description: Starts a simple HTTP server in the current directory on a specified port (default: 8080), automatically selecting and using python3, python, or php if available.
#

main() {
    local http_port="${1:-8080}"

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
}

main "$@"

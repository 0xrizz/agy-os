#!/usr/bin/env bash
# harness/agy-script/install-agy.sh — Custom ECC Installation Shell Entrypoint
#
# Usage:
#   ./harness/agy-script/install-agy.sh [options]
#
# Options:
#   --config <path>   Path to configuration file (default: ecc-install.json)
#   --dry-run         Simulate installation without mutating files
#   --help            Display help information
#
# All file paths produced or resolved use forward-slash formatting.

set -euo pipefail

SCRIPT_PATH="$0"
while [ -L "$SCRIPT_PATH" ]; do
    link_dir="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
    SCRIPT_PATH="$(readlink "$SCRIPT_PATH")"
    [[ "$SCRIPT_PATH" != /* ]] && SCRIPT_PATH="$link_dir/$SCRIPT_PATH"
done
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"

# POSIX/MSYS2 path handling for Git Bash environment on Windows
if command -v cygpath &>/dev/null; then
    NODE_SCRIPT="$(cygpath -m "$SCRIPT_DIR/scripts/install-apply-agy.js")"
else
    NODE_SCRIPT="$SCRIPT_DIR/scripts/install-apply-agy.js"
fi

# Ensure all path separators are forward slashes
NODE_SCRIPT="$(echo "$NODE_SCRIPT" | tr '\\' '/')"

# Execute Node installer apply script with all CLI arguments passed through
exec node "$NODE_SCRIPT" "$@"

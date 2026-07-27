#!/usr/bin/env bash
set -euo pipefail
# shellcheck source=./ddf-lib.sh
source "$(dirname "$0")/ddf-lib.sh"

HOOKS_DIR="$REPO_ROOT/.git/hooks"
PRE_COMMIT_HOOK="$HOOKS_DIR/pre-commit"

if [[ ! -d "$HOOKS_DIR" ]]; then
    log_fail "Git hooks directory not found at $HOOKS_DIR. Is this a git repository?"
    exit 1
fi

log_info "Installing DDF pre-commit hook into $PRE_COMMIT_HOOK..."

cat <<'EOF' > "$PRE_COMMIT_HOOK"
#!/usr/bin/env bash
set -euo pipefail

echo "[Pre-Commit Hook] Running DDF Gate Check (--check-only)..."
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if ! bash "$REPO_ROOT/harness/scripts/ddf-gate.sh" --check-only; then
    echo "[Pre-Commit Hook] DDF Gate Check failed. Commit aborted."
    exit 1
fi
EOF

chmod +x "$PRE_COMMIT_HOOK" 2>/dev/null || true
log_pass "DDF pre-commit hook installed successfully at $PRE_COMMIT_HOOK"

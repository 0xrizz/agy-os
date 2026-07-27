#!/usr/bin/env bash
set -euo pipefail
# shellcheck source=./ddf-lib.sh
source "$(dirname "$0")/ddf-lib.sh"

CHECK_ONLY=false
if [[ "${1:-}" == "--check-only" ]]; then
    CHECK_ONLY=true
    shift
fi

log_info "Starting DDF Gate Pipeline..."

log_info "--- Step 0: Governance Script Self-Tests ---"
if ! "$(dirname "$0")/test-governance.sh"; then
    log_fail "Governance self-tests failed. Aborting DDF gate."
    exit 1
fi
log_pass "Governance self-tests passed."

log_info "--- Step 1: Validation ---"
if ! "$(dirname "$0")/ddf-validate.sh"; then
    log_fail "Validation failed. Aborting DDF gate."
    exit 1
fi
log_pass "Validation passed."

if $CHECK_ONLY; then
    log_info "Check-only mode. Skipping sync and archive."
    exit 0
fi

log_info "--- Step 2: Index Sync ---"
"$(dirname "$0")/ddf-index-sync.sh"

log_info "--- Step 3: Archive Completed Records ---"
"$(dirname "$0")/ddf-archive.sh"

log_pass "DDF Gate Pipeline completed successfully!"

#!/usr/bin/env bash
set -euo pipefail
# shellcheck source=./ddf-lib.sh
source "$(dirname "$0")/ddf-lib.sh"

log_info "Running DDF Governance Script Self-Tests..."

TEST_PASS=0
TEST_FAIL=0
TEST_WARN=0

run_test() {
    local name="$1"
    local expected_code="$2"
    shift 2
    local cmd=("$@")

    set +e
    "${cmd[@]}" &>/dev/null
    local exit_code=$?
    set -e

    if [[ $exit_code -eq $expected_code ]]; then
        log_pass "Governance Test: $name"
        TEST_PASS=$((TEST_PASS + 1))
    else
        log_fail "Governance Test: $name (Expected exit code $expected_code, got $exit_code)"
        TEST_FAIL=$((TEST_FAIL + 1))
    fi
}

# 1. Shellcheck Linting (if installed)
if command -v shellcheck &>/dev/null; then
    log_info "Running shellcheck lint..."
    run_test "Shellcheck Linting" 0 shellcheck -e SC1091,SC2034 "$REPO_ROOT/harness/scripts"/*.sh
else
    log_warn "shellcheck not installed, skipping static lint test."
    TEST_WARN=$((TEST_WARN + 1))
fi

# 2. Functional Mock Validation Tests
TMP_TEST_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_TEST_DIR"' EXIT

# Mock Valid ADR
cat <<'EOF' > "$TMP_TEST_DIR/ADR-999-test.md"
---
decision_id: "ADR-999"
status: "approved"
goal: "Test ADR"
invariants: ["Inv 1"]
date: "2026-07-27"
---
# Test ADR
EOF

run_test "Valid ADR Validation Pass" 0 "bash" "$REPO_ROOT/harness/scripts/ddf-validate.sh" --file "$TMP_TEST_DIR/ADR-999-test.md" --skip-target-check

# Mock Invalid ADR Status
cat <<'EOF' > "$TMP_TEST_DIR/ADR-998-bad-status.md"
---
decision_id: "ADR-998"
status: "invalid_status_value"
goal: "Bad Status ADR"
invariants: ["Inv 1"]
date: "2026-07-27"
---
# Bad Status ADR
EOF

run_test "Invalid Status Validation Fail" 1 "bash" "$REPO_ROOT/harness/scripts/ddf-validate.sh" --file "$TMP_TEST_DIR/ADR-998-bad-status.md" --skip-target-check

# Mock Missing Delimiters
cat <<'EOF' > "$TMP_TEST_DIR/ADR-997-no-delim.md"
decision_id: "ADR-997"
status: "approved"
EOF

run_test "Missing Delimiters Fail" 1 "bash" "$REPO_ROOT/harness/scripts/ddf-validate.sh" --file "$TMP_TEST_DIR/ADR-997-no-delim.md" --skip-target-check

# Target Baseline Hash Snapshot Test (Task 1)
MOCK_REPO_DIR=$(mktemp -d)
git init "$MOCK_REPO_DIR" &>/dev/null
git -C "$MOCK_REPO_DIR" config user.email "test@example.com"
git -C "$MOCK_REPO_DIR" config user.name "Test User"
touch "$MOCK_REPO_DIR/file.txt"
git -C "$MOCK_REPO_DIR" add file.txt
git -C "$MOCK_REPO_DIR" commit -m "initial commit" &>/dev/null
MOCK_BASELINE_FILE="$TMP_TEST_DIR/.target-baseline"

run_test "Target Baseline Hash Init and Pass" 0 env OVERRIDE_TARGET_REPO="$MOCK_REPO_DIR" OVERRIDE_BASELINE_FILE="$MOCK_BASELINE_FILE" "bash" "$REPO_ROOT/harness/scripts/ddf-validate.sh" --file "$TMP_TEST_DIR/ADR-999-test.md"

echo "0000000000000000000000000000000000000000" > "$MOCK_BASELINE_FILE"
run_test "Target Baseline Hash Drift Fail" 1 env OVERRIDE_TARGET_REPO="$MOCK_REPO_DIR" OVERRIDE_BASELINE_FILE="$MOCK_BASELINE_FILE" "bash" "$REPO_ROOT/harness/scripts/ddf-validate.sh" --file "$TMP_TEST_DIR/ADR-999-test.md"
rm -rf "$MOCK_REPO_DIR"

# yq Bootstrap Hard-fail Test (Task 2)
MOCK_YQ_DIR=$(mktemp -d)
mkdir -p "$MOCK_YQ_DIR/harness/bin"
echo "invalid yq binary" > "$MOCK_YQ_DIR/harness/bin/yq.exe"
echo "invalid yq binary" > "$MOCK_YQ_DIR/harness/bin/yq"

run_test "yq Checksum Mismatch Hard-fail" 1 env PATH="/usr/bin:/bin" OVERRIDE_REPO_ROOT="$MOCK_YQ_DIR" "bash" -c "source '$REPO_ROOT/harness/scripts/ddf-lib.sh'; ensure_yq"
rm -rf "$MOCK_YQ_DIR"

# Patch-to-CHG Coupling Test (Task 3)
MOCK_PATCH_ENV=$(mktemp -d)
mkdir -p "$MOCK_PATCH_ENV/harness/patches"
mkdir -p "$MOCK_PATCH_ENV/docs/changes"
touch "$MOCK_PATCH_ENV/harness/patches/uncoupled-feature.patch"

run_test "Uncoupled Patch File Fail" 1 env OVERRIDE_REPO_ROOT="$MOCK_PATCH_ENV" "bash" "$REPO_ROOT/harness/scripts/ddf-validate.sh" --skip-target-check

mkdir -p "$MOCK_PATCH_ENV/docs/decisions"
cat <<'EOF' > "$MOCK_PATCH_ENV/docs/decisions/ADR-999.md"
---
decision_id: "ADR-999"
status: "approved"
goal: "Goal"
invariants: ["Inv"]
date: "2026-07-27"
---
# ADR 999
EOF

cat <<'EOF' > "$MOCK_PATCH_ENV/docs/changes/CHG-888-test.md"
---
change_id: "CHG-888"
status: "in_progress"
decision_refs: ['ADR-999']
owner_stage: "builder"
date: "2026-07-27"
---
# Change
Staged patch: harness/patches/uncoupled-feature.patch
EOF

run_test "Coupled Patch File Pass" 0 env OVERRIDE_REPO_ROOT="$MOCK_PATCH_ENV" "bash" "$REPO_ROOT/harness/scripts/ddf-validate.sh" --skip-target-check
rm -rf "$MOCK_PATCH_ENV"

# Affected Scope Warning Test (Task 7)
MOCK_SCOPE_ENV=$(mktemp -d)
mkdir -p "$MOCK_SCOPE_ENV/docs/decisions" "$MOCK_SCOPE_ENV/docs/changes"
cat <<'EOF' > "$MOCK_SCOPE_ENV/docs/decisions/ADR-990.md"
---
decision_id: "ADR-990"
status: "approved"
goal: "Goal"
invariants: ["Inv"]
affected_scope: ["docs/"]
date: "2026-07-27"
---
# ADR 990
EOF

cat <<'EOF' > "$MOCK_SCOPE_ENV/docs/changes/CHG-880-out-of-scope.md"
---
change_id: "CHG-880"
status: "in_progress"
decision_refs: ['ADR-990']
owner_stage: "builder"
date: "2026-07-27"
---
# Change Out of Scope
- `unauthorized/path/file.py` - Modifying out of scope file
EOF

SCOPE_OUT=$(env OVERRIDE_REPO_ROOT="$MOCK_SCOPE_ENV" "bash" "$REPO_ROOT/harness/scripts/ddf-validate.sh" --skip-target-check 2>&1 || true)
if echo "$SCOPE_OUT" | grep -q "falls outside declared affected_scope"; then
    log_pass "Governance Test: Affected Scope Cross-Validation Warning Pass"
    TEST_PASS=$((TEST_PASS + 1))
else
    log_fail "Governance Test: Affected Scope Cross-Validation Warning Fail"
    TEST_FAIL=$((TEST_FAIL + 1))
fi
rm -rf "$MOCK_SCOPE_ENV"

# 3. Spec-Delta Bundle Completeness Tests
MOCK_BUNDLE_ENV=$(mktemp -d)
mkdir -p "$MOCK_BUNDLE_ENV/docs/vision/plans/valid-bundle"
cat <<'EOF' > "$MOCK_BUNDLE_ENV/docs/vision/plans/valid-bundle/requirements.md"
---
title: "Req"
status: "draft"
---
# Req
EOF
cat <<'EOF' > "$MOCK_BUNDLE_ENV/docs/vision/plans/valid-bundle/design.md"
---
title: "Design"
status: "draft"
---
# Design
EOF
cat <<'EOF' > "$MOCK_BUNDLE_ENV/docs/vision/plans/valid-bundle/tasks.md"
---
title: "Tasks"
status: "draft"
---
# Tasks
EOF

run_test "Valid Spec-Delta Bundle Pass" 0 env OVERRIDE_REPO_ROOT="$MOCK_BUNDLE_ENV" "bash" "$REPO_ROOT/harness/scripts/ddf-validate.sh" --skip-target-check

mkdir -p "$MOCK_BUNDLE_ENV/docs/vision/plans/incomplete-bundle"
cat <<'EOF' > "$MOCK_BUNDLE_ENV/docs/vision/plans/incomplete-bundle/requirements.md"
---
title: "Req"
status: "draft"
---
# Req
EOF
cat <<'EOF' > "$MOCK_BUNDLE_ENV/docs/vision/plans/incomplete-bundle/design.md"
---
title: "Design"
status: "draft"
---
# Design
EOF

run_test "Incomplete Spec-Delta Bundle Fail" 1 env OVERRIDE_REPO_ROOT="$MOCK_BUNDLE_ENV" "bash" "$REPO_ROOT/harness/scripts/ddf-validate.sh" --skip-target-check
rm -rf "$MOCK_BUNDLE_ENV"

# 4. Draft ADR Index Exclusion Test
MOCK_INDEX_ENV=$(mktemp -d)
mkdir -p "$MOCK_INDEX_ENV/docs/decisions"
cat <<'EOF' > "$MOCK_INDEX_ENV/docs/decisions/ADR-001-approved.md"
---
decision_id: "ADR-001"
status: "approved"
goal: "Goal 1"
invariants: ["Inv 1"]
date: "2026-07-27"
affected_scope: ["docs/"]
---
# Approved ADR
EOF
cat <<'EOF' > "$MOCK_INDEX_ENV/docs/decisions/ADR-002-draft.md"
---
decision_id: "ADR-002"
status: "draft"
goal: "Goal 2"
invariants: ["Inv 2"]
date: "2026-07-27"
affected_scope: ["docs/"]
---
# Draft ADR
EOF

env OVERRIDE_REPO_ROOT="$MOCK_INDEX_ENV" "bash" "$REPO_ROOT/harness/scripts/ddf-index-sync.sh" &>/dev/null
set +e
grep -q "ADR-001" "$MOCK_INDEX_ENV/docs/decisions/index.md"
HAS_APPROVED=$?
grep -q "ADR-002" "$MOCK_INDEX_ENV/docs/decisions/index.md"
HAS_DRAFT=$?
set -e

if [[ $HAS_APPROVED -eq 0 && $HAS_DRAFT -ne 0 ]]; then
    log_pass "Governance Test: Draft ADR Index Exclusion Filter Pass"
    TEST_PASS=$((TEST_PASS + 1))
else
    log_fail "Governance Test: Draft ADR Index Exclusion Filter Fail"
    TEST_FAIL=$((TEST_FAIL + 1))
fi
rm -rf "$MOCK_INDEX_ENV"

# 5. Spec-Delta Folder Archival Test
MOCK_ARCHIVE_ENV=$(mktemp -d)
mkdir -p "$MOCK_ARCHIVE_ENV/docs/changes"
mkdir -p "$MOCK_ARCHIVE_ENV/docs/vision/plans/feature-x"
cat <<'EOF' > "$MOCK_ARCHIVE_ENV/docs/changes/CHG-010-feature-x.md"
---
change_id: "CHG-010"
status: "completed"
decision_refs: []
owner_stage: "auditor"
date: "2026-07-27"
---
# CHG Feature X
EOF
touch "$MOCK_ARCHIVE_ENV/docs/vision/plans/feature-x/requirements.md"
touch "$MOCK_ARCHIVE_ENV/docs/vision/plans/feature-x/design.md"
touch "$MOCK_ARCHIVE_ENV/docs/vision/plans/feature-x/tasks.md"

env OVERRIDE_REPO_ROOT="$MOCK_ARCHIVE_ENV" "bash" "$REPO_ROOT/harness/scripts/ddf-archive.sh" &>/dev/null

set +e
test -f "$MOCK_ARCHIVE_ENV/docs/changes/archive/CHG-010-feature-x.md"
CHG_ARCHIVED=$?
test -d "$MOCK_ARCHIVE_ENV/docs/vision/plans/archive/feature-x"
BUNDLE_ARCHIVED=$?
set -e

if [[ $CHG_ARCHIVED -eq 0 && $BUNDLE_ARCHIVED -eq 0 ]]; then
    log_pass "Governance Test: Spec-Delta Folder Archival Pass"
    TEST_PASS=$((TEST_PASS + 1))
else
    log_fail "Governance Test: Spec-Delta Folder Archival Fail"
    TEST_FAIL=$((TEST_FAIL + 1))
fi
rm -rf "$MOCK_ARCHIVE_ENV"

echo ""
log_info "Governance Test Summary: $TEST_PASS passed, $TEST_FAIL failed, $TEST_WARN warnings."
if [[ $TEST_FAIL -gt 0 ]]; then
    exit 1
fi
log_pass "Governance script self-tests passed successfully."

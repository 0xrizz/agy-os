---
change_id: "CHG-004"
title: "CHG-004: DDF Enforcement Remediation Execution"
status: "completed"
decision_refs:
  - "ADR-005"
spec_delta_ref: "005-ddf-enforcement-remediation"
owner_stage: "auditor"
date: "2026-07-27"
---

# Change Record: CHG-004: DDF Enforcement Remediation Execution

## Objective
Implement all 11 remediation tasks identified in Spec-Delta 005 (`005-ddf-enforcement-remediation`) to enforce the invariants of approved `ADR-005`.

## Implemented Changes
- **Files Modified / Created**:
  - `harness/scripts/ddf-validate.sh` - Target baseline hash check, patch coupling check, affected_scope warning, doc_id schema check
  - `harness/scripts/ddf-lib.sh` - Hard-fail yq verification on checksum/platform mismatch, fallback copy from harness bin
  - `harness/scripts/ddf-archive.sh` - Use spec_delta_ref for explicit 1:1 binding matching
  - `harness/scripts/test-governance.sh` - Categorize missing shellcheck as WARN, add unit tests for tasks 1-3, 7
  - `AGENTS.md` - Reconcile role responsibilities (§3) and consolidate vision references
  - `README.md` - Consolidate vision narrative reference to `docs/vision/harness-mission.md`
  - `.agents/rules/RULES.md` - Complete §5.2.3 Enforcement Failure Policy
  - `.github/workflows/ddf-gate.yml` - CI workflow running ddf-gate.sh --check-only
  - `docs/README.md` - Standardize doc_id in frontmatter schema
  - `docs/changes/_template.md` - Add spec_delta_ref key

## Task Verification & Log Record

### Task 1 Verification
```text
[INFO] Initialized target baseline SHA: e38d9654363a4a6ac4d01a958869cfbe642d78bb in /d/dev/agy-harness/harness/.target-baseline
[PASS] Target repo (d:/CLAUDE-PROJECT/website) is clean (git baseline verified).
[PASS] Governance Test: Target Baseline Hash Init and Pass
[PASS] Governance Test: Target Baseline Hash Drift Fail
```

### Task 2 Verification
```text
[PASS] SHA256 checksum verified for yq_windows_amd64.exe
[PASS] Governance Test: yq Checksum Mismatch Hard-fail
```

### Task 3 Verification
```text
[PASS] Governance Test: Uncoupled Patch File Fail
[PASS] Governance Test: Coupled Patch File Pass
```

### Task 4 Verification
```text
[PASS] SHA256 checksum verified for yq_windows_amd64.exe
[PASS] Target repo (d:/CLAUDE-PROJECT/website) is clean (git baseline verified).
[INFO] Validating files...
[WARN] File AGENTS.md does not match known DDF document categories.
[INFO] Validation Summary: 0 passed, 0 failed, 1 warnings.
```

### Task 5 Verification
```text
[PASS] SHA256 checksum verified for yq_windows_amd64.exe
[PASS] Target repo (d:/CLAUDE-PROJECT/website) is clean (git baseline verified).
[INFO] Validating files...
[WARN] File .agents/rules/RULES.md does not match known DDF document categories.
[INFO] Validation Summary: 0 passed, 0 failed, 1 warnings.
```

### Task 6 Verification
```text
[PASS] SHA256 checksum verified for yq_windows_amd64.exe
[PASS] Target repo (d:/CLAUDE-PROJECT/website) is clean (git baseline verified).
[INFO] Validating files...
[INFO] Validation Summary: 0 passed, 0 failed, 0 warnings.
```

### Task 7 Verification
```text
[PASS] Governance Test: Affected Scope Cross-Validation Warning Pass
```

### Task 8 Verification
```text
[WARN] shellcheck not installed, skipping static lint test.
[INFO] Governance Test Summary: 13 passed, 0 failed, 1 warnings.
[PASS] Governance script self-tests passed successfully.
```

### Task 9 Verification
```text
[PASS] SHA256 checksum verified for yq_windows_amd64.exe
[PASS] Target repo (d:/CLAUDE-PROJECT/website) is clean (git baseline verified).
[INFO] Validating files...
[WARN] File .github/workflows/ddf-gate.yml does not match known DDF document categories.
[INFO] Validation Summary: 0 passed, 0 failed, 1 warnings.
```

### Task 10 Verification
```text
[PASS] SHA256 checksum verified for yq_windows_amd64.exe
[PASS] Target repo (d:/CLAUDE-PROJECT/website) is clean (git baseline verified).
[INFO] Validating files...
[INFO] Validation Summary: 0 passed, 0 failed, 0 warnings.
```

### Task 11 Verification
```text
[PASS] SHA256 checksum verified for yq_windows_amd64.exe
[PASS] Target repo (d:/CLAUDE-PROJECT/website) is clean (git baseline verified).
[INFO] Validating files...
[INFO] Validation Summary: 0 passed, 0 failed, 0 warnings.
```

## Handoff Checklist
- [x] Task 1 (FR-1): Implement target repository baseline hash snapshot verification in `check_target_repo` within `harness/scripts/ddf-validate.sh`.
- [x] Task 2 (FR-2): Hard-fail `ensure_yq` in `harness/scripts/ddf-lib.sh` with `exit 1` upon SHA256 mismatch or unlisted OS/arch.
- [x] Task 3 (FR-3): Implement `check_patch_coupling()` in `harness/scripts/ddf-validate.sh` to enforce patch-to-CHG coupling invariant.
- [x] Task 4 (FR-4): Reconcile ADR extraction role responsibility in `AGENTS.md` §3 to align with Auditor/Reviewer role in `ddf-spec-gate.md`.
- [x] Task 5 (FR-5): Complete Section 5.2.3 "Enforcement Failure Policy" in `.agents/rules/RULES.md`.
- [x] Task 6 (FR-6): Consolidate vision narrative in `README.md` and `AGENTS.md` into direct references to `docs/vision/harness-mission.md`.
- [x] Task 7 (FR-7): Implement `affected_scope` cross-validation warning check in `harness/scripts/ddf-validate.sh`.
- [x] Task 8 (FR-8): Update `harness/scripts/test-governance.sh` to categorize missing `shellcheck` as `WARN` in output summary instead of silent pass.
- [x] Task 9 (FR-9): Add GitHub Actions CI workflow `.github/workflows/ddf-gate.yml` running `ddf-gate.sh --check-only`.
- [x] Task 10 (FR-10): Harmonize `doc_id` / `id` frontmatter key schema in `docs/README.md` and update `ddf-validate.sh`.
- [x] Task 11 (FR-11): Add `spec_delta_ref` to `docs/changes/_template.md` and update `harness/scripts/ddf-archive.sh` to use explicit binding.

## Reviewer Verification Output

### `test-governance.sh` Output
```text
[INFO] Running DDF Governance Script Self-Tests...
[WARN] shellcheck not installed, skipping static lint test.
[PASS] Governance Test: Valid ADR Validation Pass
[PASS] Governance Test: Invalid Status Validation Fail
[PASS] Governance Test: Missing Delimiters Fail
[PASS] Governance Test: Target Baseline Hash Init and Pass
[PASS] Governance Test: Target Baseline Hash Drift Fail
[PASS] Governance Test: yq Checksum Mismatch Hard-fail
[PASS] Governance Test: Uncoupled Patch File Fail
[PASS] Governance Test: Coupled Patch File Pass
[PASS] Governance Test: Affected Scope Cross-Validation Warning Pass
[PASS] Governance Test: Valid Spec-Delta Bundle Pass
[PASS] Governance Test: Incomplete Spec-Delta Bundle Fail
[PASS] Governance Test: Draft ADR Index Exclusion Filter Pass
[PASS] Governance Test: Spec-Delta Folder Archival Pass

[INFO] Governance Test Summary: 13 passed, 0 failed, 1 warnings.
[PASS] Governance script self-tests passed successfully.
```

### `ddf-gate.sh --check-only` Output
```text
[INFO] Starting DDF Gate Pipeline...
[INFO] --- Step 0: Governance Script Self-Tests ---
[INFO] Running DDF Governance Script Self-Tests...
[WARN] shellcheck not installed, skipping static lint test.
[PASS] Governance Test: Valid ADR Validation Pass
[PASS] Governance Test: Invalid Status Validation Fail
[PASS] Governance Test: Missing Delimiters Fail
[PASS] Governance Test: Target Baseline Hash Init and Pass
[PASS] Governance Test: Target Baseline Hash Drift Fail
[PASS] Governance Test: yq Checksum Mismatch Hard-fail
[PASS] Governance Test: Uncoupled Patch File Fail
[PASS] Governance Test: Coupled Patch File Pass
[PASS] Governance Test: Affected Scope Cross-Validation Warning Pass
[PASS] Governance Test: Valid Spec-Delta Bundle Pass
[PASS] Governance Test: Incomplete Spec-Delta Bundle Fail
[PASS] Governance Test: Draft ADR Index Exclusion Filter Pass
[PASS] Governance Test: Spec-Delta Folder Archival Pass

[INFO] Governance Test Summary: 13 passed, 0 failed, 1 warnings.
[PASS] Governance script self-tests passed successfully.
[PASS] Governance self-tests passed.
[INFO] --- Step 1: Validation ---
[PASS] SHA256 checksum verified for yq_windows_amd64.exe
[PASS] Target repo (d:/CLAUDE-PROJECT/website) is clean (git baseline verified).
[INFO] Validating files...
[PASS] Spec-Delta bundle verified: 005-ddf-enforcement-remediation

[INFO] Validation Summary: 12 passed, 0 failed, 0 warnings.
[PASS] Validation passed.
[INFO] Check-only mode. Skipping sync and archive.
```

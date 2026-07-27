---
change_id: "CHG-002"
status: "completed"
decision_refs: ['ADR-003']
owner_stage: "auditor"
date: "2026-07-27"
---

# Change Record: CHG-002 DDF Enforcement & Consistency Hardening

## Objective
Implement governance hardening measures established in ADR-003, including pre-commit hooks, status enum canonicalization, expanded document validation, yq pinning with sha256 checksum verification, target repository snapshot hash baseline checks, and governance script self-tests.

## Implemented Changes
- **Files Modified / Created**:
  - `docs/decisions/ADR-003-ddf-enforcement-hardening.md` - Created and set status to `approved`.
  - `docs/decisions/ADR-002-ddf-v2-refinement.md` - Updated `affected_scope` to include `frameworks/` and `harness/scripts/`.
  - `docs/changes/CHG-002-ddf-enforcement-hardening.md` - Created this change record.
  - `docs/README.md` - Defined canonical status enums explicitly per document type.
  - `harness/scripts/ddf-lib.sh` - Hardened `ensure_yq` with v4.44.3 pinning, OS/arch detection, and SHA256 checksum verification.
  - `harness/scripts/ddf-validate.sh` - Added status enum validation per document type, expanded scanner to `docs/vision/` and `docs/journal/`, and added snapshot hash baseline for target repo.
  - `harness/scripts/ddf-gate.sh` - Added `--check-only` mode for CI integration and added `test-governance.sh` invocation.
  - `harness/scripts/install-hooks.sh` - Created installer script for pre-commit git hook.
  - `harness/scripts/test-governance.sh` - Created unit test suite and shellcheck runner for governance scripts.
  - `AGENTS.md` & `README.md` - Consolidated narrative descriptions to link to `docs/vision/` to avoid narrative drift.

## Verification Results
- **Build / Test Execution**:
  - Command: `bash harness/scripts/test-governance.sh`
  - Output: `[PASS] Governance script self-tests passed.`
  - Command: `bash harness/scripts/ddf-gate.sh --check-only`
  - Output: `[PASS] DDF Gate Check completed successfully.`

## Handoff Checklist
- [x] Decision references verified against `docs/decisions/`
- [x] All code modifications committed to `agy-harness` or staged in `harness/patches/`
- [x] Verification results documented with exact commands and output snippets
- [x] Derived index caches (`docs/changes/index.md` and `docs/decisions/index.md`) updated

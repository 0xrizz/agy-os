---
title: "Task Breakdown: DDF Enforcement Remediation"
doc_type: "vision_plan"
status: "active"
author: "explorer"
date: "2026-07-27"
created_at: "2026-07-27"
updated_at: "2026-07-27"
references:
  - "docs/vision/plans/005-ddf-enforcement-remediation/design.md"
---

# Tasks: Spec-Delta 005 — Task Breakdown: DDF Enforcement Remediation

## 1. Phase 1: Explorer Analysis & Spec-Delta Initialization

- [ ] **Task 1.1**: Initialize Spec-Delta 005 bundle (`requirements.md`, `design.md`, `tasks.md`) under `docs/vision/plans/005-ddf-enforcement-remediation/`.
- [ ] **Task 1.2**: Extract candidate invariants for ADR-005 and establish baseline verification plan.

## 2. Phase 2: Builder Implementation (11 Remediation Tasks)

- [ ] **Task 2.1 (FR-1)**: Implement target repository baseline hash snapshot verification in `check_target_repo` within `harness/scripts/ddf-validate.sh`.
- [ ] **Task 2.2 (FR-2)**: Hard-fail `ensure_yq` in `harness/scripts/ddf-lib.sh` with `exit 1` upon SHA256 mismatch or unlisted OS/arch.
- [ ] **Task 2.3 (FR-3)**: Implement `check_patch_coupling()` in `harness/scripts/ddf-validate.sh` to enforce patch-to-CHG coupling invariant.
- [ ] **Task 2.4 (FR-4)**: Reconcile ADR extraction role responsibility in `AGENTS.md` §3 to align with Auditor/Reviewer role in `ddf-spec-gate.md`.
- [ ] **Task 2.5 (FR-5)**: Complete Section 5.2.3 "Enforcement Failure Policy" in `.agents/rules/RULES.md`.
- [ ] **Task 2.6 (FR-6)**: Consolidate vision narrative in `README.md` and `AGENTS.md` into direct references to `docs/vision/harness-mission.md`.
- [ ] **Task 2.7 (FR-7)**: Implement `affected_scope` cross-validation warning check in `harness/scripts/ddf-validate.sh`.
- [ ] **Task 2.8 (FR-8)**: Update `harness/scripts/test-governance.sh` to categorize missing `shellcheck` as `WARN` in output summary instead of silent pass.
- [ ] **Task 2.9 (FR-9)**: Add GitHub Actions CI workflow `.github/workflows/ddf-gate.yml` running `ddf-gate.sh --check-only`.
- [ ] **Task 2.10 (FR-10)**: Harmonize `doc_id` / `id` frontmatter key schema in `docs/README.md` and update `ddf-validate.sh`.
- [ ] **Task 2.11 (FR-11)**: Add `spec_delta_ref` to `docs/changes/_template.md` and update `harness/scripts/ddf-archive.sh` to use explicit binding.

## 3. Phase 3: Reviewer Verification

- [ ] **Task 3.1**: Execute `bash harness/scripts/ddf-validate.sh` and `bash harness/scripts/test-governance.sh` to verify zero regression.
- [ ] **Task 3.2**: Audit index purity in `docs/decisions/index.md` and `docs/changes/index.md`.

## 4. Phase 4: Auditor Gate

- [ ] **Task 4.1**: Perform DDF gate validation and sign off on ADR-005, CHG completion, and Spec-Delta archival.

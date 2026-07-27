---
title: "Spec-Delta 005: DDF Enforcement Remediation"
doc_type: "vision_plan"
status: "active"
author: "explorer"
date: "2026-07-27"
created_at: "2026-07-27"
updated_at: "2026-07-27"
references:
  - "docs/vision/harness-mission.md"
  - "docs/decisions/ADR-002-ddf-v2-refinement.md"
  - "docs/decisions/ADR-003-ddf-enforcement-hardening.md"
  - "docs/decisions/ADR-004-spec-delta-increment-pipeline.md"
  - ".agents/rules/RULES.md"
---

# Requirements: Spec-Delta 005 — DDF Enforcement Remediation

## 1. Overview

This Spec-Delta increment addresses the 11 governance enforcement gaps identified during the DDF red-teaming audit. While DDF v2/v3 established strong documentation standards, several enforcement mechanisms remained narrative-only or contained script gaps. This increment closes all 11 gaps to transition `agy-harness` from narrative compliance to mechanical, automated enforcement under `docs/vision/harness-mission.md` (`VIS-001`).

---

## 2. Functional Requirements

### FR-1: Target Repo Read-Only Integrity Baseline Snapshot Hash
- **Citation**: `harness/scripts/ddf-validate.sh::check_target_repo`
- **Description**: `check_target_repo` must record and compare a target repository commit snapshot hash (`.target-baseline`) in addition to `git status --porcelain` to guarantee absolute read-only immutability.
- **BDD Scenario**:
  - **Given** the target repository at `d:/CLAUDE-PROJECT/website`,
  - **When** `ddf-validate.sh` executes `check_target_repo`,
  - **Then** it must compute/verify the HEAD commit SHA against `.target-baseline` and fail if any commit drift or uncommitted state is detected.

### FR-2: Hard-fail `yq` Bootstrapping & Checksum Mismatch
- **Citation**: `harness/scripts/ddf-lib.sh::ensure_yq`
- **Description**: `ensure_yq()` must execute a hard-fail (`exit 1`) upon SHA256 checksum mismatch or if an `expected_hash` is missing for an unrecognized OS/architecture, preventing execution of unverified binaries.
- **BDD Scenario**:
  - **Given** `ensure_yq()` downloads a binary or checks an existing `yq` binary,
  - **When** the SHA256 hash does not match `expected_hash` or `expected_hash` is empty,
  - **Then** `ensure_yq()` must output `log_fail` and terminate immediately with exit code `1`.

### FR-3: Patch-to-CHG Coupling Verification Scanner
- **Citation**: `harness/scripts/ddf-validate.sh::check_patch_coupling`
- **Description**: A dedicated function `check_patch_coupling()` in `ddf-validate.sh` must scan `$PATCHES_DIR` (`harness/patches/`) and fail validation if any `.patch` file exists without a corresponding active or completed Change Record (`docs/changes/CHG-*.md`) referencing it.
- **BDD Scenario**:
  - **Given** one or more `.patch` files staged in `harness/patches/`,
  - **When** `ddf-validate.sh` executes,
  - **Then** it parses all active/completed CHG records and fails if an unreferenced patch file is found.

### FR-4: ADR Extraction Role Responsibility Alignment
- **Citation**: `AGENTS.md` §3 & `.agents/workflows/ddf-spec-gate.md`
- **Description**: Role definitions in `AGENTS.md` §3 must be aligned with `.agents/workflows/ddf-spec-gate.md` to assign ADR extraction responsibility unequivocally to Auditor/Reviewer during Stage 1 Spec-Gate audit (checks & balances).
- **BDD Scenario**:
  - **Given** `AGENTS.md` §3 and workflow definitions,
  - **When** agent roles and stage responsibilities are audited,
  - **Then** `AGENTS.md` §3 states that Auditor/Reviewer performs ADR extraction during Stage 1 validation.

### FR-5: Enforcement Failure Policy Section Completion
- **Citation**: `.agents/rules/RULES.md` §5.2.3
- **Description**: Section 5.2.3 "Enforcement Failure Policy" in `.agents/rules/RULES.md` must be completed with explicit policy rules governing gate failure handling, non-zero exit codes, and mandatory remediation steps.
- **BDD Scenario**:
  - **Given** `.agents/rules/RULES.md`,
  - **When** §5.2.3 is inspected,
  - **Then** it contains fully articulated enforcement failure rules prohibiting gate bypasses.

### FR-6: Narrative Vision Duplication Consolidation
- **Citation**: `README.md` & `AGENTS.md`
- **Description**: Substantive vision narrative duplicated in `README.md` and `AGENTS.md` must be replaced with concise, direct pointers to `docs/vision/harness-mission.md` (`VIS-001`).
- **BDD Scenario**:
  - **Given** `README.md` and `AGENTS.md`,
  - **When** mission objectives are referenced,
  - **Then** both documents contain minimal summary text linking directly to `docs/vision/harness-mission.md`.

### FR-7: Affected Scope Cross-Validation Warning Check
- **Citation**: `harness/scripts/ddf-validate.sh`
- **Description**: `ddf-validate.sh` must compare the `affected_scope` paths listed in referenced ADRs against the files modified by a CHG, emitting a warning (`WARN`) if a CHG modifies paths outside its declared `affected_scope`.
- **BDD Scenario**:
  - **Given** an active CHG modifying files in path `X`,
  - **When** `ddf-validate.sh` runs,
  - **Then** it verifies if `X` falls within `affected_scope` of the bound ADRs and emits `log_warn` if unlisted.

### FR-8: Shellcheck Skip Visibility & Warning Categorization
- **Citation**: `harness/scripts/test-governance.sh`
- **Description**: `test-governance.sh` must categorize skipped `shellcheck` runs as explicit `WARN` entries in the output summary instead of counting them as silent passes.
- **BDD Scenario**:
  - **Given** `test-governance.sh` running in an environment lacking `shellcheck`,
  - **When** execution finishes,
  - **Then** the summary explicitly lists skipped lints under `WARN_COUNT` and flags warning status.

### FR-9: Automated CI Workflow Pipeline Integration
- **Citation**: `.github/workflows/ddf-gate.yml`
- **Description**: Create a GitHub Actions workflow `.github/workflows/ddf-gate.yml` that automatically runs `bash harness/scripts/ddf-gate.sh --check-only` on every pull request and push to main.
- **BDD Scenario**:
  - **Given** code pushed to repository or pull request opened,
  - **When** CI pipeline triggers,
  - **Then** `.github/workflows/ddf-gate.yml` executes `ddf-gate.sh --check-only` and fails the build on governance errors.

### FR-10: Document Schema Key Standardization for Vision and Journal
- **Citation**: `docs/README.md` & `harness/scripts/ddf-validate.sh`
- **Description**: Harmonize frontmatter schema keys (`doc_id` / `id`) across `docs/README.md` and update `ddf-validate.sh` to validate schema key compliance for vision and journal document categories.
- **BDD Scenario**:
  - **Given** vision or journal documents under `docs/`,
  - **When** `ddf-validate.sh` checks frontmatter,
  - **Then** it validates required frontmatter keys (`title`, `status`, `doc_type`) consistently without schema mismatches.

### FR-11: Explicit Spec-Delta Reference Binding in Change Records
- **Citation**: `docs/changes/_template.md` & `harness/scripts/ddf-archive.sh`
- **Description**: Add `spec_delta_ref` frontmatter key to `docs/changes/_template.md` and update `ddf-archive.sh` to use `spec_delta_ref` for exact 1:1 Spec-Delta bundle archival instead of regex slug guessing.
- **BDD Scenario**:
  - **Given** a completed CHG record with `spec_delta_ref: "005-ddf-enforcement-remediation"`,
  - **When** `ddf-archive.sh` executes,
  - **Then** it archives the exact matching Spec-Delta folder under `docs/vision/plans/archive/`.

---

## 3. Non-Functional Requirements

- **NFR-1 (Read-Only Guarantee)**: Zero modification to `d:/CLAUDE-PROJECT/website` files.
- **NFR-2 (Deterministic Integrity)**: Scripts must use deterministic validation (hard-fail exit 1, no silent passes).
- **NFR-3 (Path Formatting Invariant)**: All paths in documentation and scripts must use forward slashes exclusively (`/`).

---

## 4. Acceptance Criteria

- [ ] **AC-1**: `check_target_repo` in `ddf-validate.sh` validates baseline commit SHA snapshot.
- [ ] **AC-2**: `ensure_yq` in `ddf-lib.sh` exits code 1 on SHA256 mismatch or missing expected hash.
- [ ] **AC-3**: `check_patch_coupling` in `ddf-validate.sh` verifies all `.patch` files map to active/completed CHG.
- [ ] **AC-4**: `AGENTS.md` §3 assigns ADR extraction to Auditor/Reviewer role.
- [ ] **AC-5**: `.agents/rules/RULES.md` §5.2.3 contains complete Enforcement Failure Policy text.
- [ ] **AC-6**: `README.md` & `AGENTS.md` refer to `docs/vision/harness-mission.md` without narrative duplication.
- [ ] **AC-7**: `ddf-validate.sh` checks modified CHG paths against ADR `affected_scope`.
- [ ] **AC-8**: `test-governance.sh` categorizes missing `shellcheck` as `WARN` in validation summary.
- [ ] **AC-9**: `.github/workflows/ddf-gate.yml` exists and triggers `ddf-gate.sh --check-only`.
- [ ] **AC-10**: `docs/README.md` and `ddf-validate.sh` maintain unified frontmatter key schema for vision/journal.
- [ ] **AC-11**: `docs/changes/_template.md` and `ddf-archive.sh` use `spec_delta_ref` for 1:1 archival binding.

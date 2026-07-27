---
title: "Technical Design: DDF Enforcement Remediation"
doc_type: "vision_plan"
status: "active"
author: "explorer"
date: "2026-07-27"
created_at: "2026-07-27"
updated_at: "2026-07-27"
references:
  - "docs/vision/plans/005-ddf-enforcement-remediation/requirements.md"
---

# Design: Spec-Delta 005 — Technical Design: DDF Enforcement Remediation

## 1. System Architecture & Topology

The remediation topology spans seven core areas in `agy-harness`:

```
+-------------------------------------------------------------------------------+
|                             agy-harness Workspace                             |
|                                                                               |
|  +--------------------------+    +-----------------------------------------+  |
|  |     harness/scripts/     |    |                  docs/                  |  |
|  |  - ddf-lib.sh            |    |  - vision/harness-mission.md            |  |
|  |  - ddf-validate.sh       |    |  - vision/plans/005-.../               |  |
|  |  - ddf-archive.sh        |    |  - decisions/ADR-005-...                |  |
|  |  - test-governance.sh    |    |  - changes/_template.md                 |  |
|  +------------+-------------+    +--------------------+--------------------+  |
|               |                                       |                       |
|  +------------v-------------+    +--------------------+--------------------+  |
|  |      .agents/rules/      |    |           .github/workflows/            |  |
|  |  - RULES.md              |    |  - ddf-gate.yml                         |  |
|  +------------+-------------+    +-----------------------------------------+  |
|               |                                                               |
|  +------------v-------------+                                                 |
|  |  Root Documentation      |                                                 |
|  |  - AGENTS.md             |                                                 |
|  |  - README.md             |                                                 |
|  +--------------------------+                                                 |
+-------------------------------------------------------------------------------+
```

---

## 2. Data Flow & Component Interfaces

1. **Target Baseline Hashing Data Flow**:
   - `ddf-validate.sh` -> `check_target_repo()` reads `.target-baseline`.
   - If `.target-baseline` missing, creates initial commit hash snapshot.
   - On subsequent runs, compares `git rev-parse HEAD` and `git status --porcelain` against snapshot.

2. **`yq` Bootstrap Security Interface**:
   - `ddf-lib.sh` -> `ensure_yq()` checks SHA256 of downloaded or existing binary against `expected_hash`.
   - On mismatch or empty `expected_hash`: logs `FAIL` and exits with code `1`.

3. **Patch Coupling Verification Data Flow**:
   - `ddf-validate.sh` -> `check_patch_coupling()` reads `$PATCHES_DIR` (`harness/patches/*.patch`).
   - For each patch file, scans active/completed `docs/changes/CHG-*.md` for `patch_refs` or matching patch mentions.

4. **Affected Scope Cross-Validation Interface**:
   - `ddf-validate.sh` extracts `affected_scope` from `decision_refs` ADRs of an active CHG.
   - Emits `log_warn` if files modified in CHG branch fall outside declared `affected_scope`.

5. **1:1 Spec-Delta Binding Data Flow**:
   - `docs/changes/_template.md` includes `spec_delta_ref: "<increment-slug>"`.
   - `ddf-archive.sh` reads `spec_delta_ref` from CHG frontmatter to archive exact folder in `docs/vision/plans/archive/`.

---

## 3. Trade-Off Analysis & Options

- **Option A: Loose / Advisory Script Enforcement**:
  - *Pros*: Faster implementation, low friction.
  - *Cons*: High risk of compliance drift, unverified binary execution, false positive passes.
- **Option B: Strict Mechanical Hardening & 1:1 Schema Coupling (Selected Approach)**:
  - *Pros*: Eliminates narrative-only rules, enforces deterministic hard-fail exit codes, secures binary checksums, seals governance gaps across 11 audit findings.
  - *Cons*: Requires updating scripts and templates across harness repo.
  - *Selection Rationale*: Aligns with ADR-002, ADR-003, ADR-004 invariants and `agy-harness` mission.

---

## 4. Architectural Decision Records (ADR Extractions)

Candidate ADR for extraction during Stage 1 Spec-Gate audit: **ADR-005: DDF Enforcement Hardening & Remediation**.

### Candidate Invariants for ADR-005:

1. **Target Baseline Hash Invariant**: `check_target_repo` must compare target repo commit SHA against `.target-baseline` file.
2. **`yq` Hard-Fail Invariant**: `ensure_yq` must exit code 1 immediately if checksum mismatch or unknown OS/arch occurs.
3. **Patch Coupling Invariant**: No patch file may exist in `harness/patches/` without a corresponding CHG referencing it.
4. **ADR Extraction Role Invariant**: ADR extraction from Spec-Delta design docs is strictly assigned to Auditor/Reviewer during Stage 1 audit.
5. **Enforcement Failure Policy Invariant**: Governance script gate failures require immediate non-zero exit and fix prior to progression.
6. **Vision Reference Invariant**: Root documentation (`README.md`, `AGENTS.md`) must reference `docs/vision/harness-mission.md` rather than duplicating vision text.
7. **Scope Alignment Invariant**: `ddf-validate.sh` must warn if CHG modifications exceed `affected_scope` in bound ADRs.
8. **Lint Visibility Invariant**: Missing lint tools (e.g. `shellcheck`) must be explicitly logged as `WARN` in script execution summaries.
9. **CI Gate Invariant**: Governance gates must run in automated CI workflows (`ddf-gate.yml`).
10. **Schema Standardization Invariant**: Vision/Journal documents must adhere to frontmatter schema checked by `ddf-validate.sh`.
11. **Explicit Spec-Delta Ref Invariant**: Change Records must contain `spec_delta_ref` frontmatter key for deterministic Spec-Delta bundle binding.

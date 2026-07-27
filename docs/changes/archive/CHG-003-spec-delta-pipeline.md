---
change_id: "CHG-003"
status: "completed"
decision_refs: ['ADR-004']
owner_stage: "auditor"
date: "2026-07-27"
---

# Change Record: CHG-003 Spec-Delta Pipeline Implementation

## Objective
Implement the Spec-Delta Increment Development & Task Decomposition Pipeline in `agy-harness` per ADR-004 invariants. This includes establishing standard Spec-Delta bundle templates, hardening governance scripts (`ddf-validate.sh`, `ddf-archive.sh`, `ddf-index-sync.sh`, `test-governance.sh`), and updating project governance rules and documentation.

## Implemented Changes

### R1: Spec-Delta Folder Structure & Templates
- `docs/vision/plans/_template/requirements.md` - Standard requirements template referencing VIS-001.
- `docs/vision/plans/_template/design.md` - Standard technical design template with 1-to-N ADR extraction guidelines.
- `docs/vision/plans/_template/tasks.md` - Standard atomic task decomposition template.
- `docs/vision/plans/archive/.gitkeep` - Historical archive directory marker for completed Spec-Delta bundles.

### R2: Script Hardening (`harness/scripts/`)
- `harness/scripts/ddf-validate.sh` - Added validation for Spec-Delta bundle 3-file completeness (`requirements.md`, `design.md`, `tasks.md`) in `docs/vision/plans/<increment-slug>/`.
- `harness/scripts/ddf-archive.sh` - Added support for moving completed Spec-Delta folders from `docs/vision/plans/<slug>/` to `docs/vision/plans/archive/<slug>/`.
- `harness/scripts/ddf-index-sync.sh` - Filtered ADR index generation to ONLY include ADRs with `status: approved` or `status: superseded`, maintaining index purity per ADR-004 Invariant 4.
- `harness/scripts/test-governance.sh` - Expanded unit test suite with mock test cases for Spec-Delta bundle validation, draft ADR index exclusion, and Spec-Delta archival.

### R3: Governance Rules & Documentation Alignment
- `.agents/rules/RULES.md` - Updated Section 5 with Spec-Delta pipeline governance, bundle structure requirements, 1-to-N ADR extraction rules, and index purity invariants.
- `AGENTS.md` - Updated Section 3 (Roles & Lifecycle) and Section 4 (Execution Workflow) to integrate Spec-Delta planning and CHG task list imports.
- `docs/README.md` - Updated taxonomy matrix and directory purpose table to include `docs/vision/plans/` and `docs/vision/plans/archive/`.

## Verification Results
- **Build / Test Execution**:
  - Command: `bash harness/scripts/test-governance.sh`
  - Output: All unit tests (including Spec-Delta mock validations and index purity tests) passed (7 passed, 0 failed).
  - Command: `bash harness/scripts/ddf-gate.sh --check-only`
  - Output: DDF Gate Check completed successfully with 0 errors and 0 warnings.
- **Governance & Boundary Audit**:
  - Target repo `d:/CLAUDE-PROJECT/website` un-modified: `[Pass]`
  - Frontmatter schema & index purity validation: `[Pass]`

## Handoff Checklist
- [x] Create Spec-Delta templates (`requirements.md`, `design.md`, `tasks.md`) in `docs/vision/plans/_template/`
- [x] Create `docs/vision/plans/archive/` directory
- [x] Harden `harness/scripts/ddf-validate.sh` for Spec-Delta bundle structure validation
- [x] Update `harness/scripts/ddf-archive.sh` to archive completed Spec-Delta folders to `docs/vision/plans/archive/`
- [x] Update `harness/scripts/ddf-index-sync.sh` to filter out draft ADRs from `docs/decisions/index.md`
- [x] Update `harness/scripts/test-governance.sh` with unit tests for Spec-Delta validation, draft ADR filtering, and archival
- [x] Update `.agents/rules/RULES.md` to reflect ADR-004 invariants and Spec-Delta rules
- [x] Update `AGENTS.md` to document Spec-Delta lifecycle in Explorer and Builder roles
- [x] Update `docs/README.md` taxonomy matrix with `docs/vision/plans/`
- [x] Run `test-governance.sh` and `ddf-gate.sh` to verify full pass
- [x] Update derived index cache (`docs/changes/index.md` & `docs/decisions/index.md`)

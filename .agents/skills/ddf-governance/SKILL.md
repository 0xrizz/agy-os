---
name: ddf-governance
description: Operations guide and skill for managing Documentation-Driven Framework (DDF v2) decision records (ADR-XXX), Spec-Delta increment bundles (requirements/design/tasks), change records (CHG-XXX), frontmatter schema compliance, and executing governance verification scripts in agy-harness.
---

# DDF Governance Skill (`ddf-governance`)

This skill provides step-by-step procedures for managing architectural decision records (ADRs), Spec-Delta increment bundles, change records (CHGs), handoff checklists, and running automated DDF verification scripts within `agy-harness`.

---

## 1. Document Lifecycle & ID Schema

| Document Type | Location | ID Schema | Template | Canonical Statuses |
| :--- | :--- | :--- | :--- | :--- |
| **Spec-Delta Bundle** | `docs/vision/plans/<increment-slug>/` | 3-file bundle (`requirements`, `design`, `tasks`) | `docs/vision/plans/_template/` | `draft`, `active`, `archived` |
| **Archived Spec-Delta** | `docs/vision/plans/archive/<increment-slug>/` | Folder bundle | N/A | `archived` |
| **Decision Anchor (ADR)** | `docs/decisions/` | `ADR-XXX-slug.md` | `docs/decisions/_template.md` | `draft`, `proposed`, `approved`, `superseded`, `deprecated` |
| **Change Record (CHG)** | `docs/changes/` | `CHG-XXX-slug.md` | `docs/changes/_template.md` | `draft`, `in_progress`, `completed`, `verified`, `archived` |
| **Archived Change** | `docs/changes/archive/` | `CHG-XXX-slug.md` | N/A | `completed`, `archived` |

---

## 2. Standard Workflow Procedures

### Step 0: Spec-Delta Increment Decomposition (OpenSpec Pattern)
Before introducing non-trivial architectural or feature changes:
1. Create a Spec-Delta bundle in `docs/vision/plans/<increment-slug>/` using templates from `docs/vision/plans/_template/` (`requirements.md`, `design.md`, `tasks.md`).
2. Map functional goals in `requirements.md` to `docs/vision/harness-mission.md` (`VIS-001`).
3. Elaborate technical design in `design.md`. If immutable invariants are required, extract 1-to-N atomic `ADR-XXX` records to `docs/decisions/`.
4. Outline atomic task steps in `tasks.md`.

### Step 1: Decision Anchor Verification or Creation
1. Check existing approved ADRs in `docs/decisions/index.md`.
2. If an approved ADR covers the scope, reference its `ADR-XXX` ID in your Change Record.
3. If no ADR exists or architectural invariants are changing:
   - Create `docs/decisions/ADR-XXX-slug.md` using `docs/decisions/_template.md`.
   - Fill out YAML frontmatter (`decision_id`, `status: proposed`, `goal`, `affected_scope`, `invariants`, `date`).
   - Move status to `approved` after review.

### Step 2: Change Record Creation & DR Coupling
1. Create `docs/changes/CHG-XXX-slug.md` using `docs/changes/_template.md`.
2. Import execution tasks from `tasks.md` into the Handoff Checklist of `CHG-XXX`.
3. Ensure frontmatter explicitly includes:
   ```yaml
   change_id: "CHG-XXX"
   status: "in_progress"
   decision_refs: ['ADR-XXX']
   spec_delta_ref: "<increment-slug>"
   owner_stage: "builder"
   date: "YYYY-MM-DD"
   ```
4. Complete implementation, ensuring target repo `d:/CLAUDE-PROJECT/website` remains untouched and changes are output to `harness/patches/*.patch` if applicable.

### Step 3: Mechanical Validation & Index Syncing
Execute the master governance script via Git Bash:
```bash
& "C:\Program Files\Git\bin\bash.exe" harness/scripts/ddf-gate.sh
```
Or execute specific sub-scripts:
- Frontmatter & Spec-Delta check: `& "C:\Program Files\Git\bin\bash.exe" harness/scripts/ddf-validate.sh`
- Rebuild cache indexes: `& "C:\Program Files\Git\bin\bash.exe" harness/scripts/ddf-index-sync.sh`
- Archive completed CHGs & Spec-Deltas: `& "C:\Program Files\Git\bin\bash.exe" harness/scripts/ddf-archive.sh`

---

## 3. Strict Invariants
- **Forward-Slash Paths**: Mandatory in all document frontmatter and bodies (e.g. `d:/CLAUDE-PROJECT/website`).
- **Zero Direct Target Edits**: Always stage target changes in `harness/patches/`. Target repo immutability is snapshot-verified against `harness/.target-baseline`.
- **Patch-to-CHG Coupling**: Unreferenced `.patch` files trigger a validation failure via `check_patch_coupling()`.
- **Checksum Hard-Fail**: External binary dependencies (`yq`) must hard-fail (`exit 1`) on SHA256 checksum mismatch.
- **Index Purity Invariant**: `docs/decisions/index.md` ONLY lists `approved` or `superseded` ADRs (excludes `draft`/`proposed` ADRs).
- **Spec Archival**: Completed Spec-Delta folders are automatically moved to `docs/vision/plans/archive/<increment-slug>/` upon CHG completion using explicit `spec_delta_ref` binding.
- **Script Enforcement**: Always verify using `harness/scripts/ddf-gate.sh` prior to handing off stages.

---
name: ddf-spec-apply
description: Builder workflow to initialize Parent Change Record docs/changes/CHG-XXX-<slug>.md, bind decision_refs to approved ADRs, import tasks.md checklist into CHG handoff checklist, execute tasks sequentially, and stage patch files in harness/patches/.
---

# Workflow: Spec-Delta Change Execution & Patch Staging (`/ddf-spec-apply <increment-slug>`)

## Overview
The `/ddf-spec-apply` workflow is operated by the **Builder** role. It binds an active Spec-Delta bundle (`docs/vision/plans/<increment-slug>/`) to a Parent Change Record (`docs/changes/CHG-XXX-<slug>.md`), imports execution tasks, executes technical work in `agy-harness`, and stages target repository modifications as standard patch files in `harness/patches/`.

---

## Agent Role & Prerequisites
- **Assigned Role**: `builder`
- **Target Repo Boundary**: `d:/CLAUDE-PROJECT/website` (**READ-ONLY**)
- **Harness Repo**: `d:/dev/agy-harness` (**READ & WRITE**)

---

## Step-by-Step Procedure

### Phase 1: Parent Change Record Initialization
1. Scan `docs/changes/` to derive the next available numeric index (e.g. `CHG-005`).
2. Construct the Parent Change Record path: `docs/changes/CHG-XXX-<increment-slug>.md`.
3. Populate frontmatter:
   ```yaml
   ---
   change_id: "CHG-XXX"
   status: "in_progress"
   decision_refs: ['ADR-XXX']
   owner_stage: "builder"
   date: "YYYY-MM-DD"
   ---
   ```
   *Note: `decision_refs` MUST point exclusively to approved ADRs in `docs/decisions/`.*

### Phase 2: Task Checklist Import
Import task items from `docs/vision/plans/<increment-slug>/tasks.md` directly into the `## Handoff Checklist` section of `CHG-XXX.md`, preserving task hierarchy and checkbox states (`- [ ]`).

### Phase 3: Task Execution & Patch Staging
1. Operate the `builder` agent to execute tasks in `agy-harness`.
2. **Target Repo Boundary Enforcement**:
   - Do NOT edit, create, or delete files directly in `d:/CLAUDE-PROJECT/website`.
   - Stage all target modifications as standard `.patch` or `.diff` files inside `harness/patches/` (e.g. `harness/patches/feature-name.patch`).
3. Run verification tests in `agy-harness` to ensure all implemented code and scripts pass empirically.

### Phase 4: Stage Hand-off & Validation
1. Mark all completed task checkboxes in `CHG-XXX.md`.
2. Update frontmatter `status` to `completed` (or `verified`) and set `owner_stage` to `reviewer`.
3. Execute validation:
   ```bash
   bash harness/scripts/ddf-validate.sh
   ```

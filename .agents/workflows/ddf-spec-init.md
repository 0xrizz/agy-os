---
name: ddf-spec-init
description: Explorer workflow to initialize a new Spec-Delta 3-file bundle folder (requirements.md, design.md, tasks.md) under docs/vision/plans/<increment-slug>/ copied from docs/vision/plans/_template/.
---

# Workflow: Spec-Delta Increment Initialization (`/ddf-spec-init <increment-slug>`)

## Overview
The `/ddf-spec-init` workflow is operated by the **Explorer** role. It decomposes macro vision sub-missions (`docs/vision/harness-mission.md` / `VIS-001`) into a standardized Spec-Delta 3-file bundle (`requirements.md`, `design.md`, `tasks.md`) under `docs/vision/plans/<increment-slug>/`.

---

## Agent Role & Prerequisites
- **Assigned Role**: `explorer`
- **Target Location**: `docs/vision/plans/<increment-slug>/`
- **Source Template**: `docs/vision/plans/_template/`

---

## Step-by-Step Procedure

### Phase 1: Parameter & Boundary Verification
1. Ensure `<increment-slug>` is provided as a lower-case hyphenated string (e.g. `005-my-feature`).
2. Verify that target directory `docs/vision/plans/<increment-slug>/` does NOT already exist. If it exists, abort initialization.

### Phase 2: Spec-Delta Bundle Construction
1. Create the target directory:
   ```bash
   mkdir -p docs/vision/plans/<increment-slug>
   ```
2. Copy standard template files:
   ```bash
   cp docs/vision/plans/_template/requirements.md docs/vision/plans/<increment-slug>/requirements.md
   cp docs/vision/plans/_template/design.md docs/vision/plans/<increment-slug>/design.md
   cp docs/vision/plans/_template/tasks.md docs/vision/plans/<increment-slug>/tasks.md
   ```
3. Update YAML frontmatter metadata in the 3 newly created files:
   - Set `title` to match the increment description.
   - Set `status` to `draft`.
   - Set `created_at` and `updated_at` to the current date (`YYYY-MM-DD`).

### Phase 3: Requirement Decomposition
1. Populate `requirements.md` with functional/non-functional requirements and Given-When-Then BDD scenarios linking back to `VIS-001`.
2. Populate `design.md` with technical architecture, component topology, data flows, and trade-off analysis.
3. Populate `tasks.md` with an ordered, atomic task breakdown.

### Phase 4: Validation Gate
Execute validation script to verify bundle completeness:
```bash
bash harness/scripts/ddf-validate.sh
```
Confirm that `ddf-validate.sh` reports clean pass for the new Spec-Delta bundle.

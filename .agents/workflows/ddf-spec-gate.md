---
name: ddf-spec-gate
description: Auditor/Reviewer workflow to audit a Spec-Delta bundle, verify frontmatter schema, extract immutable ADR-XXX invariants to docs/decisions/, approve ADR status, and execute bash harness/scripts/ddf-validate.sh.
---

# Workflow: Spec-Delta Invariant Gate & ADR Extraction (`/ddf-spec-gate <increment-slug>`)

## Overview
The `/ddf-spec-gate` workflow is operated by the **Auditor** and **Reviewer** roles. It verifies that a Spec-Delta bundle in `docs/vision/plans/<increment-slug>/` meets architectural standards, extracts 1-to-N immutable Decision Records (`ADR-XXX`) into `docs/decisions/`, and locks them in `status: approved` prior to code execution.

---

## Agent Roles & Prerequisites
- **Assigned Roles**: `auditor` / `reviewer`
- **Target Folder**: `docs/vision/plans/<increment-slug>/`
- **Decision Anchor Directory**: `docs/decisions/`

---

## Step-by-Step Procedure

### Phase 1: Bundle Completeness Audit
1. Verify that `docs/vision/plans/<increment-slug>/` contains all 3 mandatory files:
   - `requirements.md`
   - `design.md`
   - `tasks.md`
2. Check YAML frontmatter delimiters and mandatory keys (`title`, `status`, `doc_type`).

### Phase 2: 1-to-N ADR Invariant Extraction
1. Audit Section 4 of `design.md` for architectural decisions, system constraints, or security boundaries.
2. For each identified invariant, extract a new Decision Record (`ADR-XXX`) under `docs/decisions/`:
   - Filename format: `docs/decisions/ADR-XXX-<short-slug>.md`
   - Mandatory frontmatter fields:
     ```yaml
     ---
     decision_id: "ADR-XXX"
     status: "approved"
     supersedes: null
     goal: "Description of the architectural decision goal"
     affected_scope:
       - "docs/"
       - "harness/"
     invariants:
       - "Immutable invariant statement 1"
     date: "YYYY-MM-DD"
     ---
     ```
3. Set the status of each newly extracted ADR to `approved`.

### Phase 3: Spec-Delta Status Activation
Update the frontmatter `status` field in `requirements.md`, `design.md`, and `tasks.md` from `draft` to `active`.

### Phase 4: Script Verification & Index Sync
1. Run the DDF validator script:
   ```bash
   bash harness/scripts/ddf-validate.sh
   ```
2. Rebuild decision index cache:
   ```bash
   bash harness/scripts/ddf-index-sync.sh
   ```
3. Verify that `docs/decisions/index.md` strictly lists only `approved` or `superseded` ADRs.

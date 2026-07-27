---
name: ddf-spec-archive
description: Reviewer/Auditor workflow to run mechanical archival script bash harness/scripts/ddf-archive.sh to move completed Spec-Delta bundle to docs/vision/plans/archive/<increment-slug>/, completed CHG to docs/changes/archive/, and rebuild cache indices via bash harness/scripts/ddf-index-sync.sh.
---

# Workflow: Spec-Delta Mechanical Archival & Index Sync (`/ddf-spec-archive <increment-slug>`)

## Overview
The `/ddf-spec-archive` workflow is operated by the **Reviewer** and **Auditor** roles. It executes automated mechanical scripts to archive completed Spec-Delta bundles and Parent Change Records, preserving a clean workspace while syncing derived index caches.

---

## Agent Roles & Prerequisites
- **Assigned Roles**: `reviewer` / `auditor`
- **Spec-Delta Active Folder**: `docs/vision/plans/<increment-slug>/`
- **Spec-Delta Archive Folder**: `docs/vision/plans/archive/<increment-slug>/`
- **Change Archive Directory**: `docs/changes/archive/`

---

## Step-by-Step Procedure

### Phase 1: Pre-Archival Verification Audit
1. Confirm that the Parent Change Record (`CHG-XXX`) has `status` set to `completed`, `verified`, or `archived`.
2. Confirm that all tasks in the CHG handoff checklist are marked complete.

### Phase 2: Dry-Run Archival Preview
Run the archival script in dry-run mode to inspect proposed filesystem operations:
```bash
bash harness/scripts/ddf-archive.sh --dry-run
```
Verify that the output accurately lists:
- `CHG-XXX` moving to `docs/changes/archive/`
- Spec-Delta folder `docs/vision/plans/<increment-slug>/` moving to `docs/vision/plans/archive/<increment-slug>/`

### Phase 3: Automated Archival Execution
Execute the mechanical archival script:
```bash
bash harness/scripts/ddf-archive.sh
```
This script will:
- Move completed Change Records into `docs/changes/archive/`.
- Move associated Spec-Delta folders into `docs/vision/plans/archive/`.
- Automatically trigger `harness/scripts/ddf-index-sync.sh` upon completion.

### Phase 4: Index Cache & Gate Sign-Off
1. Rebuild derived index tables:
   ```bash
   bash harness/scripts/ddf-index-sync.sh
   ```
2. Execute full master gate check to verify workspace purity:
   ```bash
   bash harness/scripts/ddf-gate.sh
   ```
3. Confirm 100% clean exit status.

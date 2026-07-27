---
name: ddf-decision-gate
description: Automated workflow gate enforcing DDF frontmatter compliance, decision traceability, target repo read-only safety, Spec-Delta pipeline integration, and post-execution indexing.
---

# Workflow: Master DDF Governance Gate (`ddf-decision-gate`)

## Overview
The `ddf-decision-gate` workflow is the programmatic gatekeeper for `agy-harness`. It guarantees that all proposals, Spec-Delta bundles, decision records, change records, and patch files satisfy Documentation-Driven Framework (DDF v2 / ADR-004) governance before execution or patch staging.

---

## 1. Integrated Spec-Delta Command Lifecycle

```
1. /ddf-spec-init <increment-slug>    (Explorer: Instantiate 3-file bundle)
               |
               v
2. /ddf-spec-gate <increment-slug>    (Auditor: Extract ADRs & approve)
               |
               v
3. /ddf-spec-apply <increment-slug>   (Builder: Bind CHG & execute tasks)
               |
               v
4. /ddf-spec-archive <increment-slug> (Reviewer/Auditor: Mechanical archive & index sync)
```

---

## 2. Verification Pipeline Stages

### Phase 1: Pre-Flight Frontmatter & Reference Validation
Execute validation via the provided verification script:
- **Action**: Run `bash harness/scripts/ddf-validate.sh`
- **Validation**: This script leverages both `grep` and `yq` to verify:
  - Valid YAML delimiters across all DDF documents.
  - Presence of mandatory keys (`decision_id`, `change_id`, `status`, `decision_refs`, `owner_stage`).
  - Spec-Delta 3-file bundle completeness (`requirements.md`, `design.md`, `tasks.md`).
  - Decision reference linking to `approved` ADRs (e.g., `ADR-XXX`).
  - Zero-edit guarantee in target repository (`d:/CLAUDE-PROJECT/website`).
  - Patch file syntax integrity if applicable.
- **Action on Failure**: Script exits with a non-zero code. Abort workflow immediately.

### Phase 2: Post-Execution Index Syncing
Ensure cache indexes accurately reflect the current state of documentation:
- **Action**: Run `bash harness/scripts/ddf-index-sync.sh`
- **Validation**: Rebuilds derived cache tables in `docs/decisions/index.md` and `docs/changes/index.md`. `docs/decisions/index.md` MUST strictly exclude draft or proposed ADRs.

### Phase 3: Archive Transition
Manage the state lifecycle for completed or archived records:
- **Action**: Run `bash harness/scripts/ddf-archive.sh`
- **Validation**: Automatically moves Change Records with `completed`, `verified`, or `archived` status into `docs/changes/archive/`, and associated Spec-Delta bundles into `docs/vision/plans/archive/`.

---

## 3. Complete Pipeline Execution
Agents can run all governance phases sequentially via the master gatekeeper script:
- **Action**: Run `bash harness/scripts/ddf-gate.sh`

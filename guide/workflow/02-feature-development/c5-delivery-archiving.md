---
title: "Phase C5: Delivery, Per-PR Delta Writing & Archiving"
audience: [AI-Agent, Human-Developer]
scope: "guide/workflow/02-feature-development/c5-delivery-archiving"
prerequisites:
  - "d:/dev/agy-os/guide/README.md"
  - "d:/dev/agy-os/AGENTS.md"
  - "d:/dev/agy-os/guide/workflow/02-feature-development/c4-review-verification.md"
related_commands:
  - "/opsx-sync"
  - "/opsx-archive"
---

# Phase C5: Delivery, Per-PR Delta Writing & Archiving

## 1. Overview & Objectives

**Phase C5 (Delivery, Delta Writing & Archiving)** completes the OpenSpec SDD feature development lifecycle. In this final phase, the `spec-delta-writer` subagent updates per-PR delta specs based on exact git diffs, the human developer conducts **HITL Gate 2** sign-off, main specifications are synchronized using `/opsx-sync`, commit freshness hashes are updated by `spec-freshness-checker`, and completed changes are archived via `/opsx-archive`.

```text
+-------------------------------------------------------------------------+
| Phase C5: Delivery, Per-PR Delta Writing & Archiving                    |
| Subagents: spec-delta-writer, spec-freshness-checker, doc-updater       |
| Commands: /opsx-sync, /opsx-archive                                     |
| Gate: Human-in-the-Loop (HITL) Gate 2 Patch & PR Sign-off               |
+-------------------------------------------------------------------------+
```

---

## 2. Automated Per-PR Delta Writing via `spec-delta-writer`

The `spec-delta-writer` subagent automatically analyzes the finalized patch diff (`d:/dev/agy-os/harness/patches/*.patch`) or PR diff and updates the delta specification file before delivery:

1. **Diff Inspection**: Parses modified files, added endpoints, and altered functions.
2. **Delta Writing**: Reconciles the active delta spec (`openspec/changes/<change-name>/specs/`) with actual code implementations.
3. **Anchor Tag Preservation**: Ensures all requirements retain explicit `<!-- id: <capability-id> -->` anchor tags for full traceability.

```markdown
<!-- id: user-auth -->
<!-- verified-commit: 7f8a9b2c3d4e -->
# Delta Spec: User Authentication Refresh & Rate Limiting

## ADDED Requirements
...
```

---

## 3. Human-in-the-Loop (HITL) Gate 2 Sign-off & Patch Application

Before merging or committing changes to the target repository, **HITL Gate 2** requires explicit human developer sign-off:

1. **Review Patch Artifacts**: Developer inspects staged patch files in `d:/dev/agy-os/harness/patches/`.
2. **Review Spec Delta & Verification Log**: Developer validates `spec-delta-writer` delta output and multi-agent review logs.
3. **Apply Patch to Target Repo**:
   ```bash
   # Execute git apply from harness patches directory to target website repository
   cd d:/CLAUDE-PROJECT/website
   git apply d:/dev/agy-os/harness/patches/20260729-user-auth-rate-limit.patch
   ```

---

## 4. Main Spec Synchronization (`/opsx-sync`)

Once the patch is applied and committed to the target repository, execute the sync command:

```bash
/opsx-sync
```

### Sync Operations
- Merges `ADDED` requirements into main capability specs (`openspec/specs/<capability>/spec.md`).
- Updates `MODIFIED` requirements in main capability specs.
- Purges `REMOVED` requirements from main capability specs.
- Invokes `spec-freshness-checker` to record the current git commit SHA and update `<!-- verified-commit: <hash> -->` anchors across all main specs.

---

## 5. Change Directory Archiving (`/opsx-archive`)

Finalize the feature development lifecycle by archiving the active change package:

```bash
/opsx-archive
```

### Archiving Actions
- Relocates `openspec/changes/<change-name>/` to `openspec/changes/archive/<YYYY-MM-DD>-<change-name>/`.
- Cleans up temporary working directories in `.agents/`.
- Persists key decision nodes to Memory MCP knowledge graph.
- Closes feature development task cycle cleanly.

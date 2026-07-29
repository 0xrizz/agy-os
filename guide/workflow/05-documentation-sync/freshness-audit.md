---
title: "Spec Freshness Staleness Auditing & Spec-Guardian"
audience: [AI-Agent, Human-Developer]
scope: "guide/workflow/05-documentation-sync/freshness-audit"
prerequisites:
  - "d:/dev/agy-os/guide/README.md"
  - "d:/dev/agy-os/AGENTS.md"
  - "d:/dev/agy-os/guide/workflow/05-documentation-sync/doc-sync-workflow.md"
related_commands:
  - "/audit-freshness"
  - "/update-docs"
---

# Spec Freshness Staleness Auditing & Spec-Guardian

## 1. Overview & Objectives

**Spec Freshness & Staleness Auditing** is a maintenance workflow driven by the `spec-freshness-checker` and `spec-guardian` subagents. Its goal is to guarantee that OpenSpec capability specifications (`openspec/specs/`) never drift out of sync with the underlying codebase as changes accumulate over time.

```text
+-------------------------------------------------------------------------+
| Spec Freshness Staleness Auditing Workflow                              |
| Key Subagents: spec-freshness-checker, spec-guardian                    |
| Execution Command: /audit-freshness                                     |
| Mechanism: Commit hash anchors, diff comparison & Freshness Score       |
+-------------------------------------------------------------------------+
```

---

## 2. Key Subagents & Roles

| Subagent | Primary Function |
|:---|:---|
| `spec-freshness-checker` | Audits commit hash anchors (`<!-- verified-commit: <hash> -->`) across `openspec/specs/` against git log history to identify stale or drifted specification files. |
| `spec-guardian` | Monitors code commit activity and blocks pull requests or releases if associated specs are stale or missing verification hashes. |

---

## 3. Mechanics of Spec Staleness Detection

Spec staleness is tracked using commit hash anchor headers and verification timestamps embedded at the top of every capability spec in `openspec/specs/<capability>/spec.md`:

```markdown
<!-- id: user-auth -->
<!-- verified-commit: 7f8a9b2c3d4e -->
<!-- last-verified: 2026-07-29 -->
# Capability: User Authentication
```

### Staleness Auditing Algorithm
1. **Anchor Extraction**: `spec-freshness-checker` reads the `verified-commit` hash from the spec file header.
2. **Git Diff Inspection**: Queries git history between `verified-commit` and `HEAD` for all source files mapped to that capability:
   ```bash
   git diff 7f8a9b2c3d4e..HEAD -- src/auth/
   ```
3. **Drift Assessment**:
   - **ZERO DRIFFT (Fresh)**: No code changes in mapped paths since `verified-commit`.
   - **DRIFT DETECTED (Stale)**: Source code in mapped paths modified across 1+ commits since `verified-commit`.

---

## 4. Spec Freshness Score & Classification

`spec-freshness-checker` calculates a overall **Spec Freshness Score** for the repository:

Freshness Score = ( Number of Fresh Specs / Total Enforced Specs ) * 100%

### Spec Classification Categories

| Category | Definition | Action Required |
|:---|:---|:---|
| **FRESH (100% Match)** | Verified commit matches current code state or code un-drifted. | No action required. |
| **STALE (Minor Drift)** | 1-5 commits touch mapped files without spec update. | Flagged for re-verification. |
| **CRITICAL STALE (Major Drift)** | >5 commits or breaking API changes touch mapped files. | `spec-guardian` blocks PR build; re-verification mandatory. |

---

## 5. Re-Verification & Patch Generation Workflow

When stale specs are identified during a freshness audit (`/audit-freshness`):

1. **Audit Report Output**: Generates `.agents/freshness-report.md` listing stale specs.
2. **Re-verification Dispatch**: Dispatches `spec-miner` or `doc-updater` to analyze git diffs since `verified-commit`.
3. **Spec Patch Creation**: Generates an update patch for `openspec/specs/<capability>/spec.md` with revised scenarios and updated commit hash anchors:
   ```markdown
   <!-- id: user-auth -->
   <!-- verified-commit: 9e8d7c6b5a4f -->
   <!-- last-verified: 2026-07-29 -->
   ```
4. **Re-verification Complete**: Freshness score restored to 100%.

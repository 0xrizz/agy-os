# Spec-Delta Increment Pipeline Operational Guide

This reference guide details the step-by-step procedures, role transitions, invariant extraction protocols, and archival rules for the **Spec-Delta Increment Pipeline** as established by `ADR-004`.

---

## 1. Pipeline Overview & Lifecycle

```
+-----------------------------------------------------------------------+
| Phase 1: Explorer Init (/ddf-spec-init <increment-slug>)             |
| - Creates docs/vision/plans/<increment-slug>/                         |
| - Copies requirements.md, design.md, tasks.md from _template/        |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
| Phase 2: Auditor Gate (/ddf-spec-gate <increment-slug>)               |
| - Audits design.md for 1-to-N architectural invariants               |
| - Extracts ADR-XXX records to docs/decisions/ & sets status: approved |
| - Runs harness/scripts/ddf-validate.sh                                |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
| Phase 3: Builder Execution (/ddf-spec-apply <increment-slug>)         |
| - Auto-derives next Parent Change Record (CHG-XXX-<slug>.md)          |
| - Binds decision_refs to approved ADRs                                |
| - Imports tasks.md checklist into CHG Handoff Checklist               |
| - Executes tasks, stages patches in harness/patches/*.patch           |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
| Phase 4: Mechanical Archive (/ddf-spec-archive <increment-slug>)      |
| - Runs harness/scripts/ddf-archive.sh                                 |
| - Moves completed Spec-Delta folder to plans/archive/<slug>/          |
| - Moves completed CHG to changes/archive/                             |
| - Syncs cache indices via harness/scripts/ddf-index-sync.sh          |
+-----------------------------------------------------------------------+
```

---

## 2. Invariants & Strict Rules

1. **Target Repository Read-Only Invariant**:
   - `d:/CLAUDE-PROJECT/website` MUST remain strictly READ-ONLY.
   - Any modifications targeting `website` MUST be staged as standard `.patch` files inside `harness/patches/`.
2. **Path Formatting Invariant**:
   - All paths in scripts, frontmatter, and documentation MUST use forward slashes (e.g. `d:/dev/agy-harness`).
3. **Derived Index Purity**:
   - `docs/decisions/index.md` MUST only list ADRs with `status: approved` or `status: superseded`.
4. **Deterministic Script Enforcement**:
   - Pipeline transitions must be verified by running `harness/scripts/ddf-validate.sh`, `ddf-index-sync.sh`, `ddf-archive.sh`, or `ddf-gate.sh`.

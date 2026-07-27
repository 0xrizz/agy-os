# Spec-Driven Patterns Reference: OpenSpec vs GitHub Spec-Kit

Deep technical reference for agents authoring command-driven schema-based workflows, comparing OpenSpec (`/opsx:*`) and GitHub Spec-Kit (`/speckit.*`).

---

## 1. Pattern Comparison Matrix

| Component | GitHub Spec-Kit (`/speckit.*`) | OpenSpec (`/opsx:*`) | Generic Schema Pattern |
| :--- | :--- | :--- | :--- |
| **CLI & Slash Entry** | `specify` CLI / `/speckit.*` | `@fission-ai/openspec` CLI / `/opsx:*` | Slash Command Router |
| **Constitution / Explore** | `/speckit.constitution` | `/opsx:explore` | Phase 1: Explore & Principles |
| **Spec Proposal** | `/speckit.specify` | `/opsx:propose` | Phase 2: Spec-Delta 3-File Bundle |
| **Architecture Plan** | `/speckit.plan` | `design.md` inside change folder | Phase 3: Technical Design & ADR Extraction |
| **Task Breakdown** | `/speckit.tasks` | `tasks.md` inside change folder | Phase 4: Atomic Task Decomposition |
| **Execution Engine** | `/speckit.implement` | `/opsx:apply` | Phase 5: Sequential Task Execution |
| **Archival & Sync** | N/A (inline specs) | `/opsx:archive` | Phase 6: Mechanical Archive & Index Sync |

---

## 2. OpenSpec Specification Schema

OpenSpec organizes changes in `openspec/changes/<change-id>/`:
- `proposal.md`: Summary of change, business motivation, scope.
- `specs/`: Detailed requirements with BDD scenarios (`WHEN ... THEN ...`).
- `design.md`: Technical architecture and data structures.
- `tasks.md`: Ordered task checklist (`- [ ] 1.1 Task description`).

---

## 3. GitHub Spec-Kit Specification Schema

Spec-Kit organizes specs via commands:
- `/speckit.constitution`: Sets project-wide code standards & testing guardrails.
- `/speckit.specify`: Defines functional user spec (tech stack agnostic).
- `/speckit.plan`: Defines architecture & framework choices.
- `/speckit.tasks`: Generates task breakdown.
- `/speckit.implement`: Executes tasks via AI coding agent.

---
title: "Documentation-Driven Framework (DDF) Master Architecture & Governance Guide"
doc_type: "index"
doc_id: "DOC-IDX"
status: "active"
author: "teamwork_preview_worker_m1_1"
created_at: "2026-07-27"
updated_at: "2026-07-27"
tags: ["ddf", "governance", "index", "architecture"]
references:
  - "AGENTS.md"
  - "README.md"
  - ".agents/rules/RULES.md"
---

# Documentation-Driven Framework (DDF) Master Architecture & Governance Guide

Welcome to the **Documentation-Driven Framework (DDF)** root repository for `agy-harness`.

DDF serves as the single source of truth for architectural intent, system boundaries, decision records, change specifications, and agent activity within `agy-harness`. It balances rigid machine-parsable metadata with flexible, expressive Markdown narrative.

---

## 1. DDF Core Philosophy

In `agy-harness`, **Documentation is a First-Class Artifact**. Code is viewed as a downstream implementation of documented architectural intent.

- **Single Source of Truth**: System boundaries, mission goals, and technical decisions originate in `docs/`.
- **Cognitive Bridge Across Sessions**: AI agents operate in episodic execution windows with context truncation. DDF acts as external persistent memory so subsequent sessions reconstruct context, constraints, and decision rationale without drift.
- **Dual Schema Boundary**: Structured with rigid YAML frontmatter for deterministic machine parsing and regex rule enforcement, combined with flexible Markdown narrative bodies for human and LLM technical reasoning.
- **Traceable Evolution**: Architectural shifts are recorded in immutable decision logs (`decisions/`) and versioned vision profiles (`vision/`).

---

## 2. Metadata & Narrative Schema Boundary

Every document in `docs/` enforces a strict separation between machine-parsable metadata and flexible narrative content.

### 2.1 Rigid YAML Frontmatter (Mandatory Header)

Every Markdown file in `docs/` MUST begin with a valid YAML frontmatter block enclosed by triple-dashed delimiters (`---`):

```yaml
---
title: "Document Title"
doc_type: "vision" | "adr" | "change_spec" | "journal" | "index"
decision_id: "ADR-XXX"
change_id: "CHG-XXX"
doc_id: "VIS-XXX" | "JRN-YYYY-MM-DD" | "DOC-IDX"
status: "<canonical-status-enum-per-doc-type>"
author: "agent-or-human-name"
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
tags: ["tag1", "tag2"]
references:
  - "relative/path/to/referenced-file.md"
---
```

#### Canonical Status Enums per Document Type
- **ADR (`docs/decisions/`)**: `draft` | `proposed` | `approved` | `superseded` | `deprecated`
- **Change Record (`docs/changes/`)**: `draft` | `in_progress` | `completed` | `verified` | `archived`
- **Vision / Journal (`docs/vision/`, `docs/journal/`)**: `draft` | `active` | `archived`

### 2.2 Flexible Markdown Narrative Body

Below the YAML header, content follows standard Markdown best practices with structured hierarchical headings (`#`, `##`, `###`), narrative explanations, trade-off matrices, code blocks, and diagrams.

---

## 3. Directory Layout Purpose & Taxonomy Matrix

The `docs/` directory hierarchy and purpose breakdown:

```
docs/
├── README.md                   # DDF Master Guide & Schema Specification
├── vision/                     # System Vision & Target Repo Profiles
│   ├── harness-mission.md      # Dual Primary Objectives & Subsystem Topology
│   ├── target-repo-profile.md  # Target Repo Tech Stack, Boundaries & Patch Rules
│   └── plans/                  # Spec-Delta Increment Bundles (ADR-004)
│       ├── _template/          # Spec-Delta Bundle Templates (requirements, design, tasks)
│       │   ├── requirements.md
│       │   ├── design.md
│       │   └── tasks.md
│       └── archive/            # Archived Spec-Delta Bundles (.gitkeep)
├── decisions/                  # Decision Anchors (ADRs / DRs)
│   ├── _template.md            # Decision Record Template
│   ├── ADR-001-documentation-driven-framework.md # Meta-Decision Record
│   └── index.md                # Decision Record Derived Cache Index
├── changes/                    # Active Change Records & DR-Patch Couplers
│   ├── _template.md            # Change Record Template
│   ├── index.md                # Change Record Derived Cache Index
│   └── archive/                # Archived Change Records (.gitkeep)
└── journal/                    # Agent Execution Journals & Session Notes
    └── _template.md            # Session Journal Template
```

| Directory | Purpose | File Naming Convention | Lifecycle & Archival Rules |
| :--- | :--- | :--- | :--- |
| `docs/` | Root index, DDF principles, YAML schema | `README.md` | Maintained continuously; updated when DDF schema evolves. |
| `docs/vision/` | High-level mission, target profiles | `<slug>.md` | Living vision documents; updated upon strategic shifts. |
| `docs/vision/plans/` | Spec-Delta increment bundles (requirements, design, tasks) | `<increment-slug>/` | Active increment bundles; moved to `archive/` upon CHG completion. |
| `docs/vision/plans/_template/` | Spec-Delta 3-file bundle templates | `requirements.md`, `design.md`, `tasks.md` | Standard templates for Explorer decomposition. |
| `docs/vision/plans/archive/` | Historical archived Spec-Delta bundles | `<increment-slug>/` | Permanent read-only archive for completed Spec-Deltas. |
| `docs/decisions/` | Decision Anchors (ADRs / DRs) | `ADR-XXX-<slug>.md` | Immutable once approved; superseding requires a new record. |
| `docs/changes/` | Active feature specs & DR-patch couplers | `CHG-XXX-<slug>.md` | Active during lifecycle; moved to `archive/` when completed. |
| `docs/changes/archive/` | Historical completed change specs | `CHG-XXX-<slug>.md` | Permanent read-only archive for historical auditing. |
| `docs/journal/` | Execution logs & session notes | `YYYY-MM-DD-journal.md` | Chronological append-only logs of agent activity. |

---

## 4. Governance Rules & Maintenance Lifecycle

1. **Immutability of Decision Records**: Approved decision records in `decisions/` cannot be silently overwritten. Any change to architectural invariants requires creating a new decision record that explicitly marks the former as `superseded`.
2. **Read-Only Target Governance**: All proposed modifications targeting the target project (`d:/CLAUDE-PROJECT/website`) must be specified in a Change Record under `docs/changes/` and staged as patch files in `harness/patches/`. Direct edits to the target project are strictly prohibited.
3. **Derived Cache Maintenance**: `docs/decisions/index.md` and `docs/changes/index.md` are derived cache tables. They MUST be updated whenever a new decision or change record is added, updated, or archived.
4. **Agent Reading & Writing Protocol**:
   - **Reading Protocol**: Incoming agent sessions MUST inspect `docs/decisions/index.md` and `docs/changes/index.md` during context hydration to locate active constraints and ongoing changes.
   - **Writing Protocol**: When creating or modifying documents, agents MUST generate valid YAML frontmatter, set accurate `created_at` / `updated_at` dates, and resolve relative `references`.

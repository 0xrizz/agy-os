---
name: command-workflow-generator
description: Master skill and authoring guide for designing, building, and enforcing Command-Driven Schema-Based Automation Workflows for AI agent tools and sidecars, synthesized from OpenSpec (/opsx) and GitHub Spec-Kit (/speckit) paradigms. Activate this skill whenever asked to create agent workflows, design command-driven pipelines, author schema-validated task flows, or build spec-driven agent tools.
license: Apache-2.0
compatibility: Compatible with Google Antigravity (AGY), OpenSpec, GitHub Spec-Kit, and agentskills.io engines.
metadata:
  standard: "agentskills.io/v1.0"
  author: "Google Antigravity Team"
---

# Command-Driven Schema-Based Automation Workflow Generator (`command-workflow-generator`)

This skill provides step-by-step technical procedures, architectural patterns, and templates for designing, authoring, and enforcing **Command-Driven Schema-Based Automation Workflows** for AI coding agents and toolkits, synthesized from [GitHub Spec-Kit](https://github.com/github/spec-kit) and [OpenSpec (Fission-AI)](https://github.com/Fission-AI/OpenSpec).

---

## 1. Core Architecture: 3-Pillar Workflow Model

Every command-driven schema-based workflow relies on 3 integrated layers:

```
+-------------------------------------------------------------------+
| 1. Command Vocabulary (Slash Commands / CLI Routes)               |
|    - /explore   -> Analyze requirements & initial context          |
|    - /propose   -> Create spec bundle (requirements, design, tasks) |
|    - /gate      -> Validate schemas & lock binding ADR invariants  |
|    - /apply     -> Sequentially execute atomic tasks              |
|    - /archive   -> Mechanical archival & index cache sync          |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| 2. Schema & Bundle Boundaries (Declarative Constraints)           |
|    - Standardized 3-File Bundle (requirements, design, tasks)     |
|    - Rigid YAML Frontmatter + Canonical Status Enums              |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| 3. Automated State Engine (Deterministic Script Verification)     |
|    - Executable Bash/Python Scripts (validate, gate, archive)     |
|    - Derived Cache Index Purity (docs/decisions/index.md)         |
+-------------------------------------------------------------------+
```

---

## 2. 6-Phase State Machine Lifecycle

When designing or authoring a new workflow, enforce the following 6-phase state machine:

### Phase 1: Explore & Principles (`/explore` or `/constitution`)
- **Objective**: Establish governing project guidelines and perform initial requirements analysis before writing code or specs.
- **Output**: `constitution.md` or exploration summary.

### Phase 2: Propose & Spec Bundle (`/propose` or `/specify`)
- **Objective**: Initiate a change proposal by constructing a standardized Spec-Delta bundle in `plans/<slug>/` or `changes/<slug>/`.
- **Bundle Anatomy**:
  - `requirements.md`: Business/user goals, functional requirements, Given-When-Then BDD scenarios.
  - `design.md`: Technical approach, component topology, data flows.
  - `tasks.md`: Atomic, ordered implementation checklist (e.g. `1.1`, `1.2`, `2.1`).

### Phase 3: Plan & Invariant Gate (`/plan` or `/gate`)
- **Objective**: Extract immutable architectural rules (*invariants*) into Decision Anchors (`ADR-XXX`).
- **Enforcement**: Audit frontmatter schemas and set ADR status to `approved` before execution.

### Phase 4: Task Decomposition (`/tasks`)
- **Objective**: Break down technical designs into granular, testable tasks.

### Phase 5: Apply & Execution (`/apply` or `/implement`)
- **Objective**: Operate the `builder` agent to execute tasks in `tasks.md` sequentially.
- **Output**: Executable code, unit tests, or staged patch files (`.patch` / `.diff`).

### Phase 6: Mechanical Archive & Index Sync (`/archive`)
- **Objective**: Move completed spec bundles and Change Records to `archive/`.
- **Enforcement**: Run deterministic scripts (`ddf-archive.sh`, `ddf-index-sync.sh`) to maintain clean cache index tables without polluting active decision anchors.

---

## 3. Workflow Authoring Layout (AGY Flat & Lean Invariant)

When building command-driven workflows for Google Antigravity (AGY), enforce the following layout:

```
.agents/workflows/
├── ddf-spec-init.md             # Primary workflow guide & command router
├── ddf-spec-gate.md             # Direct single markdown files only
├── ddf-spec-apply.md
└── ddf-spec-archive.md

Supporting Asset Locations:
├── docs/vision/plans/_template/  # Canonical templates (requirements, design, tasks)
├── harness/scripts/               # Deterministic Bash/Python scripts
└── .agents/skills/<skill>/references/ # Detailed reference documentation
```

---


## 4. Invariant Governance & Compliance Rules

1. **Executable Script Validation**: Schema enforcement MUST use executable Bash/Python scripts (`ddf-validate.sh`, `ddf-gate.sh`), never narrative prose alone.
2. **Index Cache Purity**: Derived index tables (`index.md`) MUST only list binding active records (`approved`/`superseded`).
3. **Clean Mechanical Archival**: Completed spec bundles MUST be archived via script automation to maintain clean workspace directories.

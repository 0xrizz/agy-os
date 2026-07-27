# Agentic System Operating Manual (`AGENTS.md`)

Welcome to **`agy-harness`** — an agentic development workspace and testbed operating with Google Antigravity (AGY).

---

## 1. Overview & Dual Primary Objectives

This repository serves as a mirror harness for the target project located at `d:/CLAUDE-PROJECT/website`. System vision and detailed mission objectives are formally defined in [docs/vision/harness-mission.md](file:///d:/dev/agy-harness/docs/vision/harness-mission.md):

1. **Harness-Native Operating System for Agentic Work**:
   - Integrating and orchestrating agentic toolkits (including the upstream **ECC Toolkit** located in `ECC/`).
   - Testing, evaluating, and refining agent roles, workflows, skills, and sidecars in an isolated harness environment before applying proven patterns to the target project.

2. **Framework Development Experiment Readiness**:
   - Preparing for future experimentation with modern software engineering paradigms (Spec-Driven Development, BMAD, or custom Agentic Design Patterns) isolated within `frameworks/`.

---

## 2. Workspace Access & Security Boundaries

| Workspace | Absolute Path | Access Permission | Allowed Operations |
| :--- | :--- | :--- | :--- |
| **Target Repo (`website`)** | `d:/CLAUDE-PROJECT/website` | **READ-ONLY** | Code reading, AST parsing, audit, search, diff/patch verification. **NO direct edits.** |
| **Harness Repo (`agy-harness`)** | `d:/dev/agy-harness` | **READ & WRITE** | Full access to edit, build harness scripts, configure agents, write tests. |

> [!IMPORTANT]
> Any changes intended for the target repository MUST be produced as patch files (`.patch` or `.diff`) saved in `harness/patches/`.

---

## 3. Multi-Agent Orchestration, Roles & Lifecycle

Agents operating within `agy-harness` collaborate across a strict 4-stage lifecycle using 5 specialized roles:

### The 5 Agent Roles
- **Explorer (`explorer`)**: Analyzes requirements and reads the target codebase to understand context. Responsible for decomposing vision objectives into Spec-Delta bundles (`requirements.md`, `design.md`, `tasks.md`) under `docs/vision/plans/<increment-slug>/`.
- **Builder (`builder`)**: Responsible for implementing harness code, agent configurations, or tests in agy-harness, binding Parent CHG records, and executing tasks.
- **Patch-Builder (`patch-builder`)**: A sub-role of the builder stage. Formulates and validates target repo modifications, outputting standard patch files to `harness/patches/`.
- **Reviewer (`reviewer`)**: Audits changes against acceptance criteria, holds ADR extraction authority alongside Auditor during Spec-Gate (`/ddf-spec-gate`), and ensures patches are syntactically valid and tests pass.
- **Auditor (`auditor`)**: Final governance check and gate authority. Holds exclusive ADR extraction and approval authority during Spec-Gate (`/ddf-spec-gate`) to extract 1-to-N Decision Records (`ADR-XXX`) into `docs/decisions/`, verifying adherence to DDF schema, security boundaries, invariants, and approving lifecycle state transitions.

### 4-Stage Lifecycle
1. **Explorer**: Context gathering, macro vision decomposition, and Spec-Delta bundle creation (`docs/vision/plans/<increment-slug>/`).
2. **Builder**: Parent CHG binding (`docs/changes/`), task execution, and patch generation.
3. **Reviewer**: Quality assurance, verification test execution, and derived index sync.
4. **Auditor**: Spec-Gate ADR extraction and approval, security, DDF gate compliance, and automated Spec-Delta archival sign-off.

---

## 4. Execution Workflow & Governance Guidelines

1. **Read-Only Target Inspection**: Use `view_file`, `grep_search`, or `list_dir` to inspect `d:/CLAUDE-PROJECT/website`. Never attempt to modify files directly in the target directory.
2. **Patch-Only Delivery**: Save all target repo changes into `harness/patches/<feature-name>.patch`.
3. **DDF & Spec-Delta Governance**: All architectural changes must follow the Documentation-Driven Framework (DDF v2) and Spec-Delta Increment Pipeline (ADR-004). Read `docs/README.md` for schema constraints, decision records (`docs/decisions/`), change records (`docs/changes/`), and Spec-Delta plans (`docs/vision/plans/`).
4. **Automated Enforcement**: Always execute validation scripts located in `harness/scripts/` (e.g., `ddf-validate.sh`, `ddf-index-sync.sh`, `ddf-archive.sh`, `ddf-gate.sh`) to ensure compliance with DDF rules, Spec-Delta 3-file bundle completeness, and index purity. Agents determine status transitions, but these scripts perform the mechanical validation, indexing, and archiving.
5. **AGY Workflow Flat & Lean Invariant**: All workflow slash command definitions under `.agents/workflows/` MUST be single `.md` files directly at the root of `.agents/workflows/` (e.g. `ddf-spec-init.md`). Never create nested markdown sub-folders inside `.agents/workflows/` to prevent AGY slash command registry pollution. Store templates in `docs/`, scripts in `harness/scripts/`, and references under `.agents/skills/<skill>/references/`.


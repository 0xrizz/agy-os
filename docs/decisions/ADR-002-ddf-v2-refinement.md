---
decision_id: "ADR-002"
status: "approved"
supersedes: "ADR-001"
goal: "Refine DDF framework with executable validation, consistent ID schema, complete role definitions, and automated governance scripts."
affected_scope:
  - "docs/"
  - ".agents/rules/"
  - ".agents/workflows/"
  - "frameworks/"
  - "harness/scripts/"
  - "AGENTS.md"
  - "README.md"
invariants:
  - "All architectural changes must be anchored to an approved Decision Record (ADR-XXX) prior to implementation."
  - "Machine-parseable metadata strictly resides in YAML frontmatter; narrative rationale resides in Markdown body."
  - "Target repository (d:/CLAUDE-PROJECT/website) remains strictly READ-ONLY; all recommended changes must be staged via patch files in harness/patches/."
  - "Decision Records are append-only state transitions; superseded decisions must update status and reference the superseding decision_id."
  - "Validation must use executable Git Bash scripts combining grep and yq for reliable YAML parsing."
  - "All path references in documentation and scripts must use forward-slash format strictly."
  - "Lifecycle transitions are hybridized: Agents decide to set the status, while scripts execute the mechanical operations (like archive moves and index syncs)."
date: "2026-07-27"
---

# ADR-002: DDF v2 Refinement

## Context
Following the initial rollout of DDF (ADR-001), a comprehensive "grill-me" review session revealed 8 critical gaps. These included inconsistent ID schemas, missing executable validation (relying on prose instructions for grep instead of scripts), incomplete role definitions, mixed target audiences in READMEs, and fragile manual cache indexing.

## Rationale
To mature DDF into version 2 and ensure it can be effectively governed by both human developers and autonomous agents, we derived 6 key decisions that directly address the identified gaps:

1. **Executable Validation via Scripts**: Move away from prose-based grep commands in workflow documents. Instead, provide definitive Git Bash scripts (e.g., `ddf-validate.sh`) for execution.
2. **Hybrid YAML Validation (grep + yq)**: Enhance frontmatter validation by incorporating `yq` for proper YAML schema validation, augmented by `grep` where beneficial.
3. **Consistent ID Schema**: Standardize all decision records to the `ADR-XXX` prefix (replacing `DDF-XXX`), while maintaining type-specific keys (`decision_id:`, `change_id:`).
4. **Roles and Stages**: Formally define 5 agent roles (`explorer`, `builder`, `patch-builder`, `reviewer`, `auditor`) and a strict 4-stage lifecycle (`explorer` -> `builder` -> `reviewer` -> `auditor`). `patch-builder` operates as a sub-role during the builder stage.
5. **Separation of Concerns in Documentation**: Split documentation responsibilities. `AGENTS.md` is strictly for agent governance and operational rules, while `README.md` is strictly for human developer onboarding. Both are to be written in English.
6. **Path Standardization**: Mandate forward-slash `/` paths globally (e.g., `d:/CLAUDE-PROJECT/website`) to prevent cross-platform and agent parsing issues.
7. **Hybrid Lifecycle Triggers**: Agents are responsible for cognitive decisions (e.g., setting the `status`), while automated scripts handle mechanical state consequences (e.g., moving files to archives, syncing indexes).
8. **Automated Index Generation**: Replace the manual cache maintenance for `index.md` files with automated scripts.

## Consequences
- **Positive Outcomes**:
  - Clearer onboarding for humans and strictly defined governance for agents.
  - Highly reliable validation that doesn't rely on agent interpretation of prose.
  - Reduced administrative burden through automated script execution for index syncing and archiving.
- **Trade-Offs & Liabilities**:
  - Introduction of a new dependency (`yq`) for validation scripts.
  - Requires updating all existing documentation to reflect the new paradigms.

## Options Considered
- Continuing with DDF v1 was rejected as the inconsistencies and reliance on manual agent execution for complex validation operations proved too fragile in practice.

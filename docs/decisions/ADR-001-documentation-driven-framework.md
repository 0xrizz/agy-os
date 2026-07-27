---
decision_id: "ADR-001"
status: "superseded"
supersedes: null
superseded_by: "ADR-002"
goal: "Adopt Documentation-Driven Framework (DDF) to establish rigid machine-enforceable decision anchors and flexible narrative reasoning across agent sessions."
affected_scope:
  - "docs/"
  - ".agents/rules/"
  - ".agents/workflows/"
  - "AGENTS.md"
  - "README.md"
invariants:
  - "All architectural changes must be anchored to an approved Decision Record (ADR-XXX) prior to implementation."
  - "Machine-parseable metadata strictly resides in YAML frontmatter; narrative rationale resides in Markdown body."
  - "Target repository (d:/CLAUDE-PROJECT/website) remains strictly READ-ONLY; all recommended changes must be staged via patch files in harness/patches/."
  - "Decision Records are append-only state transitions; superseded decisions must update status and reference the superseding decision_id."
date: "2026-07-27"
---

# ADR-001: Adoption of Documentation-Driven Framework (DDF)

## Context
In multi-agent and long-running software engineering projects, AI agents operate in episodic, stateless execution sessions. Context window truncation and session resets cause severe "rationale evaporation," where the original architectural context, invariant constraints, and design trade-offs are lost between sessions. Without a structured framework, subsequent agent sessions risk making conflicting design choices, degrading project structure, or violating security boundaries.

## Rationale
To eliminate rationale evaporation and maintain strict system governance, we adopt the **Documentation-Driven Framework (DDF)**. DDF operates under three primary design principles:

1. **Cognitive Bridge**: Persistent markdown documents under `docs/` serve as external working memory for agents. Any newly spawned agent can reconstruct the full state, history, and active constraints by reading `docs/decisions/` and `docs/changes/`.
2. **Rationale Preservation Across Sessions**: Architectural intent is captured at the time of decision-making rather than inferred post-hoc. Every non-trivial change must link to an explicit Decision Record (`decision_refs`).
3. **Rigid vs. Flexible Schema Boundaries**:
   - **Rigid Frontmatter**: Standardized YAML headers enforce strict type constraints and fixed keys (`decision_id`, `status`, `invariants`, `affected_scope`), enabling deterministic validation by governance rules (`.agents/rules/RULES.md`).
   - **Flexible Markdown Body**: Free-form narrative sections allow rich contextual explanations, deep technical reasoning, and nuance that fixed schemas cannot capture.

## Consequences
- **Positive Outcomes**:
  - Deterministic alignment across agent sessions.
  - Machine-verifiable governance via rule scripts and gate workflows.
  - Clean separation between harness experimentation (`agy-harness`) and read-only target codebase (`website/`).
- **Trade-Offs & Liabilities**:
  - Slight initial overhead in writing decision records before code implementation.
  - Requirement to maintain derived cache indexes (`index.md`).

## Options Considered
1. **Option 1: Informal Commit Messages & Prompt Instructions**
   - *Pros*: Zero documentation overhead.
   - *Cons*: Rationale is lost across session resets; cannot be validated programmatically by automated governance tools.
   - *Reason for Rejection*: Insufficient to prevent architectural drift in complex multi-agent environments.

2. **Option 2: Monolithic Architecture Specification File**
   - *Pros*: Single file to inspect.
   - *Cons*: Single point of merge conflicts; quickly exceeds context window limits; difficult to perform fine-grained status tracking per decision.
   - *Reason for Rejection*: Fails to scale as project decisions expand.

3. **Option 3: Documentation-Driven Framework (DDF) with Frontmatter Decision Anchors**
   - *Pros*: Combines machine-verifiable YAML schemas with rich narrative bodies; modular per-decision tracking.
   - *Cons*: Requires maintaining templates and index caches.
   - *Reason for Selection*: **Selected Approach**. Provides optimal balance of machine validation and human/LLM reasoning preservation.

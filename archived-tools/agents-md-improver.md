---
description: Audit, evaluate quality, and improve AGENTS.md and rule governance files across the workspace.
---

# `/agents-md-improver` Workflow

Perform a comprehensive quality audit and targeted improvement of `AGENTS.md`, `RULES.md`, and `.agents/rules/*.md` files in the Antigravity agent harness.

## Workflow Execution Steps

1. **Trigger Skill Instructions**:
   Load and follow `.agents/skills/agents-md-improver/SKILL.md`.

2. **Phase 1: Discovery**:
   Scan repository root and `.agents/` directory for all governance and rules markdown files:
   - `AGENTS.md`
   - `RULES.md`
   - `.agents/AGENTS.md`
   - `.agents/rules/*.md`
   - Global `~/.gemini/config/AGENTS.md` (if applicable)

3. **Phase 2: Quality Assessment**:
   Score each file against the 6 core criteria in `.agents/skills/agents-md-improver/references/quality-criteria.md`:
   - Workspace Boundaries & Access Controls (20 pts)
   - Path Formatting & Shell Environment Invariants (20 pts)
   - Skill & Registry Governance (20 pts)
   - Architecture & Workflow Clarity (15 pts)
   - Non-Obvious Gotchas & Invariants (15 pts)
   - Actionability & Conciseness (10 pts)

4. **Phase 3: Generate Quality Report**:
   Present an `AGENTS.md Quality Report` detailing:
   - Overall grade & score
   - Strengths and deficiencies per file
   - Actionable recommendations

5. **Phase 4: Targeted Improvement**:
   Apply approved improvements using standard section templates in `.agents/skills/agents-md-improver/references/templates.md`.

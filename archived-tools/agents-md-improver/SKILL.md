---
name: agents-md-improver
description: >-
  Audit, evaluate, and improve AGENTS.md and rules files across an Antigravity agent harness repository.
  Use when user asks to check, audit, update, improve, optimize, or fix AGENTS.md, RULES.md, or .agents/rules/*.md files.
  Scans for all governance and rules files, evaluates quality against rubrics, outputs a structured quality report, then makes targeted updates upon approval.
  Also use when the user mentions "AGENTS.md maintenance", "rule optimization", or "harness governance audit".
license: Apache-2.0
compatibility: Compatible with Google Antigravity (AGY), Open Agent Skills engines, Claude Code, and Gemini Agent Platform.
metadata:
  standard: "agentskills.io/v1.0"
  author: "Google Antigravity Team"
---

# AGENTS.md Improver (`agents-md-improver`)

Audit, evaluate, and improve `AGENTS.md`, `RULES.md`, and `.agents/rules/*.md` files across an Antigravity workspace to ensure agents operate with clear, actionable, and compliant workspace governance.

---

## Workflow

### Phase 1: Discovery

Find all `AGENTS.md`, `RULES.md`, and rule definition files in the repository and customization roots:

```bash
# Scan workspace repository and agent customization roots
find . -name "AGENTS.md" -o -name "RULES.md" -o -name "*.md" -path "*/.agents/rules/*" 2>/dev/null | head -50
```

**File Types & Locations:**

| Type | Location | Purpose |
|------|----------|---------|
| Workspace Root Rules | `./AGENTS.md` or `./RULES.md` | Primary workspace boundaries and governance rules |
| Workspace Customizations | `./.agents/AGENTS.md` | Team-shared rules and workspace-scoped guidelines |
| Workspace Domain Rules | `./.agents/rules/*.md` | Feature or domain-specific modular agent rules |
| Global Customizations | `~/.gemini/config/AGENTS.md` | User-wide defaults across all workspaces |

*Note: All paths in rules and documentation MUST strictly use forward-slash format (`/`). Windows backslashes (`\`) are prohibited.*

---

### Phase 2: Quality Assessment

Evaluate each governance file against the 6 core quality criteria. See [references/quality-criteria.md](references/quality-criteria.md) for detailed scoring rubrics.

**Quick Assessment Checklist:**

| Criterion | Weight | Key Verification Check |
|-----------|--------|------------------------|
| Workspace Boundaries & Access Controls | High (20 pts) | Are Read-Only vs Read-Write paths explicitly defined? |
| Path Formatting & Shell Environment | High (20 pts) | Are forward slashes mandatory and execution shell specified (Git Bash)? |
| Skill & Registry Governance | High (20 pts) | Does structure strictly follow `agentskills.io` and flat workflow layout? |
| Architecture & Workflow Clarity | Medium (15 pts) | Are key directories, entry points, and workflows clearly mapped? |
| Non-Obvious Gotchas & Invariants | Medium (15 pts) | Are harness quirks, anti-patterns, and known gotchas captured? |
| Actionability & Conciseness | High (10 pts) | Are instructions copy-paste executable with no outdated fluff? |

**Quality Scores:**
- **A (90-100)**: Exemplary governance, strict pathing, clear boundaries, zero ambiguity.
- **B (70-89)**: Strong coverage, minor formatting or section gaps.
- **C (50-69)**: Basic rules present, missing key boundaries or environment constraints.
- **D (30-49)**: Sparse, vague, or contains Windows backslash path violations.
- **F (0-29)**: Severely outdated or missing essential governance rules.

---

### Phase 3: Quality Report Output

**ALWAYS output the quality report BEFORE making any file modifications.**

Format:

```markdown
## AGENTS.md Quality Report

### Summary
- Files Scanned: `<list of files>`
- Overall Harness Governance Grade: `<A-F>` (Average Score: `<0-100>`)

### File Breakdown

#### `<file_path>` (Score: `<0-100>` - Grade: `<A-F>`)
- **Strengths**: `<key positive points>`
- **Deficiencies**: `<missing sections, improper path formats, vague rules>`
- **Actionable Recommendations**: `<specific edits needed>`
```

---

### Phase 4: Targeted Updates & Improvement

After presenting the Quality Report and receiving approval, update `AGENTS.md` or rule files using structured templates in [references/templates.md](references/templates.md).

**Key Principles for Edits:**
1. **Preserve Authority**: Maintain all strict user directives and system constraints without silent deletion.
2. **Forward-Slash Invariant**: Ensure all referenced paths use forward slashes (`/`).
3. **Concise Bulleting**: Use dense, actionable statements rather than narrative text.

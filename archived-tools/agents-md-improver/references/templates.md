# AGENTS.md Templates & Recommended Structure

This document provides standardized templates for structuring `AGENTS.md`, `RULES.md`, and `.agents/rules/*.md` files within the Antigravity agent harness ecosystem.

---

## Standard Section Templates

### 0. Universal Path Formatting & Shell Execution Environment

```markdown
## 0. Universal Path Formatting & Shell Execution Environment
- All file paths in rules, documentation, scripts, change records, and tool parameters MUST strictly use forward-slash format (e.g., `d:/dev/agy-os`, `d:/CLAUDE-PROJECT/website`). Windows backslashes (`\`) are strictly prohibited in metadata, paths, and documentation.
- **Terminal Execution Environment**: All script executions, shell commands, and automated tooling MUST strictly run using **Git Bash** (e.g., `& 'C:\Program Files\Git\bin\bash.exe'` or bash shell execution). Running scripts via CMD or PowerShell is strictly prohibited.
```

---

### 1. Context & Workspace Boundaries

```markdown
## 1. Context & Workspace Boundaries
Workspace Root: `agy-os` (`d:/dev/agy-os`)

- **Target Repo (`<target-name>/`)**: `d:/path/to/target`
  - **Access**: **READ-ONLY**. Only allowed for inspection, analysis, audit, AST parsing, and patch creation. Direct writes or edits are strictly forbidden.
- **Harness Repo (`agy-os`)**: `d:/dev/agy-os`
  - **Access**: **READ & WRITE**. Full access to read, write, create, and modify files within this workspace.
```

---

### 2. Target Modification via Patch Staging

```markdown
## 2. Target Modification via Patch Staging
- Every recommended change to the Target Repo MUST be produced as a patch file (`.patch` or `.diff`) and saved in the `harness/patches/` directory within `agy-os`.
- Do not create, alter, or delete files directly inside the Target Repo.
```

---

### 3. Agent Skills & Registry Purity Specification

```markdown
## 3. Agent Skills & Registry Purity Specification
- **Skill Structure**: Every skill must reside in a dedicated directory under `.agents/skills/<skill-name>/` containing a `SKILL.md`. The `name` in YAML frontmatter MUST match the directory name exactly (`[a-z0-9-]`).
- **Workflow Registry Purity**: The `.agents/workflows/` directory MUST strictly maintain a **Flat & Lean Layout**. Every file directly inside `.agents/workflows/` MUST be a single `.md` workflow file mapping to a valid slash command.
- **Progressive Disclosure**: `SKILL.md` instruction body MUST remain under 500 lines. Supporting templates belong in `docs/` or `assets/`, and detailed documentation under `references/*.md`.
```

---

### 4. Code Style, Gotchas & Verification Invariants

```markdown
## 4. Code Style & Architectural Invariants
- **No Dummy Fallbacks**: Never mask symptoms, swallow exceptions, or return dummy fallbacks.
- **Log Inspection**: Inspect error tracebacks before diagnosing runtime failures.
- **Empirical Verification**: Never declare success without executing verification test scripts (`npm test`, `pytest`, or build commands).
```

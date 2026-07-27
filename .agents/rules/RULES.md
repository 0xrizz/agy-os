---
trigger: always_on
---

# Project Rules & Agentic Workspace Governance

## 0. Universal Path Formatting & Shell Execution Environment
- All file paths in rules, documentation, scripts, change records, and agent tool parameters MUST strictly use forward-slash format (e.g., `d:/dev/agy-os`, `d:/CLAUDE-PROJECT/website`). Windows backslashes (`\`) are strictly prohibited in metadata, paths, and documentation instructions to avoid cross-platform regex and tool failures.
- **Terminal Execution Environment**: All script executions, shell commands, and automated tooling MUST strictly run using **Git Bash** (e.g., `& 'C:\Program Files\Git\bin\bash.exe'` or bash shell execution). Running scripts via CMD or PowerShell is strictly prohibited.

## 1. Context & Workspace Boundaries
Workspace Root: `agy-os` (`d:/dev/agy-os`)

- **Target Repo (`website/`)**: `d:/CLAUDE-PROJECT/website`
  - **Access**: **READ-ONLY**. Only allowed for inspection, analysis, audit, AST parsing, and patch creation. Direct writes, edits, or file/folder deletions are strictly forbidden.
- **Harness Repo (`agy-os`)**: `d:/dev/agy-os`
  - **Access**: **READ & WRITE**. Full access to read, write, create, and modify files within this workspace.

## 2. Target Modification via Patch Staging
- Every recommended change to the Target Repo (`website/`) **MUST** be produced as a patch file (`.patch` or `.diff`) and saved in the `harness/patches/` directory within `agy-os`.
- Do not create, alter, or delete files directly in `d:/CLAUDE-PROJECT/website`.

## 3. Framework Development Experiment Readiness
- This harness environment is prepared for future novel development methodology experiments (like SDD, BMAD, or Agentic Design Patterns).
- Feature tests and experiments inside the harness must be validated against acceptance criteria empirically.

## 4. ECC Toolkit Reference Isolation
- The upstream `ECC/` repository within `agy-os` is treated as a reference library.
- Modifications to ECC components should be adapted/copied to the `.agents/` structure (`agents/`, `skills/`, `workflows/`) at the root of `agy-os` without altering the original `ECC/` directory.

## 5. Official Agent Skills Specification (`agentskills.io`) Compliance

1. **Directory & Name Alignment**: Every skill must reside in a dedicated directory under `.agents/skills/<skill-name>/` containing a `SKILL.md`. The `name` in YAML frontmatter MUST match the directory name exactly, using only lowercase letters, numbers, and hyphens (`[a-z0-9-]`).
2. **Pushy & Descriptive Triggering**: The `description` field MUST specify both what the skill enables AND explicit triggering phrases/contexts. Descriptions should be slightly "pushy" to ensure reliable agent triggering.
3. **Progressive Disclosure Cap**: Main `SKILL.md` instruction body MUST remain concise (under 500 lines recommended). Deep documentation, schemas, and templates must be split into `references/*.md` or `assets/` and loaded on demand.

## 6. AGY Workflow Layout & Registry Purity Invariant
- The `.agents/workflows/` directory MUST strictly maintain a **Flat & Lean Layout**. 
- Every file directly inside `.agents/workflows/` MUST be a single `.md` workflow file mapping to a valid slash command.
- NO nested subdirectories containing `.md` files (e.g., `templates/`, `references/`) are permitted inside `.agents/workflows/` to prevent AGY slash command registry pollution.
- Supporting templates MUST be placed in `docs/` or `assets/`, scripts in `harness/scripts/`, and reference documentation under `.agents/skills/<skill-name>/references/`.
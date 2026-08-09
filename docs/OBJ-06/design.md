# Technical Design Document: OBJ-06 ECC Component Refactoring & Agent Schema Alignment

<!--
AI INSTRUCTION:
This template defines the technical architecture and design specifications for OBJ-06.
- Use forward slashes (/) for all file paths.
- Use clickable file:/// links for all referenced file paths.
- Section 4 MUST contain a 4-column decision matrix.
- Section 5 MUST detail Non-Destructive Rollback Architecture.
-->

## 1. Overview & Architecture Goals

### Context
Objective 06 defines the technical architecture for refactoring the installed **ECC (Everything-as-Code)** component surface within the Antigravity harness ([agy-os](file:///d:/dev/agy-os)). It migrates installed subagent definitions to a canonical flat path, enforces YAML frontmatter schema compliance across all agent files, eliminates legacy bridge workflow scaffolding, and prunes the component inventory per the approved change manifest [ecc-components-fix.txt](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-components-fix.txt).

### Goals
- Relocate all installed ECC subagents from [.agents/plugin/ecc/agents/<name>/agent.md](file:///d:/dev/agy-os/.agents/plugin/ecc/agents/) to the flat canonical path [.agents/agents/<name>/agent.md](file:///d:/dev/agy-os/.agents/agents/).
- Enforce automated YAML frontmatter parse validation (`name`, `description`, `model`) via [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) with Fail-Fast exit code 1.
- Deprecate and remove ALL `a-*.md` bridge workflows from [.agents/workflows/](file:///d:/dev/agy-os/.agents/workflows/), restoring registry purity for true user slash-commands only.
- Execute the full component pruning delta from [ecc-components-fix.txt](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-components-fix.txt): remove 1 agent (`chief-of-staff`), 27 workflows, 17 skills; add 6 rules, 14 skills.
- Maintain token budget governance within **85%–95%** (post-OBJ-06 footprint: **88.6%**).
- Preserve non-destructive rollback capability via [uninstall-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-agy.sh).

### Non-Goals
- Rewriting ECC agent logic or adding new capabilities to existing agents.
- Modifying upstream [ECC/](file:///d:/dev/agy-os/ECC) source files.
- Modifying target repository [website](file:///d:/CLAUDE-PROJECT/website) (`d:/CLAUDE-PROJECT/website`) directly.
- Creating new installer scripts from scratch (scripts are updated in-place with `--target-dir` support handled by OBJ-07).

---

## 2. Target Directory Layout & Component Structure

```text
d:/dev/agy-os/
├── .agents/
│   ├── agents/                              # [NEW] Canonical flat agent directory (post-OBJ-06)
│   │   └── <agent-name>/
│   │       ├── agent.md                     # Antigravity subagent entrypoint (YAML frontmatter required)
│   │       ├── prompts/                     # Supporting agent prompt assets (optional)
│   │       └── references/                  # Supporting reference docs (optional)
│   ├── plugin/
│   │   └── ecc/
│   │       ├── agents/                      # [DEPRECATED] Emptied after relocation to .agents/agents/
│   │       └── platform/                    # Managed platform configs (unchanged)
│   ├── rules/                               # Flat rules directory (33 rules post-OBJ-06)
│   │   └── <name>.md                        # e.g., cloudflare-edge-runtime.md (6 new rules added)
│   ├── skills/                              # Native skills directory (42 skills post-OBJ-06)
│   │   └── <skill-name>/
│   │       └── SKILL.md                     # 17 skills removed, 14 skills added
│   ├── workflows/                           # Flat workflow registry (32 commands post-OBJ-06)
│   │   ├── plan.md                          # True slash-command workflow (/plan)
│   │   └── <name>.md                        # No a-*.md bridge workflows — ALL removed
│   ├── scripts/                             # 100% self-contained runtime scripts (unchanged)
│   │   └── lib/                             # Shared helper libraries (-agy.js naming)
│   └── hooks.json                           # Lifecycle hooks config (unchanged)
├── harness/
│   └── agy-script/                          # Custom installer & teardown scripts
│       ├── install-agy.sh                   # Updated: resolves agents to .agents/agents/
│       ├── uninstall-agy.sh                 # Updated: cleans .agents/agents/ on rollback
│       ├── post-install-agy.js              # Updated: targets .agents/agents/ (no bridge gen)
│       ├── scripts/
│       │   ├── install-apply-agy.js         # Updated: writes to .agents/agents/
│       │   └── verify-installation-agy.js   # Updated: checks .agents/agents/ + YAML validation
│       └── adapters/
│           └── antigravity-project-agy.js   # Updated: maps to .agents/agents/
├── AGENTS.md                                # Updated: Section 3 canonical path = .agents/agents/
└── docs/
    └── OBJ-06/
        ├── spec.md                          # Behavioral specification (this objective)
        ├── design.md                        # This technical design document
        ├── task.md                          # Stateful execution checklist
        └── artifacts/
            ├── proposal.md                  # Approved executive proposal
            ├── ecc-components-fix.txt       # Component change manifest source
            └── ecc-items.json               # Post-OBJ-06 inventory reference baseline
```

---

## 3. Technical Design

### 3.1 Agent Path Relocation Pipeline

The relocation is executed as a 4-step atomic pipeline inside [post-install-agy.js](file:///d:/dev/agy-os/harness/agy-script/post-install-agy.js):

1. **Scan Source**: Read all subdirectories under `.agents/plugin/ecc/agents/`.
2. **Filter**: Exclude any agent listed in the DELETE section of [ecc-components-fix.txt](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-components-fix.txt) (e.g., `chief-of-staff`).
3. **Copy**: For each remaining agent, recursively copy the entire directory from `.agents/plugin/ecc/agents/<name>/` to `.agents/agents/<name>/`.
4. **Cleanup**: After all copies succeed, delete `.agents/plugin/ecc/agents/` content (leaving `.agents/plugin/ecc/platform/` untouched).

**Atomicity Guarantee**: If any copy step fails, the pipeline halts with exit code 1 before any cleanup occurs, leaving the source `.agents/plugin/ecc/agents/` intact for recovery.

### 3.2 YAML Frontmatter Schema

All `agent.md` files under `.agents/agents/` MUST contain a valid YAML frontmatter block as the first content of the file:

```yaml
---
name: <agent-name>        # Required. String. Must match directory name exactly.
description: <text>       # Required. Non-empty string. Used for agent discovery.
model: <model-id>         # Required. String. e.g., "claude-sonnet-4-5", "inherit".
tools:                    # Optional. List of allowed tool names.
  - tool_name
metadata:                 # Optional. Key-value pairs for agent metadata.
  key: value
---
```

**Validation Logic** added to [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js):
- Extracts the content between the first and second `---` delimiters.
- Parses the YAML block using a lightweight inline parser (no external dependencies).
- Asserts presence of `name`, `description`, `model`.
- On failure: prints `[INVALID FRONTMATTER] .agents/agents/<name>/agent.md — missing field: <field>` and exits with code 1.

### 3.3 Component Pruning Protocol

Pruning is driven entirely from [ecc-components-fix.txt](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-components-fix.txt) and executed in the following sequence:

| Phase | Target | Action | Count |
|---|---|---|---|
| P1 — Agents | `.agents/agents/chief-of-staff/` | DELETE directory | 1 agent |
| P2 — Bridge Workflows | `.agents/workflows/a-*.md` | DELETE all matching files | All bridge workflows |
| P3 — Obsolete Workflows | `.agents/workflows/<name>.md` | DELETE 27 listed files | 27 workflows |
| P4 — Workflow Edits | `update-codemaps.md`, `plan-prd.md` | UPDATE target path references | 2 workflows |
| P5 — Obsolete Skills | `.agents/skills/<name>/` | DELETE 17 listed directories | 17 skills |
| P6 — Orphaned Scripts | `.agents/scripts/` | AUDIT & DELETE orphans | Variable |

---

## 4. Decision Matrix

| Decision | Selected Option | Rationale | Alternatives Considered |
|---|---|---|---|
| **Agent canonical path layout** | Flat layout `.agents/agents/<name>/agent.md` | Direct subagent discovery without plugin namespace indirection. Simpler resolver logic. Aligns with Antigravity native subagent convention. | Categorized subfolders (`.agents/agents/<category>/<name>/`); rejected as unnecessary complexity with only 31 agents. |
| **Bridge workflow (`a-*.md`) deprecation scope** | Remove ALL `a-*.md` workflows | Native Antigravity subagent discovery via `.agents/agents/` renders bridge markdown wrappers fully redundant. Removes 31+ orphan slash commands from registry. | Remove only bridge workflows for deleted agents; rejected because remaining `a-*.md` files still pollute the slash-command registry. |
| **YAML frontmatter validation strictness** | Full automated YAML parse in `verify-installation-agy.js` | Prevents silent agent discovery failures at runtime due to missing or malformed frontmatter. Fail-Fast exit code 1 ensures no partial installations. | Regex-only `---` block detection; rejected as insufficient — does not catch missing required fields or malformed YAML values. |
| **Component manifest reference source** | [ecc-items.json](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-items.json) (static JSON baseline) | Provides a machine-readable, version-controlled ground truth for `verify-installation-agy.js` to diff against physical disk state. | Dynamic manifest re-parse on every run; rejected because it creates a circular dependency between installation and verification. |

---

## 5. Non-Destructive Rollback Architecture

### 5.1 Rollback Trigger Conditions
Rollback is triggered automatically when:
- `verify-installation-agy.js` exits with code 1 (any missing, extra, or invalid component).
- Token budget audit exceeds **95%** threshold and manual user confirmation is obtained.
- Any step in the agent relocation pipeline fails mid-execution.

### 5.2 Rollback Mechanism ([uninstall-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-agy.sh))

The teardown script performs a non-destructive, ordered cleanup:

```bash
# Step 1: Remove canonical agent directory
rm -rf .agents/agents/

# Step 2: Restore bridge workflow scaffold (if needed, re-run post-install-agy.js against legacy path)
# NOTE: .agents/plugin/ecc/agents/ is left intact if agent copy was atomic

# Step 3: Remove new rules (6 added by OBJ-06)
rm -f .agents/rules/cloudflare-edge-runtime.md
rm -f .agents/rules/cloudflare-pages-deploy.md
rm -f .agents/rules/sanity-cms-federation.md
rm -f .agents/rules/monorepo-workspace.md
rm -f .agents/rules/tailwind-v4.md
rm -f .agents/rules/prisma-neon-edge.md

# Step 4: Do NOT delete .agents/scripts/ or .agents/hooks.json (runtime hooks must remain)
```

### 5.3 Recovery Point
- **Full recovery**: Re-run `install-agy.sh` from the original OBJ-01 baseline using `harness/manifests/*.custom.json` manifests against [ecc-items.json from OBJ-01](file:///d:/dev/agy-os/docs/OBJ-01/artifacts/ecc-items.json).
- **Partial recovery**: The atomic copy guarantee means `.agents/plugin/ecc/agents/` is never deleted until all copies to `.agents/agents/` succeed, making mid-migration rollback safe.

### 5.4 Safety Invariants
- [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json) is **NEVER deleted** by any rollback operation — the `pre:agy-guardrail` hook MUST remain active at all times.
- [ECC/](file:///d:/dev/agy-os/ECC) source files are **NEVER modified** during any OBJ-06 operation.
- [d:/CLAUDE-PROJECT/website](file:///d:/CLAUDE-PROJECT/website) is **NEVER touched** by any OBJ-06 operation.

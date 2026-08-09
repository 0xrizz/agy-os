# Customization Proposal Document: Objective OBJ-08 Personal Local Product CLI Runner & Multi-Repo Productization (`agy-harness`)

> **Master Harness**: Antigravity ([agy-os](file:///d:/dev/agy-os)) (`d:/dev/agy-os`)  
> **Reference Production Target**: OpenSpec Framework ([frameworks/openspec](file:///d:/dev/agy-os/frameworks/openspec)) (`d:/dev/agy-os/frameworks/openspec`)  
> **New Product CLI Tool**: `harness/bin/agy-harness.sh` (CLI runner for `deploy`, `verify`, `uninstall`, `status`)  
> **Custom Item Architecture**: Hybrid (Centralized Baseline in `agy-os` + Non-Destructive Local Extensions in Target Repositories)  
> **Verification Standard**: 100% Baseline Parity + Local Extension Audit via `agy-harness verify`

---

## 1. Executive Summary & Architectural Motivation

Objective 08 (OBJ-08) productizes the multi-repository installer suite established in OBJ-07 into a unified, portable personal CLI tool (`agy-harness`) for deploying, verifying, status-checking, and uninstalling the OpenAGY agent harness (`.agents/`) across any local repository on the user's machine (such as [frameworks/openspec](file:///d:/dev/agy-os/frameworks/openspec)).

Prior to OBJ-08, running installer commands required invoking multi-step bash or node scripts directly from `harness/agy-script/`. OBJ-08 provides a single CLI binary entrypoint (`harness/bin/agy-harness.sh`) with subcommands (`deploy`, `verify`, `uninstall`, `status`), while establishing a **Hybrid Custom Item Architecture** that allows target repositories to maintain local custom rules, skills, agents, or workflows directly inside `.agents/rules/`, `.agents/skills/`, etc., without being overwritten during baseline syncs.

---

## 2. CLI Runner Commands & Functional Surface

The `agy-harness` CLI tool provides four subcommands:

1. **`agy-harness deploy [--target-dir <path>]`**:
   - Scaffolds `.agents/` in the target directory if not present.
   - Deploys/updates all baseline master components (rules, agents, skills, workflows, hooks, scripts, `ecc-items.json`) from `agy-os`.
   - **Non-Destructive Sync**: Preserves local target custom items in `.agents/skills/`, `.agents/rules/`, etc.

2. **`agy-harness verify [--target-dir <path>]`**:
   - Parses `<target-dir>/.agents/ecc-items.json` reference baseline.
   - Validates 100% physical disk presence for all baseline master items across 6 component kinds.
   - Audits extra items in target as `[LOCAL EXTENSION]` without failing parity if baseline is intact. Exits with code 0 on full baseline match, code 1 on missing baseline items.

3. **`agy-harness status [--target-dir <path>]`**:
   - Displays deployment status of `<target-dir>/.agents/`.
   - Reports baseline item counts (rules, agents, skills, workflows, hooks, platform).
   - Lists local custom extensions discovered in target standard paths.

4. **`agy-harness uninstall [--target-dir <path>]`**:
   - Removes `<target-dir>/.agents/` non-destructively.
   - Leaves all target repository source files 100% untouched.

---

## 3. Productization & Target Rollout Layout

```text
d:/dev/agy-os/ (Master Harness & CLI Distribution Root)
├── harness/
│   ├── bin/
│   │   └── agy-harness.sh                <-- Unified Product CLI Entrypoint
│   ├── ecc-items.json                    <-- Master baseline items reference
│   └── agy-script/                       <-- Underlying installer & verification engines
├── frameworks/
│   └── openspec/                         <-- Primary Local Production Rollout Target
│       ├── .agents/                      <-- Deployed & verified via agy-harness deploy
│       │   ├── agents/                   <-- Baseline subagent definitions
│       │   ├── rules/                    <-- Baseline + local custom rules
│       │   ├── skills/                   <-- Baseline + local custom skills
│       │   ├── workflows/                <-- Baseline workflows
│       │   ├── hooks.json                <-- Standard hooks config
│       │   ├── ecc-items.json            <-- Copied baseline reference
│       │   └── scripts/                  <-- 100% self-contained runtime scripts
│       ├── AGENTS.md
│       └── README.md
└── docs/
    └── OBJ-08/                           <-- Objective 08 Documentation Suite
        ├── artifacts/
        │   └── proposal.md
        ├── spec.md
        ├── design.md
        └── task.md
```

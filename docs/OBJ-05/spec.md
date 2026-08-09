# OpenAGY Behavioral Specification: OBJ-05 Graphify Knowledge Harness

<!--
AI INSTRUCTION:
This template defines behavioral requirements and system constraints following the OpenAGY spec-driven format.
When populating this file:
- System constraints MUST define boundary rules, path invariants, and execution parameters.
- Each requirement MUST use the level-3 heading `### Requirement: <Name>` followed by SHALL statements.
- Scenarios MUST use level-4 headings `#### Scenario: <Name>` with bulleted WHEN/THEN/AND clauses.
- Use forward slashes (/) for all file paths.
- Use clickable file:/// links for all referenced file paths.
-->

## 1. Scope & System Constraints

### 1.1 Path Formatting & Shell Execution Invariants
- All file paths in rules, configurations, change records, and documentation MUST strictly use forward-slash format (e.g., [d:/dev/agy-os](file:///d:/dev/agy-os), [graphify-out/](file:///d:/dev/agy-os/graphify-out/)). Windows backslashes (`\`) are strictly prohibited.
- Governance script executions (such as `graphify-merge-agy.sh` and hook installations) MUST be explicitly specified using **Git Bash** (`bash`). Running graphify governance scripts via CMD or PowerShell is strictly prohibited.

### 1.2 Access & Directory Boundaries
- Upstream [ECC/](file:///d:/dev/agy-os/ECC/) directory is treated strictly as an isolated, READ-ONLY reference library. Its content is **included** in the graphify scan (read-only file inspection), but no files inside `ECC/` may be created, modified, or deleted.
- Target repository [website](file:///d:/CLAUDE-PROJECT/website) (`d:/CLAUDE-PROJECT/website`) is strictly READ-ONLY. OBJ-05 produces zero patches or modifications targeting `website/`.
- All merger scripts and governance scripts MUST reside under [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/) per AGENTS.md §4.
- Each sub-repo extract MUST write its own `graphify-out/` inside its own directory, **not** into the root `agy-os/graphify-out/`:
  - `ECC/graphify-out/` — isolated per-repo output
  - `OpenSpec/graphify-out/` — isolated per-repo output
  - `frameworks/openspec/graphify-out/` — isolated per-repo output
- Merged unified graph MUST reside at [d:/dev/agy-os/graphify-out/graph.json](file:///d:/dev/agy-os/graphify-out/graph.json).

### 1.3 Documentation Hierarchy & SSOT Invariants
- Exactly ONE Single Source of Truth global PRD exists at [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md).
- Objective suite [docs/OBJ-05/](file:///d:/dev/agy-os/docs/OBJ-05/) consists strictly of `spec.md`, `design.md`, `task.md`, and `artifacts/` (with [docs/OBJ-05/artifacts/proposal-2.md](file:///d:/dev/agy-os/docs/OBJ-05/artifacts/proposal-2.md) as the approved architectural proposal). No `PRD.md` or `prompt.md` files are permitted inside `docs/OBJ-05/` per AGENTS.md §8.

### 1.4 3-Phase Hybrid Execution Model & Session Boundaries
- OBJ-05 SHALL strictly follow the **3-Phase Hybrid Execution Model** defined in [proposal-2.md](file:///d:/dev/agy-os/docs/OBJ-05/artifacts/proposal-2.md):
  - **Phase 1 (Agent Prep)**: Agent wipes stale output and creates all four `.graphifyignore` files and the merge script before any scan occurs.
  - **Phase 2 (User Interactive Scan)**: User triggers graphify extraction commands (`/graphify <path>`) interactively within an active Antigravity session so the host LLM performs Step 5 community labeling and Part B semantic extraction.
  - **Phase 3 (Agent Harness Integration)**: Agent verifies acceptance criteria, registers the MCP server, installs the commit hook, and updates governance rules.
- The `--code-only` flag is explicitly prohibited for initial builds (full pipeline AST + semantic is required).

### 1.5 Pre-Scoping & Output Integrity Invariants
- Pre-scoping via dedicated `.graphifyignore` files in all four repository roots (`agy-os`, `ECC`, `OpenSpec`, `frameworks/openspec`) MUST be in place prior to Phase 2 to prevent scope bleed (oversized graphs).
- The unified [graphify-out/graph.json](file:///d:/dev/agy-os/graphify-out/graph.json) MUST NOT be smaller (fewer nodes) than the prior run, unless a deliberate `--force` rebuild or Phase 1 clean wipe is performed. This is enforced by graphify's shrink-guard (`#479`).
- [graphify-out/GRAPH_REPORT.md](file:///d:/dev/agy-os/graphify-out/GRAPH_REPORT.md) and [graphify-out/wiki/](file:///d:/dev/agy-os/graphify-out/wiki/) MUST exist after the unified build, and community labels MUST be human-readable semantic names (zero `"Community [0-9]+"` generic placeholders in `.graphify_labels.json`).

---

## 2. Requirements

### Requirement: Phase 1 Agent Preparation & Clean Wipe
<!-- id: REQ-01 -->
The system SHALL wipe the existing incomplete/corrupt [graphify-out/](file:///d:/dev/agy-os/graphify-out/) directory and prepare all workspace configuration files before any multi-root interactive scan is initiated.

#### Scenario: Phase 1 Clean State Preparation
<!-- id: REQ-01-S1 -->
- **WHEN** the agent executes Phase 1 setup
- **THEN** `rm -rf d:/dev/agy-os/graphify-out` MUST be run via Git Bash to prevent shrink-guard lock-out
- **AND** `graphify-out/` MUST be completely absent prior to Phase 2 invocation

#### Scenario: Hardcoded Skip Directories & Pre-Scoping Respected
<!-- id: REQ-01-S2 -->
- **WHEN** graphify scans `agy-os/` with `.graphifyignore` configured
- **THEN** dependency directories (`node_modules/`), lock files (`pnpm-lock.yaml`), and nested sub-repos (`ECC/`, `OpenSpec/`, `frameworks/openspec/`) MUST be excluded from the root scan
- **AND** no duplicate scanning across sub-repo boundaries shall occur

---

### Requirement: Multi-Repository `.graphifyignore` Pre-Scoping Configuration
<!-- id: REQ-02 -->
The system SHALL create and maintain dedicated `.graphifyignore` files across all four repositories (`agy-os`, `ECC`, `OpenSpec`, `frameworks/openspec`) during Phase 1 to exclude assets/media binaries (`*.png`, `*.jpg`, `*.svg`, `*.ttf`, `*.woff`), IDE configs, vendor tool directories, and patch staging files, while explicitly keeping `archived-tools/` (in `agy-os`), `.changeset/` (in `OpenSpec`), and `.devcontainer/` (in `OpenSpec`) INCLUDED.

#### Scenario: Sub-Repo Isolation in agy-os Root
<!-- id: REQ-02-S1 -->
- **WHEN** `/graphify d:/dev/agy-os` is triggered at the `agy-os/` root with [d:/dev/agy-os/.graphifyignore](file:///d:/dev/agy-os/.graphifyignore) configured
- **THEN** sub-repositories (`ECC/`, `OpenSpec/`, `frameworks/openspec/`) and patch staging (`harness/patches/`) MUST be excluded from the root scan
- **AND** `archived-tools/` MUST be scanned and included in the root knowledge graph

#### Scenario: Asset & Vendor Exclusions in Sub-Repos
<!-- id: REQ-02-S2 -->
- **WHEN** sub-repos are scanned with their respective `.graphifyignore` files
- **THEN** vendor IDE directories (`.claude/`, `.cursor/`, `.gemini/`, etc.), `assets/`, images, and font files MUST be excluded
- **AND** core skills, rules, agents, workflows, and code MUST be extracted into isolated per-repo `graphify-out/graph.json` files

---

### Requirement: Phase 2 Interactive Multi-Root Full-Pipeline Extract
<!-- id: REQ-03 -->
The system SHALL extract knowledge graphs from all four repositories (`agy-os` root, `ECC/`, `OpenSpec/`, `frameworks/openspec/`) sequentially via user-triggered `/graphify <path>` commands in an active Antigravity session to ensure host LLM availability for Step 5 community labeling and semantic subagent dispatch.

#### Scenario: Interactive Root & Sub-Repo Extraction
<!-- id: REQ-03-S1 -->
- **WHEN** the user triggers `/graphify d:/dev/agy-os`, `/graphify d:/dev/agy-os/ECC`, `/graphify d:/dev/agy-os/OpenSpec`, and `/graphify d:/dev/agy-os/frameworks/openspec` in the chat
- **THEN** graphify MUST execute AST extraction on code files AND semantic extraction on documentation files
- **AND** each sub-repo MUST write its output to its isolated `graphify-out/graph.json` (`ECC/graphify-out/graph.json`, `OpenSpec/graphify-out/graph.json`, `frameworks/openspec/graphify-out/graph.json`)

#### Scenario: Semantic Community Labeling Verification
<!-- id: REQ-03-S2 -->
- **WHEN** Phase 2 extraction completes for any repository
- **THEN** Step 5 LLM labeling MUST populate `graphify-out/.graphify_labels.json` with human-readable semantic names
- **AND** zero entries matching the pattern `"Community [0-9]+"` shall exist in `.graphify_labels.json`

---

### Requirement: Unified Graph Merge & Repository Origin Attribution
<!-- id: REQ-04 -->
The system SHALL merge all four individual repository graphs (agy-os root + ECC + OpenSpec + frameworks/openspec) into a single unified [graphify-out/graph.json](file:///d:/dev/agy-os/graphify-out/graph.json) via `graphify merge-graphs`, executed by [harness/agy-script/graphify-merge-agy.sh](file:///d:/dev/agy-os/harness/agy-script/graphify-merge-agy.sh).

#### Scenario: Merge Produces Cross-Repo Edges with `repo` Attribute
<!-- id: REQ-04-S1 -->
- **WHEN** `harness/agy-script/graphify-merge-agy.sh` is executed after all four repo graphs exist
- **THEN** the unified graph MUST contain nodes from all four repositories, each stamped with its `repo` attribute (`ecc`, `openspec`, `openspec-fw`, or `agy-os`)
- **AND** cross-repo relationships (e.g., ECC skill definition → installed `.agents/skills/` counterpart) MUST be queryable via `graphify path "<source>" "<target>"`

#### Scenario: Merge Script Idempotency & Shrink-Guard Enforcement
<!-- id: REQ-04-S2 -->
- **WHEN** `harness/agy-script/graphify-merge-agy.sh` is executed multiple times
- **THEN** the script MUST exit with code 0 and maintain a non-decreasing node count
- **AND** if an invalid or truncated graph input is provided, the script MUST exit with code 1 without corrupting the existing unified graph

---

### Requirement: Wiki Generation for Agent Navigation
<!-- id: REQ-05 -->
The system SHALL generate a `graphify --wiki` output at [graphify-out/wiki/](file:///d:/dev/agy-os/graphify-out/wiki/) on the unified graph, producing an agent-crawlable `index.md` with semantic community links.

#### Scenario: Wiki Generation on Unified Graph
<!-- id: REQ-05-S1 -->
- **WHEN** `graphify export wiki` or `graphify --wiki` is run after unified merge
- **THEN** [graphify-out/wiki/index.md](file:///d:/dev/agy-os/graphify-out/wiki/index.md) MUST exist and contain links to per-community articles with semantic community titles
- **AND** the [graphify.md](file:///d:/dev/agy-os/.agents/rules/graphify.md) rule MUST instruct agents to navigate `wiki/index.md` before falling back to `graphify query`

---

### Requirement: MCP Server Integration & Commit Hook Installation
<!-- id: REQ-06 -->
The system SHALL register the graphify MCP server in [.mcp.json](file:///d:/dev/agy-os/.mcp.json) and install the post-commit git hook via `graphify hook install` in Phase 3.

#### Scenario: MCP Server Registered and Active Hook
<!-- id: REQ-06-S1 -->
- **WHEN** Phase 3 harness integration is performed by the agent
- **THEN** [.mcp.json](file:///d:/dev/agy-os/.mcp.json) MUST contain the `graphify` entry (`"command": "graphify", "args": ["--mcp"]`)
- **AND** `graphify hook status` MUST return `installed`

---

## 3. Process Flow

1. **Phase 1 — Agent Preparation**:
   - Agent runs `rm -rf d:/dev/agy-os/graphify-out` via Git Bash.
   - Agent creates `.graphifyignore` files in `agy-os/`, `ECC/`, `OpenSpec/`, and `frameworks/openspec/`.
   - Agent creates `harness/agy-script/graphify-merge-agy.sh` and verifies PATH/Python installation.
   - Agent presents User Runbook for Phase 2.

2. **Phase 2 — User Interactive Session Execution**:
   - User triggers `/graphify d:/dev/agy-os` (root scan + Step 5 semantic community labeling).
   - User triggers `/graphify d:/dev/agy-os/ECC`, `/graphify d:/dev/agy-os/OpenSpec`, `/graphify d:/dev/agy-os/frameworks/openspec` sequentially.
   - Agent executes `harness/agy-script/graphify-merge-agy.sh` upon user prompt to produce unified `graphify-out/graph.json`.
   - Agent executes `graphify export wiki` upon user prompt to produce `graphify-out/wiki/index.md`.

3. **Phase 3 — Agent Verification & Harness Integration**:
   - Agent audits all 10 success criteria (SC-01 through SC-10), specifically checking SC-06 (`grep -c "Community [0-9]" graphify-out/.graphify_labels.json` == 0).
   - Agent registers MCP server in `.mcp.json`.
   - Agent installs post-commit hook via `graphify hook install`.
   - Agent updates `.agents/rules/graphify.md` and `docs/PRD.md`.


# Technical Design Document: OBJ-05 Graphify Knowledge Harness

<!--
AI INSTRUCTION:
This template defines the technical architecture and design specifications.
When populating this file:
- Clearly delineate Goals vs Non-Goals to control project scope.
- Provide explicit annotated directory structures and component layouts.
- Detail data models, schemas, and API contracts.
- Explicitly document trade-offs and rationale for key architectural choices using a 4-column table.
- Use forward slashes (/) for all file paths.
- Use clickable file:/// links for all referenced file paths.
-->

## 1. Overview & Architecture Goals

### Context & Failure Analysis
Objective 05 establishes a **unified, multi-root knowledge graph** for the `agy-os` harness, covering all nested repositories (`ECC/`, `OpenSpec/`, `frameworks/openspec/`) alongside the main harness workspace. 

The previous OBJ-05 attempt failed due to a **two-layer architectural defect** identified in [docs/OBJ-05/artifacts/proposal-2.md](file:///d:/dev/agy-os/docs/OBJ-05/artifacts/proposal-2.md):
1. **Layer 1 — Labeling Failure (Step 5)**: When run from a bare terminal background process, graphify's Step 5 community labeling step lacks an active host LLM session, producing generic `"Community 0"`...`"Community 457"` placeholders instead of human-readable semantic names.
2. **Layer 2 — Scope Bleed**: Missing root `.graphifyignore` caused graphify to scan 549 files indiscriminately, generating an oversized 175MB graph that exceeded sub-repo boundaries.

OBJ-05 (Re-Run) corrects this by establishing the **3-Phase Hybrid Execution Model**: Phase 1 Agent Preparation (scoping & wiping), Phase 2 User Interactive Session Extraction (maintaining active LLM session continuity for semantic extraction and Step 5 community labeling), and Phase 3 Agent Harness Integration & Verification.

### Goals / Non-Goals
- **Goals**:
  - Pre-scope all four repositories (`agy-os`, `ECC`, `OpenSpec`, `frameworks/openspec`) via dedicated `.graphifyignore` files in Phase 1.
  - Perform Phase 1 clean wipe of corrupt/incomplete `graphify-out/` to avoid shrink-guard lock-outs.
  - Execute Phase 2 interactive full-pipeline extractions (`/graphify <path>`) within an active Antigravity session to ensure Step 5 semantic community labeling succeeds (zero `"Community N"` generic labels).
  - Merge all four repository graphs into a single unified `graphify-out/graph.json` with `repo` origin attributes (`ecc`, `openspec`, `openspec-fw`, `agy-os`).
  - Generate agent-crawlable wiki (`graphify-out/wiki/index.md`) on the unified graph for O(1) architecture navigation.
  - Register graphify MCP server in `.mcp.json` and install post-commit auto-rebuild hook.
  - Update `.agents/rules/graphify.md` and `docs/PRD.md`.

- **Non-Goals**:
  - Modifying any files inside the read-only upstream reference directory [ECC/](file:///d:/dev/agy-os/ECC/).
  - Modifying the target repository [website/](file:///d:/CLAUDE-PROJECT/website).
  - Generating patches targeting `website/` — OBJ-05 produces zero `.patch` or `.diff` files.
  - Using `--code-only` flag for initial builds (semantic extraction is mandatory for all four repos).
  - Setting up external API keys (`GEMINI_API_KEY`, `GOOGLE_API_KEY`) — active host agent (Antigravity) acts as the semantic LLM backend.

---

## 2. Directory Layout & Component Structure

```text
d:/dev/agy-os/
├── .agents/
│   └── rules/
│       └── graphify.md                  # [MODIFY] Multi-root + wiki + cross-repo path instructions
├── .graphifyignore                       # [NEW] Root-level exclusion patterns (pre-scoping)
├── .mcp.json                             # [MODIFY] Register graphify MCP server entry
├── ECC/
│   ├── .graphifyignore                   # [NEW] ECC sub-repo exclusion patterns
│   └── graphify-out/                     # [NEW] Isolated ECC graph output (from /graphify d:/dev/agy-os/ECC)
│       ├── graph.json
│       ├── GRAPH_REPORT.md
│       └── manifest.json
├── OpenSpec/
│   ├── .graphifyignore                   # [NEW] OpenSpec sub-repo exclusion patterns
│   └── graphify-out/                     # [NEW] Isolated OpenSpec graph output
│       ├── graph.json
│       ├── GRAPH_REPORT.md
│       └── manifest.json
├── frameworks/
│   └── openspec/
│       ├── .graphifyignore               # [NEW] Framework sub-repo exclusion patterns
│       └── graphify-out/                 # [NEW] Isolated frameworks/openspec graph output
│           ├── graph.json
│           ├── GRAPH_REPORT.md
│           └── manifest.json
├── graphify-out/                         # [REBUILD] Unified merged graph (root agy-os + 3 sub-repos)
│   ├── graph.json                        # Merged: all 4 repos, nodes carry `repo` attribute
│   ├── GRAPH_REPORT.md                   # Audit report with semantic community labels + god nodes
│   ├── manifest.json                     # File manifest for incremental update tracking
│   ├── wiki/                             # [NEW] Agent-crawlable wiki output
│   │   ├── index.md                      # Top-level wiki index (community overview with semantic titles)
│   │   └── <community-name>.md           # Per-community knowledge articles
│   ├── .graphify_root                    # Scan root marker
│   ├── .graphify_python                  # Resolved Python interpreter path
│   └── .graphify_analysis.json           # Community detection + god nodes analysis
├── harness/
│   └── agy-script/
│       └── graphify-merge-agy.sh         # [NEW] Merge script for 4-repo graph combination
└── docs/
    ├── PRD.md                            # [MODIFY] Add OBJ-05 section to Strategic Objectives
    └── OBJ-05/                           # Objective 05 documentation suite
        ├── spec.md
        ├── design.md
        ├── task.md
        └── artifacts/
            ├── proposal.md               # Baseline proposal
            └── proposal-2.md             # [APPROVED] 3-Phase Hybrid Execution Proposal
```

---

## 3. Technical Design & Component Specification

### 3.1 Responsibility Matrix (3-Phase Hybrid Execution Model)

Per [proposal-2.md §2](file:///d:/dev/agy-os/docs/OBJ-05/artifacts/proposal-2.md#L81), execution responsibilities are partitioned as follows:

| Phase | Tasks | Owner / Execution Mode | Why |
|---|---|---|---|
| **Phase 1: Agent Prep** | `rm -rf graphify-out/`, write 4 `.graphifyignore` files, write `graphify-merge-agy.sh`, verify PATH & Python | **Agent (Automated)** | Deterministic file & environment preparation before any scan begins. |
| **Phase 2: User Interactive Scan** | `/graphify d:/dev/agy-os`, `/graphify d:/dev/agy-os/ECC`, `/graphify d:/dev/agy-os/OpenSpec`, `/graphify d:/dev/agy-os/frameworks/openspec`, run merge script, export wiki | **User (Interactive Session)** | Requires active Antigravity LLM session host for Step 5 semantic community labeling & subagent dispatch. |
| **Phase 3: Integration & Audit** | Audit 10 acceptance criteria (specifically SC-06 label check), register MCP server, install commit hook, update rules & PRD | **Agent (Automated)** | Deterministic verification, configuration registration, and governance documentation. |

### 3.2 Extraction Pipeline Architecture

Graphify uses a **two-part parallel extraction** per repository:

```text
graphify . / graphify extract <path>  (Triggered interactively in Antigravity session)
         │
         ├── Part A: AST Extraction (parallel)
         │     ├── Input: .js .ts .py .sh .go (code files)
         │     ├── Engine: Python tree-sitter (local, deterministic)
         │     ├── Cost: ZERO tokens — no LLM required
         │     └── Output: .graphify_ast.json
         │
         └── Part B: Semantic Extraction (parallel)
               ├── Input: .md .yaml .txt (documentation files)
               ├── Engine: Subagent dispatched by active host agent (Antigravity session)
               ├── Chunk size: 20-25 files per subagent batch
               ├── Cost: Antigravity subscription tokens (no external API key)
               └── Output: .graphify_semantic.json
         │
         └── Part C: Merge → Build → Cluster → Label (Step 5) → Wiki → HTML
               ├── Step 5: Active Host Agent generates human-readable community labels
               └── Output: graph.json, GRAPH_REPORT.md, wiki/, graph.html
```

### 3.3 Multi-Root Pipeline Sequence

```bash
# Phase 1: Agent Preparation (Git Bash)
rm -rf d:/dev/agy-os/graphify-out
# Agent creates all 4 .graphifyignore files + harness/agy-script/graphify-merge-agy.sh

# Phase 2: User Interactive Session Execution (Chat Commands)
# 1. User runs in Antigravity chat:
/graphify d:/dev/agy-os

# 2. User runs sub-repo scans sequentially:
/graphify d:/dev/agy-os/ECC
/graphify d:/dev/agy-os/OpenSpec
/graphify d:/dev/agy-os/frameworks/openspec

# 3. User prompts Agent to merge:
# Agent runs: bash harness/agy-script/graphify-merge-agy.sh

# 4. User prompts Agent to generate wiki:
# Agent runs: graphify export wiki

# Phase 3: Agent Verification & Integration
# Agent checks SC-06: grep -c "Community [0-9]" graphify-out/.graphify_labels.json == 0
# Agent registers .mcp.json, installs hook, updates graphify.md & PRD.md
```

### 3.4 Per-Repository `.graphifyignore` Architecture

Summary matrix of exclusion strategies per repository (detailed in [proposal.md §3.4](file:///d:/dev/agy-os/docs/OBJ-05/artifacts/proposal.md#L91) and [proposal-2.md §2.1](file:///d:/dev/agy-os/docs/OBJ-05/artifacts/proposal-2.md#L87)):

| Repository | Path | Major Exclusions | Explicit Inclusions | SSOT Reference |
|---|---|---|---|---|
| **agy-os** (root) | `d:/dev/agy-os/.graphifyignore` | Sub-repos (`ECC/`, `OpenSpec/`, `frameworks/openspec/`), `harness/patches/`, system logs, media/fonts | `archived-tools/` | [proposal.md §3.4.1](file:///d:/dev/agy-os/docs/OBJ-05/artifacts/proposal.md) |
| **ECC** (upstream) | `d:/dev/agy-os/ECC/.graphifyignore` | Vendor IDE dirs (`.claude/`, `.cursor/`, `.gemini/`, etc.), `assets/`, media, fonts, binaries | Core skills, rules, agents | [proposal.md §3.4.2](file:///d:/dev/agy-os/docs/OBJ-05/artifacts/proposal.md) |
| **OpenSpec** | `d:/dev/agy-os/OpenSpec/.graphifyignore` | `website/`, `assets/`, media/images | `.changeset/`, `.devcontainer/` | [proposal.md §3.4.3](file:///d:/dev/agy-os/docs/OBJ-05/artifacts/proposal.md) |
| **frameworks/openspec** | `d:/dev/agy-os/frameworks/openspec/.graphifyignore` | `harness/patches/`, `*.patch`, legacy `.agent/` | Core framework code | [proposal.md §3.4.4](file:///d:/dev/agy-os/docs/OBJ-05/artifacts/proposal.md) |

### 3.5 `graphify-merge-agy.sh` Contract

Location: [harness/agy-script/graphify-merge-agy.sh](file:///d:/dev/agy-os/harness/agy-script/graphify-merge-agy.sh)

```bash
#!/usr/bin/env bash
# graphify-merge-agy.sh
# Merges all 4 per-repo graph.json files into the unified agy-os/graphify-out/graph.json
# AGENTS.md §4: All harness scripts reside in harness/agy-script/

set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

graphify merge-graphs \
  "$REPO_ROOT/ECC/graphify-out/graph.json" \
  "$REPO_ROOT/OpenSpec/graphify-out/graph.json" \
  "$REPO_ROOT/frameworks/openspec/graphify-out/graph.json" \
  "$REPO_ROOT/graphify-out/graph.json" \
  --out "$REPO_ROOT/graphify-out/graph.json"

echo "[graphify-merge-agy] Merge complete: $REPO_ROOT/graphify-out/graph.json"
```

### 3.6 Updated `.agents/rules/graphify.md` Content

```markdown
---
trigger: always_on
description: Consult the unified multi-root graphify knowledge graph at graphify-out/ for all
             codebase, architecture, and cross-repo relationship questions.
---

## graphify (Multi-Root Knowledge Harness)

This project has a unified graphify knowledge graph covering 4 repositories:
- `agy-os` (main harness)
- `ECC` (upstream ECC reference)
- `OpenSpec` (upstream OpenSpec)
- `frameworks/openspec` (OpenSpec framework child repo)

Unified graph: graphify-out/graph.json

### Navigation Rules (priority order)
1. If `graphify-out/wiki/index.md` exists → navigate wiki first for broad architecture review
2. For specific concepts: `graphify explain "<concept>"`
3. For relationships: `graphify query "<question>"` (BFS) or `graphify path "<A>" "<B>"`
4. For cross-repo installed vs upstream: `graphify path "ECC/agents/<name>" ".agents/plugin/ecc/agents/<name>"`
5. Read `graphify-out/GRAPH_REPORT.md` ONLY for full architecture review when query/wiki insufficient

### Update Policy
- Post-commit hook auto-rebuilds AST graph after every `git commit` (no action needed)
- For `.md`/doc changes: run `graphify update .` manually (AST-only, zero token)
- For full semantic refresh: run `harness/agy-script/graphify-merge-agy.sh` after major doc changes
```

### 3.7 `.mcp.json` MCP Server Registration

```json
{
  "graphify": {
    "command": "graphify",
    "args": ["--mcp"],
    "cwd": "d:/dev/agy-os"
  }
}
```

---

## 4. Key Design Decisions

| Decision | Selected Option | Rationale | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **Execution Model (ADR-01)** | 3-Phase Hybrid Execution Model | Agent owns Phase 1 prep & Phase 3 verification; User owns Phase 2 interactive session scan so host LLM remains active for Step 5 community labeling & semantic subagent dispatch | Fully automated terminal execution (failed in attempt 1: Step 5 lost LLM context, producing 458 generic `"Community N"` labels) |
| **Pre-Scoping (ADR-02)** | Layered `.graphifyignore` created in Phase 1 | Scopes root scan before execution to prevent scope bleed (549 files -> 175MB graph) | Scanning without `.graphifyignore` (causes shrink-guard lock-out and oversized graphs) |
| **Corpus Wipe (ADR-03)** | `rm -rf graphify-out/` in Phase 1 | Prevents graphify shrink-guard (`#479`) from rejecting valid scoped builds that produce fewer nodes than the corrupt 175MB graph | Preserving old `graphify-out/` (blocks fresh build via shrink-guard rejection) |
| **Extraction Cadence (ADR-04)** | Sequential per-repo interactive scan | Prevents session overload from 4x concurrent subagent dispatches | Parallel background extractions (risks context window overflow and orphaned subagents) |
| **Merge Execution (ADR-05)** | Agent executes `graphify-merge-agy.sh` in Phase 2.5 | `graphify merge-graphs` is a deterministic NetworkX Python operation requiring zero LLM inference | Requiring user to manually run shell script |
| **Wiki Scope (ADR-06)** | `graphify export wiki` on unified merged graph | Ensures wiki index covers all 4 repositories (`ecc`, `openspec`, `openspec-fw`, `agy-os`) | Per-repo wiki generation (loses cross-repo relationship index) |

---

## 5. Non-Destructive Guardrails & Rollback Architecture

### 5.1 Non-Destructive Guarantees
- **`ECC/` is READ-ONLY**: `graphify extract ECC` reads ECC files for graph extraction but writes output **only** to `ECC/graphify-out/` — no modification to any file inside `ECC/` itself.
- **`website/` is untouched**: OBJ-05 produces no patches, no diffs, and no modifications targeting `d:/CLAUDE-PROJECT/website`.
- **`.graphifyignore` is additive-only**: A plain-text file with no destructive side effects. Reverting is `git checkout .graphifyignore` or `rm .graphifyignore`.
- **Sub-repo isolation**: Each `ECC/graphify-out/`, `OpenSpec/graphify-out/`, `frameworks/openspec/graphify-out/` is self-contained. Deleting any one does not affect the others or the root merged graph (only requires a re-merge to regenerate).
- **Shrink-guard**: Graphify's built-in shrink-guard (`#479`) prevents accidental replacement of a larger unified graph with a smaller one without explicit `--force` or Phase 1 wipe.

### 5.2 Rollback Procedures

| Component | Rollback Action | Effect |
|---|---|---|
| `graphify-out/` (unified) | `rm -rf d:/dev/agy-os/graphify-out/` | Removes graph; re-run Phase 1 prep + Phase 2 interactive scan to rebuild |
| `ECC/graphify-out/` | `rm -rf d:/dev/agy-os/ECC/graphify-out/` | Removes ECC graph; re-run `/graphify d:/dev/agy-os/ECC` |
| `OpenSpec/graphify-out/` | `rm -rf d:/dev/agy-os/OpenSpec/graphify-out/` | Removes OpenSpec graph; re-run `/graphify d:/dev/agy-os/OpenSpec` |
| `frameworks/openspec/graphify-out/` | `rm -rf d:/dev/agy-os/frameworks/openspec/graphify-out/` | Removes fw graph; re-run `/graphify d:/dev/agy-os/frameworks/openspec` |
| `.graphifyignore` | `git checkout .graphifyignore` or `rm .graphifyignore` | Restores prior state; no structural impact |
| Post-commit hook | `graphify hook uninstall` | Removes hook from `.git/hooks/post-commit`; no data loss |
| MCP registration | Remove graphify entry from `.mcp.json` | Disables MCP access; graph itself unaffected |
| `harness/agy-script/graphify-merge-agy.sh` | `git checkout harness/agy-script/graphify-merge-agy.sh` or delete file | Script removed; run merge commands manually |

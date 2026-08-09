# Task Checklist for Agent Execution: OBJ-05 Graphify Knowledge Harness

<!--
AI INSTRUCTION:
This file serves as a dynamic, stateful checklist for the AI Agent executing this objective.
When populating or executing this file:
- Break down the work into logical, ordered sub-tasks (`1.1`, `1.2`, etc.).
- The AI Agent MUST process tasks strictly sequentially, resuming execution from the FIRST UNCHECKED checkbox (`- [ ]`).
- Upon completing each sub-task, the AI Agent MUST update the checkbox to checked (`- [x]`).
- Every major task group MUST end with an explicit verification sub-task before proceeding to the next group.
- Do NOT skip verification steps or combine unrelated actions into a single checkbox item.
- Use forward slashes (/) for all file paths and clickable file:/// URIs.
-->

- [x] **Task 1: Phase 1 — Agent Preparation (Agent-Owned)**
  - [x] 1.1 Wipe stale/corrupt `graphify-out/`: run `rm -rf d:/dev/agy-os/graphify-out` via Git Bash to avoid shrink-guard lock-out
  - [x] 1.2 Create [.graphifyignore](file:///d:/dev/agy-os/.graphifyignore) at root `d:/dev/agy-os/` with sub-repo exclusions (`ECC/`, `OpenSpec/`, `frameworks/openspec/`), patch staging, system logs, IDE configs, media/fonts (keeping `archived-tools/` included)
  - [x] 1.3 Create [ECC/.graphifyignore](file:///d:/dev/agy-os/ECC/.graphifyignore) with vendor IDE configs (`.claude/`, `.cursor/`, `.gemini/`, etc.), `assets/`, media, fonts, binaries
  - [x] 1.4 Create [OpenSpec/.graphifyignore](file:///d:/dev/agy-os/OpenSpec/.graphifyignore) with `website/`, `assets/`, media/images (explicitly keeping `.changeset/` and `.devcontainer/` included)
  - [x] 1.5 Create [frameworks/openspec/.graphifyignore](file:///d:/dev/agy-os/frameworks/openspec/.graphifyignore) with `harness/patches/`, `*.patch`, legacy `.agent/`
  - [x] 1.6 Create [harness/agy-script/graphify-merge-agy.sh](file:///d:/dev/agy-os/harness/agy-script/graphify-merge-agy.sh) — idempotent 4-repo merge script with `set -euo pipefail` and exit code 0/1 contract (see [design.md §3.5](file:///d:/dev/agy-os/docs/OBJ-05/design.md))
  - [x] 1.7 Pre-validate Python environment & `graphify` PATH installation via `graphify --version`
  - [x] 1.8 **Verification Step**: Confirm `graphify-out/` is completely absent, all four `.graphifyignore` files exist in their respective directories, and `harness/agy-script/graphify-merge-agy.sh` passes syntax check (`bash -n harness/agy-script/graphify-merge-agy.sh`). Produce User Runbook for Phase 2.


- [ ] **Task 2: Phase 2 — User Interactive Session Extraction & Merge (User-Owned / Active Session)**
  - [ ] 2.1 Trigger root scan interactively: user runs `/graphify .` in Antigravity chat — triggers AST + semantic extraction & Step 5 community labeling
  - [ ] 2.2 Trigger ECC extraction interactively: user runs `/graphify ./ECC` in Antigravity chat — produces isolated [ECC/graphify-out/graph.json](file:///d:/dev/agy-os/ECC/graphify-out/graph.json)
  - [ ] 2.3 Trigger OpenSpec extraction interactively: user runs `/graphify ./OpenSpec` in Antigravity chat — produces isolated [OpenSpec/graphify-out/graph.json](file:///d:/dev/agy-os/OpenSpec/graphify-out/graph.json)
  - [ ] 2.4 Trigger framework extraction interactively: user runs `/graphify ./frameworks/openspec` in Antigravity chat — produces isolated [frameworks/openspec/graphify-out/graph.json](file:///d:/dev/agy-os/frameworks/openspec/graphify-out/graph.json)
  - [ ] 2.5 Run merge script: user prompts agent to run `bash d:/dev/agy-os/harness/agy-script/graphify-merge-agy.sh` — merges all 4 graphs into unified [graphify-out/graph.json](file:///d:/dev/agy-os/graphify-out/graph.json)
  - [ ] 2.6 Generate wiki: user prompts agent to run `graphify export wiki` on unified graph — generates [graphify-out/wiki/index.md](file:///d:/dev/agy-os/graphify-out/wiki/index.md)
  - [ ] 2.7 **Verification Step**: Confirm all three sub-repo `graph.json` files exist and are non-empty, unified `graph.json` contains merged nodes from multiple `repo` values, `graphify-out/wiki/index.md` exists with community links, and `.graphify_labels.json` contains 0 entries matching `"Community [0-9]+"` (SC-06 label check).


- [ ] **Task 3: Phase 3 — Agent Verification & Harness Integration (Agent-Owned)**
  - [ ] 3.1 Audit all 10 success criteria (SC-01 through SC-10 from proposal-2.md §5)
  - [ ] 3.2 Register graphify MCP server in [.mcp.json](file:///d:/dev/agy-os/.mcp.json): add `graphify` entry with `command: "graphify"`, `args: ["--mcp"]`, `cwd: "d:/dev/agy-os"` (see [design.md §3.7](file:///d:/dev/agy-os/docs/OBJ-05/design.md))
  - [ ] 3.3 Install post-commit auto-rebuild hook: `graphify hook install` from `d:/dev/agy-os` via Git Bash
  - [ ] 3.4 Update [.agents/rules/graphify.md](file:///d:/dev/agy-os/.agents/rules/graphify.md) with multi-root instructions, wiki-first navigation priority, cross-repo path examples, and updated update policy (see [design.md §3.6](file:///d:/dev/agy-os/docs/OBJ-05/design.md))
  - [ ] 3.5 Update [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md) — add `### Objective 05 (OBJ-05): Graphify Knowledge Harness` to `## 2. Strategic Objectives` section and add `OBJ-05/` entry to architecture tree
  - [ ] 3.6 **Verification Step (Final Audit)**: Run `graphify path "ECC/agents/planner" ".agents/plugin/ecc/agents/planner"` to confirm cross-repo path resolution. Confirm `graphify hook status` returns `installed`. Run `bash d:/dev/agy-os/harness/agy-script/graphify-merge-agy.sh` a second time to verify idempotency (exit code 0, non-decreasing node count).

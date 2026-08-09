# Proposal: OBJ-05 — Graphify Knowledge Harness

**Author:** Antigravity Agent  
**Date:** 2026-08-01  
**Status:** PROPOSED  
**Objective Suite:** [docs/OBJ-05/](file:///d:/dev/agy-os/docs/OBJ-05/)  
**PRD Reference:** [docs/PRD.md §OBJ-05](file:///d:/dev/agy-os/docs/PRD.md)

---

## 1. Executive Summary

The `agy-os` harness currently has an **incomplete and non-compliant graphify scan** (`graphify-out/` exists but is missing `GRAPH_REPORT.md`, `wiki/`, and `.graphify_python`). More critically, it scans only the main harness root — three nested repositories (`ECC/`, `OpenSpec/`, `frameworks/openspec/`) are invisible to the knowledge graph, making cross-repo relationship queries impossible.

OBJ-05 proposes the **Graphify Knowledge Harness**: a clean revert of the existing incomplete graph, followed by a complete multi-root unified knowledge graph covering all four repositories, integrated into the harness via a wiki output, MCP server registration, and a post-commit auto-rebuild hook.

---

## 2. Problem Statement

| Problem | Impact |
|---|---|
| Existing `graphify-out/` is incomplete (missing GRAPH_REPORT, wiki, Python path) | `graphify query` may fail; rule instruction "navigate wiki first" cannot be followed |
| `ECC/`, `OpenSpec/`, `frameworks/openspec/` are not in the graph | Agents cannot trace how ECC skills/agents map to installed `.agents/` counterparts |
| No `.graphifyignore` | Sub-repo `graphify-out/` directories risk double-counting during root scans |
| Scan not run via Git Bash | Violates AGENTS.md §0 execution invariant |
| No wiki output | Agents must do expensive `graphify query` BFS even for simple architecture questions |
| No commit hook | Agents must manually trigger `graphify update .` or the graph drifts from code |

---

## 3. Proposed Solution Architecture

### 3.1 Repository Scope & Extraction Mode

| Repository | Path | Extraction Mode | Expected Token Cost |
|---|---|---|---|
| **agy-os** (main harness) | `d:/dev/agy-os` | Full pipeline (AST + semantic) | **High** — many SKILL.md, AGENTS.md, spec/design/task files |
| **ECC** | `d:/dev/agy-os/ECC` | Full pipeline (AST + semantic) | **High** — README.md ~106KB, WORKING-CONTEXT.md ~29KB, CONTRIBUTING.md ~14KB |
| **OpenSpec** | `d:/dev/agy-os/OpenSpec` | Full pipeline (AST + semantic) | **Medium** — openspec/, skills/, docs/ |
| **frameworks/openspec** | `d:/dev/agy-os/frameworks/openspec` | Full pipeline (AST + semantic) | **Medium** — AGENTS.md, harness/, openspec/ |

**Semantic backend:** Antigravity host agent (subscription) — no external API key required. Graphify's documented fallback: *"When `GEMINI_API_KEY`/`GOOGLE_API_KEY` are unset, semantic extraction falls to the host agent itself."*

**AST backend:** Python tree-sitter (local, deterministic, zero token cost) — runs in parallel with semantic extraction.

### 3.2 Deliverable Files

| # | File | Status | Description |
|---|---|---|---|
| 1 | [.graphifyignore](file:///d:/dev/agy-os/.graphifyignore) | NEW | Root exclusion: ECC/, OpenSpec/, frameworks/openspec/, patch staging, media/fonts (archived-tools/ included) |
| 2 | [ECC/.graphifyignore](file:///d:/dev/agy-os/ECC/.graphifyignore) | NEW | ECC exclusion: vendor IDE configs (.claude/, .cursor/, etc.), assets/, media, fonts, binaries |
| 3 | [OpenSpec/.graphifyignore](file:///d:/dev/agy-os/OpenSpec/.graphifyignore) | NEW | OpenSpec exclusion: website/, assets/, media (.changeset/ and .devcontainer/ included) |
| 4 | [frameworks/openspec/.graphifyignore](file:///d:/dev/agy-os/frameworks/openspec/.graphifyignore) | NEW | Framework exclusion: harness/patches/, *.patch, .agent/ |
| 5 | [harness/agy-script/graphify-merge-agy.sh](file:///d:/dev/agy-os/harness/agy-script/graphify-merge-agy.sh) | NEW | Idempotent 4-repo merge script |
| 6 | [graphify-out/](file:///d:/dev/agy-os/graphify-out/) | REBUILD | Unified graph: graph.json + GRAPH_REPORT.md + wiki/ |
| 7 | [ECC/graphify-out/](file:///d:/dev/agy-os/ECC/graphify-out/) | NEW | Isolated ECC graph |
| 8 | [OpenSpec/graphify-out/](file:///d:/dev/agy-os/OpenSpec/graphify-out/) | NEW | Isolated OpenSpec graph |
| 9 | [frameworks/openspec/graphify-out/](file:///d:/dev/agy-os/frameworks/openspec/graphify-out/) | NEW | Isolated frameworks/openspec graph |
| 10 | [.agents/rules/graphify.md](file:///d:/dev/agy-os/.agents/rules/graphify.md) | MODIFY | Multi-root + wiki-first navigation |
| 11 | [.mcp.json](file:///d:/dev/agy-os/.mcp.json) | MODIFY | Graphify MCP server registration |
| 12 | [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md) | MODIFY | Add OBJ-05 section |

### 3.3 Execution Pipeline

```
Phase 0: Revert & Root Re-Scan
  └─ rm -rf graphify-out/
  └─ graphify .  (full pipeline on agy-os root)
  └─ ✓ Verify: GRAPH_REPORT.md + graph.json exist

Area 1: Sub-Repo Extraction
  ├─ graphify extract ECC       → ECC/graphify-out/graph.json
  ├─ graphify extract OpenSpec  → OpenSpec/graphify-out/graph.json
  └─ graphify extract frameworks/openspec → frameworks/openspec/graphify-out/graph.json

Merge
  └─ bash harness/agy-script/graphify-merge-agy.sh
  └─ ✓ Verify: cross-repo query returns multi-repo nodes

Harness Integration
  ├─ graphify --wiki   → graphify-out/wiki/index.md
  ├─ .mcp.json update  → graphify MCP entry
  └─ graphify hook install → post-commit AST hook

Documentation
  ├─ .agents/rules/graphify.md update
  └─ docs/PRD.md OBJ-05 section
```

### 3.4 Detailed Per-Repository `.graphifyignore` Specifications (SSOT)

#### 1. Root Harness (`d:/dev/agy-os/.graphifyignore`)
```text
# Sub-repository Isolation (Prevents double scanning during root scan)
ECC/
OpenSpec/
frameworks/openspec/

# Target Patch Staging & Diff Files
harness/patches/
*.patch
*.diff

# System Logs & Scratch Scripts
.system_generated/
scratch/
*.log

# IDE & Tooling Configs
.vscode/
.claude/
.github/

# Media, Assets, Fonts, Binaries & Source Maps
*.png
*.jpg
*.jpeg
*.gif
*.svg
*.webp
*.ico
*.ttf
*.woff
*.woff2
*.wasm
*.map
```
> **Note:** `archived-tools/` is explicitly **INCLUDED** (not ignored) so its tool history remains in the root knowledge graph.

#### 2. Upstream ECC (`d:/dev/agy-os/ECC/.graphifyignore`)
```text
# Graphify Output Directory
graphify-out/

# Vendor & IDE Specific Configuration Directories
.claude/
.claude-plugin/
.codebuddy/
.codex/
.codex-plugin/
.cursor/
.gemini/
.github/
.hermes/
.kimi/
.kiro/
.openclaw/
.opencode/
.qwen/
.trae/
.vscode/
.zed/

# Assets & Media Directories
assets/
*.png
*.jpg
*.jpeg
*.gif
*.svg
*.webp
*.ico

# Fonts, Binaries & Build Maps
*.ttf
*.woff
*.woff2
*.wasm
*.map

# Legacy Shims & Temporary Files
legacy-command-shims/
*.log
```

#### 3. OpenSpec Repo (`d:/dev/agy-os/OpenSpec/.graphifyignore`)
```text
# Graphify Output Directory
graphify-out/

# Website & Marketing Assets
website/
assets/

# Media, Images & SVG Icons
*.png
*.jpg
*.jpeg
*.gif
*.svg
*.webp
*.ico
```
> **Note:** `.changeset/` and `.devcontainer/` are explicitly **INCLUDED** (not ignored) to retain build infrastructure and change spec history in the graph.

#### 4. Frameworks Child Repo (`d:/dev/agy-os/frameworks/openspec/.graphifyignore`)
```text
# Graphify Output Directory
graphify-out/

# Patch Staging & Diff Files
harness/patches/
*.patch
*.diff

# Legacy Agent Directory
.agent/
```

---


## 4. Acceptance Criteria

| # | Criterion | Verification |
|---|---|---|
| AC-01 | `graphify-out/GRAPH_REPORT.md` exists and contains community labels | `ls -la graphify-out/GRAPH_REPORT.md` |
| AC-02 | `graphify-out/wiki/index.md` exists with at least 1 community link | `cat graphify-out/wiki/index.md` |
| AC-03 | `ECC/graphify-out/graph.json`, `OpenSpec/graphify-out/graph.json`, `frameworks/openspec/graphify-out/graph.json` all exist and are non-empty | `ls -la */graphify-out/graph.json` |
| AC-04 | Merged unified graph contains nodes from >1 repository namespace | `graphify query "cross-repo ECC skills"` returns multi-repo results |
| AC-05 | Cross-repo path query resolves | `graphify path "ECC/agents/planner" ".agents/plugin/ecc/agents/planner"` returns a path |
| AC-06 | Post-commit hook installed | `graphify hook status` returns `installed` |
| AC-07 | Merge script is idempotent (exit 0 on re-run, node count non-decreasing) | Run `graphify-merge-agy.sh` twice, compare node counts |
| AC-08 | `.graphifyignore` present and excludes sub-repo outputs from root scan | Verify no `ECC/graphify-out/` nodes appear in `graphify query` results after root-only scan |
| AC-09 | `.agents/rules/graphify.md` contains wiki-first instruction and cross-repo path example | `grep -n "wiki" .agents/rules/graphify.md` |
| AC-10 | All commands executed via Git Bash — no CMD or PowerShell invocations | Code review of task.md execution log |

---

## 5. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| ECC semantic extraction consumes very high tokens (large docs) | High | Medium | Expected and acceptable — ECC docs are large by design. Run in a dedicated session if token budget is a concern. |
| `graphify hook install` incompatible with Git Bash on Windows | Medium | Low | Verify with `graphify hook status` after install; fallback is manual `graphify update .` |
| Merged graph exceeds reasonable size (>100MB) | Medium | Medium | Shrink-guard prevents accidental shrink; if too large, consider `--no-viz` for HTML to reduce output size |
| MCP server startup conflict with existing `.mcp.json` entries | Low | Low | Add entry only if key `graphify` does not already exist; non-destructive append |
| Sub-repo `graphify-out/` output conflicts with host-repo `.gitignore` | Low | Low | Add `ECC/graphify-out/`, `OpenSpec/graphify-out/`, `frameworks/openspec/graphify-out/` to `.gitignore` as part of task 1 setup |

---

## 6. Non-Destructive Guarantee

Per AGENTS.md §4 and OBJ-05 design.md §5:

- **`ECC/` files are never written** — graphify reads ECC for extraction but writes only to `ECC/graphify-out/`
- **`website/` is untouched** — OBJ-05 produces zero patches or modifications
- **All new files are reversible** — `.graphifyignore`, `graphify-merge-agy.sh`, `graphify-out/` can be deleted without any harness functionality loss
- **Hook is removable** — `graphify hook uninstall` cleanly removes the post-commit entry
- **MCP entry is removable** — delete the `graphify` key from `.mcp.json`

---

## 7. References

- [spec.md](file:///d:/dev/agy-os/docs/OBJ-05/spec.md) — Behavioral requirements and WHEN/THEN/AND scenarios
- [design.md](file:///d:/dev/agy-os/docs/OBJ-05/design.md) — Technical architecture, decision table, rollback procedures
- [task.md](file:///d:/dev/agy-os/docs/OBJ-05/task.md) — Sequential execution checklist
- [AGENTS.md](file:///d:/dev/agy-os/AGENTS.md) — Project governance rules
- [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md) — Global product requirements
- [.agents/skills/graphify/SKILL.md](file:///d:/dev/agy-os/.agents/skills/graphify/SKILL.md) — Graphify skill execution specification
- [.agents/skills/graphify/references/github-and-merge.md](file:///d:/dev/agy-os/.agents/skills/graphify/references/github-and-merge.md) — Multi-root merge documentation

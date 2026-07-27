---
title: "Spec-Delta Technical Design: ECC Native Toolkit Integration for Antigravity"
doc_type: "vision"
status: "draft"
author: "explorer"
created_at: "2026-07-28"
updated_at: "2026-07-28"
references:
  - "docs/vision/plans/001-ecc-native-integration/requirements.md"
---

# Design: ECC Native Toolkit Integration for Antigravity

## 1. System Architecture & Topology

The diagram below illustrates the integration pipeline of the ECC Toolkit into `agy-harness` under Approach 4 (Hybrid Native Installer + Selective Custom Mapping):

```
+-----------------------------------------------------------------------------------+
|                                  agy-harness                                      |
|                                                                                   |
|  +----------------------+      +-----------------------------------------------+  |
|  |     ECC/ (Read-Only) |      |     harness/scripts/ecc-integration/          |  |
|  |   Upstream Reference | ---> | (01-patch, 02-dry-run, 03-install, 04-uninst)  |  |
|  +----------------------+      +-----------------------+-----------------------+  |
|                                                        |                          |
|                                                        v                          |
|                                        +-------------------------------+          |
|                                        |  ECC Installer (Node Runtime) |          |
|                                        +---------------+---------------+          |
|                                                        |                          |
|                                                        v                          |
|                                        +-------------------------------+          |
|                                        |         .agents/              |          |
|                                        |  (rules, skills, workflows)   |          |
|                                        +---------------+---------------+          |
|                                                        |                          |
|                                                        v                          |
|                                        +-------------------------------+          |
|                                        | 06-post-install-adapt.ps1     |          |
|                                        | (Tool rewrite & Rule Overlay) |          |
|                                        +-------------------------------+          |
+-----------------------------------------------------------------------------------+
```

---

## 2. Component Breakdown & Data Flow

### A. Toolchain Scripts (`harness/scripts/ecc-integration/`)
1. `01-patch-adapter.ps1`: Applies `harness/patches/ecc-antigravity-adapter-fix.patch` to `ECC/scripts/lib/install-targets/antigravity-project.js`, changing `rootSegments: ['.agent']` to `rootSegments: ['.agents']`.
2. `02-dry-run-install.ps1`: Runs `node ECC/scripts/install-apply.js --target antigravity --profile minimal --modules agentic-patterns,security --dry-run --json` and saves preview output to `output/dry-run-result.json`.
3. `03-install-ecc.ps1`: Executes actual installation into `.agents/`.
4. `04-uninstall-ecc.ps1`: Runs `node ECC/scripts/uninstall.js --target antigravity` for clean rollback.
5. `05-reinstall-patched.ps1`: Runs uninstall, re-applies patch, and re-installs for deterministic execution.
6. `06-post-install-adapt.ps1`: Executes `node ECC/scripts/gemini-adapt-agents.js .agents/skills/`, overlays `config/harness-rules-overlay.md`, and maps agent roles to `AGENTS.md`.

---

## 3. Trade-Off Analysis & Options

- **Option A (Pure Native Copy)**: Manually copy files from `ECC/` to `.agents/` without running the installer.
  - *Pros*: Simple, no patch required.
  - *Cons*: Loses `ecc-install-state.json` lifecycle tracking, cannot perform clean uninstall or automated sync on upstream update.
- **Option B (Standard ECC Install)**: Run `install.ps1 --target antigravity` without patching.
  - *Pros*: No file modification in `ECC/`.
  - *Cons*: Writes to deprecated `.agent/` (singular) which Antigravity 2.0 ignores.
- **Selected Approach (Option C / Approach 4)**: Hybrid patched installer with post-install custom mapping.
  - *Rationale*: Maintains `ecc-install-state.json` lifecycle tracking, writes directly to `.agents/`, and ensures 100% tool name and rule alignment with Antigravity harness governance.

---

## 4. Architectural Decision Records (ADR Governance Alignment)

This design adheres to existing decision records:
- **ADR-001**: Documentation-Driven Framework (DDF) structure and frontmatter validation.
- **ADR-004**: Spec-Delta Increment Pipeline and 3-file bundle layout.

---
title: "Spec-Delta Requirements: ECC Native Toolkit Integration for Antigravity"
doc_type: "vision"
status: "draft"
author: "explorer"
created_at: "2026-07-28"
updated_at: "2026-07-28"
references:
  - "docs/vision/harness-mission.md"
---

# Requirements: ECC Native Toolkit Integration for Antigravity

## 1. Overview

This Spec-Delta increment (`001-ecc-native-integration`) formalizes the integration of the upstream **ECC Agentic Toolkit** (`ECC/`) into the `agy-harness` workspace operating system as a native Antigravity 2.0 configuration under `.agents/`.

This increment fulfills **Objective 1** of the macro vision (`docs/vision/harness-mission.md` / `VIS-001`): *Harness-Native Operating System for Agentic Work*.

---

## 2. Functional Requirements

- **FR-1**: **Adapter Target Patching**: The ECC installer adapter `antigravity-project.js` must be patched so that `--target antigravity` resolves to `.agents/` (plural, Antigravity 2.0 standard) rather than `.agent/` (singular, deprecated).
- **FR-2**: **Selective Module Installation**: The ECC installation must execute using `--profile minimal` (5 core modules: `rules-core`, `agents-core`, `commands-core`, `platform-configs`, `workflow-quality`) plus explicitly selected modules `agentic-patterns` and `security`.
- **FR-3**: **Full Custom Post-Install Mapping**:
  - Rewriting agent tool calls from Claude-style (`Read`, `Write`, `Edit`, `Bash`, `Grep`) to Antigravity 2.0 native tool calls (`read_file`, `write_file`, `replace`, `run_shell_command`, `grep_search`).
  - Overlaying harness-specific boundary constraints (READ-ONLY target repo `d:/CLAUDE-PROJECT/website`, patch-only delivery) as a higher-priority layer over ECC rules.
  - Aligning agent roles with harness roles (`explorer`, `builder`, `patch-builder`, `reviewer`).
- **FR-4**: **Reusable Integration Toolchain**: All integration steps (patching, dry-run, installation, uninstallation, reinstall, and post-install adaptation) must be encapsulated as a reusable PowerShell toolchain under `harness/scripts/ecc-integration/`.

---

## 3. Non-Functional Requirements

- **NFR-1**: **Target Repo Immutability**: The target repository `d:/CLAUDE-PROJECT/website` must remain strictly untouched and READ-ONLY during all setup and execution steps.
- **NFR-2**: **Baseline Verification**: Target repo immutability must be verified against `harness/.target-baseline`.
- **NFR-3**: **DDF Compliance & Script Enforcement**: All frontmatter schemas, path constraints (forward slashes), and document coupling rules must pass mechanical validation via `harness/scripts/ddf-validate.sh` and `harness/scripts/ddf-gate.sh`.

---

## 4. Acceptance Criteria

- [ ] **AC-1**: Patch file `harness/patches/ecc-antigravity-adapter-fix.patch` correctly redirects ECC target path to `.agents/`.
- [ ] **AC-2**: Dry-run script `harness/scripts/ecc-integration/02-dry-run-install.ps1` executes cleanly and outputs valid JSON execution plan.
- [ ] **AC-3**: ECC components are installed into `.agents/` and post-install script `06-post-install-adapt.ps1` rewrites all tool names and applies harness rule overlays.
- [ ] **AC-4**: `harness/scripts/ddf-validate.sh` reports 0 errors across all Spec-Delta, Change Record, and Decision Record documents.

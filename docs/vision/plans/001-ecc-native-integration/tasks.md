---
title: "Spec-Delta Task Checklist: ECC Native Toolkit Integration for Antigravity"
doc_type: "vision"
status: "draft"
author: "explorer"
created_at: "2026-07-28"
updated_at: "2026-07-28"
references:
  - "docs/vision/plans/001-ecc-native-integration/design.md"
---

# Tasks: ECC Native Toolkit Integration for Antigravity

## 1. Stage 1: Explorer Phase (Requirements & Architectural Setup)

- [x] Task 1.1: Audit upstream ECC installer components (`manifests/`, `scripts/`, `install-targets/`) and identify target root mismatch (`.agent/` vs `.agents/`).
- [x] Task 1.2: Perform `/grill-me` alignment interview to determine Approach 4 integration parameters (profile `minimal`, modules `agentic-patterns` & `security`, patch-based adapter fix, ECC-first overlay strategy).
- [x] Task 1.3: Initialize Spec-Delta 3-file bundle (`requirements.md`, `design.md`, `tasks.md`) under `docs/vision/plans/001-ecc-native-integration/`.
- [x] Task 1.4: Initialize Parent Change Record `CHG-001-ecc-native-integration.md` bound to `ADR-001` and `ADR-004`.

## 2. Stage 2: Builder Phase (Implementation & Execution Pipeline)

### Phase 2.1: Reusable Toolchain Scaffolding
- [ ] Task 2.1.1: Create toolchain directory structure at `harness/scripts/ecc-integration/`.
- [ ] Task 2.1.2: Create harness rule overlay config file `harness/scripts/ecc-integration/config/harness-rules-overlay.md` specifying target repo READ-ONLY boundaries and patch-staging rules.
- [ ] Task 2.1.3: Write `harness/scripts/ecc-integration/README.md` documenting toolchain architecture and CLI usage.

### Phase 2.2: ECC Target Adapter Patching
- [ ] Task 2.2.1: Generate patch file `harness/patches/ecc-antigravity-adapter-fix.patch` targeting `ECC/scripts/lib/install-targets/antigravity-project.js` (`rootSegments: ['.agent']` $\rightarrow$ `['.agents']`).
- [ ] Task 2.2.2: Implement `harness/scripts/ecc-integration/01-patch-adapter.ps1` to safely apply and verify the adapter patch.

### Phase 2.3: Dry-Run Installation & Verification
- [ ] Task 2.3.1: Implement `harness/scripts/ecc-integration/02-dry-run-install.ps1` executing `node ECC/scripts/install-apply.js --target antigravity --profile minimal --modules agentic-patterns,security --dry-run --json`.
- [ ] Task 2.3.2: Save and inspect dry-run output JSON at `harness/scripts/ecc-integration/output/dry-run-result.json`.

### Phase 2.4: Actual ECC Native Installation
- [ ] Task 2.4.1: Implement `harness/scripts/ecc-integration/03-install-ecc.ps1` to execute real installation into `.agents/`.
- [ ] Task 2.4.2: Execute `03-install-ecc.ps1` and verify creation of `.agents/rules/`, `.agents/workflows/`, `.agents/skills/`, and `.agents/ecc-install-state.json`.

### Phase 2.5: Lifecycle Rollback & Reinstall Automation
- [ ] Task 2.5.1: Implement `harness/scripts/ecc-integration/04-uninstall-ecc.ps1` calling `node ECC/scripts/uninstall.js --target antigravity`.
- [ ] Task 2.5.2: Implement `harness/scripts/ecc-integration/05-reinstall-patched.ps1` orchestrating clean uninstall $\rightarrow$ re-patch $\rightarrow$ re-install cycle.

### Phase 2.6: Post-Install Adaptation (Full Custom Mapping)
- [ ] Task 2.6.1: Implement `harness/scripts/ecc-integration/06-post-install-adapt.ps1` supporting `--dry-run` and live execution modes.
- [ ] Task 2.6.2: Execute tool name rewrite using `node ECC/scripts/gemini-adapt-agents.js .agents/skills/` (`Read` $\rightarrow$ `read_file`, `Write` $\rightarrow$ `write_file`, `Edit` $\rightarrow$ `replace`, `Bash` $\rightarrow$ `run_shell_command`, `Grep` $\rightarrow$ `grep_search`).
- [ ] Task 2.6.3: Overlay harness-specific governance rules (`harness-rules-overlay.md`) over installed ECC rules and restore `RULES.md` as higher-priority layer.
- [ ] Task 2.6.4: Generate role-aligned agent definitions (`.agents/agents/explorer.md`, `builder.md`, `patch-builder.md`, `reviewer.md`).

## 3. Stage 3: Reviewer Phase (Quality Assurance & Empirical Audit)

- [ ] Task 3.1: Audit `.agents/skills/` to confirm zero Claude-style tool names remain in frontmatter or instruction bodies.
- [ ] Task 3.2: Verify target repository `d:/CLAUDE-PROJECT/website` immutability using `git status` and baseline snapshot comparison against `harness/.target-baseline`.
- [ ] Task 3.3: Execute `harness/scripts/ddf-validate.sh` and confirm zero schema, path, or coupling errors.
- [ ] Task 3.4: Execute `harness/scripts/ddf-index-sync.sh` to update derived indexes `docs/changes/index.md` and `docs/decisions/index.md`.

## 4. Stage 4: Auditor Phase (Governance Sign-off & Archival)

- [ ] Task 4.1: Perform final DDF gate audit using `harness/scripts/ddf-gate.sh`.
- [ ] Task 4.2: Advance `CHG-001` frontmatter status to `completed` (`owner_stage: auditor`).
- [ ] Task 4.3: Execute `harness/scripts/ddf-archive.sh` to automatically move `docs/vision/plans/001-ecc-native-integration/` to `docs/vision/plans/archive/001-ecc-native-integration/` and archive `CHG-001`.

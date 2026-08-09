# OpenAGY Behavioral Specification: OBJ-08 Personal Local Product CLI Runner & Multi-Repo Productization (`agy-harness`)

<!--
AI INSTRUCTION:
This specification defines behavioral requirements and system constraints for OBJ-08.
- Each requirement uses `### Requirement: <Name>` with SHALL statements.
- Scenarios use `#### Scenario: <Name>` with WHEN/THEN/AND bullets.
- Every requirement carries a unique `<!-- id: obj08-req-N -->` anchor.
- Every scenario carries a unique `<!-- id: obj08-sc-N-M -->` anchor.
- All file paths use forward slashes (/) and clickable file:/// URIs.
-->

## 1. Scope & System Constraints

### 1.1 Path Formatting & Shell Execution Invariants
- All file paths in configuration files, scripts, CLI parameters, and documentation MUST strictly use forward-slash format (e.g., `d:/dev/agy-os`, `d:/dev/agy-os/frameworks/openspec`). Windows backslashes (`\`) are strictly prohibited.
- CLI commands and automated tooling MUST strictly execute using **Git Bash** (`bash`). Running scripts via CMD or PowerShell is strictly prohibited.
- Target paths MUST be normalized to forward-slash format using `.replace(/\\/g, '/')` or `tr '\\' '/'` before any file system operation.

### 1.2 Access & Directory Boundaries
- Upstream [ECC](file:///d:/dev/agy-os/ECC) directory is strictly READ-ONLY.
- Target repository [website](file:///d:/CLAUDE-PROJECT/website) remains strictly READ-ONLY.
- All product CLI executable scripts MUST reside in [harness/bin/agy-harness.sh](file:///d:/dev/agy-os/harness/bin/agy-harness.sh).
- Primary rollout target MUST reside at [frameworks/openspec](file:///d:/dev/agy-os/frameworks/openspec).

---

## 2. Requirements

<!-- id: obj08-req-1 -->
### Requirement: Portable Unified CLI Runner (`agy-harness.sh`)

[harness/bin/agy-harness.sh](file:///d:/dev/agy-os/harness/bin/agy-harness.sh) SHALL serve as the unified CLI runner for personal local product deployment, accepting subcommands `deploy` (or `install`), `verify` (or `audit`), `uninstall` (or `clean`), and `status`, passing `--target-dir <path>` forward to the underlying installer suite in [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/).

<!-- id: obj08-sc-1-1 -->
#### Scenario: Executing `agy-harness deploy` against a target directory
- **WHEN** user executes `bash harness/bin/agy-harness.sh deploy --target-dir d:/dev/agy-os/frameworks/openspec`
- **THEN** `agy-harness.sh` delegates to `harness/agy-script/install-agy.sh --target-dir d:/dev/agy-os/frameworks/openspec`
- **AND** scaffolds `.agents/` inside `frameworks/openspec`, deploying all baseline rules, agents, skills, workflows, hooks, runtime scripts, and `ecc-items.json`

<!-- id: obj08-sc-1-2 -->
#### Scenario: Executing `agy-harness verify` against a target directory
- **WHEN** user executes `bash harness/bin/agy-harness.sh verify --target-dir d:/dev/agy-os/frameworks/openspec`
- **THEN** `agy-harness.sh` delegates to `harness/agy-script/scripts/verify-installation-agy.js --target-dir d:/dev/agy-os/frameworks/openspec`
- **AND** validates 100% baseline parity against `frameworks/openspec/.agents/ecc-items.json`, exiting with code 0

<!-- id: obj08-sc-1-3 -->
#### Scenario: Executing `agy-harness status` against a target directory
- **WHEN** user executes `bash harness/bin/agy-harness.sh status --target-dir d:/dev/agy-os/frameworks/openspec`
- **THEN** `agy-harness.sh` outputs a summary report displaying baseline item counts and listing local custom extensions

<!-- id: obj08-sc-1-4 -->
#### Scenario: Executing `agy-harness uninstall` against a target directory
- **WHEN** user executes `bash harness/bin/agy-harness.sh uninstall --target-dir d:/dev/agy-os/frameworks/openspec`
- **THEN** `agy-harness.sh` delegates to `harness/agy-script/uninstall-agy.sh --target-dir d:/dev/agy-os/frameworks/openspec`
- **AND** non-destructively removes `frameworks/openspec/.agents/` without touching project code

---

<!-- id: obj08-req-2 -->
### Requirement: Hybrid Custom Item Architecture & Non-Destructive Sync

The CLI installer SHALL implement a Hybrid Custom Item Architecture where master baseline items from `agy-os` are deployed 1:1, while local custom rules and skills inside target standard paths (`.agents/rules/`, `.agents/skills/`, `.agents/agents/`, `.agents/workflows/`) are preserved during deployment and audited as `[LOCAL EXTENSION]` during verification.

<!-- id: obj08-sc-2-1 -->
#### Scenario: Preserving local target custom skills during `deploy`
- **WHEN** a target directory contains a local custom skill at `<target-dir>/.agents/skills/custom-project-skill/SKILL.md`
- **THEN** `agy-harness deploy --target-dir <path>` updates all master baseline skills
- **AND** does NOT delete or alter `custom-project-skill/SKILL.md`

<!-- id: obj08-sc-2-2 -->
#### Scenario: Auditing local extensions during `verify`
- **WHEN** `agy-harness verify --target-dir <path>` audits a target directory containing local custom items
- **THEN** all baseline master items listed in `ecc-items.json` are verified with `✓ [MATCH]`
- **AND** extra local custom items in `.agents/skills/` or `.agents/rules/` are reported with `ℹ [LOCAL EXTENSION]` without failing the baseline parity verification

---

<!-- id: obj08-req-3 -->
### Requirement: Production Target Rollout to OpenSpec Framework

The CLI runner SHALL successfully deploy `.agents/` to [frameworks/openspec](file:///d:/dev/agy-os/frameworks/openspec) and achieve 100% baseline parity verification.

<!-- id: obj08-sc-3-1 -->
#### Scenario: Rolling out and verifying OpenSpec framework target
- **WHEN** `bash harness/bin/agy-harness.sh deploy --target-dir d:/dev/agy-os/frameworks/openspec` completes execution
- **THEN** [frameworks/openspec/.agents/](file:///d:/dev/agy-os/frameworks/openspec/.agents/) contains the complete 1:1 baseline asset surface
- **AND** `bash harness/bin/agy-harness.sh verify --target-dir d:/dev/agy-os/frameworks/openspec` exits with code 0

---

<!-- id: obj08-req-4 -->
### Requirement: 3-Case Test Matrix Verification Across Test Repositories

The CLI installer suite SHALL execute and validate test coverage across three distinct target repository state cases:

1. **Case 1 ([test/repo-experiment-01](file:///d:/dev/agy-os/test/repo-experiment-01))**: Previously installed repository where custom agents/items (e.g., `.agents/agents/custom-agent-01/agent.md`) are added post-install.
2. **Case 2 ([test/repo-experiment-02](file:///d:/dev/agy-os/test/repo-experiment-02))**: Uninstalled repository that already contains pre-existing custom agents/items (e.g., `.agents/agents/custom-agent-02/agent.md`) prior to first installation.
3. **Case 3 ([test/repo-experiment-03](file:///d:/dev/agy-os/test/repo-experiment-03))**: Clean uninstalled repository with no prior `.agents/` directory or custom items.

<!-- id: obj08-sc-4-1 -->
#### Scenario: Case 1 Verification on `test/repo-experiment-01` (Post-install custom agent addition)
- **WHEN** `bash harness/bin/agy-harness.sh deploy --target-dir d:/dev/agy-os/test/repo-experiment-01` runs against an already-installed repo containing a custom agent `.agents/agents/custom-agent-01/agent.md`
- **THEN** all master baseline items are updated 1:1, and `custom-agent-01/agent.md` is preserved without deletion
- **AND** `bash harness/bin/agy-harness.sh verify --target-dir d:/dev/agy-os/test/repo-experiment-01` verifies 100% baseline parity (exit code 0) and reports `custom-agent-01` as `ℹ [LOCAL EXTENSION]`

<!-- id: obj08-sc-4-2 -->
#### Scenario: Case 2 Verification on `test/repo-experiment-02` (Uninstalled repo with pre-existing custom agent)
- **WHEN** `bash harness/bin/agy-harness.sh deploy --target-dir d:/dev/agy-os/test/repo-experiment-02` runs against a repo containing pre-existing custom agent `.agents/agents/custom-agent-02/agent.md` before first install
- **THEN** `.agents/` is scaffolded, all baseline master items are deployed, and pre-existing `custom-agent-02/agent.md` is preserved
- **AND** `bash harness/bin/agy-harness.sh verify --target-dir d:/dev/agy-os/test/repo-experiment-02` exits with code 0 and reports `custom-agent-02` as `ℹ [LOCAL EXTENSION]`

<!-- id: obj08-sc-4-3 -->
#### Scenario: Case 3 Verification on `test/repo-experiment-03` (Fresh clean repo install)
- **WHEN** `bash harness/bin/agy-harness.sh deploy --target-dir d:/dev/agy-os/test/repo-experiment-03` runs against a clean repo with no `.agents/` directory
- **THEN** `.agents/` is scaffolded from scratch and all baseline master items are deployed with 100% 1:1 parity
- **AND** `bash harness/bin/agy-harness.sh verify --target-dir d:/dev/agy-os/test/repo-experiment-03` exits with code 0 with 0 missing and 0 extra items

---

## 3. Process Flow

1. **Step 1 — CLI Entrypoint Implementation**: Create [harness/bin/agy-harness.sh](file:///d:/dev/agy-os/harness/bin/agy-harness.sh) supporting `deploy`, `verify`, `uninstall`, and `status` subcommands.
2. **Step 2 — Hybrid Sync Engine & Audit Verification Updates**: Update [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) to preserve target custom items non-destructively and update [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) to audit extra items as `ℹ [LOCAL EXTENSION]`.
3. **Step 3 — 3-Case Test Matrix Execution**: Validate Case 1 ([test/repo-experiment-01](file:///d:/dev/agy-os/test/repo-experiment-01)), Case 2 ([test/repo-experiment-02](file:///d:/dev/agy-os/test/repo-experiment-02)), and Case 3 ([test/repo-experiment-03](file:///d:/dev/agy-os/test/repo-experiment-03)) test matrix against non-destructive sync logic and parity checks.
4. **Step 4 — Production Target Rollout**: Deploy `.agents/` to [frameworks/openspec](file:///d:/dev/agy-os/frameworks/openspec) via `agy-harness deploy` and verify 100% parity with `agy-harness verify`.
5. **Step 5 — Documentation Verification & PRD Update**: Verify SSOT documentation integrity, ensure clickable `file:///` URIs, and update [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md).

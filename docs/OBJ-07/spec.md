# OpenAGY Behavioral Specification: OBJ-07 Multi-Repository Custom Installer & Adapter Isolation

<!--
AI INSTRUCTION:
This specification defines behavioral requirements and system constraints for OBJ-07.
- Each requirement uses `### Requirement: <Name>` with SHALL statements.
- Scenarios use `#### Scenario: <Name>` with WHEN/THEN/AND bullets.
- Every requirement carries a unique `<!-- id: obj07-req-N -->` anchor.
- Every scenario carries a unique `<!-- id: obj07-sc-N-M -->` anchor.
- All file paths use forward slashes (/) and clickable file:/// URIs.
-->

## 1. Scope & System Constraints

### 1.1 Path Formatting & Shell Execution Invariants
- All file paths in configuration files, scripts, metadata, change records, and documentation MUST strictly use forward-slash format (e.g., `d:/dev/agy-os`, `test/repo-experiment-01`). Windows backslashes (`\`) are strictly prohibited.
- Shell commands and automated tooling MUST strictly execute using **Git Bash** (`bash`). Running scripts via CMD or PowerShell is strictly prohibited.
- All resolved target directory paths MUST be normalized to forward-slash format using `.replace(/\\/g, '/')` before any file system operation.

### 1.2 Access & Directory Boundaries
- Upstream [ECC](file:///d:/dev/agy-os/ECC) directory is treated strictly as READ-ONLY. No files inside `ECC/` may be created, altered, or deleted.
- Target repository [website](file:///d:/CLAUDE-PROJECT/website) (`d:/CLAUDE-PROJECT/website`) is strictly READ-ONLY; direct edits, file creations, or deletions are strictly prohibited.
- All harness modifications MUST reside inside the [agy-os](file:///d:/dev/agy-os) workspace.
- Custom installer scripts MUST reside in [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/).
- The test sandbox MUST reside at [test/repo-experiment-01](file:///d:/dev/agy-os/test/repo-experiment-01) and be committed to the `agy-os` repository.

### 1.3 Multi-Repository Isolation Invariants
- When `--target-dir <path>` is specified, the installer MUST write ALL assets exclusively into `<target-dir>/.agents/`. No assets are ever written outside the designated `<target-dir>` boundary.
- The master harness [agy-os](file:///d:/dev/agy-os) `.agents/` directory MUST remain completely untouched when installing into an external `--target-dir`.
- When `--target-dir` is omitted, all scripts MUST fall back to the current working directory (`.`) as the target, preserving 100% backward compatibility with the master harness installation behaviour.
- The `ecc-items.json` reference baseline MUST be copied into `<target-dir>/.agents/ecc-items.json` during installation. The verification script reads this self-contained copy for `--target-dir` runs.

---

## 2. Requirements

<!-- id: obj07-req-1 -->
### Requirement: `--target-dir` CLI Parameter Acceptance Across All Installer Scripts

All five installer and verification scripts SHALL accept `--target-dir <path>` as a CLI parameter: [install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh), [uninstall-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-agy.sh), [post-install-agy.js](file:///d:/dev/agy-os/harness/agy-script/post-install-agy.js), [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js), and [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js). When `--target-dir` is omitted, each script SHALL default to the current working directory (`.`) to maintain backward compatibility.

<!-- id: obj07-sc-1-1 -->
#### Scenario: Parsing `--target-dir` with an absolute path

- **WHEN** a script receives `--target-dir d:/dev/agy-os/test/repo-experiment-01` as a CLI argument
- **THEN** the script resolves the provided path using `path.resolve(targetDirArg).replace(/\\/g, '/')` to produce a normalized absolute forward-slash path
- **AND** uses that resolved path as the root for all `.agents/` directory derivation throughout its execution

<!-- id: obj07-sc-1-2 -->
#### Scenario: Defaulting to CWD when `--target-dir` is omitted

- **WHEN** a script is executed without the `--target-dir` argument
- **THEN** the script derives its installation root identically to its pre-OBJ-07 behaviour (using `path.resolve(__dirname, '../..')` or equivalent `SCRIPT_DIR`-based derivation)
- **AND** no change in file layout, path resolution, or output is observable compared to a pre-OBJ-07 run against the master harness

<!-- id: obj07-sc-1-3 -->
#### Scenario: Normalizing the resolved target path to forward-slash format

- **WHEN** the `--target-dir` path is resolved (whether absolute or relative)
- **THEN** all backslashes (`\`) in the resolved path string are replaced with forward slashes (`/`) before any file system operation
- **AND** all derived child paths (e.g., `<targetDir>/.agents/rules/`, `<targetDir>/.agents/agents/`) use this normalized root as their prefix

---

<!-- id: obj07-req-2 -->
### Requirement: Target Directory `.agents/` Scaffold & Full Asset Deployment

When `--target-dir <path>` is provided, [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) SHALL scaffold the complete `.agents/` directory tree inside `<target-dir>` and deploy all ECC component assets (33 rules, 31 agents, 42 skills, 32 workflows, `hooks.json`, runtime scripts, and the `ecc-items.json` reference file) with 100% 1:1 parity compared to the master harness installation.

<!-- id: obj07-sc-2-1 -->
#### Scenario: Scaffolding the full `.agents/` directory tree under the target directory

- **WHEN** [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) begins installation with `--target-dir <path>`
- **THEN** the following directories are created inside `<target-dir>` if they do not already exist: `.agents/agents/`, `.agents/rules/`, `.agents/skills/`, `.agents/workflows/`, `.agents/scripts/`, `.agents/scripts/lib/`
- **AND** no directories or files are created outside the `<target-dir>/.agents/` boundary

<!-- id: obj07-sc-2-2 -->
#### Scenario: Deploying the `ecc-items.json` reference baseline into the target directory

- **WHEN** the installer successfully completes asset deployment into `<target-dir>/.agents/`
- **THEN** [harness/ecc-items.json](file:///d:/dev/agy-os/harness/ecc-items.json) is copied to `<target-dir>/.agents/ecc-items.json`
- **AND** this self-contained copy is the exclusive reference file used by `verify-installation-agy.js --target-dir <path>` during compliance verification

<!-- id: obj07-sc-2-3 -->
#### Scenario: Deploying runtime scripts self-contained into `<target-dir>/.agents/scripts/`

- **WHEN** the installer deploys assets into `<target-dir>/.agents/`
- **THEN** all runtime scripts from [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) (including `pre-tool-guardrail-agy.js`, `observation-envelope-agy.js`) and all shared libraries from [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/) are copied into `<target-dir>/.agents/scripts/` and `<target-dir>/.agents/scripts/lib/` respectively
- **AND** the deployed scripts contain zero hardcoded absolute paths referencing the master harness (`d:/dev/agy-os`)

<!-- id: obj07-sc-2-4 -->
#### Scenario: Fail-Fast exit on any scaffold or copy failure

- **WHEN** any directory scaffold or file copy operation fails during `--target-dir` installation
- **THEN** the installer immediately halts execution with exit code 1 and outputs the failed operation path
- **AND** no partial `.agents/` structure is left in an inconsistent state — the installer aborts before any cleanup of source files

---

<!-- id: obj07-req-3 -->
### Requirement: Committed Test Sandbox Initialization

A minimal committed test repository at [test/repo-experiment-01](file:///d:/dev/agy-os/test/repo-experiment-01) SHALL provide a clean, isolated target for end-to-end multi-repository installer validation. The sandbox MUST contain only the three required scaffold files and MUST NOT contain any `.agents/` directory in its committed state.

<!-- id: obj07-sc-3-1 -->
#### Scenario: Validating test sandbox scaffold files exist

- **WHEN** the test sandbox initialization task (Task 1) is complete
- **THEN** the following files exist inside [test/repo-experiment-01](file:///d:/dev/agy-os/test/repo-experiment-01):
  - `package.json` — content: `{ "name": "repo-experiment-01", "version": "1.0.0", "private": true }`
  - `.gitignore` — content: `node_modules/\n.DS_Store`
  - `README.md` — content: `# Test Repo Experiment 01`
- **AND** no `.agents/` directory exists in the committed state of `test/repo-experiment-01`

<!-- id: obj07-sc-3-2 -->
#### Scenario: Running full installation against the test sandbox

- **WHEN** the end-to-end test (Task 4) executes the multi-repo installer via Git Bash:
  ```bash
  bash harness/agy-script/install-agy.sh --target-dir d:/dev/agy-os/test/repo-experiment-01
  ```
- **THEN** the installer scaffolds `.agents/` inside `test/repo-experiment-01`, deploys all ECC components, copies runtime scripts, and copies `ecc-items.json`
- **AND** the master harness `.agents/` directory at `d:/dev/agy-os/.agents/` is left completely untouched throughout this operation

---

<!-- id: obj07-req-4 -->
### Requirement: 1:1 Installation Parity Compliance Verification

[verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) SHALL accept `--target-dir <path>`, read `<target-dir>/.agents/ecc-items.json` as its reference baseline, and verify 100% physical disk parity across all 6 component kinds (rules: 33, agents: 31, commands: 32, hooks: 1, skills: 42, platform: 3) with Fail-Fast exit code 1 on any discrepancy and exit code 0 on full parity.

<!-- id: obj07-sc-4-1 -->
#### Scenario: Reading the self-contained `ecc-items.json` from the target directory

- **WHEN** [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) is executed with `--target-dir <path>`
- **THEN** the script resolves the reference JSON path as `<targetDir>/.agents/ecc-items.json`
- **AND** parses and extracts item lists for all 6 kinds (`rules`, `agents`, `commands`, `hooks`, `skills`, `platform`) from this self-contained file

<!-- id: obj07-sc-4-2 -->
#### Scenario: Verifying 100% component parity in the target directory and exiting with code 0

- **WHEN** all expected component items are confirmed physically present in `<target-dir>/.agents/` across all 6 kinds
- **THEN** the verification script outputs `✓ [MATCH]` for every item and kind in the audit report
- **AND** execution exits with code 0, confirming 100% 1:1 parity between the master harness baseline and the target directory installation

<!-- id: obj07-sc-4-3 -->
#### Scenario: Fail-Fast exit code 1 on missing or extra items in the target directory

- **WHEN** any listed component is missing from `<target-dir>/.agents/` or any extra unapproved component is detected
- **THEN** the verification script outputs a detailed per-kind audit scorecard with `[MISSING]` or `[EXTRA]` markers for each discrepancy
- **AND** execution IMMEDIATELY fails with exit code 1 without completing further verification checks

---

<!-- id: obj07-req-5 -->
### Requirement: Non-Destructive Target Directory Rollback

[uninstall-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-agy.sh) SHALL accept `--target-dir <path>` and, when provided, remove exclusively the `.agents/` directory inside that target directory. All project source files (`package.json`, `src/`, `.gitignore`, `README.md`, etc.) SHALL remain completely untouched. The upstream [ECC/](file:///d:/dev/agy-os/ECC) and [website/](file:///d:/CLAUDE-PROJECT/website) repositories SHALL remain protected in all rollback scenarios.

<!-- id: obj07-sc-5-1 -->
#### Scenario: Removing `.agents/` exclusively from the target directory

- **WHEN** `uninstall-agy.sh --target-dir d:/dev/agy-os/test/repo-experiment-01` is executed
- **THEN** the script resolves `TARGET_DIR` to `d:/dev/agy-os/test/repo-experiment-01` and removes only `${TARGET_DIR}/.agents/`
- **AND** no file outside `${TARGET_DIR}/.agents/` is deleted or modified during the rollback

<!-- id: obj07-sc-5-2 -->
#### Scenario: Confirming project source files are preserved after rollback

- **WHEN** the rollback against `test/repo-experiment-01` completes
- **THEN** the files `test/repo-experiment-01/package.json`, `test/repo-experiment-01/.gitignore`, and `test/repo-experiment-01/README.md` exist with their original content unchanged
- **AND** `test/repo-experiment-01/.agents/` no longer exists on disk
- **AND** the safety audit log confirms `ECC/` and `d:/CLAUDE-PROJECT/website` are untouched

<!-- id: obj07-sc-5-3 -->
#### Scenario: Dry-run preview mode for target-dir rollback

- **WHEN** `uninstall-agy.sh --target-dir <path> --dry-run` is executed
- **THEN** the script outputs a `[DRY-RUN]` prefixed preview of every directory and file that would be removed inside `<target-dir>/.agents/`
- **AND** no actual file system modifications are made
- **AND** execution exits with code 0 after outputting the full dry-run plan

---

## 3. Process Flow

1. **Step 1 — Test Sandbox Initialization**: Create and commit [test/repo-experiment-01](file:///d:/dev/agy-os/test/repo-experiment-01) with `package.json`, `.gitignore`, and `README.md`. Verify no `.agents/` directory is present in the committed state.
2. **Step 2 — `--target-dir` CLI Refactoring**: Add `--target-dir` arg parsing to all 5 scripts ([install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh), [uninstall-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-agy.sh), [post-install-agy.js](file:///d:/dev/agy-os/harness/agy-script/post-install-agy.js), [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js), [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js)) with CWD-fallback backward compatibility. Forward-slash normalization applied to all resolved paths.
3. **Step 3 — `ecc-items.json` Copy & Self-Contained Script Deployment**: Update `install-apply-agy.js` to copy [harness/ecc-items.json](file:///d:/dev/agy-os/harness/ecc-items.json) into `<targetDir>/.agents/ecc-items.json` and deploy runtime scripts into `<targetDir>/.agents/scripts/` and `<targetDir>/.agents/scripts/lib/`.
4. **Step 4 — End-to-End Multi-Repo Installation**: Execute `bash harness/agy-script/install-agy.sh --target-dir d:/dev/agy-os/test/repo-experiment-01` via Git Bash. Run `verify-installation-agy.js --target-dir ...` and assert exit code 0. Confirm master harness `.agents/` is unmodified.
5. **Step 5 — Rollback Verification & PRD Sync**: Execute `bash harness/agy-script/uninstall-agy.sh --target-dir d:/dev/agy-os/test/repo-experiment-01`. Verify `package.json`, `.gitignore`, `README.md` remain intact and `.agents/` is removed. Confirm PRD.md registers OBJ-07.

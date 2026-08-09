# OpenAGY Behavioral Specification: OBJ-03 ECC Script Integration

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
- All file paths in rules, configurations, change records, and documentation MUST strictly use forward-slash format (e.g., [d:/dev/agy-os](file:///d:/dev/agy-os), [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/), [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/)). Windows backslashes (`\`) are strictly prohibited in metadata, paths, and documentation instructions to prevent cross-platform tool and regex failures.
- Terminal execution MUST be explicitly specified using **Git Bash** (`bash`). Running scripts via CMD or PowerShell is strictly prohibited.

### 1.2 Access & Directory Boundaries
- Upstream [ECC](file:///d:/dev/agy-os/ECC) directory is treated strictly as an isolated, READ-ONLY reference library. No files inside `ECC/` may be directly modified, deleted, or overwritten.
- Target repository [website](file:///d:/CLAUDE-PROJECT/website) (`d:/CLAUDE-PROJECT/website`) is strictly READ-ONLY. Direct writes, edits, file creations, or folder deletions within the target repository are strictly forbidden. All proposed target modifications MUST be staged as `.patch` or `.diff` files inside [harness/patches/](file:///d:/dev/agy-os/harness/patches/).
- All harness runtime scripts — including hook scripts, non-hook support scripts, shared helper libraries, and AGY-native scripts — MUST reside in [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) and [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/) as the single canonical location for 100% self-contained co-located execution, replacing external `CLAUDE_PLUGIN_ROOT` dependencies per Proposal-02.
- Installer, setup, verification, and teardown scripts MUST reside under [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/) per AGENTS.md §4.

### 1.3 Documentation Hierarchy & SSOT Invariants
- Exactly ONE Single Source of Truth global PRD exists at [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md).
- Objective suite directories under [docs/](file:///d:/dev/agy-os/docs/) (such as [docs/OBJ-03/](file:///d:/dev/agy-os/docs/OBJ-03/)) MUST consist strictly of `spec.md`, `design.md`, `task.md`, and `artifacts/`. Creating `PRD.md` or `prompt.md` files inside `docs/OBJ-03/` is strictly prohibited per AGENTS.md §8.

---

## 2. Requirements

### Requirement: 100% Self-Contained /.agents/scripts/ Script Resolution Invariant
<!-- id: harness.ecc.script_resolution -->
<!-- entities: ScriptInstaller, UnifiedScriptResolver -->
<!-- enforced: harness/agy-script/scripts/install-apply-agy.js -->

The system SHALL mandate that all hook scripts, support scripts, shared libraries, and AGY-native scripts are physically co-located under [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) and [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/), ensuring all relative Node.js module imports (e.g. `require('./lib/utils')`, `require('./lib/hook-flags')`, `require('./lib/state-store')`) resolve locally without relying on external environment variables (`CLAUDE_PLUGIN_ROOT`), dynamic resolution shims, or external directory paths.

#### Scenario: Executing co-located hook scripts with relative library imports
- **WHEN** an AGY lifecycle hook or tool script is executed by the harness dispatcher from [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/)
- **THEN** the script resolves all shared library dependencies directly from [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/) via relative paths (e.g., `require('./lib/utils')`, `require('./lib/hook-flags')`)
- **AND** completes execution with zero runtime dependency on `CLAUDE_PLUGIN_ROOT` or external [ECC](file:///d:/dev/agy-os/ECC) directory paths.

#### Scenario: Executing co-located support scripts autonomously
- **WHEN** a support script (such as `harness-audit.js`, `skills-health.js`, or `loop-status.js`) is executed from [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/)
- **THEN** the script loads its sub-modules and shared libraries locally from [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/) without invoking environment variable lookups
- **AND** performs its intended function autonomously within the [agy-os](file:///d:/dev/agy-os) workspace.

#### Scenario: Verifying self-contained script co-location during installation check
- **WHEN** the installation verification script [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) checks script installation integrity
- **THEN** it verifies that all required scripts and shared libraries exist under [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) and [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/)
- **AND** confirms that zero scripts contain unaligned relative import paths (such as `../lib/` or `ECC/scripts/`).

---

### Requirement: AGY Guardrail Activation & Bash Inspection
<!-- id: harness.guardrail.bash_inspection -->
<!-- entities: PreToolGuardrail, ToolUseInterceptor -->
<!-- enforced: .agents/scripts/pre-tool-guardrail-agy.js -->

The system SHALL register `pre:agy-guardrail` ([.agents/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/scripts/pre-tool-guardrail-agy.js)) as the primary `PreToolUse` hook entry in [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json), and expand its interceptor logic to inspect Bash `command` payloads, blocking destructive file modifications, backslash path formatting, or direct writes targeting the READ-ONLY target repository [website](file:///d:/CLAUDE-PROJECT/website).

#### Scenario: Intercepting and blocking unauthorized Bash command execution
- **WHEN** an AI agent issues a Bash tool command containing paths or operations targeting [website](file:///d:/CLAUDE-PROJECT/website) (e.g. direct file edits, `echo >`, `rm`, or Windows backslashes `\`)
- **THEN** [.agents/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/scripts/pre-tool-guardrail-agy.js) intercepts the payload before shell execution
- **AND** halts execution with exit code 2 while returning a blocking error message directing the agent to use patch staging in [harness/patches/](file:///d:/dev/agy-os/harness/patches/).

#### Scenario: Permitting valid harness workspace tool commands
- **WHEN** an AI agent issues a standard command targeting the harness repository [agy-os](file:///d:/dev/agy-os) using forward-slash pathing (e.g. running verification or test scripts in Git Bash)
- **THEN** [.agents/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/scripts/pre-tool-guardrail-agy.js) validates the payload contract
- **AND** permits execution to proceed with exit code 0.

---

### Requirement: Non-Destructive Merge-Hooks Invariant
<!-- id: harness.installer.merge_hooks_invariant -->
<!-- entities: MergeHooksUtility, InstallerMerger -->
<!-- enforced: harness/agy-script/scripts/merge-hooks-agy.js -->

The system SHALL provide a standalone merge-hooks utility ([harness/agy-script/scripts/merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js)) that preserves AGY-native hook entries (`post:agy-observation-envelope`, `pre:agy-guardrail`), filters out platform-incompatible hooks (`stop:desktop-notify`), creates an atomic backup file at [.agents/hooks.json.bak](file:///d:/dev/agy-os/.agents/hooks.json.bak) prior to write operations, and replaces nuclear `hooks.json` overwrites in [harness/agy-script/scripts/install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js).

#### Scenario: Preserving local AGY-native hooks during installer execution
- **WHEN** [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) executes a reinstall or upgrade operation
- **THEN** it invokes [merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js) instead of performing a nuclear file copy of `hooks.json`
- **AND** all pre-existing AGY-native hook IDs (`post:agy-observation-envelope`, `pre:agy-guardrail`) are retained intact in [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json).

#### Scenario: Excluding platform-incompatible hooks during merge operation
- **WHEN** merging upstream ECC source `hooks.json` into the target harness configuration
- **THEN** [merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js) filters out `stop:desktop-notify` from the target hook list
- **AND** verifies that zero desktop notification entries persist in [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json).

#### Scenario: Creating atomic backup prior to hook configuration mutation
- **WHEN** [merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js) detects an existing [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json) configuration file
- **THEN** it copies the existing file to [.agents/hooks.json.bak](file:///d:/dev/agy-os/.agents/hooks.json.bak) before executing the merge algorithm
- **AND** proceeds with writing the merged payload only upon successful backup creation.

---

### Requirement: Environment Variable Documentation
<!-- id: harness.docs.env_variable_documentation -->
<!-- entities: EnvDocumentation, EnvironmentConfig -->
<!-- enforced: harness/.env.example -->

The system SHALL create and maintain a documented environment template at [harness/.env.example](file:///d:/dev/agy-os/harness/.env.example) detailing optional runtime environment variables for hook profile selection, governance capture, and session tracking, while documenting that co-located scripts in [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) operate with zero mandatory external environment variables (`CLAUDE_PLUGIN_ROOT`).

#### Scenario: Documenting optional runtime environment variables
- **WHEN** inspecting [harness/.env.example](file:///d:/dev/agy-os/harness/.env.example)
- **THEN** the file contains explicit definitions and usage documentation for `ECC_HOOK_PROFILE=standard`, `ECC_GOVERNANCE_CAPTURE=1`, `ECC_DISABLED_HOOKS`, and `ECC_SESSION_ID`
- **AND** confirms that `CLAUDE_PLUGIN_ROOT` is not required for script execution due to 100% self-contained [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) co-location.

#### Scenario: Validating environment template completeness
- **WHEN** running harness documentation or installer setup verification
- **THEN** [harness/.env.example](file:///d:/dev/agy-os/harness/.env.example) is confirmed to exist within the harness root
- **AND** contains zero hardcoded absolute machine paths or Windows backslash separators.

---

## 3. Process Flow

1. **Step 1 — 100% Self-Contained Script Co-location & Path Alignment**: The installer ([install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js)) copies all hook scripts, support scripts, shared libraries, and native scripts into [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) and [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/), aligning relative imports (`require('./lib/utils')`) for zero external env dependency.
2. **Step 2 — Guardrail & Native Script Wire-In**: Update [.agents/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/scripts/pre-tool-guardrail-agy.js) to inspect Bash tool payloads and register `pre:agy-guardrail` in [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json).
3. **Step 3 — Merge-Hooks Utility Construction**: Implement non-destructive merging in [harness/agy-script/scripts/merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js) to update hook script paths to [.agents/scripts/<name>.js](file:///d:/dev/agy-os/.agents/scripts/), preserve AGY-native hook IDs, exclude `stop:desktop-notify`, and create atomic backups.
4. **Step 4 — Installer Wire-In & Path Transformation**: Update [harness/agy-script/scripts/install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) to perform physical script copying, import path alignment, and workflow/agent command path transformation (`node .agents/scripts/<name>.js`).
5. **Step 5 — End-to-End Verification**: Run full installation via [install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh) in Git Bash, verifying adapter-free Node.js execution across [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) and successful verification by [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js).

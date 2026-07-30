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
- All file paths in rules, configurations, change records, and documentation MUST strictly use forward-slash format (e.g., [d:/dev/agy-os](file:///d:/dev/agy-os), [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/), [.agents/hooks/scripts/](file:///d:/dev/agy-os/.agents/hooks/scripts/)). Windows backslashes (`\`) are strictly prohibited in metadata, paths, and documentation instructions to prevent cross-platform tool and regex failures.
- Terminal execution MUST be explicitly specified using **Git Bash** (`bash`). Running scripts via CMD or PowerShell is strictly prohibited.

### 1.2 Access & Directory Boundaries
- Upstream [ECC](file:///d:/dev/agy-os/ECC) directory is treated strictly as an isolated, READ-ONLY reference library. No files inside `ECC/` may be directly modified, deleted, or overwritten. Upstream `ECC/scripts/lib/` ([ECC/scripts/lib/](file:///d:/dev/agy-os/ECC/scripts/lib/)) MUST NOT be copied or mirrored into `.agents/hooks/` or `.agents/hooks/lib/`, but referenced strictly in-place via `CLAUDE_PLUGIN_ROOT=d:/dev/agy-os/ECC`.
- Target repository [website](file:///d:/CLAUDE-PROJECT/website) (`d:/CLAUDE-PROJECT/website`) is strictly READ-ONLY. Direct writes, edits, file creations, or folder deletions within the target repository are strictly forbidden. All proposed target modifications MUST be staged as `.patch` or `.diff` files inside [harness/patches/](file:///d:/dev/agy-os/harness/patches/).
- Post-installation runtime script management modules MUST reside directly in [.agents/hooks/scripts/](file:///d:/dev/agy-os/.agents/hooks/scripts/) and custom helper libraries MUST reside in [.agents/hooks/scripts/lib/](file:///d:/dev/agy-os/.agents/hooks/scripts/lib/) using the `-agy.js` suffix per AGENTS.md §11.
- Installer, setup, verification, and teardown scripts MUST reside under [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/) per AGENTS.md §4.

### 1.3 Documentation Hierarchy & SSOT Invariants
- Exactly ONE Single Source of Truth global PRD exists at [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md).
- Objective suite directories under [docs/](file:///d:/dev/agy-os/docs/) (such as [docs/OBJ-03/](file:///d:/dev/agy-os/docs/OBJ-03/)) MUST consist strictly of `spec.md`, `design.md`, `task.md`, and `artifacts/`. Creating `PRD.md` or `prompt.md` files inside `docs/OBJ-03/` is strictly prohibited per AGENTS.md §8.

---

## 2. Requirements

### Requirement: CLAUDE_PLUGIN_ROOT Resolution Guarantee
<!-- id: harness.ecc.plugin_root_resolution -->
<!-- entities: EnvironmentConfig, ECCBootstrapResolver -->
<!-- enforced: harness/.env.example -->

The system SHALL document and enforce the resolution of `CLAUDE_PLUGIN_ROOT` pointing to the canonical in-place reference directory [d:/dev/agy-os/ECC](file:///d:/dev/agy-os/ECC), ensuring all ECC hook bootstrap resolvers (`plugin-hook-bootstrap.js`, `run-with-flags.js`, `resolve-ecc-root.js`) resolve transitive dependencies and upstream shared libraries in [ECC/scripts/lib/](file:///d:/dev/agy-os/ECC/scripts/lib/) in-place without physical file copying or mirroring into `.agents/hooks/` or `.agents/hooks/lib/`, while confirming any custom AGY helper libraries are scoped strictly to [.agents/hooks/scripts/lib/](file:///d:/dev/agy-os/.agents/hooks/scripts/lib/) using the `-agy.js` suffix convention.

#### Scenario: Resolving ECC hook dependencies in-place via environment variable
- **WHEN** an ECC lifecycle hook is triggered by the harness dispatcher
- **THEN** the hook bootstrap resolver reads `CLAUDE_PLUGIN_ROOT` from the environment
- **AND** successfully loads required upstream modules (`scripts/hooks/`, `scripts/lib/utils.js`, `scripts/lib/hook-flags.js`, `scripts/lib/state-store/`) directly from [ECC](file:///d:/dev/agy-os/ECC) without physical file duplication into `.agents/hooks/` or `.agents/hooks/lib/`
- **AND** confirms any custom AGY helper modules are loaded exclusively from [.agents/hooks/scripts/lib/*-agy.js](file:///d:/dev/agy-os/.agents/hooks/scripts/lib/).

#### Scenario: Missing or unexported CLAUDE_PLUGIN_ROOT fallback verification
- **WHEN** `CLAUDE_PLUGIN_ROOT` is unset in the execution environment
- **THEN** the installation verification script [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) detects the unconfigured environment variable
- **AND** reports a non-zero exit code (exit code 1) detailing the configuration requirement documented in [harness/.env.example](file:///d:/dev/agy-os/harness/.env.example).

---

### Requirement: AGY Guardrail Activation & Bash Inspection
<!-- id: harness.guardrail.bash_inspection -->
<!-- entities: PreToolGuardrail, ToolUseInterceptor -->
<!-- enforced: .agents/hooks/scripts/pre-tool-guardrail-agy.js -->

The system SHALL register `pre:agy-guardrail` ([.agents/hooks/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/hooks/scripts/pre-tool-guardrail-agy.js)) as the primary `PreToolUse` hook entry in [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json), and expand its interceptor logic to inspect Bash `command` payloads, blocking destructive file modifications, backslash path formatting, or direct writes targeting the READ-ONLY target repository [website](file:///d:/CLAUDE-PROJECT/website).

#### Scenario: Intercepting and blocking unauthorized Bash command execution
- **WHEN** an AI agent issues a Bash tool command containing paths or operations targeting [website](file:///d:/CLAUDE-PROJECT/website) (e.g. direct file edits, `echo >`, `rm`, or Windows backslashes `\`)
- **THEN** [.agents/hooks/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/hooks/scripts/pre-tool-guardrail-agy.js) intercepts the payload before shell execution
- **AND** halts execution with exit code 2 while returning a blocking error message directing the agent to use patch staging in [harness/patches/](file:///d:/dev/agy-os/harness/patches/).

#### Scenario: Permitting valid harness workspace tool commands
- **WHEN** an AI agent issues a standard command targeting the harness repository [agy-os](file:///d:/dev/agy-os) using forward-slash pathing (e.g. running verification or test scripts in Git Bash)
- **THEN** [.agents/hooks/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/hooks/scripts/pre-tool-guardrail-agy.js) validates the payload contract
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

The system SHALL create and maintain a documented environment template at [harness/.env.example](file:///d:/dev/agy-os/harness/.env.example) detailing all required and optional runtime environment variables for ECC hook bootstrap resolution, profile selection, governance capture, and session tracking.

#### Scenario: Documenting mandatory runtime environment variables
- **WHEN** inspecting [harness/.env.example](file:///d:/dev/agy-os/harness/.env.example)
- **THEN** the file contains explicit definitions and usage documentation for `CLAUDE_PLUGIN_ROOT`, `ECC_HOOK_PROFILE=standard`, `ECC_GOVERNANCE_CAPTURE=1`, `ECC_DISABLED_HOOKS`, and `ECC_SESSION_ID`
- **AND** all path examples use forward-slash formatting.

#### Scenario: Validating environment template completeness
- **WHEN** running harness documentation or installer setup verification
- **THEN** [harness/.env.example](file:///d:/dev/agy-os/harness/.env.example) is confirmed to exist within the harness root
- **AND** contains zero hardcoded absolute machine paths or Windows backslash separators.

---

## 3. Process Flow

1. **Step 1 — Environment Configuration**: Developer or installer copies [harness/.env.example](file:///d:/dev/agy-os/harness/.env.example) to `.env` and sets `CLAUDE_PLUGIN_ROOT=d:/dev/agy-os/ECC` to establish in-place module resolution.
2. **Step 2 — Guardrail Expansion & Registration**: Implement Bash tool payload inspection in [.agents/hooks/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/hooks/scripts/pre-tool-guardrail-agy.js) and register `pre:agy-guardrail` in [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json).
3. **Step 3 — Merge-Hooks Utility Construction**: Implement non-destructive merging, AGY-native preservation (`post:agy-observation-envelope`, `pre:agy-guardrail`), `stop:desktop-notify` exclusion, and atomic backup logic in [harness/agy-script/scripts/merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js).
4. **Step 4 — Installer Wire-In**: Update [harness/agy-script/scripts/install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) (lines 287–303) to invoke `merge-hooks-agy.js` instead of performing nuclear file copies.
5. **Step 5 — End-to-End Verification**: Run full re-installation via [install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh) in Git Bash, verifying zero AGY-native hook loss, exclusion of `stop:desktop-notify`, and successful execution of [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js).

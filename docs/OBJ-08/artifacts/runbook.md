# Operational Runbook: OBJ-08 Personal Local Product CLI Runner (`agy-harness`)

<!--
AI INSTRUCTION:
This runbook serves as the definitive operational manual for deploying, verifying, managing, and troubleshooting the agy-harness CLI runner across target repositories.
- All file paths MUST use forward slashes (/) and clickable file:/// URIs.
- All terminal commands MUST execute under Git Bash (bash).
- Baseline master items from agy-os are synced 1:1; target local extensions are preserved non-destructively.
-->

## 1. Prerequisites & Environment System Invariants

### System Invariants
- **Terminal Shell Environment**: All CLI invocations MUST strictly execute using **Git Bash** (`bash`). Execution via CMD or PowerShell is strictly prohibited.
- **Pathing Format**: All target paths, CLI parameters, and file references MUST use forward slashes (`/`) (e.g., `d:/dev/agy-os/frameworks/openspec`). Windows backslashes (`\`) are auto-normalized by `agy-harness.sh` using `tr '\\' '/'`.
- **Read-Only Boundaries**: Upstream source repository [ECC/](file:///d:/dev/agy-os/ECC) and external target repository [website/](file:///d:/CLAUDE-PROJECT/website) remain strictly **READ-ONLY**.
- **Executable Location**: The product CLI entrypoint is located at [harness/bin/agy-harness.sh](file:///d:/dev/agy-os/harness/bin/agy-harness.sh).

### Pre-flight Verification
Run `agy-harness.sh` without parameters to verify environment availability and argument help output:

```bash
bash harness/bin/agy-harness.sh
```

**Expected Help Output** (Exit code `1`):
```text
Usage: agy-harness <deploy|verify|uninstall|status> [--target-dir <path>]
```

---

## 2. CLI Command Matrix & Exit Code Contracts

The product CLI front-end wrapper delegates to underlying engine scripts in [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/).

| Subcommand | Aliases | Underlying Delegation Target | Description | Exit Code Contract |
| :--- | :--- | :--- | :--- | :--- |
| `deploy` | `install` | `bash harness/agy-script/install-agy.sh "$@"` | Scaffolds `.agents/`, deploys master baseline components 1:1, preserves target local custom extensions. | `0` on success |
| `verify` | `audit` | `node harness/agy-script/scripts/verify-installation-agy.js "$@"` | Dual-pass compliance verification. Validates 100% baseline parity against `ecc-items.json` and audits local extensions. | `0` if 0 missing baseline items; `1` if baseline item missing |
| `status` | - | `node harness/agy-script/scripts/verify-installation-agy.js "$@"` | Outputs human-readable scorecard displaying baseline parity matches and discovered local custom extensions. | `0` on completed report |
| `uninstall` | `clean` | `bash harness/agy-script/uninstall-agy.sh "$@"` | Non-destructively purges target `.agents/` directory without touching project code. | `0` on completed teardown |

---

## 3. Multi-Repository Operational Workflows

### Workflow 3.1: Fresh Repository Onboarding (e.g., `frameworks/openspec`)

To scaffold and deploy the `.agents/` harness to a fresh local target repository:

```bash
bash harness/bin/agy-harness.sh deploy --target-dir d:/dev/agy-os/frameworks/openspec
```

**Expected Terminal Output**:
```text
[Installer Engine] Starting custom ECC installation execution...
Config File: D:/dev/agy-os/ecc-install.json
Execution Mode: LIVE MUTATION
[Installer Engine] Duplicate ID validation passed: Zero ID collisions detected.
Resolved Profile: agy-developer
Total Resolved Modules: 14

Executing physical asset copying & directory cleanup...
[MergeHooks Engine] Merging hooks from: D:/dev/agy-os/ECC/hooks/hooks.json
[MergeHooks Engine] Target: d:/dev/agy-os/frameworks/openspec/.agents/hooks.json
[MergeHooks Engine] SUCCESS: Merged hooks written to d:/dev/agy-os/frameworks/openspec/.agents/hooks.json
[Post-Install Engine] Starting post-install agent transformation...
[Post-Install Engine] Target Dir: d:/dev/agy-os/frameworks/openspec
[Post-Install Engine] Detected 29 subagents in .agents/agents/
[Post-Install Engine] Registry purity verified: .agents/workflows/ layout is 100% flat.
[Installer Engine] SUCCESS: Installation completed successfully.
Install State written to d:/dev/agy-os/frameworks/openspec/.agents/plugin/ecc/ecc-install-state.json
```

### Workflow 3.2: Baseline Parity Audit & Verification

To verify that a deployed target repository maintains 100% 1:1 baseline parity:

```bash
bash harness/bin/agy-harness.sh verify --target-dir d:/dev/agy-os/frameworks/openspec
```

**Expected Verification Summary Output** (Exit code `0`):
```text
Proposal Items Summary: Declared: 140, Matched: 140, Missing: 0, Local Extensions: 0

--- Environment & Self-Contained Script Architecture Verification ---
  ✓ [MATCH] harness/.env.example template file exists.
  ✓ [MATCH] 100% self-contained script co-location confirmed with zero mandatory CLAUDE_PLUGIN_ROOT dependency.

--- AGY-Native Helper Libraries Verification (.agents/scripts/lib/) ---
  ✓ [MATCH] Required helper library -> .agents/scripts/lib/command-inspector-agy.js
  ✓ [MATCH] Required helper library -> .agents/scripts/lib/path-validator-agy.js

--- Lifecycle Hooks Configuration Verification (.agents/hooks.json) ---
  ✓ [MATCH] 'pre:agy-guardrail' present and pinned at PreToolUse index 0.
  ✓ [MATCH] 'post:agy-observation-envelope' present in PostToolUse.
  ✓ [MATCH] Hook commands point directly to co-located .agents/scripts/ runtime paths.

===============================================
[Verification Engine] SUCCESS: Verification PASSED with 100% compliance across proposal items, self-contained script co-location, AGY helper libraries, and hooks configuration.
```

### Workflow 3.3: Status Scorecard Inspection

To view the complete item match and extension scorecard:

```bash
bash harness/bin/agy-harness.sh status --target-dir d:/dev/agy-os/frameworks/openspec
```

---

## 4. Hybrid Custom Extension Lifecycle

Target repositories can define custom local rules, skills, agents, and workflows inside standard standard paths (`.agents/agents/`, `.agents/rules/`, `.agents/workflows/`, `.agents/skills/`) without baseline sync collisions.

### 4.1 Authoring a Target Local Custom Agent
Create a custom agent directory and `agent.md` inside `<target-dir>/.agents/agents/<custom-agent-name>/agent.md`:

```bash
mkdir -p d:/dev/agy-os/test/repo-experiment-01/.agents/agents/custom-agent-01
```

Create `agent.md` with compliant YAML frontmatter:
```markdown
---
name: custom-agent-01
description: Custom project-specific reviewer agent
mainAgent: true
subagent: true
model: flash
tools: []
mcpServers: []
skills: []
---

# Subagent: custom-agent-01
Custom agent instructions go here.
```

### 4.2 Re-deploying Baseline Master Items
Re-running `deploy` syncs master baseline items 1:1 while leaving `custom-agent-01` completely untouched:

```bash
bash harness/bin/agy-harness.sh deploy --target-dir d:/dev/agy-os/test/repo-experiment-01
```

### 4.3 Auditing Local Extensions in `verify`
When `verify` audits the target directory, baseline items are checked for `✓ [MATCH]`, and custom items are audited as non-failing `ℹ [LOCAL EXTENSION]`:

```bash
bash harness/bin/agy-harness.sh verify --target-dir d:/dev/agy-os/test/repo-experiment-01
```

**Expected Extension Output**:
```text
  ✓ [MATCH] typescript-reviewer -> .agents/agents/typescript-reviewer/agent.md
  ✓ [MATCH] Compliant YAML frontmatter -> .agents/agents/custom-agent-01/agent.md
  ℹ [LOCAL EXTENSION] custom-agent-01 -> .agents/agents/custom-agent-01

Proposal Items Summary: Declared: 140, Matched: 140, Missing: 0, Local Extensions: 5
[Verification Engine] SUCCESS: Verification PASSED...
```

---

## 5. Non-Destructive Teardown & Rollback Protocol

If an installed target repository must be returned to its pre-harness state:

```bash
bash harness/bin/agy-harness.sh uninstall --target-dir d:/dev/agy-os/frameworks/openspec
```

**Teardown Safety Invariants**:
1. **Target Isolation**: Removal is strictly scoped to `<target-dir>/.agents/`.
2. **Project Integrity**: Root project files (`package.json`, `tsconfig.json`, `src/`, `.git/`) are NEVER touched.
3. **Single Command Teardown**: Reverts the target codebase to a clean state in one command.

---

## 6. Troubleshooting & Diagnostic Playbook

### Diagnostic 6.1: Verification Fails with `✗ [MISSING]` (Exit code `1`)
- **Symptom**: `verify` returns exit code 1 with `✗ [MISSING]` listed for one or more baseline items.
- **Root Cause**: A baseline rule, agent, workflow, skill, or hook file was deleted or corrupted inside `<target-dir>/.agents/`.
- **Remediation**:
  1. Re-run baseline synchronization:
     ```bash
     bash harness/bin/agy-harness.sh deploy --target-dir <target-path>
     ```
  2. Re-verify parity:
     ```bash
     bash harness/bin/agy-harness.sh verify --target-dir <target-path>
     ```

### Diagnostic 6.2: Invalid YAML Frontmatter Error
- **Symptom**: `verify` logs `✗ [INVALID FRONTMATTER]` for a custom or baseline agent.
- **Root Cause**: An `agent.md` file is missing required YAML block delimiters (`---`) or required 8 schema fields (`name`, `description`, `mainAgent`, `subagent`, `model`, `tools`, `mcpServers`, `skills`).
- **Remediation**: Inspect `<target-dir>/.agents/agents/<name>/agent.md` and ensure valid 8-field YAML frontmatter is present.

### Diagnostic 6.3: Path Format or Command Not Found in Windows Shell
- **Symptom**: `bash: harness/bin/agy-harness.sh: No such file or directory` or backslash escape errors.
- **Root Cause**: Shell command was executed in CMD or PowerShell instead of Git Bash.
- **Remediation**: Always execute script invocations using Git Bash (`bash harness/bin/agy-harness.sh ...`).

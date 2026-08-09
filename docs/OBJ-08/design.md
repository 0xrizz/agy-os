# Technical Design Document: OBJ-08 Personal Local Product CLI Runner & Multi-Repo Productization (`agy-harness`)

<!--
AI INSTRUCTION:
This document defines the technical architecture and design specifications for OBJ-08.
- Use forward slashes (/) for all file paths.
- Use clickable file:/// links for all referenced file paths.
- Section 4 MUST contain a 4-column decision matrix.
- Section 5 MUST detail Non-Destructive Rollback Architecture.
-->

## 1. Overview & Architecture Goals

### Context
Objective 08 (OBJ-08) productizes the multi-repository installer suite established in OBJ-07 into a unified, portable personal product CLI runner ([harness/bin/agy-harness.sh](file:///d:/dev/agy-os/harness/bin/agy-harness.sh)). It allows deploying, verifying, auditing, status-checking, and uninstalling the `.agents/` harness across any local repository on the user's system, starting with [frameworks/openspec](file:///d:/dev/agy-os/frameworks/openspec) as the primary production rollout target.

Prior to OBJ-08, running harness lifecycle operations required executing low-level multi-step scripts in [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/). OBJ-08 elevates these capabilities into a single executable CLI entrypoint while introducing a **Hybrid Custom Item Architecture** that allows target repositories to maintain local custom rules, skills, agents, and workflows inside `.agents/` without being overwritten or purged during baseline sync operations.

### Goals
- **Portable Product CLI Runner Entrypoint**: Provide [harness/bin/agy-harness.sh](file:///d:/dev/agy-os/harness/bin/agy-harness.sh) supporting `deploy`, `verify`, `uninstall`, and `status` subcommands, with path normalization (converting backslashes `\` to forward slashes `/`), argument forwarding (`--target-dir <path>`), and deterministic exit codes.
- **Hybrid Custom Item Architecture**: Ensure master baseline items from `agy-os` are deployed 1:1, while target local custom items in standard paths (`.agents/skills/`, `.agents/rules/`, `.agents/agents/`, `.agents/workflows/`) are preserved non-destructively during updates.
- **Status Reporter & Extension Auditor**: Extend [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) to audit master baseline items as `✓ [MATCH]` and target local custom extensions as `ℹ [LOCAL EXTENSION]`, without failing baseline parity checks.
- **3-Case Test Matrix Verification**: Validate installer and auditor behavior across Case 1 (post-install extension addition), Case 2 (pre-existing custom item before install), and Case 3 (clean uninstalled fresh repo).
- **Primary Production Rollout**: Deploy `.agents/` to [frameworks/openspec](file:///d:/dev/agy-os/frameworks/openspec) and achieve 100% baseline parity verification.

### Non-Goals
- Modifying upstream [ECC/](file:///d:/dev/agy-os/ECC) source files.
- Modifying target repository [website](file:///d:/CLAUDE-PROJECT/website) directly.
- Publishing `agy-harness` to npm public registry (this is a personal local CLI product runner).
- Destructive purges of user-created custom extensions in target repositories.

---

## 2. Directory Layout & CLI Distribution Architecture

```text
d:/dev/agy-os/  (Master Harness & Product CLI Root)
├── harness/
│   ├── bin/
│   │   └── agy-harness.sh                # Product CLI entrypoint (deploy|verify|uninstall|status)
│   ├── ecc-items.json                    # Master baseline items reference
│   └── agy-script/                       # Installer and verification engine scripts
│       ├── install-agy.sh                # Scaffolding and installation wrapper
│       ├── uninstall-agy.sh              # Non-destructive teardown wrapper
│       └── scripts/
│           ├── install-apply-agy.js      # Hybrid sync engine script
│           └── verify-installation-agy.js# Dual-pass auditor & status verification script
├── frameworks/
│   └── openspec/                         # Primary Production Rollout Target
│       └── .agents/                      # Managed target harness directory
│           ├── agents/                   # Master baseline + local custom subagents
│           ├── rules/                    # Master baseline + local custom rules
│           ├── skills/                   # Master baseline + local custom skills
│           ├── workflows/                # Master baseline + local custom workflows
│           ├── hooks.json                # Lifecycle hooks configuration
│           ├── ecc-items.json            # Self-contained baseline reference copy
│           └── scripts/                  # Self-contained runtime scripts & helper libraries
├── test/
│   ├── repo-experiment-01/             # Test Case 1: Post-install custom item addition
│   ├── repo-experiment-02/             # Test Case 2: Pre-existing custom item before install
│   └── repo-experiment-03/             # Test Case 3: Clean fresh repo install
└── docs/
    └── OBJ-08/                           # Technical Documentation Suite
        ├── artifacts/
        │   └── proposal.md               # Proposal document
        ├── spec.md                       # Behavioral specification
        ├── design.md                     # Technical design document (THIS FILE)
        └── task.md                       # Implementation task list
```

---

## 3. Technical Design

### 3.1 CLI Runner Entrypoint Spec (`harness/bin/agy-harness.sh`)

The entrypoint [harness/bin/agy-harness.sh](file:///d:/dev/agy-os/harness/bin/agy-harness.sh) acts as a portable bash CLI front-end wrapper. It handles shell environment resolution, normalizes target directory paths to forward slashes, routes subcommands to underlying engine scripts, and returns consistent exit codes.

#### Implementation Architecture

```bash
#!/usr/bin/env bash
# agy-harness — Personal Local Product CLI Entrypoint for AGY-OS Harness Deployment

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
HARNESS_ROOT="$( cd "${SCRIPT_DIR}/../.." && pwd )"
HARNESS_ROOT="$(echo "${HARNESS_ROOT}" | tr '\\' '/')"

COMMAND="$1"
shift || true

# Forward-slash path normalization for --target-dir parameter
ARGS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target-dir)
      TARGET_VAL="$2"
      TARGET_VAL_NORM="$(echo "${TARGET_VAL}" | tr '\\' '/')"
      ARGS+=("--target-dir" "${TARGET_VAL_NORM}")
      shift 2
      ;;
    *)
      ARGS+=("$1")
      shift
      ;;
  esac
done

case "${COMMAND}" in
  deploy|install)
    bash "${HARNESS_ROOT}/harness/agy-script/install-agy.sh" "${ARGS[@]}"
    ;;
  verify|audit)
    node "${HARNESS_ROOT}/harness/agy-script/scripts/verify-installation-agy.js" "${ARGS[@]}"
    ;;
  uninstall|clean)
    bash "${HARNESS_ROOT}/harness/agy-script/uninstall-agy.sh" "${ARGS[@]}"
    ;;
  status)
    echo "=== AGY-OS Local Product Status ==="
    node "${HARNESS_ROOT}/harness/agy-script/scripts/verify-installation-agy.js" "${ARGS[@]}"
    ;;
  *)
    echo "Usage: agy-harness <deploy|verify|uninstall|status> [--target-dir <path>]"
    exit 1
    ;;
esac
```

#### Subcommand Forwarding & Exit Code Contract

| Subcommand | Aliases | Underlying Invocation Target | Description | Exit Code Contract |
| :--- | :--- | :--- | :--- | :--- |
| `deploy` | `install` | `bash harness/agy-script/install-agy.sh "$@"` | Scaffolds `.agents/`, deploys master baseline items 1:1, preserves local custom extensions. | `0` on success, `1` on disk/permissions error |
| `verify` | `audit` | `node harness/agy-script/scripts/verify-installation-agy.js "$@"` | Validates 100% baseline parity against `ecc-items.json`, audits local extensions. | `0` if all baseline items match, `1` if baseline missing |
| `status` | - | `node harness/agy-script/scripts/verify-installation-agy.js "$@"` | Outputs human-readable summary of baseline parity and lists detected local custom extensions. | `0` on completed report |
| `uninstall` | `clean` | `bash harness/agy-script/uninstall-agy.sh "$@"` | Non-destructively removes `<targetDir>/.agents/`, leaving project code untouched. | `0` on successful teardown |

---

### 3.2 Hybrid Sync Engine (Preserving Target Local Custom Items)

The core sync engine in [harness/agy-script/scripts/install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) implements non-destructive baseline synchronization:

1. **Baseline Surface Identification**: The installer loads [harness/ecc-items.json](file:///d:/dev/agy-os/harness/ecc-items.json) to build the exact set of master baseline files across 6 item kinds (`rules`, `agents`, `skills`, `workflows`, `hooks`, `platform`).
2. **Target Scaffolding**: Target directories (`<targetDir>/.agents/rules`, `.agents/skills`, `.agents/agents`, `.agents/workflows`, `.agents/scripts`) are created if missing.
3. **Additive & Overwriting Master Baseline Copy**: Each baseline file from `agy-os` is written to `<targetDir>/.agents/`, updating obsolete baseline versions to match master baseline 1:1.
4. **Non-Destructive Local Extension Preservation**: Any pre-existing files in standard target locations (`.agents/skills/<custom-skill>/SKILL.md`, `.agents/rules/<custom-rule>.md`, `.agents/agents/<custom-agent>/agent.md`, `.agents/workflows/<custom-workflow>.md`) that are **not** present in `ecc-items.json` are retained completely untouched.

```javascript
// Hybrid Sync Logic in install-apply-agy.js
function deployHybridComponent(masterPath, targetPath, isBaselineItem) {
  if (isBaselineItem) {
    // Master baseline item: update/overwrite target copy 1:1
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(masterPath, targetPath);
  } else {
    // Target local custom item: preserve without overwriting or deleting
    if (!fs.existsSync(targetPath)) {
      // Keep local file intact
    }
  }
}
```

---

### 3.3 Status Reporter & Extension Auditor

The verification engine in [harness/agy-script/scripts/verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) operates using a **Dual-Pass Verification Model**:

#### Pass 1: Strict Baseline Parity Verification
- Loads `<targetDir>/.agents/ecc-items.json` reference baseline.
- Scans target disk for every listed baseline item.
- Outputs `✓ [MATCH]` for present baseline items.
- Outputs `✗ [MISSING]` for missing baseline items.
- If ANY baseline item is missing, verification fails and process exits with code `1`.

#### Pass 2: Local Extension Discovery & Audit
- Scans target standard directories (`.agents/skills/`, `.agents/rules/`, `.agents/agents/`, `.agents/workflows/`).
- Identifies any items present on disk that are **not** listed in `ecc-items.json`.
- Outputs each discovered item as `ℹ [LOCAL EXTENSION] <path>`.
- Local extensions are recorded in the status summary report, but do **NOT** trigger verification failure or non-zero exit codes.

```javascript
// Extension Audit Algorithm in verify-installation-agy.js
function auditLocalExtensions(targetDir, baselineItemsMap) {
  const customItems = [];
  const componentDirs = ['skills', 'rules', 'agents', 'workflows'];
  
  for (const kind of componentDirs) {
    const dirPath = path.join(targetDir, '.agents', kind);
    if (!fs.existsSync(dirPath)) continue;

    const files = readdirRecursive(dirPath);
    for (const file of files) {
      const relativePath = path.relative(path.join(targetDir, '.agents'), file).replace(/\\/g, '/');
      if (!baselineItemsMap.has(relativePath)) {
        customItems.push(relativePath);
        console.log(`  ℹ [LOCAL EXTENSION] ${kind}: ${relativePath}`);
      }
    }
  }
  return customItems;
}
```

---

## 4. Design Decision Matrix

| Decision Area | Selected Option | Rationale | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **CLI Entrypoint & Distribution Model** | Standalone Bash Wrapper (`harness/bin/agy-harness.sh`) | Fast execution in Git Bash, zero build step required, direct delegation to existing installer scripts, lightweight git-based distribution. | Global npm link package (`npm link agy-harness`), compiled C++ binary, standalone Python CLI runner. |
| **Custom Item Storage Location** | Standard Component Paths (`.agents/skills/`, `.agents/rules/`, `.agents/agents/`, `.agents/workflows/`) | Maintains 100% compliance with `agentskills.io` standard without introducing non-standard subdirectories or breaking existing tooling. | Dedicated `.agents/custom/` or `.agents/local/` isolated subfolder. |
| **Local Item Sync Behavior** | Non-Destructive Preserve Sync (Additive Copy + Overwrite Baseline) | Guarantees master baseline components stay 100% up-to-date while protecting user-created repo-specific skills/rules from deletion. | Destructive purge (deleting non-baseline files), prompt user on every unlisted file encountered. |
| **First Rollout Target Selection** | [frameworks/openspec](file:///d:/dev/agy-os/frameworks/openspec) | Validates productization against an active in-repo framework sub-workspace before external repository deployment. | Testing exclusively against synthetic sandbox test repositories. |
| **Verification Audit & Extension Model** | Dual-Pass Verification (Strict Parity Pass + Non-Failing Extension Audit Pass) | Ensures 100% baseline integrity for agent execution while giving visibility into custom local extensions as non-failing informational entries. | Hard fail on any extra/custom item found, completely ignoring local custom files in verification. |

---

## 5. Non-Destructive Rollback Architecture

The rollback architecture guarantees multi-repository safety, complete isolation of target project source code, and single-command teardown via `agy-harness uninstall`.

### Multi-Repo Safety Guarantees
1. **Strict Target Scope Boundary**: All deployment and teardown operations are strictly confined within `<targetDir>/.agents/`. The uninstaller never navigates outside `.agents/` or executes wildcard file deletions on the parent workspace.
2. **Target Application Isolation**: Application source files, configuration files (`package.json`, `tsconfig.json`, `README.md`), version control files (`.git/`), and build output remain 100% untouched.
3. **Existential Safety Checks**: Before executing removal, `uninstall-agy.sh` verifies that `<targetDir>` exists and explicitly contains a `.agents/` subdirectory, preventing accidental execution against root or system directories.

### Single-Command Teardown Execution (`agy-harness uninstall`)

When `bash harness/bin/agy-harness.sh uninstall --target-dir <path>` is executed:

```text
[Uninstall Phase 1] Target Verification
  ├── Target directory resolved & normalized: <targetDir>
  └── Confirm presence of <targetDir>/.agents/

[Uninstall Phase 2] Non-Destructive Teardown
  ├── Remove <targetDir>/.agents/ (rules, agents, skills, workflows, scripts, ecc-items.json)
  └── Preserve all target repository root and source files

[Uninstall Phase 3] Completion Report
  └── Output confirmation: "✓ Successfully uninstalled .agents/ harness from <targetDir>"
```

Running `agy-harness uninstall` restores the target repository to its exact pre-harness state in a single command, fulfilling all safety and non-destructive rollback requirements.

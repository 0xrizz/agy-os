# Technical Design Document: OBJ-03 ECC Script Integration

<!-- 
AI INSTRUCTION:
This template defines the technical architecture and design specifications.
When populating this file:
- Clearly delineate Goals vs Non-Goals to control project scope.
- Provide explicit annotated directory structures and component layouts.
- Detail data models, schemas, and API contracts.
- Explicitly document trade-offs and rationale for key architectural choices using a 4-column table.
- Use forward slashes (/) for all file paths.
- Use clickable file:/// links for all referenced file paths.
-->

## 1. Overview & Architecture Goals

### Context
Objective 03 defines the technical architecture for activating the complete **ECC Script Integration** pipeline within the Antigravity harness environment ([agy-os](file:///d:/dev/agy-os)). Following the approved Customization Proposal ([proposal.md](file:///d:/dev/agy-os/docs/OBJ-03/artifacts/proposal.md)), this design resolves four critical operational gaps:
1. **Unset `CLAUDE_PLUGIN_ROOT`**: Resolves silent failures across all 26 selected ECC hook bootstrap resolvers by establishing canonical in-place reference loading from [ECC](file:///d:/dev/agy-os/ECC) documented via [harness/.env.example](file:///d:/dev/agy-os/harness/.env.example).
2. **Unwired & Scope-Limited Guardrail**: Connects `pre:agy-guardrail` ([.agents/hooks/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/hooks/scripts/pre-tool-guardrail-agy.js)) as the primary `PreToolUse` hook in [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json) and expands its inspection logic to analyze Bash `command` strings for target repository access violations.
3. **Nuclear Hooks Copying**: Replaces destructive `hooks.json` overwrites in [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) with a non-destructive merger utility ([merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js)) that preserves AGY-native hook entries (`post:agy-observation-envelope`, `pre:agy-guardrail`).
4. **Platform Incompatibility**: Excludes Windows-incompatible `stop:desktop-notify` hooks during hook configuration merging.

### Goals / Non-Goals
- **Goals**:
  - Implement environment configuration template at [harness/.env.example](file:///d:/dev/agy-os/harness/.env.example) documenting `CLAUDE_PLUGIN_ROOT`, `ECC_HOOK_PROFILE=standard`, `ECC_GOVERNANCE_CAPTURE=1`, `ECC_DISABLED_HOOKS`, and `ECC_SESSION_ID`.
  - Expand [.agents/hooks/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/hooks/scripts/pre-tool-guardrail-agy.js) to parse incoming PreToolUse JSON payloads, inspect Bash `command` strings for target repo modifications or backslashes, and wire `pre:agy-guardrail` as the first entry in [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json).
  - Enforce AGENTS.md §11 runtime script boundaries: AGY-native hook interceptors in [.agents/hooks/scripts/](file:///d:/dev/agy-os/.agents/hooks/scripts/) and AGY-native custom helper libraries in [.agents/hooks/scripts/lib/](file:///d:/dev/agy-os/.agents/hooks/scripts/lib/) using `-agy.js` suffix, while resolving upstream ECC libraries in-place via `CLAUDE_PLUGIN_ROOT`.
  - Create standalone merger utility [harness/agy-script/scripts/merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js) with AGY-native preservation, platform exclusion filtering (`stop:desktop-notify`), and atomic backup creation ([.agents/hooks.json.bak](file:///d:/dev/agy-os/.agents/hooks.json.bak)).
  - Modify [harness/agy-script/scripts/install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) (lines 287–303) to use `merge-hooks-agy.js` instead of nuclear file copying.
  - Maintain total prompt token budget utilization strictly within the target threshold of **85% – 95%** (net +275 tokens addition, total 89.31%).
- **Non-Goals**:
  - Modifying or copying files inside the canonical upstream [ECC](file:///d:/dev/agy-os/ECC) directory (treated strictly as READ-ONLY reference).
  - Copying or mirroring upstream `ECC/scripts/lib/` files into `.agents/hooks/` or `.agents/hooks/lib/`.
  - Direct file modification, creation, or deletion inside target repository [website](file:///d:/CLAUDE-PROJECT/website) (`d:/CLAUDE-PROJECT/website`).
  - Modifying base installer scripts `ECC/install.sh` or `ECC/scripts/install-apply.js`.

---

## 2. Directory Layout & Component Structure

```text
d:/dev/agy-os/
├── .agents/
│   ├── hooks/
│   │   └── scripts/                       # AGY-Native Runtime Hook Scripts (AGENTS.md §11)
│   │       ├── pre-tool-guardrail-agy.js   # [ADAPT + WIRE] Bash command payload inspector & guardrail
│   │       ├── observation-envelope-agy.js # [KEEP] PostToolUse Error Recovery Contract envelope
│   │       └── lib/                       # [STANDARDIZED] AGY-Native Custom Helper Libraries (*-agy.js)
│   │           └── <helper>-agy.js        # Optional AGY runtime helper modules
│   ├── hooks.json                         # [ADAPT] Merged Lifecycle Hooks Config (pre:agy-guardrail wired)
│   ├── hooks.json.bak                     # [NEW] Atomic backup created before merge-hooks mutation
│   ├── plugin/ecc/                        # Installed ECC Plugin Target Directory
│   ├── rules/                             # Flat Rules Directory (.agents/rules/<name>.md)
│   ├── skills/                            # Native Agent Skills Directory (.agents/skills/<skill-name>/SKILL.md)
│   └── workflows/                         # Flat Workflows Registry (Slash Commands & /a-<name> Bridges)
├── harness/
│   ├── .env.example                       # [CREATE] Environment variable documentation template
│   ├── manifests/                         # Custom Manifest Overlay Directory (*.custom.json)
│   ├── patches/                           # Root Patch Staging Directory for Target Repo
│   └── agy-script/                        # Custom Installer & Governance Verification Scripts (AGENTS.md §4)
│       ├── install-agy.sh                 # Custom Installer Entrypoint
│       ├── uninstall-agy.sh               # Automated Teardown Script
│       ├── post-install-agy.js            # Subagent Restructuring & Bridge Workflow Generator
│       └── scripts/
│           ├── install-apply-agy.js       # [ADAPT] Manifest Merger Engine (lines 287-303 replaced)
│           ├── merge-hooks-agy.js         # [CREATE] Non-destructive lifecycle hooks merger script
│           ├── scan-target-repo.js        # Quantitative techstack scanner script
│           └── verify-installation-agy.js # Proposal item-by-kind compliance verification script
├── ECC/                                   # Upstream reference clone (READ-ONLY reference source)
│   ├── scripts/
│   │   ├── hooks/                         # 26 selected ECC hook scripts (referenced via CLAUDE_PLUGIN_ROOT)
│   │   └── lib/                           # Upstream shared libraries (utils.js, hook-flags.js, state-store/)
│   ├── manifests/                         # Base manifests (UNALTERED)
│   └── install.sh                         # Original installer (UNALTERED)
└── docs/
    ├── PRD.md                             # Single Source of Truth Global PRD
    └── OBJ-03/                            # Objective 03 Suite (ECC Script Integration)
        ├── spec.md                        # Behavioral Specification: OBJ-03
        ├── design.md                      # Technical Design Document: OBJ-03 (This File)
        ├── task.md                        # Execution Checklist: OBJ-03
        └── artifacts/
            ├── proposal.md                # Approved Customization Proposal Document
            └── ecc-items.json             # Deduplicated Static Item Matrix Reference
```

---

## 3. Technical Design & API Specification

### 3.1 Component Details

#### 1. Environment Variable Template ([harness/.env.example](file:///d:/dev/agy-os/harness/.env.example))
- **Purpose**: Document required runtime environment variables to enable in-place ECC script loading via `CLAUDE_PLUGIN_ROOT`.
- **Variables Defined**:
  - `CLAUDE_PLUGIN_ROOT=d:/dev/agy-os/ECC`: Enables hook bootstrap resolvers (`plugin-hook-bootstrap.js`, `resolve-ecc-root.js`) to locate shared modules.
  - `ECC_HOOK_PROFILE=standard`: Sets active ECC hook profile gating.
  - `ECC_GOVERNANCE_CAPTURE=1`: Enables security policy and secret scanning hooks.
  - `ECC_DISABLED_HOOKS=`: Comma-separated list of disabled hook IDs.
  - `ECC_SESSION_ID=`: Active session identifier for telemetry and compaction hooks.

#### 2. Expanded AGY Pre-Tool Guardrail ([.agents/hooks/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/hooks/scripts/pre-tool-guardrail-agy.js))
- **Purpose**: Intercept `PreToolUse` events for `run_command` / Bash execution tools, analyzing tool payload arguments for safety violations.
- **Inspection Logic**:
  1. Reads JSON payload from stdin.
  2. Extracts command string argument (`tool_input.command` or `tool_input.CommandLine`).
  3. Checks command string against forbidden patterns:
     - Target repo mutations: `d:/CLAUDE-PROJECT/website`, `CLAUDE-PROJECT/website`, `../website`.
     - Windows backslashes in tool paths or documentation parameters: `\` characters in paths.
     - Destructive file writes targeting READ-ONLY boundaries (`echo >`, `rm -rf website`).
  4. Returns exit code 2 with structured blocking message if a violation is detected; returns exit code 0 if cleared.

#### 3. Standalone Non-Destructive Hook Merger ([harness/agy-script/scripts/merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js))
- **Purpose**: Merge upstream ECC `hooks.json` into `.agents/hooks.json` while preserving AGY-native hooks and excluding platform-incompatible entries.
- **Algorithm Flow**:
  1. **Source Validation**: Checks existence and parses `ECC/hooks.json` (or `ECC/manifests/hooks.json`).
  2. **Atomic Backup**: Checks if target `.agents/hooks.json` exists; if present, creates copy at `.agents/hooks.json.bak`.
  3. **Target Ingestion & Filter**: Ingests existing target hooks, preserving AGY-native IDs (`post:agy-observation-envelope`, `pre:agy-guardrail`) and filtering out excluded IDs (`stop:desktop-notify`).
  4. **Source Ingestion & Filter**: Ingests upstream source hooks, filtering out excluded IDs (`stop:desktop-notify`). Does not overwrite preserved AGY-native entries.
  5. **Order Stabilization**: Sorts `PreToolUse` array so `pre:agy-guardrail` is pinned as index 0.
  6. **Atomic Write**: Formats merged JSON and writes to [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json).

#### 4. Installer Modification ([harness/agy-script/scripts/install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js))
- **Modification Target**: Replaces nuclear file copy logic at lines 287–303:
  ```javascript
  // OLD (Nuclear Copy):
  // fs.copyFileSync(eccHooksPath, targetHooksPath);

  // NEW (Non-Destructive Merger Call):
  import { mergeHooks } from './merge-hooks-agy.js';
  mergeHooks(eccHooksPath, targetHooksPath, targetHooksBackupPath);
  ```

#### 5. AGY-Native Custom Helper Library Location ([.agents/hooks/scripts/lib/](file:///d:/dev/agy-os/.agents/hooks/scripts/lib/))
- **Purpose**: Scope custom JavaScript helper modules created specifically for AGY-native runtime scripts (`*-agy.js`).
- **Naming & Resolution**:
  - All files in this directory MUST use the `-agy.js` suffix convention (AGENTS.md §11).
  - Keeps custom runtime helpers organized without mixing with top-level hook interceptors in `.agents/hooks/scripts/`.
  - Upstream ECC shared libraries (`utils.js`, `hook-flags.js`, `state-store/`) remain strictly in `ECC/scripts/lib/` and are resolved in-place via `CLAUDE_PLUGIN_ROOT`.

---

### 3.2 Data Schemas & Contracts

#### Lifecycle Hooks Configuration Schema (`claude-code-hooks.schema.json`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ClaudeCodeHooksConfig",
  "type": "object",
  "required": ["hooks"],
  "properties": {
    "$schema": { "type": "string" },
    "hooks": {
      "type": "object",
      "additionalProperties": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["matcher", "hooks"],
          "properties": {
            "id": { "type": "string" },
            "matcher": { "type": "string" },
            "description": { "type": "string" },
            "hooks": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["type", "command"],
                "properties": {
                  "type": { "type": "string", "enum": ["command"] },
                  "command": { "type": "string" },
                  "async": { "type": "boolean" },
                  "timeout": { "type": "integer" }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

#### Merge Operation Contract Interface
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "MergeHooksOperationSpec",
  "type": "object",
  "required": ["eccSourcePath", "targetPath", "backupPath", "preserveIds", "excludeIds"],
  "properties": {
    "eccSourcePath": { "type": "string" },
    "targetPath": { "type": "string" },
    "backupPath": { "type": "string" },
    "preserveIds": {
      "type": "array",
      "items": { "type": "string" },
      "default": ["post:agy-observation-envelope", "pre:agy-guardrail"]
    },
    "excludeIds": {
      "type": "array",
      "items": { "type": "string" },
      "default": ["stop:desktop-notify"]
    }
  }
}
```

---

## 4. Key Design Decisions

| Decision | Selected Option | Rationale | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **ECC Script Loading Architecture** | In-Place Reference Model (`CLAUDE_PLUGIN_ROOT=d:/dev/agy-os/ECC`) | Eliminates duplicate script copies, ensures exact upstream reference isolation (AGENTS.md §3), and keeps total prompt token footprint low (+275 tokens). | Copying 26 script files into `.agents/hooks/scripts/` or symlinking files (fragile on Windows) |
| **CLAUDE_PLUGIN_ROOT Resolution** | Environment Variable Documented in `harness/.env.example` | Standard cross-platform configuration model supported natively by ECC bootstrap resolvers without code modification. | Hardcoding absolute machine paths in script entrypoints or wrapping each hook in a custom runner wrapper |
| **AGY-Native Helper Library Location** | [.agents/hooks/scripts/lib/](file:///d:/dev/agy-os/.agents/hooks/scripts/lib/) | Scopes custom AGY runtime helper modules with `-agy.js` suffix (AGENTS.md §11) while maintaining in-place resolution for upstream `ECC/scripts/lib/`. | Copying ECC shared libraries into `.agents/hooks/lib/` or placing helpers in workspace root |
| **Hooks File Installation** | Non-Destructive Merger (`merge-hooks-agy.js`) | Replaces nuclear file copying to preserve local AGY-native hooks (`post:agy-observation-envelope`, `pre:agy-guardrail`) across reinstalls. | Nuclear file copying (`fs.copyFileSync`) or manual JSON editing |
| **Platform Incompatible Hook Handling** | Explicit Blacklist Filter (`stop:desktop-notify`) | Automatically filters out Windows-incompatible notification hooks during merger execution, avoiding shell pop-up errors. | Including desktop-notify and swallowing runtime errors, or modifying upstream ECC source files |

---

## 5. Non-Destructive Guardrails & Rollback Architecture

### 5.1 Non-Destructive Guarantee
- **Upstream ECC Protection**: The canonical `ECC/` source directory (`d:/dev/agy-os/ECC/`) is treated strictly as READ-ONLY. No files inside `ECC/` are written, modified, or deleted (AGENTS.md §3).
- **Target Repository Protection**: Target repository `d:/CLAUDE-PROJECT/website` is strictly READ-ONLY (AGENTS.md §1). All proposed changes are staged as patch files in [harness/patches/](file:///d:/dev/agy-os/harness/patches/).
- **Script Location Boundaries**: Runtime hook interceptors reside in `.agents/hooks/scripts/*-agy.js` and custom runtime helper libraries reside in `.agents/hooks/scripts/lib/*-agy.js` per AGENTS.md §11. Installer and merger scripts reside under `harness/agy-script/scripts/*-agy.js` per AGENTS.md §4.

### 5.2 Rollback & Backup Strategy
- **Atomic Hooks Backup**: Before any mutation to [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json), [merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js) creates a synchronous backup copy at [.agents/hooks.json.bak](file:///d:/dev/agy-os/.agents/hooks.json.bak).
- **Automated Teardown Script ([uninstall-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-agy.sh))**: If verification fails or prompt token utilization exceeds 95%, manual user confirmation triggers `uninstall-agy.sh` to revert `.agents/hooks.json` from `.agents/hooks.json.bak` and remove custom runtime additions.

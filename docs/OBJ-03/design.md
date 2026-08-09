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
Objective 03 defines the technical architecture for activating the complete **ECC Script Integration** pipeline within the Antigravity harness environment ([agy-os](file:///d:/dev/agy-os)). Following approved Customization Proposal-02 ([proposal-02.md](file:///d:/dev/agy-os/docs/OBJ-03/artifacts/proposal-02.md)), this design resolves four critical operational gaps by establishing a **100% Self-Contained Harness Architecture**:
1. **Runtime Dependency & Environment Coupling**: Replaces external `CLAUDE_PLUGIN_ROOT` environment lookup with physical migration of all 46 support scripts, 26 hook scripts, 7 shared libraries, and 2 AGY-native scripts into [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) and [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/), creating a 100% self-contained, autonomous harness with zero external environment dependencies.
2. **Unwired & Scope-Limited Guardrail**: Co-locates `pre:agy-guardrail` ([.agents/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/scripts/pre-tool-guardrail-agy.js)) in [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) as the primary `PreToolUse` hook in [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json) and expands its inspection logic to analyze Bash command strings for target repository access violations.
3. **Nuclear Hooks Copying & Script Path Transformation**: Replaces destructive `hooks.json` overwrites in [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) with a non-destructive merger utility ([merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js)) that rewrites hook script command paths to `.agents/scripts/*.js` while preserving AGY-native hook entries (`post:agy-observation-envelope`, `pre:agy-guardrail`).
4. **Platform Incompatibility**: Excludes Windows-incompatible `stop:desktop-notify` hooks during hook configuration merging.

### Goals / Non-Goals
- **Goals**:
  - Physically migrate all 46 support scripts, 26 active hook scripts (`desktop-notify` excluded), 7 shared libraries (`utils.js`, `hook-flags.js`, `resolve-ecc-root.js`, `state-store/`), and 2 AGY-native scripts into [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) and [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/).
  - Expand the automated path alignment transformer in [harness/agy-script/scripts/install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) (`alignUnifiedScriptPaths`) to rewrite relative imports (`require('../lib/utils')` -> `require('./lib/utils')`), hook script config paths (`"ECC/scripts/hooks/"` -> `".agents/scripts/"`), and workflow command calls (`node ECC/scripts/...` -> `node .agents/scripts/...`).
  - Co-locate [.agents/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/scripts/pre-tool-guardrail-agy.js) and [.agents/scripts/observation-envelope-agy.js](file:///d:/dev/agy-os/.agents/scripts/observation-envelope-agy.js) in [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) and wire `pre:agy-guardrail` as the first entry in [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json).
  - Create standalone merger utility [harness/agy-script/scripts/merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js) with AGY-native preservation, script path transformation to `.agents/scripts/`, platform exclusion filtering (`stop:desktop-notify`), and atomic backup creation ([.agents/hooks.json.bak](file:///d:/dev/agy-os/.agents/hooks.json.bak)).
  - Maintain total prompt token budget utilization strictly at **89.31%** (zero prompt token addition from JS runtime scripts co-located in `.agents/scripts/`).
- **Non-Goals**:
  - Modifying or altering files inside the canonical upstream [ECC](file:///d:/dev/agy-os/ECC) directory (treated strictly as READ-ONLY source for installer physical migration).
  - Requiring runtime environment variables like `CLAUDE_PLUGIN_ROOT` for runtime script resolution.
  - Direct file modification, creation, or deletion inside target repository [website](file:///d:/CLAUDE-PROJECT/website) (`d:/CLAUDE-PROJECT/website`).
  - Modifying base installer scripts `ECC/install.sh` or `ECC/scripts/install-apply.js`.

---

## 2. Directory Layout & Component Structure

```text
d:/dev/agy-os/
├── .agents/
│   ├── scripts/                           # [100% SELF-CONTAINED] Co-located Runtime Scripts & Subfolders
│   │   ├── pre-bash-dispatcher.js         # Copied ECC Hook Script (require('./lib/utils'))
│   │   ├── harness-audit.js               # Copied Support Script (require('./lib/utils'))
│   │   ├── loop-status.js                 # Copied Support Script (require('./lib/state-store'))
│   │   ├── pre-tool-guardrail-agy.js      # [ADAPT + WIRE] AGY Guardrail Script (co-located)
│   │   ├── observation-envelope-agy.js    # [KEEP] AGY PostToolUse Envelope Script (co-located)
│   │   ├── ci/                            # Copied support subfolder
│   │   ├── codemaps/                      # Copied support subfolder
│   │   ├── codex/                         # Copied support subfolder
│   │   ├── discord/                       # Copied support subfolder
│   │   └── lib/                           # [CO-LOCATED] Shared Libraries & State Store Modules
│   │       ├── utils.js                   # Shared utility library
│   │       ├── hook-flags.js              # Hook profile & flag evaluation library
│   │       ├── resolve-ecc-root.js        # Root resolver library
│   │       └── state-store/               # State store module (index, queries, schema, migrations)
│   ├── hooks.json                         # [ADAPT] Merged Lifecycle Hooks Config (pointing to .agents/scripts/*.js)
│   ├── hooks.json.bak                     # [NEW] Atomic backup created before merge-hooks mutation
│   ├── plugin/ecc/                        # Installed ECC Plugin Target Directory
│   ├── rules/                             # Flat Rules Directory (.agents/rules/<name>.md)
│   ├── skills/                            # Native Agent Skills Directory (.agents/skills/<skill-name>/SKILL.md)
│   └── workflows/                         # Flat Workflows Registry (Slash Commands & /a-<name> Bridges)
├── harness/
│   ├── .env.example                       # Environment variable documentation template (optional flags)
│   ├── manifests/                         # Custom Manifest Overlay Directory (*.custom.json)
│   ├── patches/                           # Root Patch Staging Directory for Target Repo
│   └── agy-script/                        # Custom Installer & Governance Verification Scripts (AGENTS.md §4)
│       ├── install-agy.sh                 # Custom Installer Entrypoint
│       ├── uninstall-agy.sh               # Automated Teardown Script (cleaning .agents/scripts/)
│       ├── post-install-agy.js            # Subagent Restructuring & Bridge Workflow Generator
│       └── scripts/
│           ├── install-apply-agy.js       # [ADAPT] Physical script copier & path transformer engine
│           ├── merge-hooks-agy.js         # [CREATE] Non-destructive merger updating paths to .agents/scripts/
│           ├── scan-target-repo.js        # Quantitative techstack scanner script
│           └── verify-installation-agy.js # Proposal item-by-kind compliance verification script
├── ECC/                                   # Upstream reference clone (READ-ONLY source for installer)
└── docs/
    └── OBJ-03/                            # Objective 03 Suite (ECC Script Integration)
        ├── spec.md                        # Behavioral Specification: OBJ-03
        ├── design.md                      # Technical Design Document: OBJ-03 (This File)
        ├── task.md                        # Execution Checklist: OBJ-03
        └── artifacts/
            ├── proposal.md                # Approved Proposal-01 Reference Document
            ├── proposal-02.md             # Approved Proposal-02 (100% Self-Contained) Document
            └── ecc-items.json             # Deduplicated Static Item Matrix Reference
```

---

## 3. Technical Design & API Specification

### 3.1 Component Details

#### 1. Environment Variable Template ([harness/.env.example](file:///d:/dev/agy-os/harness/.env.example))
- **Purpose**: Document optional runtime environment variable flags for hook profiles and governance settings. Runtime scripts execute with zero reliance on `CLAUDE_PLUGIN_ROOT` because shared libraries resolve locally via `./lib/`.
- **Variables Defined**:
  - `ECC_HOOK_PROFILE=standard`: Sets active ECC hook profile gating.
  - `ECC_GOVERNANCE_CAPTURE=1`: Enables security policy and secret scanning hooks.
  - `ECC_DISABLED_HOOKS=`: Comma-separated list of disabled hook IDs.
  - `ECC_SESSION_ID=`: Active session identifier for telemetry and compaction hooks.

#### 2. Expanded AGY Pre-Tool Guardrail ([.agents/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/scripts/pre-tool-guardrail-agy.js))
- **Purpose**: Intercept `PreToolUse` events for `run_command` / Bash execution tools, analyzing tool payload arguments for safety violations. Co-located in [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/).
- **Inspection Logic**:
  1. Reads JSON payload from stdin.
  2. Extracts command string argument (`tool_input.command` or `tool_input.CommandLine`).
  3. Checks command string against forbidden patterns:
     - Target repo mutations: `d:/CLAUDE-PROJECT/website`, `CLAUDE-PROJECT/website`, `../website`.
     - Windows backslashes in tool paths or documentation parameters: `\` characters in paths.
     - Destructive file writes targeting READ-ONLY boundaries (`echo >`, `rm -rf website`).
  4. Returns exit code 2 with structured blocking message if a violation is detected; returns exit code 0 if cleared.

#### 3. Standalone Non-Destructive Hook Merger ([harness/agy-script/scripts/merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js))
- **Purpose**: Merge upstream ECC `hooks.json` into `.agents/hooks.json` while preserving AGY-native hooks, updating command script paths to point to `.agents/scripts/*.js`, and excluding platform-incompatible entries.
- **Algorithm Flow**:
  1. **Source Validation**: Checks existence and parses `ECC/hooks.json` (or `ECC/manifests/hooks.json`).
  2. **Atomic Backup**: Checks if target `.agents/hooks.json` exists; if present, creates copy at [.agents/hooks.json.bak](file:///d:/dev/agy-os/.agents/hooks.json.bak).
  3. **Target Ingestion & Filter**: Ingests existing target hooks, preserving AGY-native IDs (`post:agy-observation-envelope`, `pre:agy-guardrail`) and filtering out excluded IDs (`stop:desktop-notify`).
  4. **Source Ingestion & Path Transformation**: Ingests upstream source hooks, filtering out excluded IDs (`stop:desktop-notify`), and transforms hook script execution command paths from `"ECC/scripts/hooks/<name>.js"` (or `"node ECC/scripts/hooks/..."`) to point directly to `".agents/scripts/<name>.js"`. Does not overwrite preserved AGY-native entries.
  5. **Order Stabilization**: Sorts `PreToolUse` array so `pre:agy-guardrail` is pinned as index 0.
  6. **Atomic Write**: Formats merged JSON and writes to [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json).

#### 4. Physical Script Copier & Transformer Engine ([harness/agy-script/scripts/install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js))
- **Purpose**: Copies all 46 support scripts, 26 active hook scripts, 7 shared libraries, and subfolders into [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) and [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/), executing automated path alignment transformations.
- **Path Alignment Transformer (`alignUnifiedScriptPaths`)**:
  - Rewrites relative import paths inside copied scripts (`require('../lib/utils')` -> `require('./lib/utils')`, `require('../lib/state-store')` -> `require('./lib/state-store')`).
  - Rewrites script invocation paths in generated workflows (`node ECC/scripts/...` -> `node .agents/scripts/...`).
  - Invokes `mergeHooks` from `merge-hooks-agy.js` to perform non-destructive hook configuration merging with path rewriting.

#### 5. Co-located Shared Library & State Store Location ([.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/))
- **Purpose**: Scopes co-located shared JavaScript library modules (`utils.js`, `hook-flags.js`, `resolve-ecc-root.js`, `state-store/`) physically copied into [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/).
- **Naming & Resolution**:
  - Permits direct relative imports (`require('./lib/utils')`) without requiring environment variables (`CLAUDE_PLUGIN_ROOT`) or external path resolution adapters.
  - Keeps top-level hook scripts and support scripts in [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) cleanly separated from shared utility libraries.

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
| **ECC Script Loading Architecture** | 100% Self-Contained Migration Model ([.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/)) | Physical migration of all 46 support scripts, 26 hook scripts, 7 shared libraries, and 2 AGY native scripts into `.agents/scripts/` eliminates external directory coupling, guarantees zero runtime environment variable dependencies (`CLAUDE_PLUGIN_ROOT`), and keeps total prompt token footprint at 89.31% (0 prompt token impact). | In-place reference via `CLAUDE_PLUGIN_ROOT` (Proposal-01, fragile if env unset), dynamic path shims, or symlinks (fragile on Windows). |
| **Environment Variable Coupling** | Zero External Env Dependency | All scripts execute as 100% self-contained Node.js modules inside [agy-os](file:///d:/dev/agy-os) without relying on shell environment variables. | Requiring `CLAUDE_PLUGIN_ROOT` in user shell profiles or wrapper runner scripts. |
| **Shared Library Location** | Co-located [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/) | Co-locates shared libraries (`utils.js`, `hook-flags.js`, `state-store/`) directly under `.agents/scripts/lib/`, permitting adapter-free relative imports (`require('./lib/utils')`). | In-place resolution in `ECC/scripts/lib/` via `CLAUDE_PLUGIN_ROOT` or copying libraries into workspace root. |
| **Hooks File Installation & Path Transformation** | Non-Destructive Merger with Path Rewriting (`merge-hooks-agy.js`) | Merges upstream hook definitions into [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json), updates `"script"` paths to point to `.agents/scripts/*.js`, preserves AGY-native hook entries (`post:agy-observation-envelope`, `pre:agy-guardrail`), and creates atomic backup [.agents/hooks.json.bak](file:///d:/dev/agy-os/.agents/hooks.json.bak). | Nuclear file copying (`fs.copyFileSync`) or manual JSON editing. |
| **Platform Incompatible Hook Handling** | Explicit Blacklist Filter (`stop:desktop-notify`) | Automatically filters out Windows-incompatible notification hooks during merger execution, avoiding shell pop-up errors. | Including desktop-notify and swallowing runtime errors, or modifying upstream ECC source files. |

---

## 5. Non-Destructive Guardrails & Rollback Architecture

### 5.1 Non-Destructive Guarantee
- **Upstream ECC Protection**: The canonical `ECC/` source directory (`d:/dev/agy-os/ECC/`) is treated strictly as READ-ONLY source for installer physical migration. No files inside `ECC/` are written, modified, or deleted (AGENTS.md §3).
- **Target Repository Protection**: Target repository `d:/CLAUDE-PROJECT/website` is strictly READ-ONLY (AGENTS.md §1). All proposed changes are staged as patch files in [harness/patches/](file:///d:/dev/agy-os/harness/patches/).
- **Script Location Boundaries**: Runtime hook scripts, support scripts, subfolders (`ci/`, `codemaps/`, `codex/`, `discord/`), and shared libraries reside in [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) and [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/) per updated AGENTS.md §11. Custom installer and merger scripts reside under `harness/agy-script/scripts/*-agy.js` per AGENTS.md §4.

### 5.2 Rollback & Backup Strategy
- **Atomic Hooks Backup**: Before any mutation to [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json), [merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js) creates a synchronous backup copy at [.agents/hooks.json.bak](file:///d:/dev/agy-os/.agents/hooks.json.bak).
- **Automated Teardown Script ([uninstall-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-agy.sh))**: If verification fails or prompt token utilization exceeds 95%, manual user confirmation triggers `uninstall-agy.sh` to revert [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json) from [.agents/hooks.json.bak](file:///d:/dev/agy-os/.agents/hooks.json.bak) and remove all migrated scripts, support subfolders, and shared libraries from [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) and [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/).

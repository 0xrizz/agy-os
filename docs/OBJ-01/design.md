# Technical Design Document: OBJ-01 Custom ECC Installation

<!-- 
AI INSTRUCTION:
This template defines the technical architecture and design specifications.
When populating this file:
- Clearly delineate Goals vs Non-Goals to control project scope.
- Provide explicit annotated directory structures and component layouts.
- Detail data models, schemas, and API contracts.
- Explicitly document trade-offs and rationale for key architectural choices.
- Use forward slashes (/) for all file paths.
- Use clickable file:/// links for all referenced file paths.
-->

## 1. Overview & Architecture Goals

### Context
Objective 01 defines the technical architecture for selectively installing and customizing the **ECC (Everything-as-Code)** toolkit into the Antigravity harness environment ([agy-os](file:///d:/dev/agy-os)).

### Goals / Non-Goals
- **Goals**:
  - Perform automated quantitative target repository analysis via scanner script ([scan-target-repo.js](file:///d:/dev/agy-os/harness/agy-script/scripts/scan-target-repo.js)).
  - Determine customization manifest items based on 2 criteria: Kriteria 1 (Quantitative Scanner) + Kriteria 2 (Qualitative User Workflow Needs).
  - Isolate custom manifest definitions in [harness/manifests/*.custom.json](file:///d:/dev/agy-os/harness/manifests/) to prevent loss during upstream `ECC/` updates.
  - Deep-merge base `ECC/manifests/` with [harness/manifests/](file:///d:/dev/agy-os/harness/manifests/) using a strict Fail-Fast rule (abort on duplicate ID).
  - Support project intent declaration via `ecc-install.json`.
  - Isolate installed ECC subagents inside [.agents/plugin/ecc/agents/](file:///d:/dev/agy-os/.agents/plugin/ecc/agents/) and platform configs under [.agents/plugin/ecc/platform/](file:///d:/dev/agy-os/.agents/plugin/ecc/platform/).
  - Convert native ECC agents to Antigravity subagents formatted as [.agents/plugin/ecc/agents/<name>/agent.md](file:///d:/dev/agy-os/.agents/plugin/ecc/agents/).
  - Deploy installed rules flat under [.agents/rules/<name>.md](file:///d:/dev/agy-os/.agents/rules/), workflows flat under [.agents/workflows/<name>.md](file:///d:/dev/agy-os/.agents/workflows/) (base workflows & `/a-<name>` bridge workflows), skills under [.agents/skills/<skill-name>/SKILL.md](file:///d:/dev/agy-os/.agents/skills/), and hooks directly at [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json).
  - Maintain non-destructive installation via custom `agy` suffix scripts located in [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/).
  - Enforce token budget governance between 85% – 95% with user warning & manual confirmation before rollback.
  - Enforce physical installation compliance per kind against [proposal.md](file:///d:/dev/agy-os/docs/OBJ-01/artifacts/proposal.md) Section 2.2 via [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) (Fail-Fast exit code 1).
- **Non-Goals**:
  - Modifying original upstream [ECC](file:///d:/dev/agy-os/ECC) repository files or manifest files directly inside `ECC/manifests/`.
  - Modifying target repository [website](file:///d:/CLAUDE-PROJECT/website) directly without patch staging in [harness/patches/](file:///d:/dev/agy-os/harness/patches/).
  - Installing ECC agents directly into root `.agents/skills/` or legacy `.agent/`.

---

## 2. Directory Layout & Component Structure

```text
d:/dev/agy-os/
├── .agents/
│   ├── plugin/
│   │   └── ecc/                           # Isolated ECC Plugin Target Directory
│   │       ├── agents/                    # Converted Antigravity Subagent Folders
│   │       │   └── <agent-name>/
│   │       │       ├── agent.md           # Antigravity Subagent Entrypoint
│   │       │       ├── prompts/           # Supporting agent prompt assets
│   │       │       └── references/        # Supporting reference docs
│   │       └── platform/                  # Managed platform configs
│   ├── rules/                             # Flat Rules Directory (.agents/rules/<name>.md)
│   │   └── <name>.md                      # e.g., common-agents.md, typescript-coding-style.md
│   ├── skills/                            # Native Agent Skills Directory (.agents/skills/<skill-name>/SKILL.md)
│   │   └── <skill-name>/
│   │       └── SKILL.md
│   ├── workflows/                         # Flat Workflows Directory (Base & Bridge Workflows)
│   │   ├── plan.md                        # Base ECC workflow (/plan)
│   │   ├── a-planner.md                   # Bridge workflow for planner subagent (/a-planner)
│   │   └── <name>.md                      # Workflow mapping to slash command
│   └── hooks.json                         # Single Lifecycle Hooks Config File
├── harness/
│   ├── manifests/                         # Custom Manifest Overlay & Backup Directory
│   │   ├── install-modules.custom.json    # Custom module additions/extensions
│   │   ├── install-components.custom.json # Custom user-facing component mappings
│   │   └── install-profiles.custom.json   # Custom profile presets (e.g. agy-developer)
│   ├── patches/                           # Target Repository Patch Staging Directory
│   └── agy-script/                        # Consolidated Custom Installer & Teardown Scripts
│       ├── install-agy.sh                 # Custom installer shell entrypoint
│       ├── uninstall-agy.sh               # Automated teardown script
│       ├── post-install-agy.js            # Dynamic agent restructure & bridge workflow generator
│       ├── scripts/
│       │   ├── scan-target-repo.js        # Quantitative techstack scanner script
│       │   ├── install-apply-agy.js       # Custom installer apply script with manifest merger
│       │   └── verify-installation-agy.js # Proposal item-by-kind compliance verification script
│       └── adapters/
│           └── antigravity-project-agy.js # Target adapter for .agents/plugin/ecc/
├── ecc-install.json                       # Project-level installation intent config
├── ECC/                                   # Upstream reference clone (READ-ONLY source)
│   ├── manifests/                         # Base manifests (UNALTERED)
│   ├── install.sh                         # Original installer (UNALTERED)
│   └── scripts/                           # Original scripts (UNALTERED)
└── docs/
    ├── PRD.md                             # Global PRD document
    ├── template/                          # Standardized OpenAGY templates
    │   ├── PRD.md
    │   ├── spec.md
    │   ├── design.md
    │   ├── task.md
    │   └── prompt.md
    └── OBJ-01/                            # Objective 01 documentation
        ├── PRD.md                         # Dedicated Objective 01 PRD
        ├── spec.md                        # Behavioral specification
        ├── design.md                      # Technical design document
        ├── task.md                        # Execution checklist
        ├── prompt.md                      # System prompt & agent execution rules
        └── artifacts/
            ├── proposal.md                # Approved Customization Proposal artifact
            └── ecc-items.json             # Deduplicated Static Item Matrix Reference
```

---

## 3. Technical Design & API Specification

### 3.1 Pre-Installation Target Analysis & Proposal Workflow
Before creating custom manifest files or running installer scripts, the system executes a 4-step collaborative proposal workflow:
1. **Quantitative Target Scanner Execution**: Run [scan-target-repo.js](file:///d:/dev/agy-os/harness/agy-script/scripts/scan-target-repo.js) to inspect target repository [website](file:///d:/CLAUDE-PROJECT/website) config files (`package.json`, `tsconfig.json`, `wrangler.json`, `prisma/schema.prisma`, file extension breakdown) to obtain quantitative techstack metrics (Kriteria 1).
2. **Interactive Component Wizard**: Conduct interactive component wizard per category combining Kriteria 1 (Quantitative Scanner) and Kriteria 2 (Qualitative User Agentic Workflow Needs).
3. **Customization Proposal Drafting**: Draft formal proposal document [proposal.md](file:///d:/dev/agy-os/docs/OBJ-01/artifacts/proposal.md) containing recommended modules, profile definitions, and prompt token load estimates (target: 85%–95%).
4. **User Proposal Approval**: Explicit approval from the user is required before proceeding to Task 3 (Custom Manifest Overlay & Intent Setup).

### 3.2 Custom Manifest Overlay & Merger ([harness/manifests/](file:///d:/dev/agy-os/harness/manifests/))
- **Manifest Backup Strategy**: Custom profiles, modules, and components are stored in `harness/manifests/*.custom.json` inside the `agy-os` repo. Upstream `ECC/manifests/` files remain completely untouched, ensuring custom manifests persist across upstream `git pull` updates.
- **Manifest Merger Engine ([install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js))**:
  1. Reads base manifests from `ECC/manifests/install-*.json`.
  2. Reads custom overlay manifests from `harness/manifests/install-*.custom.json`.
  3. **Strict Fail-Fast Validation**: Checks for duplicate module, component, or profile IDs. If any duplicate ID is found, execution is immediately aborted with exit code 1 and a detailed error message indicating conflicting IDs.
  4. Merges valid base and custom manifests into a unified in-memory manifest.
  5. Resolves the installation plan based on `ecc-install.json` or CLI flags without omitting any custom module.

### 3.3 Custom Installer Architecture ([harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/))
- **Consolidated Script Directory**: All custom installation, transformation, and uninstallation scripts reside under `harness/agy-script/`.
- **Non-Destructive Adapter**: [antigravity-project-agy.js](file:///d:/dev/agy-os/harness/agy-script/adapters/antigravity-project-agy.js) maps target installation locations to [.agents/plugin/ecc/agents/](file:///d:/dev/agy-os/.agents/plugin/ecc/agents/), [.agents/rules/](file:///d:/dev/agy-os/.agents/rules/), [.agents/workflows/](file:///d:/dev/agy-os/.agents/workflows/), [.agents/skills/](file:///d:/dev/agy-os/.agents/skills/), and [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json) instead of legacy `.agent/`.
- **Custom Entrypoint**: [install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh) and [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) execute installation plans using dynamic `__dirname` path resolution to reference `ECC/` source assets.
- **Dynamic Post-Install Pipeline ([post-install-agy.js](file:///d:/dev/agy-os/harness/agy-script/post-install-agy.js))**:
  1. Restructures subagents into `.agents/plugin/ecc/agents/<name>/agent.md`.
  2. Restructures rules into flat `.agents/rules/<name>.md` files.
  3. Deploys base workflows and `/a-<name>` bridge workflows into flat `.agents/workflows/<name>.md` files.
  4. Deploys hooks config into `.agents/hooks.json`.

### 3.4 Data Schemas & Contracts

#### Project Intent Schema (`ecc-install.json`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ECCInstallConfig",
  "type": "object",
  "properties": {
    "target": { "type": "string", "enum": ["antigravity", "claude", "cursor"] },
    "profile": { "type": "string" },
    "withComponents": { "type": "array", "items": { "type": "string" } },
    "withoutComponents": { "type": "array", "items": { "type": "string" } },
    "configVersion": { "type": "integer" }
  },
  "required": ["target", "profile"]
}
```

#### Custom Module Overlay Schema (`harness/manifests/install-modules.custom.json`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ECCCustomModuleOverlay",
  "type": "object",
  "properties": {
    "modules": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "description": { "type": "string" },
          "category": { "type": "string" },
          "files": { "type": "array", "items": { "type": "string" } }
        },
        "required": ["id", "name", "category", "files"]
      }
    }
  },
  "required": ["modules"]
}
```

#### Bridge Workflow Schema (`.agents/workflows/a-<name>.md`)
```markdown
---
description: Bridge workflow delegating to <name> subagent.
---

# Bridge Workflow: Delegate to Subagent <name>

Execute the subagent instructions defined in `.agents/plugin/ecc/agents/<name>/agent.md`.
Pass all user context, target files, and parameters to the subagent execution context.
```

### 3.5 Proposal Item Compliance Verification Engine ([verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js))
- **Purpose**: Verify that every item declared in static reference artifact [ecc-items.json](file:///d:/dev/agy-os/docs/OBJ-01/artifacts/ecc-items.json) (derived from [proposal.md](file:///d:/dev/agy-os/docs/OBJ-01/artifacts/proposal.md) Section 2.2) physically exists in the target harness directories after installation.
- **Parsing Strategy**: Reads and parses `docs/OBJ-01/artifacts/ecc-items.json`, validating item lists across all 6 root keys (`rules`, `agents`, `commands`, `hooks`, `skills`, `platform`).
- **Directory Mapping per Kind**:
  - `rules` -> `.agents/rules/<name>.md`
  - `agents` -> `.agents/plugin/ecc/agents/<name>/agent.md`
  - `commands` -> `.agents/workflows/<name>.md`
  - `hooks` -> `.agents/hooks.json`
  - `skills` -> `.agents/skills/<skill-name>/SKILL.md`
  - `platform` -> `.agents/plugin/ecc/platform/`
- **Execution & Fail-Fast Output**:
  - Outputs a structured console audit report categorized by Kind showing `[MATCH]`, `[MISSING]`, or `[EXTRA]`.
  - Exits with `exit code 0` if 100% compliant.
  - Exits with `exit code 1` if any missing item or unapproved extra item is detected.

---

## 4. Key Design Decisions

| Decision | Selected Option | Rationale | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **Techstack Scanning** | Automated Script ([scan-target-repo.js](file:///d:/dev/agy-os/harness/agy-script/scripts/scan-target-repo.js)) | Provides quantitative data (Kriteria 1) on dependencies, frameworks, DBs, and file types. | Manual file checking |
| **Component Selection Criteria** | 2 Criteria (Quantitative + Qualitative) | Combines automated scanner metrics with user's agentic workflow needs for optimal tailoring. | Static single profile selection |
| **Custom Manifest Backup** | [harness/manifests/*.custom.json](file:///d:/dev/agy-os/harness/manifests/) | Isolates custom manifest definitions so they are preserved when `ECC/` is updated from upstream. | Editing `ECC/manifests/` directly |
| **Conflict Resolution Strategy** | Strict Fail-Fast (Error & Exit Code 1 on duplicate ID) | Immediately aborts if duplicate IDs are detected to prevent unpredictable behavior. | Custom overlay silent override |
| **Custom Script Location** | [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/) | Consolidates all custom installation, transformation, and teardown scripts in one explicit harness directory. | Inside `ECC/` or root `scripts/` |
| **Installed Asset Locations** | `.agents/rules/<name>.md`, `.agents/workflows/<name>.md`, `.agents/skills/`, `.agents/hooks.json`, `.agents/plugin/ecc/agents/` | Ensures clean plugin isolation for subagents/platform while placing rules, workflows, skills, and hooks in flat target locations. | Root `.agent/` or legacy nested directories |
| **Subagent Invocations** | Dynamic Bridge Workflows (`/a-<name>`) | Scans `.agents/plugin/ecc/agents/` dynamically to generate `/a-<name>` slash commands. | Hardcoded agent list in config |
| **Teardown / Rollback Trigger** | Warning & Manual User Confirmation | Prompts user for manual confirmation before executing `uninstall-agy.sh` if token footprint > 95%. | Automatic silent deletion |
| **Proposal Item Compliance Verification** | Standalone Script ([verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js)) reading [ecc-items.json](file:///d:/dev/agy-os/docs/OBJ-01/artifacts/ecc-items.json) | Parses `ecc-items.json` and enforces Fail-Fast exit code 1 to guarantee physical file alignment per kind across all 6 item kinds. | Manual directory inspection or silent warnings |

---

## 5. Non-Destructive Guardrails & Rollback Architecture

### 5.1 Non-Destructive Guarantee
- **Upstream Protection**: Original upstream files [ECC/install.sh](file:///d:/dev/agy-os/ECC/install.sh), `ECC/scripts/install-apply.js`, and `ECC/manifests/*.json` MUST NOT be modified under any circumstances.
- **Target Repository Protection**: Target repository [website](file:///d:/CLAUDE-PROJECT/website) (`d:/CLAUDE-PROJECT/website`) is strictly READ-ONLY. No edits, file additions, or deletions occur inside `website/`. All recommended changes are staged in [harness/patches/](file:///d:/dev/agy-os/harness/patches/).
- **Custom Script Suffix Standard**: All custom installer entrypoints, adapters, and helper scripts reside in [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/) and use the `agy` suffix (`install-agy.sh`, `install-apply-agy.js`, `antigravity-project-agy.js`, `post-install-agy.js`, `uninstall-agy.sh`, `verify-installation-agy.js`).

### 5.2 Automated Rollback Strategy ([uninstall-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-agy.sh))
- If token budget utilization exceeds **95.0%**, or if custom installation verification fails, the harness displays a detailed overage notification.
- Upon manual user confirmation, [uninstall-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-agy.sh) is triggered to safely teardown installed assets:
  1. Recursively removes [.agents/plugin/ecc/](file:///d:/dev/agy-os/.agents/plugin/ecc/).
  2. Removes generated root bridge workflows (`.agents/workflows/a-*.md`).
  3. Reverts harness workspace state to clean pre-installation state without touching `ECC/` or `website/`.


# Technical Design Document: OBJ-02 Frameworks & OpenSpec Isolation Architecture

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
Objective 02 defines the technical architecture for custom ECC installation and framework suite isolation—specifically **OpenSpec** (`@fission-ai/openspec`)—within the Antigravity harness environment ([agy-os](file:///d:/dev/agy-os)). By executing custom ECC installation using scripts under [harness/agy-script/install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh) and encapsulating framework suites in dedicated subtrees under [frameworks/openspec](file:///d:/dev/agy-os/frameworks/openspec), `agy-os` maintains clean architectural boundaries, enforces patch staging for external target repository modifications, and enforces a single global Product Requirement Document ([docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md)) as the Single Source of Truth (SSOT).

### Goals / Non-Goals
- **Goals**:
  - Execute custom ECC installation for harness bootstrapping using scripts under [harness/agy-script/install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh), deep-merging custom manifest overlays, performing Fail-Fast physical installation verification via [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js), and maintaining an 85%–95% prompt token budget threshold.
  - Establish a clean, isolated framework subtree inside [frameworks/openspec](file:///d:/dev/agy-os/frameworks/openspec) for OpenSpec CLI tooling, specifications, workflows, and change management.
  - Enforce target repository isolation for [website](file:///d:/CLAUDE-PROJECT/website) (`d:/CLAUDE-PROJECT/website`) by routing all proposed target code changes into patch files staged strictly within [frameworks/openspec/harness/patches/](file:///d:/dev/agy-os/frameworks/openspec/harness/patches/) or root [harness/patches/](file:///d:/dev/agy-os/harness/patches/).
  - Synchronize governance policies between root [AGENTS.md](file:///d:/dev/agy-os/AGENTS.md) and framework-level governance [frameworks/openspec/AGENTS.md](file:///d:/dev/agy-os/frameworks/openspec/AGENTS.md), including universal forward-slash path formatting, Git Bash execution invariants, and boundary rules.
  - Maintain the OpenAGY Documentation Hierarchy Invariant (Section 6 of AGENTS.md), enforcing exactly ONE global PRD at [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md) while objective suite folders under `docs/OBJ-XX/` (e.g., [docs/OBJ-02/](file:///d:/dev/agy-os/docs/OBJ-02/)) contain strictly `spec.md`, `design.md`, `task.md`, and `artifacts/`.
  - Provide complete, automated rollback mechanisms and non-destructive guardrails to protect both harness and target codebases.
- **Non-Goals**:
  - Modifying or polluting the root `agy-os` top-level directory with internal OpenSpec framework engine runtime state or temporary CLI build artifacts.
  - Direct write access or in-place file mutation on target repository [website](file:///d:/CLAUDE-PROJECT/website).
  - Creating duplicate or conflicting `PRD.md` or `prompt.md` files within individual `docs/OBJ-XX/` directories.

---

## 2. Directory Layout & Component Structure

```text
d:/dev/agy-os/
├── .agents/                               # Root Agentic Workflows & Rules
│   ├── plugin/ecc/                        # Installed ECC Subagents & Platform Assets
│   ├── rules/                             # Flat Rules Directory (.agents/rules/<name>.md)
│   ├── skills/                            # Native Agent Skills Directory (.agents/skills/<skill-name>/SKILL.md)
│   ├── workflows/                         # Flat Workflows Registry (Slash Commands & /a-<name> Bridges)
│   └── hooks.json                         # Single Lifecycle Hooks Config
├── harness/
│   ├── manifests/                         # Custom Manifest Overlay Directory (*.custom.json)
│   ├── patches/                           # Root Patch Staging Directory for Target Repo
│   └── agy-script/                        # Custom Installer & Governance Verification Scripts
│       ├── install-agy.sh                 # Custom Installer Script Entrypoint
│       ├── uninstall-agy.sh               # Automated Rollback Teardown Script
│       ├── post-install-agy.js            # Subagent Restructuring & Bridge Workflow Generator
│       └── scripts/
│           ├── install-apply-agy.js       # Manifest Merger Engine with Strict Fail-Fast Validation
│           └── verify-installation-agy.js # Physical Installation & Token Footprint Verification Script
├── frameworks/
│   └── openspec/                          # Isolated OpenSpec Framework Subtree Root
│       ├── .agent/                        # OpenSpec Framework Engine & Internal Workflows
│       │   ├── skills/                    # OpenSpec Skills (openspec-propose, openspec-apply-change, etc.)
│       │   └── workflows/                 # OpenSpec Workflows (opsx-propose, opsx-apply, opsx-archive, etc.)
│       ├── .agents/                       # Subtree ECC Mirror & Rule Extensions
│       │   └── rules/                     # Framework-specific Rule Files
│       ├── harness/
│       │   └── patches/                   # OpenSpec Target Repo Patch Staging Directory
│       │       └── *.patch                # Staged Unified Diff Patches targeting target repo
│       ├── openspec/                      # Active OpenSpec Change Specs & Delta Specs
│       │   ├── config.yaml                # Framework Project Configuration
│       │   ├── changes/                   # Active OpenSpec Change Plans
│       │   └── specs/                     # Main System Specs & Domain Models
│       ├── AGENTS.md                      # Framework Subtree Governance File (Synchronized)
│       └── README.md                      # OpenSpec Framework Overview & Integration Docs
└── docs/
    ├── PRD.md                             # Single Source of Truth Global PRD
    ├── template/                          # Standardized OpenAGY Documentation Templates
    ├── OBJ-01/                            # Objective 01 Suite (Custom ECC Installation)
    │   ├── spec.md
    │   ├── design.md
    │   ├── task.md
    │   └── artifacts/
    └── OBJ-02/                            # Objective 02 Suite (Frameworks & OpenSpec Isolation Architecture)
        ├── spec.md                        # Behavioral Specification: OBJ-02
        ├── design.md                      # Technical Design Document: OBJ-02 (This File)
        ├── task.md                        # Execution Checklist: OBJ-02
        └── artifacts/                     # OBJ-02 Verification Reports & Decision Logs
```

---

## 3. Technical Design & API Specification

### 3.1 Component Details

#### 1. Custom ECC Installation & Harness Bootstrapping (`harness/agy-script/`)
- **Custom Installer Entrypoint**: Executed via [harness/agy-script/install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh) using Git Bash (`bash`), ensuring original upstream installer files (`ECC/install.sh`) remain strictly unmodified.
- **Manifest Merger Engine**: [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) deep-merges custom manifest overlays in [harness/manifests/*.custom.json](file:///d:/dev/agy-os/harness/manifests/) with base manifests, enforcing strict Fail-Fast validation upon duplicate module IDs.
- **Subagent Restructuring & Bridge Generator**: [post-install-agy.js](file:///d:/dev/agy-os/harness/agy-script/post-install-agy.js) places installed agents inside [.agents/plugin/ecc/agents/<name>/agent.md](file:///d:/dev/agy-os/.agents/plugin/ecc/agents/) and generates root bridge workflows in [.agents/workflows/a-<name>.md](file:///d:/dev/agy-os/.agents/workflows/).
- **Fail-Fast Compliance Audit**: [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) verifies physical installation across all 6 item kinds (`rules`, `agents`, `commands`, `hooks`, `skills`, `platform`) and checks that prompt token footprint is maintained within the **85% – 95%** threshold.

#### 2. OpenSpec Engine Integration (`frameworks/openspec/`)
- **Isolation Boundary**: All OpenSpec framework modules, CLI configurations, and change specifications run strictly inside [frameworks/openspec](file:///d:/dev/agy-os/frameworks/openspec).
- **Execution Scoping**: When executing OpenSpec commands (such as `/opsx-propose`, `/opsx-apply`, `/opsx-archive`), the execution context is scoped to `frameworks/openspec/`, ensuring internal engine state, cache, and spec deltas never pollute the root harness directory (`agy-os`).
- **Slash Command Integration**: OpenSpec slash commands are mirrored or bridged in [.agents/workflows/](file:///d:/dev/agy-os/.agents/workflows/) to allow direct invocation from the harness environment while delegating execution to the isolated engine in `frameworks/openspec/`.

#### 3. Target Repo Patch Stager (`frameworks/openspec/harness/patches/`)
- **READ-ONLY Boundary Enforcement**: The target repository [website](file:///d:/CLAUDE-PROJECT/website) (`d:/CLAUDE-PROJECT/website`) is strictly READ-ONLY. Direct `write`, `edit`, or `delete` actions on `website/` are blocked at the tool and workflow level.
- **Patch Generation Pipeline**: When an OpenSpec implementation workflow completes a task targeting [website](file:///d:/CLAUDE-PROJECT/website), the output is captured as a standard unified diff patch (`.patch` or `.diff`).
- **Patch Storage Location**: Patches are written to [frameworks/openspec/harness/patches/](file:///d:/dev/agy-os/frameworks/openspec/harness/patches/) (or root [harness/patches/](file:///d:/dev/agy-os/harness/patches/)) using a timestamped or change-ID naming convention (e.g., `2026-07-29-obj02-isolation.patch`).
- **Patch Inspection & Verification**: Staged patches can be audited, reviewed, and applied independently to target environments without compromising target repo integrity during development.

#### 4. Governance & Rule Synchronization Engine ([frameworks/openspec/AGENTS.md](file:///d:/dev/agy-os/frameworks/openspec/AGENTS.md))
- **SSOT Rule Alignment**: [frameworks/openspec/AGENTS.md](file:///d:/dev/agy-os/frameworks/openspec/AGENTS.md) acts as the local governance delegate for the framework subtree, mirroring core sections from root [AGENTS.md](file:///d:/dev/agy-os/AGENTS.md).
- **Invariants Enforced**:
  1. Universal Path Formatting (forward slashes `/` mandatory, Windows backslashes `\` prohibited in metadata/docs).
  2. Terminal Execution Environment (Git Bash `bash` mandatory, CMD/PowerShell prohibited).
  3. Target Repository Boundary (READ-ONLY access for `website/`, mandatory patch staging).
  4. AGY Workflow Layout & Registry Purity (flat layout inside `.agents/workflows/`).
  5. OpenAGY Documentation Hierarchy Invariant (Single global PRD at [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md); strictly `spec.md`, `design.md`, `task.md`, and `artifacts/` in `docs/OBJ-XX/`).

---

### 3.2 Data Schemas & Contracts

#### OpenSpec Change Plan Schema (`frameworks/openspec/openspec/changes/<change-id>/proposal.md`)
```markdown
---
id: obj-02-isolation-architecture
title: Frameworks & OpenSpec Isolation Architecture
status: proposed
created: 2026-07-29
author: architect
---

# Change Proposal: Frameworks & OpenSpec Isolation Architecture

## Context
Isolation of framework suites within agy-os workspace harness.

## Delta Specs
- `frameworks/openspec/openspec/specs/isolation/spec.md`

## Staged Patches
- `frameworks/openspec/harness/patches/2026-07-29-openspec-isolation.patch`
```

#### Patch Metadata Contract (`frameworks/openspec/harness/patches/<patch-id>.meta.json`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PatchMetadata",
  "type": "object",
  "properties": {
    "patchId": { "type": "string" },
    "changeId": { "type": "string" },
    "targetRepo": { "type": "string" },
    "patchFile": { "type": "string" },
    "createdAt": { "type": "string", "format": "date-time" },
    "filesModified": { "type": "array", "items": { "type": "string" } },
    "checksum": { "type": "string" }
  },
  "required": ["patchId", "changeId", "targetRepo", "patchFile", "createdAt", "filesModified"]
}
```

---

## 4. Key Design Decisions

| Decision | Selected Option | Rationale | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **Custom ECC Installer Location** | [harness/agy-script/install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh) | All custom installer scripts, adapters, and entrypoints reside under `harness/agy-script/` using `agy` suffix, leaving original `ECC/install.sh` completely unmodified. | Modifying `ECC/install.sh` directly or putting installer scripts in root workspace |
| **Physical Installation Compliance** | Fail-Fast Verification Script ([verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js)) | Enforces physical disk layout verification against proposal items across all 6 kinds (`rules`, `agents`, `commands`, `hooks`, `skills`, `platform`), exiting immediately with code 1 on discrepancy. | Permissive verification or manual visual inspection |
| **Framework Root Location** | [frameworks/openspec](file:///d:/dev/agy-os/frameworks/openspec) Subdirectory | Keeps root `agy-os` clean and unpolluted by framework engine internal files while allowing clean subtree git modules or sub-workspaces. | Root-level installation (`d:/dev/agy-os/openspec`) or global NPM package installation |
| **Target Repo Patch Staging** | [frameworks/openspec/harness/patches/](file:///d:/dev/agy-os/frameworks/openspec/harness/patches/) | Guarantees target repository [website](file:///d:/CLAUDE-PROJECT/website) remains strictly READ-ONLY while providing safe, reviewable diff artifacts. | Direct filesystem writes to `website/` or storing patches in temporary directories (`/tmp`) |
| **Governance Hierarchy** | Single SSOT Global PRD at [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md) | Eliminates documentation fragmentation and conflicting requirements across sub-projects by enforcing ONE global PRD with modular `docs/OBJ-XX/` suites containing strictly `spec.md`, `design.md`, `task.md`, and `artifacts/`. | Distributed per-objective `PRD.md` files inside each `docs/OBJ-XX/` directory |
| **Rule Synchronization Mechanism** | Hierarchical Governance File Mirroring ([frameworks/openspec/AGENTS.md](file:///d:/dev/agy-os/frameworks/openspec/AGENTS.md)) | Ensures agents operating within `frameworks/openspec` inherit root workspace constraints without needing cross-directory prompt lookups. | Dynamic symlinking (fragile across OS platforms) or un-synchronized independent rule files |
| **OpenSpec Workflow Deployment** | Dual-Layer Bridge Workflows (.agents/workflows/ mapped to frameworks/openspec/) | Preserves flat slash command purity in root `.agents/workflows/` while executing full SDD lifecycle in isolated framework context. | Monolithic single-directory workflow mix or duplicating workflow code across roots |

---

## 5. Non-Destructive Guardrails & Rollback Architecture

### 5.1 Non-Destructive Guarantee
- **Target Repository Boundary**: Target repository [website](file:///d:/CLAUDE-PROJECT/website) (`d:/CLAUDE-PROJECT/website`) is strictly READ-ONLY. No edits, file creations, or file deletions are performed inside `website/`. All proposed changes are produced as unified diff patch files stored in [frameworks/openspec/harness/patches/](file:///d:/dev/agy-os/frameworks/openspec/harness/patches/) or root [harness/patches/](file:///d:/dev/agy-os/harness/patches/).
- **Framework Isolation Integrity**: The OpenSpec engine is completely self-contained within [frameworks/openspec](file:///d:/dev/agy-os/frameworks/openspec). Removing or resetting `frameworks/openspec` does not affect root `agy-os` harness configuration or installed ECC assets in `.agents/`.
- **Installer Safety**: Original installer files `ECC/install.sh` and `ECC/scripts/install-apply.js` remain strictly untouched.

### 5.2 Automated Rollback Strategy
- **Token Overage Rollback Teardown**: If total prompt token footprint exceeds 95%, manual user confirmation is requested before running [uninstall-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-agy.sh) to clean up `.agents/plugin/ecc/`, `.agents/rules/`, bridge workflows (`.agents/workflows/a-*.md`), `.agents/hooks.json`, and `.agents/skills/`.
- **Patch Reversion**: If a staged patch in [frameworks/openspec/harness/patches/](file:///d:/dev/agy-os/frameworks/openspec/harness/patches/) fails validation, code review, or test execution, the patch file can be deleted or reverted without leaving residual artifacts in target repository [website](file:///d:/CLAUDE-PROJECT/website).
- **Framework Subtree Reset**: In the event of corrupt framework engine state or broken spec synchronization:
  1. Uncommitted change proposals inside `frameworks/openspec/openspec/changes/` can be archived or cleaned.
  2. Framework configuration can be restored using git checkout on `frameworks/openspec`.
  3. Governance alignment can be verified and restored by re-running governance verification scripts in [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/).

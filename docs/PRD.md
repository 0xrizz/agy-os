# Product Requirement Document (PRD): AGY-OS & ECC Integration

## 1. Vision & Overview
**AGY-OS** is an agentic workspace harness designed for advanced AI development on the Antigravity platform. This project integrates the **ECC (Everything-as-Code)** ecosystem—a comprehensive collection of skills, rules, subagents, and workflows—tailored specifically for the Antigravity harness execution environment ([agy-os](file:///d:/dev/agy-os)).

## 2. Strategic Objectives

### Objective 01 (OBJ-01): Custom ECC Installation for Antigravity Harness
Adapt and selectively install ECC components into `agy-os` with the following architectural requirements:
- **Isolated Plugin Path**: Installed ECC subagents reside strictly under [.agents/plugin/ecc/agents/](file:///d:/dev/agy-os/.agents/plugin/ecc/agents/) and platform configs under [.agents/plugin/ecc/platform/](file:///d:/dev/agy-os/.agents/plugin/ecc/platform/).
- **Antigravity Subagent Standard**: Convert native ECC agents to Antigravity-compliant subagents formatted as [.agents/plugin/ecc/agents/<name>/agent.md](file:///d:/dev/agy-os/.agents/plugin/ecc/agents/) complete with supporting files.
- **Bridge & Base Workflows**: Deploy base workflows and bridge workflows ([.agents/workflows/a-<name>.md](file:///d:/dev/agy-os/.agents/workflows/)) directly into `.agents/workflows/<name>.md`, maintaining flat layout registry purity.
- **Flat Rules & Single Hooks Config**: Deploy ECC rules directly to [.agents/rules/<name>.md](file:///d:/dev/agy-os/.agents/rules/) as flat hyphenated files and lifecycle hooks to [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json).
- **Canonical Skills Location**: Deploy skills directly under [.agents/skills/<skill-name>/SKILL.md](file:///d:/dev/agy-os/.agents/skills/) per `agentskills.io` standard.
- **Non-Destructive Custom Overlay & Installer**: Store custom manifests in [harness/manifests/*.custom.json](file:///d:/dev/agy-os/harness/manifests/) and custom installer scripts in [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/) ([install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh) / [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) / [antigravity-project-agy.js](file:///d:/dev/agy-os/harness/agy-script/adapters/antigravity-project-agy.js)) without modifying original [ECC](file:///d:/dev/agy-os/ECC) source files.
- **Proposal Item Compliance Verification**: Verify physical installation matching Section 2.2 of [proposal.md](file:///d:/dev/agy-os/docs/OBJ-01/artifacts/proposal.md) per kind via [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) (Fail-Fast exit code 1 on discrepancy).
- **Token Budget Governance**: Selectively install modules to maintain custom harness token usage strictly within the safe threshold of **85%–95%**.
- **Rollback Safety**: Provide an automated [uninstall-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-agy.sh) script to clean up installed assets if customization criteria are not met.

### Objective 02 (OBJ-02): Frameworks & OpenSpec Isolation Architecture
Establish clean architectural isolation for framework suites such as OpenSpec (`frameworks/openspec/`) within `agy-os`:
- **Isolated Framework Subtree**: Framework code and assets reside inside dedicated subdirectories under `frameworks/`.
- **Target Repo Staging Isolation**: All target repository changes originating from framework workflows stage patches strictly in `frameworks/openspec/harness/patches/`.
- **SSOT Documentation Standard**: Maintain a single global PRD at [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md) while objective suites contain strictly `spec.md`, `design.md`, `task.md`, and `artifacts/`.

---

## 3. High-Level Architecture
```text
d:/dev/agy-os/
├── .agents/
│   ├── plugin/
│   │   └── ecc/                       # Installed ECC assets
│   │       ├── agents/                # Antigravity subagent folders (<name>/agent.md + assets)
│   │       └── platform/              # Platform configs
│   ├── rules/                         # Flat Rules Directory (.agents/rules/<name>.md)
│   ├── skills/                        # Native Agent Skills Directory (.agents/skills/<skill-name>/SKILL.md)
│   ├── workflows/                     # Flat Workflows Directory (Base & Bridge Workflows)
│   └── hooks.json                     # Single Lifecycle Hooks Config File
├── harness/
│   ├── manifests/                     # Custom Manifest Overlay & Backup Directory
│   │   ├── install-modules.custom.json
│   │   ├── install-components.custom.json
│   │   └── install-profiles.custom.json
│   ├── patches/                       # Target Repo Patch Staging Directory
│   └── agy-script/                    # Custom installer & uninstaller scripts
│       ├── install-agy.sh             # Main installer entrypoint
│       ├── uninstall-agy.sh           # Main uninstaller teardown entrypoint
│       ├── post-install-agy.js        # Post-install agent restructuring script
│       ├── scripts/
│       │   ├── scan-target-repo.js    # Quantitative techstack scanner script
│       │   ├── install-apply-agy.js   # Custom apply script with Fail-Fast validator
│       │   └── verify-installation-agy.js # Proposal item compliance script
│       └── adapters/
│           └── antigravity-project-agy.js # Target adapter for .agents/plugin/ecc/
├── frameworks/
│   └── openspec/                      # OpenSpec Framework Engine & Isolation Workspace
├── ecc-install.json                   # Project-level installation intent config
├── ECC/                               # Upstream reference clone (READ-ONLY source)
└── docs/
    ├── PRD.md                         # Single Source of Truth Global PRD
    ├── template/                      # Standardized AI-Optimized templates (spec.md, design.md, task.md)
    ├── OBJ-01/                        # Objective 01 suite
    │   ├── spec.md                    # [docs/OBJ-01/spec.md](file:///d:/dev/agy-os/docs/OBJ-01/spec.md)
    │   ├── design.md                  # [docs/OBJ-01/design.md](file:///d:/dev/agy-os/docs/OBJ-01/design.md)
    │   ├── task.md                    # [docs/OBJ-01/task.md](file:///d:/dev/agy-os/docs/OBJ-01/task.md)
    │   └── artifacts/
    │       └── proposal.md            # [docs/OBJ-01/artifacts/proposal.md](file:///d:/dev/agy-os/docs/OBJ-01/artifacts/proposal.md)
    └── OBJ-02/                        # Objective 02 suite (Frameworks & OpenSpec Isolation Architecture)
        ├── spec.md                    # [docs/OBJ-02/spec.md](file:///d:/dev/agy-os/docs/OBJ-02/spec.md)
        ├── design.md                  # [docs/OBJ-02/design.md](file:///d:/dev/agy-os/docs/OBJ-02/design.md)
        ├── task.md                    # [docs/OBJ-02/task.md](file:///d:/dev/agy-os/docs/OBJ-02/task.md)
        └── artifacts/                 # Supporting artifacts for OBJ-02
```

---

## 4. Acceptance Criteria
1. `docs/` framework is fully populated with global PRD, templates, and objective suites (OBJ-01 & OBJ-02) containing strictly `spec.md`, `design.md`, `task.md`, and `artifacts/`.
2. Custom quantitative scanner ([scan-target-repo.js](file:///d:/dev/agy-os/harness/agy-script/scripts/scan-target-repo.js)) and 2-criteria wizard produce an approved proposal document.
3. Custom installer script ([install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh)) executes without touching upstream `ECC/install.sh`.
4. ECC agents are correctly converted and residing in [.agents/plugin/ecc/agents/<name>/agent.md](file:///d:/dev/agy-os/.agents/plugin/ecc/agents/).
5. Rules reside in [.agents/rules/<name>.md](file:///d:/dev/agy-os/.agents/rules/), skills in [.agents/skills/<skill-name>/SKILL.md](file:///d:/dev/agy-os/.agents/skills/), workflows in [.agents/workflows/<name>.md](file:///d:/dev/agy-os/.agents/workflows/), and hooks at [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json).
6. Verification script ([verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js)) verifies physical installation compliance against proposal list per kind with exit code 0.
7. Final token customization load remains strictly within **85%–95%**.
8. Automated uninstall script ([uninstall-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-agy.sh)) safely reverts changes when triggered.



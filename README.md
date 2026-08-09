# AGY-OS — Agentic Workspace Harness

[![Node Version](https://img.shields.io/badge/node-%3E%3D26-brightgreen.svg)](file:///d:/dev/agy-os/package.json)
[![pnpm Version](https://img.shields.io/badge/pnpm-%3E%3D10-blue.svg)](file:///d:/dev/agy-os/package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](file:///d:/dev/agy-os/package.json)
[![Architecture: Antigravity](https://img.shields.io/badge/Architecture-Antigravity--2.0-purple.svg)](file:///d:/dev/agy-os/docs/PRD.md)
[![Runbook: Operational](https://img.shields.io/badge/Runbook-RUNBOOK.md-orange.svg)](file:///d:/dev/agy-os/RUNBOOK.md)

**AGY-OS** is an agentic workspace harness designed for advanced AI software engineering on the Google Antigravity platform. It integrates the **Everything-as-Code (ECC)** ecosystem—a comprehensive collection of specialized subagents, rules, skills, workflows, and lifecycle hooks—tailored specifically for predictable, token-governed, multi-repository agent operation.

---

## 🚀 Vision & Core Philosophy

AGY-OS serves as an operating environment for autonomous coding agents, enforcing strict architectural invariants, non-destructive installer routines, and token-aware context management.

### Key Pillars
- **Token Budget Governance**: Custom agent token consumption is maintained strictly within the safe threshold of **85% – 95%** (currently at **88.6%** with 221,500 tokens).
- **Multi-Repository Productization**: Deploy, audit, and verify isolated `.agents/` scaffolds across arbitrary target repositories via the `agy-harness` CLI.
- **100% Self-Contained Runtime**: Post-installation scripts and helper modules reside co-located in [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) with zero external environment dependencies.
- **Target Repository Protection**: External target code bases are treated as **READ-ONLY**. All proposed changes are produced as staged patch files under [harness/patches/](file:///d:/dev/agy-os/harness/patches/).
- **Universal Path Standard**: All internal paths, scripts, and documentation strictly use forward-slash formatting (`d:/dev/agy-os`).

---

## 🎯 Strategic Objective Suite (OBJ-01 – OBJ-08)

The implementation and evolution of AGY-OS is documented across a series of structured objective suites under [docs/](file:///d:/dev/agy-os/docs/):

| Objective | Title & Description | Documentation Suite |
|---|---|---|
| **OBJ-01** | **Custom ECC Installation**: Modular adaptation and installation of ECC rules, skills, subagents, and hooks into `agy-os` under token budget controls. | [docs/OBJ-01/](file:///d:/dev/agy-os/docs/OBJ-01/spec.md) |
| **OBJ-02** | **Framework & OpenSpec Isolation**: Clean architectural separation for framework subtrees (`frameworks/openspec/`) and patch staging isolation. | [docs/OBJ-02/](file:///d:/dev/agy-os/docs/OBJ-02/spec.md) |
| **OBJ-05** | **Graphify Multi-Root Knowledge Harness**: Multi-root AST & semantic knowledge extraction across repositories with a unified merge engine and agent-navigable wiki. | [docs/OBJ-05/](file:///d:/dev/agy-os/docs/OBJ-05/spec.md) |
| **OBJ-06** | **ECC Component Refactoring**: Migration to flat canonical subagent paths ([.agents/agents/<name>/agent.md](file:///d:/dev/agy-os/.agents/agents/)), schema alignment, and component inventory optimization. | [docs/OBJ-06/](file:///d:/dev/agy-os/docs/OBJ-06/spec.md) |
| **OBJ-07** | **Multi-Repo Custom Installer**: CLI extension adding `--target-dir <path>` support across all installer scripts with 1:1 parity verification. | [docs/OBJ-07/](file:///d:/dev/agy-os/docs/OBJ-07/spec.md) |
| **OBJ-08** | **Personal Product CLI Runner (`agy-harness`)**: Portable CLI entrypoint ([harness/bin/agy-harness.sh](file:///d:/dev/agy-os/harness/bin/agy-harness.sh)) for deploying, verifying, status checking, and uninstalling `.agents/` across local repositories. | [docs/OBJ-08/](file:///d:/dev/agy-os/docs/OBJ-08/spec.md) |

---

## 🏗️ Architecture & Workspace Structure

```text
d:/dev/agy-os/
├── .agents/                           # Active Agent Scaffold & Execution Surface
│   ├── agents/                        # Canonical Subagent Directory (<name>/agent.md)
│   ├── rules/                         # Flat Rules Directory (.agents/rules/<name>.md)
│   ├── skills/                        # Native Agent Skills Directory (.agents/skills/<name>/SKILL.md)
│   ├── workflows/                     # Slash-command Workflows (.agents/workflows/<name>.md)
│   ├── scripts/                       # 100% Self-Contained Runtime Scripts & Libraries
│   │   └── lib/                       # Co-located Shared Runtime Modules
│   ├── hooks.json                     # Single Lifecycle Hooks Configuration File
│   └── ecc-items.json                 # Verification Parity Baseline Reference
├── harness/                           # Multi-Repo Productization & Installer Engine
│   ├── bin/
│   │   └── agy-harness.sh             # Portable CLI Entrypoint
│   ├── agy-script/                    # Custom Installer, Verifier & Teardown Scripts
│   │   ├── install-agy.sh             # Installer (accepts --target-dir)
│   │   ├── uninstall-agy.sh           # Teardown Script (accepts --target-dir)
│   │   └── scripts/
│   │       ├── install-apply-agy.js   # Scaffolding & Component Copier
│   │       └── verify-installation-agy.js # 1:1 Parity & YAML Frontmatter Verifier
│   ├── manifests/                     # Custom Module Manifest Overlays
│   └── patches/                       # Staged Patch Files for Target Repositories
├── docs/                              # OpenAGY Documentation Hierarchy
│   ├── PRD.md                         # Single Source of Truth Global PRD
│   ├── OBJ-01/                        # Objective 01 Spec, Design & Task Suite
│   ├── OBJ-02/                        # Objective 02 Spec, Design & Task Suite
│   ├── OBJ-05/                        # Objective 05 Spec, Design & Task Suite
│   ├── OBJ-06/                        # Objective 06 Spec, Design & Task Suite
│   ├── OBJ-07/                        # Objective 07 Spec, Design & Task Suite
│   └── OBJ-08/                        # Objective 08 Spec, Design & Task Suite
├── frameworks/
│   └── openspec/                      # Isolated OpenSpec Engine Workspace
├── test/
│   └── repo-experiment-01/            # Minimal Sandbox Target for End-to-End Testing
├── AGENTS.md                          # Harness Governance & Agent Behavior Rules
├── RUNBOOK.md                         # Operational & Maintenance Runbook
└── package.json                       # Project Dependencies & Scripts
```

---

## 📖 Operational Documentation & Navigation

- 📘 **Single Source of Truth Global PRD**: [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md)
- 📙 **Operational Runbook & Maintenance Guide**: [RUNBOOK.md](file:///d:/dev/agy-os/RUNBOOK.md)
- 📗 **Agent Behavior & Harness Governance Rules**: [AGENTS.md](file:///d:/dev/agy-os/AGENTS.md)

---

## 🛠️ `agy-harness` CLI Usage Guide

The unified CLI entrypoint is located at [harness/bin/agy-harness.sh](file:///d:/dev/agy-os/harness/bin/agy-harness.sh). It manages the deployment, verification, status inspection, and cleanup of the `.agents/` scaffold across local target repositories.

### 1. Deploy Harness to Target Repository
Scaffold the `.agents/` environment into an external directory non-destructively:
```bash
bash harness/bin/agy-harness.sh deploy --target-dir d:/dev/target-repo
```

### 2. Verify 1:1 Installation Parity
Validate physical installation and YAML frontmatter schema compliance (returns exit code `0` on 100% match):
```bash
bash harness/bin/agy-harness.sh verify --target-dir d:/dev/target-repo
```

### 3. Check Target Repository Status
Print a status report comparing baseline components with target local extensions:
```bash
bash harness/bin/agy-harness.sh status --target-dir d:/dev/target-repo
```

### 4. Non-Destructive Teardown
Safely remove `.agents/` from the target repository without modifying source code:
```bash
bash harness/bin/agy-harness.sh uninstall --target-dir d:/dev/target-repo
```

### 📦 GitHub Package Installation (`pnpm`)

This package is published to **GitHub Packages** as [`@0xrizz/agy-os`](file:///d:/dev/agy-os/package.json).

- **Install via pnpm**:
  ```bash
  pnpm add @0xrizz/agy-os
  ```
- **Execute CLI directly via pnpm `dlx`**:
  ```bash
  pnpm dlx @0xrizz/agy-os status --target-dir d:/dev/target-repo
  ```


---

## 📊 NPM & Diagnostic Commands

AGY-OS includes built-in diagnostic and health check scripts in `package.json`:

```bash
# Run comprehensive harness audit
pnpm run audit

# Check workspace health and component status
pnpm run status

# Run system doctor check
pnpm run doctor

# Verify harness dependencies
pnpm run verify:deps
```

---

## ⚙️ Workspace Governance & Invariants

When working inside `agy-os`, all automated agents and human developers must observe the core governance rules defined in [AGENTS.md](file:///d:/dev/agy-os/AGENTS.md):

1. **Terminal Environment**: Execute shell scripts exclusively using **Git Bash** (`bash`).
2. **Target Repo Read-Only**: Write changes targeting external repositories as `.patch` files into [harness/patches/](file:///d:/dev/agy-os/harness/patches/).
3. **Flat Workflow Layout**: Workflows inside `.agents/workflows/` must strictly map to valid slash-commands without nested directories.
4. **Self-Contained Scripts**: Runtime scripts must resolve all imports relative to `.agents/scripts/` without relying on external environment variables.
5. **SSOT Documentation**: Maintain [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md) as the single global PRD. All objective suites must contain strictly `spec.md`, `design.md`, `task.md`, and `artifacts/`.

---

## 📜 License

This project is licensed under the [MIT License](file:///d:/dev/agy-os/package.json).

# Operational Runbook: AGY-OS Workspace Harness

[![Node Version](https://img.shields.io/badge/node-%3E%3D26-brightgreen.svg)](file:///d:/dev/agy-os/package.json)
[![pnpm Version](https://img.shields.io/badge/pnpm-%3E%3D10-blue.svg)](file:///d:/dev/agy-os/package.json)
[![Documentation: PRD](https://img.shields.io/badge/Documentation-PRD.md-purple.svg)](file:///d:/dev/agy-os/docs/PRD.md)

This runbook serves as the definitive operational manual for deploying, operating, auditing, verifying, and troubleshooting the **AGY-OS** agentic workspace harness across master and target repositories.

---

## 1. System Invariants & Environment Prerequisites

### 1.1 Operating System & Terminal Environment
- **Terminal Shell**: All script invocations, maintenance commands, and automated tooling MUST strictly execute using **Git Bash** (`bash`). Execution via CMD or PowerShell is strictly prohibited.
- **Pathing Standard**: All paths in documentation, scripts, parameters, and tool arguments MUST use forward slashes (`/`) (e.g., `d:/dev/agy-os`).
- **Engine Requirements**: Node.js `>=26` and pnpm `>=10`.

### 1.2 Access Boundaries & Protection
- **Master Harness Workspace (`agy-os`)**: Read & Write access ([d:/dev/agy-os](file:///d:/dev/agy-os)).
- **Target Repository Protection**: Target repositories (e.g., `website/`) are **READ-ONLY**. All proposed changes MUST be staged as patch files under [harness/patches/](file:///d:/dev/agy-os/harness/patches/).
- **Upstream Clone (`ECC/`)**: Isolated READ-ONLY reference clone.

---

## 2. CLI Runner (`agy-harness`) & Multi-Repo Operations

The CLI entrypoint [harness/bin/agy-harness.sh](file:///d:/dev/agy-os/harness/bin/agy-harness.sh) manages `.agents/` scaffolding and verification across local codebases.

### 2.1 Subcommand Matrix

| Command | Alias | Underlying Delegation Target | Primary Purpose | Exit Code Contract |
| :--- | :--- | :--- | :--- | :--- |
| `deploy` | `install` | `bash harness/agy-script/install-agy.sh "$@"` | Scaffolds `.agents/`, deploys master baseline components 1:1, preserves target local extensions. | `0` on success |
| `verify` | `audit` | `node harness/agy-script/scripts/verify-installation-agy.js "$@"` | Dual-pass compliance verification. Validates 100% baseline parity against `ecc-items.json` and audits local extensions. | `0` if 0 missing baseline items |
| `status` | - | `node harness/agy-script/scripts/verify-installation-agy.js "$@"` | Outputs human-readable scorecard displaying baseline parity matches and local custom extensions. | `0` on completed report |
| `uninstall` | `clean` | `bash harness/agy-script/uninstall-agy.sh "$@"` | Non-destructively purges target `.agents/` directory without touching project code. | `0` on completed teardown |

### 2.2 Operational Workflows

#### Workflow A: Target Repository Deployment
To deploy the `.agents/` harness to any local target repository non-destructively:
```bash
bash harness/bin/agy-harness.sh deploy --target-dir d:/dev/target-repo
```

#### Workflow B: Installation Parity Audit
To verify 1:1 baseline parity and YAML frontmatter schema compliance:
```bash
bash harness/bin/agy-harness.sh verify --target-dir d:/dev/target-repo
```

#### Workflow C: Inspecting Target Status
To inspect baseline matches and custom local extensions:
```bash
bash harness/bin/agy-harness.sh status --target-dir d:/dev/target-repo
```

#### Workflow D: Non-Destructive Teardown
To safely remove `.agents/` scaffold from target repository:
```bash
bash harness/bin/agy-harness.sh uninstall --target-dir d:/dev/target-repo
```

---

## 3. Daily Maintenance & Harness Health Diagnostics

AGY-OS includes automated health check scripts in `package.json`:

```bash
# 1. Comprehensive 16-point Harness Audit (Target score: 39/39)
pnpm run audit

# 2. Check workspace health and component status
pnpm run status

# 3. System doctor check
pnpm run doctor

# 4. Verify harness dependencies
pnpm run verify:deps
```

---

## 4. Hybrid Extension Lifecycle

Target repositories can define custom local rules, skills, agents, and workflows inside standard paths (`.agents/agents/`, `.agents/rules/`, `.agents/workflows/`, `.agents/skills/`) without baseline sync collisions.

### 4.1 Authoring a Target Local Custom Agent
Create a custom agent directory and `agent.md` inside `<target-dir>/.agents/agents/<custom-agent-name>/agent.md`:

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
Re-running `deploy` syncs master baseline items 1:1 while leaving `custom-agent-01` untouched. `verify` reports custom items as non-failing `ℹ [LOCAL EXTENSION]`.

---

## 5. Knowledge Graph Maintenance (Graphify)

AGY-OS uses **Graphify** for multi-root AST and semantic knowledge extraction across repositories (`ECC/`, `OpenSpec/`, `frameworks/openspec/`).

### 5.1 Rebuilding Multi-Root Knowledge Graph
To perform a complete AST + semantic re-scan and merge:
```bash
bash harness/agy-script/graphify-merge-agy.sh
```

### 5.2 Generating Wiki Output
To generate the agent-crawlable architecture wiki:
```bash
graphify --wiki
```

---

## 6. Token Governance & Troubleshooting Playbook

### 6.1 Token Budget Maintenance
- **Governance Window**: Maintain token utilization strictly between **85% – 95%**.
- **Current Footprint**: 221,500 tokens (88.6%).

### 6.2 Troubleshooting Guide

#### Issue: `verify` returns exit code 1 (`✗ [MISSING]`)
- **Remediation**: Re-run `bash harness/bin/agy-harness.sh deploy --target-dir <path>` to restore missing baseline items.

#### Issue: `✗ [INVALID FRONTMATTER]`
- **Remediation**: Inspect `<target-dir>/.agents/agents/<name>/agent.md` and ensure valid 8-field YAML frontmatter is present (`name`, `description`, `mainAgent`, `subagent`, `model`, `tools`, `mcpServers`, `skills`).

#### Issue: Windows Backslash or Command Failure
- **Remediation**: Ensure all commands run via **Git Bash** (`bash harness/bin/agy-harness.sh ...`).

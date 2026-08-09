# Customization Proposal Document: Objective OBJ-07 Multi-Repository Custom Installer & Adapter Isolation

> **Target Repository**: Arbitrary External Repository (e.g., [test/repo-experiment-01](file:///d:/dev/agy-os/test/repo-experiment-01))  
> **Primary Harness**: Antigravity ([agy-os](file:///d:/dev/agy-os)) (`d:/dev/agy-os`)  
> **New Parameter**: `--target-dir <path>` (Default: `.`)  
> **Installation Parity Target**: **100% 1:1 Match** with master harness installation  
> **Verification Script**: [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) `--target-dir <path>`

---

## 1. Executive Summary & Architectural Motivation

This proposal defines the complete architectural specification for **Objective 07 (OBJ-07: Multi-Repository Custom Installer & Adapter Isolation)** in the Antigravity workspace harness ([agy-os](file:///d:/dev/agy-os)). 

Prior to OBJ-07, the custom installer scripts ([install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh), [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js), [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js), and [uninstall-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-agy.sh)) hardcoded `d:/dev/agy-os` as the sole destination for installed ECC assets. OBJ-07 refactors the installer suite to accept a `--target-dir <path>` parameter, enabling seamless, isolated installation of custom rules, agents, skills, workflows, and hooks into any target codebase or test repository without hardcoding harness paths.

### Core Architectural Goals

1. **Multi-Repo Target Resolution (`--target-dir`)**:
   - Refactor `install-agy.sh` and its child Node.js scripts in `harness/agy-script/` to parse `--target-dir <path>`.
   - `--target-dir` defaults to current working directory (`.`) if unspecified. All relative or absolute target paths are normalized with forward slashes (`/`).

2. **Isolated Target Scaffold & Co-located Script Deployment**:
   - When installing to an external repo (e.g. `d:/dev/agy-os/test/repo-experiment-01`), the installer scaffolds the full standard `.agents/` structure (`.agents/agents/`, `.agents/rules/`, `.agents/skills/`, `.agents/workflows/`, `.agents/hooks.json`, `.agents/scripts/`).
   - All runtime scripts and libraries are deployed 100% self-contained into `.agents/scripts/` and `.agents/scripts/lib/` within the specified `--target-dir`, ensuring zero reliance on external environment variables like `CLAUDE_PLUGIN_ROOT`.

3. **Isolated Test Repository Setup**:
   - Establish a dedicated isolated test workspace at [test/repo-experiment-01](file:///d:/dev/agy-os/test/repo-experiment-01) with minimal repository structure (`package.json`, `.gitignore`, `README.md`).

4. **1:1 Installation Parity Verification Protocol**:
   - Refactor `verify-installation-agy.js` to accept `--target-dir <path>`.
   - Run verification against `test/repo-experiment-01` to enforce **Fail-Fast validation** (exiting with code 1 upon any discrepancy and exit code 0 on 100% component parity).

---

## 2. Multi-Repository Installer Component Architecture

The diagram below illustrates how the refactored custom installer interacts with arbitrary target directories via `--target-dir`.

```text
d:/dev/agy-os/ (Master Harness)
├── harness/agy-script/
│   ├── install-agy.sh                    <-- Accepts --target-dir <path>
│   ├── uninstall-agy.sh                  <-- Accepts --target-dir <path>
│   ├── post-install-agy.js               <-- Accepts --target-dir <path>
│   └── scripts/
│       ├── install-apply-agy.js          <-- Accepts --target-dir <path>
│       └── verify-installation-agy.js    <-- Accepts --target-dir <path>
│
└── Execution Target (e.g., test/repo-experiment-01)
    ├── package.json
    └── .agents/                          <-- Scaffolded by installer inside target-dir
        ├── agents/                       <-- Converted subagent definitions
        ├── rules/                        <-- Flat rules layout
        ├── skills/                       <-- Native skills per agentskills.io
        ├── workflows/                    <-- Flat workflows registry
        ├── hooks.json                    <-- Lifecycle hooks configuration
        └── scripts/                      <-- Co-located 100% self-contained runtime scripts
            └── lib/                      <-- Co-located runtime libraries (*-agy.js)
```

---

## 3. Isolated Test Repository & Verification Protocol

### Section 3.1: Test Repository Blueprint (`test/repo-experiment-01`)
- **Directory Path**: [test/repo-experiment-01](file:///d:/dev/agy-os/test/repo-experiment-01)
- **Scaffold Files**:
  - `package.json` (`{ "name": "repo-experiment-01", "version": "1.0.0", "private": true }`)
  - `.gitignore` (`node_modules/`, `.DS_Store`)
  - `README.md` (`# Test Repo Experiment 01`)

### Section 3.2: Execution Protocol
1. Execute multi-repo installation command via Git Bash:
   ```bash
   bash harness/agy-script/install-agy.sh --target-dir d:/dev/agy-os/test/repo-experiment-01
   ```
2. Execute multi-repo compliance verification command:
   ```bash
   node harness/agy-script/scripts/verify-installation-agy.js --target-dir d:/dev/agy-os/test/repo-experiment-01
   ```

### Section 3.3: Installation Parity Success Criteria
- **Rules Count**: 33 flat rule markdown files installed under `.agents/rules/`.
- **Agents Count**: 31 subagent directories installed under `.agents/agents/<name>/agent.md`.
- **Skills Count**: 42 native skill folders installed under `.agents/skills/<skill-name>/SKILL.md`.
- **Workflows Count**: 32 flat workflow markdown files installed under `.agents/workflows/`.
- **Hooks Configuration**: `.agents/hooks.json` valid with `pre:agy-guardrail` pinned at index 0 and `post:agy-observation-envelope` registered.
- **Runtime Scripts**: 100% self-contained co-location under `.agents/scripts/` and `.agents/scripts/lib/`.
- **Verification Result**: Exit code `0` (100% 1:1 match; zero missing or extra items).

---

## 4. Risk Assessment & Safety Invariants

| Risk Description | Severity | Mitigation & Safety Mechanism |
| :--- | :---: | :--- |
| **1. Hardcoded Path Bleed** | High | All installer helper scripts use `path.resolve(targetDir)` with forward-slash normalization. Absolute harness paths are never hardcoded in target files. |
| **2. Partial Target Installation** | High | `install-apply-agy.js` executes inside atomic transaction routines; if any copy/scaffold step fails, installation aborts immediately with Fail-Fast exit code 1. |
| **3. Non-Destructive Rollback** | Critical | `uninstall-agy.sh --target-dir <path>` cleans up `.agents/` inside the target directory without touching project source files (`package.json`, `src/`, etc.). |
| **4. Verification False Positives** | Medium | `verify-installation-agy.js` verifies physical disk files against master manifest `ecc-items.json` inside the specified `--target-dir`. |

---

## 5. Summary & Handover

This proposal establishes the architecture for multi-repository custom installer execution and verification. Upon execution of OBJ-07 tasks, the custom installer will be fully multi-repo capable and verified against [test/repo-experiment-01](file:///d:/dev/agy-os/test/repo-experiment-01).

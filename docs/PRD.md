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

### Objective 05 (OBJ-05): Graphify Knowledge Harness
Establish a unified, multi-root knowledge graph covering all nested repositories within `agy-os` (`ECC/`, `OpenSpec/`, `frameworks/openspec/`) alongside the main harness workspace, with agent-navigable wiki output, MCP server registration, and a post-commit AST auto-rebuild hook.
- **Phase-Zero Revert**: Wipe the non-compliant `graphify-out/` and perform a fresh full-pipeline (AST + semantic) re-scan of `agy-os/` via Git Bash.
- **Multi-Root Extraction**: Run `graphify extract` (full pipeline: code + semantic) on `ECC/`, `OpenSpec/`, and `frameworks/openspec/`, each producing an isolated `graphify-out/` directory.
- **Unified Merge**: Merge all four `graph.json` files into a single unified `graphify-out/graph.json` via [harness/agy-script/graphify-merge-agy.sh](file:///d:/dev/agy-os/harness/agy-script/graphify-merge-agy.sh), with each node carrying a `repo` attribute.
- **Wiki Output**: Generate `graphify-out/wiki/index.md` via `graphify --wiki` for agent-crawlable O(1) architecture navigation.
- **MCP Integration**: Register graphify MCP server in `.mcp.json` for native `query_graph`, `shortest_path`, `get_node` tool calls.
- **Commit Hook**: Install post-commit AST-only incremental auto-rebuild hook (zero token cost).
- **Rule Update**: Update [.agents/rules/graphify.md](file:///d:/dev/agy-os/.agents/rules/graphify.md) with multi-root + wiki-first navigation instructions.

### Objective 06 (OBJ-06): ECC Component Refactoring & Agent Schema Alignment
Refactor the installed ECC component surface to align with the Antigravity canonical subagent standard, enforce YAML frontmatter schema compliance, and prune the component inventory per [ecc-components-fix.txt](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-components-fix.txt):
- **Canonical Agent Path Migration**: Relocate all installed ECC subagents from [.agents/plugin/ecc/agents/\<name\>/agent.md](file:///d:/dev/agy-os/.agents/plugin/ecc/agents/) to the flat canonical path [.agents/agents/\<name\>/agent.md](file:///d:/dev/agy-os/.agents/agents/). Update all script adapters, `AGENTS.md`, and hook resolvers to reference the new path.
- **YAML Frontmatter Schema Standardization**: Enforce valid YAML frontmatter in all `agent.md` files with required fields (`name`, `description`, `model`). Automated parse validation added to [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) with Fail-Fast exit code 1.
- **Bridge Workflow Deprecation**: Remove ALL `a-*.md` bridge workflows from [.agents/workflows/](file:///d:/dev/agy-os/.agents/workflows/). Subagent invocation is handled directly via native Antigravity subagent discovery (`.agents/agents/<name>/agent.md`).
- **Component Inventory Optimization**: Purged 4 agents (`chief-of-staff`, `gan-evaluator`, `gan-generator`, `gan-planner`), 32 bridge workflows (`a-*.md`), 27 obsolete workflows, and 17 obsolete skills. Added 6 new rules and 14 new skills per [ecc-components-fix.txt](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-components-fix.txt). Post-refactor inventory: 33 rules, 28 agents, 32 commands, 42 skills, 3 platform, 1 hooks.
- **Token Budget Governance**: Post-OBJ-06 footprint = **221,500 tokens** (**88.6%**) — within the **85%–95%** governance window.
- **Artifacts**: [proposal.md](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/proposal.md) · [ecc-components-fix.txt](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-components-fix.txt) · [ecc-items.json](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-items.json) · [spec.md](file:///d:/dev/agy-os/docs/OBJ-06/spec.md) · [design.md](file:///d:/dev/agy-os/docs/OBJ-06/design.md) · [task.md](file:///d:/dev/agy-os/docs/OBJ-06/task.md)

### Objective 07 (OBJ-07): Multi-Repository Custom Installer & Adapter Isolation
Refactor the Antigravity custom installer suite to support arbitrary target repositories via a `--target-dir <path>` CLI parameter, enabling isolated, self-contained ECC component installation into any external codebase with full 1:1 parity verification:
- **`--target-dir` CLI Parameter**: All 5 installer scripts ([install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh), [uninstall-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-agy.sh), [post-install-agy.js](file:///d:/dev/agy-os/harness/agy-script/post-install-agy.js), [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js), [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js)) accept `--target-dir <path>` with CWD-fallback backward compatibility. All paths normalized to forward-slash format.
- **Isolated `.agents/` Scaffold**: When `--target-dir` is active, the installer scaffolds the full `.agents/` tree (`agents/`, `rules/`, `skills/`, `workflows/`, `scripts/`, `scripts/lib/`) exclusively inside the target directory. The master harness `.agents/` remains completely untouched.
- **Self-Contained `ecc-items.json` Copy**: The verification reference [ecc-items.json](file:///d:/dev/agy-os/harness/ecc-items.json) is copied into `<target-dir>/.agents/ecc-items.json` during installation. `verify-installation-agy.js --target-dir` reads this self-contained copy for Fail-Fast 1:1 parity validation (exit code 0 = 100% match).
- **Runtime Script Co-location**: All runtime scripts and shared libraries are mirrored from [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) into `<target-dir>/.agents/scripts/` with zero hardcoded absolute harness paths in deployed files.
- **Committed Test Sandbox**: A minimal sandbox at [test/repo-experiment-01](file:///d:/dev/agy-os/test/repo-experiment-01) (`package.json`, `.gitignore`, `README.md`) provides a reproducible, isolated end-to-end test target committed to `agy-os`. Generated `.agents/` is gitignored.
- **Non-Destructive Target Rollback**: `uninstall-agy.sh --target-dir <path>` removes exclusively `<target-dir>/.agents/`. Project source files are never touched. `--dry-run` preview mode available.
- **Artifacts**: [proposal.md](file:///d:/dev/agy-os/docs/OBJ-07/artifacts/proposal.md) · [ecc-items.json](file:///d:/dev/agy-os/harness/ecc-items.json) · [spec.md](file:///d:/dev/agy-os/docs/OBJ-07/spec.md) · [design.md](file:///d:/dev/agy-os/docs/OBJ-07/design.md) · [task.md](file:///d:/dev/agy-os/docs/OBJ-07/task.md)

---

## 3. High-Level Architecture
```text
d:/dev/agy-os/
├── .agents/
│   ├── agents/                        # [OBJ-06] Canonical flat agent directory (<name>/agent.md)
│   ├── plugin/
│   │   └── ecc/
│   │       ├── agents/                # [DEPRECATED by OBJ-06] Emptied after relocation to .agents/agents/
│   │       └── platform/              # Platform configs
│   ├── rules/                         # Flat Rules Directory (.agents/rules/<name>.md)
│   ├── skills/                        # Native Agent Skills Directory (.agents/skills/<skill-name>/SKILL.md)
│   ├── workflows/                     # Flat Workflows Directory (slash-commands only; no a-*.md post-OBJ-06)
│   ├── scripts/                       # 100% self-contained runtime scripts (.agents/scripts/)
│   └── hooks.json                     # Single Lifecycle Hooks Config File
├── harness/
│   ├── ecc-items.json                 # [OBJ-07] Master reference item baseline for verification
│   ├── manifests/                     # Custom Manifest Overlay & Backup Directory
│   │   ├── install-modules.custom.json
│   │   ├── install-components.custom.json
│   │   └── install-profiles.custom.json
│   ├── patches/                       # Target Repo Patch Staging Directory
│   └── agy-script/                    # Custom installer & uninstaller scripts
│       ├── install-agy.sh             # [OBJ-07] Accepts --target-dir <path>
│       ├── uninstall-agy.sh           # [OBJ-07] Accepts --target-dir <path>; scopes cleanup to target/.agents/
│       ├── post-install-agy.js        # [OBJ-07] Accepts --target-dir <path>
│       ├── scripts/
│       │   ├── scan-target-repo.js    # Quantitative techstack scanner script
│       │   ├── install-apply-agy.js   # [OBJ-07] Accepts --target-dir; copies ecc-items.json into target
│       │   └── verify-installation-agy.js # [OBJ-07] Accepts --target-dir; reads target/.agents/ecc-items.json
│       └── adapters/
│           └── antigravity-project-agy.js # Target adapter for .agents/
├── test/
│   └── repo-experiment-01/            # [OBJ-07] Committed minimal test sandbox for multi-repo installer
│       ├── package.json               # Minimal scaffold (committed)
│       ├── .gitignore                 # Excludes node_modules/, .agents/ (gitignored)
│       ├── README.md                  # # Test Repo Experiment 01
│       └── .agents/                   # GENERATED by install-agy.sh --target-dir (NOT committed)
│           ├── agents/                # 28 subagent directories (1:1 parity with master)
│           ├── rules/                 # 36 flat rule files (1:1 parity)
│           ├── skills/                # 42 skill directories (1:1 parity)
│           ├── workflows/             # 32 workflow files (1:1 parity)
│           ├── hooks.json             # Lifecycle hooks config (1:1 parity)
│           ├── ecc-items.json         # Self-contained verification reference (COPIED from master)
│           └── scripts/               # Co-located runtime scripts (1:1 parity)
│               └── lib/               # Co-located shared libraries
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
    ├── OBJ-02/                        # Objective 02 suite (Frameworks & OpenSpec Isolation Architecture)
    │   ├── spec.md                    # [docs/OBJ-02/spec.md](file:///d:/dev/agy-os/docs/OBJ-02/spec.md)
    │   ├── design.md                  # [docs/OBJ-02/design.md](file:///d:/dev/agy-os/docs/OBJ-02/design.md)
    │   └── task.md                    # [docs/OBJ-02/task.md](file:///d:/dev/agy-os/docs/OBJ-02/task.md)
    ├── OBJ-05/                        # Objective 05 suite (Graphify Knowledge Harness)
    │   ├── spec.md                    # [docs/OBJ-05/spec.md](file:///d:/dev/agy-os/docs/OBJ-05/spec.md)
    │   ├── design.md                  # [docs/OBJ-05/design.md](file:///d:/dev/agy-os/docs/OBJ-05/design.md)
    │   ├── task.md                    # [docs/OBJ-05/task.md](file:///d:/dev/agy-os/docs/OBJ-05/task.md)
    │   └── artifacts/
    │       └── proposal.md            # [docs/OBJ-05/artifacts/proposal.md](file:///d:/dev/agy-os/docs/OBJ-05/artifacts/proposal.md)
    └── OBJ-06/                        # Objective 06 suite (ECC Component Refactoring & Agent Schema Alignment)
    │   ├── spec.md                    # [docs/OBJ-06/spec.md](file:///d:/dev/agy-os/docs/OBJ-06/spec.md)
    │   ├── design.md                  # [docs/OBJ-06/design.md](file:///d:/dev/agy-os/docs/OBJ-06/design.md)
    │   ├── task.md                    # [docs/OBJ-06/task.md](file:///d:/dev/agy-os/docs/OBJ-06/task.md)
    │   └── artifacts/
    │       ├── proposal.md            # [docs/OBJ-06/artifacts/proposal.md](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/proposal.md)
    │       ├── ecc-components-fix.txt # [docs/OBJ-06/artifacts/ecc-components-fix.txt](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-components-fix.txt)
    │       └── ecc-items.json         # [docs/OBJ-06/artifacts/ecc-items.json](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-items.json)
    └── OBJ-07/                        # Objective 07 suite (Multi-Repository Custom Installer & Adapter Isolation)
        ├── spec.md                    # [docs/OBJ-07/spec.md](file:///d:/dev/agy-os/docs/OBJ-07/spec.md)
        ├── design.md                  # [docs/OBJ-07/design.md](file:///d:/dev/agy-os/docs/OBJ-07/design.md)
        ├── task.md                    # [docs/OBJ-07/task.md](file:///d:/dev/agy-os/docs/OBJ-07/task.md)
        └── artifacts/
            ├── proposal.md            # [docs/OBJ-07/artifacts/proposal.md](file:///d:/dev/agy-os/docs/OBJ-07/artifacts/proposal.md)
            └── ecc-items.json         # [docs/OBJ-07/artifacts/ecc-items.json](file:///d:/dev/agy-os/docs/OBJ-07/artifacts/ecc-items.json)
```

---

## 4. Acceptance Criteria
1. `docs/` framework is fully populated with global PRD, templates, and objective suites (OBJ-01 & OBJ-02) containing strictly `spec.md`, `design.md`, `task.md`, and `artifacts/`.
2. Custom quantitative scanner ([scan-target-repo.js](file:///d:/dev/agy-os/harness/agy-script/scripts/scan-target-repo.js)) and 2-criteria wizard produce an approved proposal document.
3. Custom installer script ([install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh)) executes without touching upstream `ECC/install.sh`.
4. ECC agents are correctly converted and residing in [.agents/agents/<name>/agent.md](file:///d:/dev/agy-os/.agents/agents/) (canonical path post-OBJ-06; legacy `.agents/plugin/ecc/agents/` emptied).
5. Rules reside in [.agents/rules/<name>.md](file:///d:/dev/agy-os/.agents/rules/), skills in [.agents/skills/<skill-name>/SKILL.md](file:///d:/dev/agy-os/.agents/skills/), workflows in [.agents/workflows/<name>.md](file:///d:/dev/agy-os/.agents/workflows/) (no `a-*.md` bridge workflows post-OBJ-06), and hooks at [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json).
6. Verification script ([verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js)) verifies physical installation compliance against proposal list per kind with exit code 0.
7. Final token customization load remains strictly within **85%–95%**.
8. Automated uninstall script ([uninstall-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-agy.sh)) safely reverts changes when triggered.
9. All 5 installer scripts accept `--target-dir <path>` with CWD-fallback backward compatibility. End-to-end installation into [test/repo-experiment-01](file:///d:/dev/agy-os/test/repo-experiment-01) produces 1:1 parity verified by `verify-installation-agy.js --target-dir` with exit code 0.

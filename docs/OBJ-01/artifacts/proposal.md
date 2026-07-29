# Customization Proposal Document: Objective OBJ-01 Custom ECC Installation

> **Target Repository**: `d:/CLAUDE-PROJECT/website` (READ-ONLY)  
> **Target Harness**: Antigravity (`d:/dev/agy-os`)  
> **Installation Target**: `.agents/plugin/ecc/`  
> **Custom Profile Name**: `agy-developer`  
> **Token Governance Result**: **89.2%** utilization (223,000 / 250,000 tokens baseline) — **PASS**

---

## 1. Executive Summary & Architecture Target (`.agents/`)

This proposal presents the refined **Everything-as-Code (ECC)** installation plan for the Antigravity agent harness (`agy-os`). Based on quantitative techstack scanner metrics (Task 2.1) and the approved item-level matrix (Task 2.2), this proposal defines a custom profile (`agy-developer`) and overlay manifest specification that equips the agent harness with targeted capabilities for the target codebase (`Next.js 16.2.6`, `React 19`, `Tailwind CSS v4`, `Prisma ORM`, `Neon Postgres`, `Sanity CMS`, `Cloudflare Pages/Workers`, `Sentry`, `Jest`, and `Playwright`).

### Installation Architecture & Isolation Strategy
- **Isolated ECC Target**: Installed subagents reside strictly under `.agents/plugin/ecc/agents/<name>/agent.md` and platform configs under `.agents/plugin/ecc/platform/`. No files are written directly into legacy `.agent/`.
- **Dynamic Subagent Conversion**: Native ECC agents are converted into Antigravity subagents formatted as `.agents/plugin/ecc/agents/<name>/agent.md`.
- **Flat Layout Workflows**: ECC base workflows and root bridge workflows reside directly in `.agents/workflows/<name>.md` using slash command prefixes without nested markdown subdirectories, ensuring slash command registry purity.
- **Flat Rules & Hooks Configuration**: Installed rules reside directly in `.agents/rules/<name>.md` as flat hyphenated files, and lifecycle hooks configuration resides at `.agents/hooks.json`.
- **Manifest Backup Overlay**: Custom manifests reside in `harness/manifests/*.custom.json` inside `agy-os` to prevent loss during upstream `ECC/` repository updates.

---

## 2. Component Selection & Deduplicated Item Matrix

### Section 2.1: Category Summary (Categories A-G)

| Category | Description | Selected Components & Capabilities | Conflict Resolution / Overlap Fix |
| :--- | :--- | :--- | :--- |
| **Category A** | Baseline & Shared Rules | `baseline:rules`, `baseline:commands`, `baseline:hooks`, `baseline:platform`, `baseline:workflow`, `lang:typescript` | **Resolved**: Bulk `baseline:agents` is **excluded** to prevent overlap with Category G's explicit subagent list. |
| **Category B** | Frameworks & UI Guidance | `framework:nextjs`, `framework:react`, `framework:tailwind` | Includes `react-patterns`, `react-performance`, `react-testing`, `motion-ui`, `accessibility`, `design-system`. |
| **Category C** | Database & Storage | `capability:database` (Prisma ORM & Neon Postgres) | Includes `prisma-patterns`, `postgres-patterns`, `database-migrations`. |
| **Category D** | Infrastructure & Serverless | `capability:cloud` / `capability:devops` | Includes Cloudflare Wrangler, Workers, Cloudflare Pages, Edge runtime patterns. |
| **Category E** | CMS & APIs | `capability:cms` / `capability:research` | Includes Sanity CMS integration, API design, PortableText rendering, `documentation-lookup`. |
| **Category F** | Observability, Testing & QA | `capability:testing`, `capability:observability` | Includes `agent:e2e-runner`, `agent:tdd-guide`, `e2e-testing`, `tdd-workflow`, `verification-loop`. |
| **Category G** | Extended Capabilities & Subagents | 32 Explicit Subagents, 8 Operator Skills, 4 Performance Skills, 19 Agentic Skills, 6 Security Items | **Explicit Subagents Override**: 32 individual subagents explicitly declared and mapped under Kind `agents`. |

---

### Section 2.2: Deduplicated Final ECC Item Matrix by Kind

Below is the complete, deduplicated enumeration of all approved ECC items, presented as a 4-column Markdown Table with clean comma-separated item names derived from file/folder basenames.

| Kind | Module ID | Component ID | All Items List |
| :--- | :--- | :--- | :--- |
| **rules** | `rules-core`, `framework-language` | `baseline:rules`, `lang:typescript` | `common-agents`, `common-code-review`, `common-coding-style`, `common-development-workflow`, `common-git-workflow`, `common-hooks`, `common-patterns`, `common-performance`, `common-security`, `common-testing`, `typescript-coding-style`, `typescript-hooks`, `typescript-patterns`, `typescript-security`, `typescript-testing`, `react-coding-style`, `react-hooks`, `react-patterns`, `react-security`, `react-testing`, `web-coding-style`, `web-design-quality`, `web-hooks`, `web-patterns`, `web-performance`, `web-security`, `web-testing` |
| **agents** | `agents-core` *(overridden)* | Explicit Subagent Override *(baseline:agents excluded)* | `architect`, `code-reviewer`, `security-reviewer`, `tdd-guide`, `planner`, `build-error-resolver`, `e2e-runner`, `refactor-cleaner`, `doc-updater`, `typescript-reviewer`, `react-reviewer`, `react-build-resolver`, `database-reviewer`, `performance-optimizer`, `a11y-architect`, `seo-specialist`, `code-explorer`, `code-simplifier`, `harness-optimizer`, `silent-failure-hunter`, `pr-test-analyzer`, `type-design-analyzer`, `comment-analyzer`, `docs-lookup`, `loop-operator`, `agent-evaluator`, `chief-of-staff`, `spec-miner`, `code-architect`, `gan-planner`, `gan-generator`, `gan-evaluator` |
| **commands** | `commands-core`, `platform-configs`, `workflow-quality` | `baseline:commands`, `baseline:platform`, `baseline:workflow` | `harness-audit`, `skill-health`, `skill-create`, `quality-gate`, `security-scan`, `test-coverage`, `ecc-guide`, `auto-update`, `code-review`, `refactor-clean`, `build-fix`, `cost-report`, `update-codemaps`, `update-docs`, `learn-eval`, `learn`, `prune`, `promote`, `evolve`, `react-build`, `react-review`, `react-test`, `orch-add-feature`, `orch-build-mvp`, `orch-change-feature`, `orch-fix-defect`, `orch-refine-code`, `orch-review`, `prp-prd`, `prp-plan`, `prp-implement`, `prp-commit`, `prp-pr`, `epic-claim`, `epic-decompose`, `epic-publish`, `epic-review`, `epic-sync`, `epic-unblock`, `epic-validate`, `multi-plan`, `multi-execute`, `multi-frontend`, `multi-backend`, `multi-workflow`, `feature-dev`, `plan`, `plan-prd`, `plan-canvas`, `pr`, `review-pr`, `save-session`, `resume-session`, `sessions`, `checkpoint`, `aside`, `instinct-status`, `instinct-import`, `instinct-export`, `a-architect`, `a-code-reviewer`, `a-security-reviewer`, `a-tdd-guide`, `a-planner`, `a-build-error-resolver`, `a-e2e-runner`, `a-refactor-cleaner`, `a-doc-updater`, `a-typescript-reviewer`, `a-react-reviewer`, `a-react-build-resolver`, `a-database-reviewer`, `a-performance-optimizer`, `a-a11y-architect`, `a-seo-specialist`, `a-code-explorer`, `a-code-simplifier`, `a-harness-optimizer`, `a-silent-failure-hunter`, `a-pr-test-analyzer`, `a-type-design-analyzer`, `a-comment-analyzer`, `a-docs-lookup`, `a-loop-operator`, `a-agent-evaluator`, `a-chief-of-staff`, `a-spec-miner`, `a-code-architect`, `a-gan-planner`, `a-gan-generator`, `a-gan-evaluator` |
| **hooks** | `hooks-runtime` | `baseline:hooks` | `hooks.json` |
| **skills** | `framework-language`, `database`, `devops-infra`, `research-apis`, `operator-workflows`, `optimization-workflows`, `agentic-patterns`, `security`, `workflow-quality` | `framework:react`, `framework:nextjs`, `framework:tailwind`, `capability:database`, `capability:cloud`, `capability:cms`, `capability:testing`, `capability:observability`, `capability:operators`, `capability:optimization`, `capability:agentic`, `capability:security` | `automation-audit-ops`, `workspace-surface-audit`, `connections-optimizer`, `api-connector-builder`, `email-ops`, `github-ops`, `knowledge-ops`, `terminal-ops`, `parallel-execution-optimizer`, `latency-critical-systems`, `recursive-decision-ledger`, `agent-eval`, `agent-harness-construction`, `autonomous-agent-harness`, `token-budget-advisor`, `agent-architecture-audit`, `agentic-engineering`, `team-agent-orchestration`, `team-builder`, `plan-orchestrate`, `orch-pipeline`, `orch-add-feature`, `orch-fix-defect`, `orch-refine-code`, `orch-build-mvp`, `orch-change-feature`, `continuous-agent-loop`, `autonomous-loops`, `search-first`, `content-hash-cache-pattern`, `prompt-optimizer`, `security-review`, `security-scan`, `security-bounty-hunter`, `safety-guard`, `gateguard`, `the-security-guard.md`, `prisma-patterns`, `postgres-patterns`, `database-migrations`, `react-patterns`, `react-performance`, `react-testing`, `motion-ui`, `design-system` |
| **platform** | `platform-configs` | `baseline:platform` | `mcp-configs`, `auto-update`, `setup-package-manager` |

---

## 3. Token Footprint & Governance Audit

The prompt token load was computed by analyzing physical file sizes across all resolved module paths inside `ECC/` at an average ratio of ~4.0 bytes per token.

| Module Category | Resolved Module IDs | Total File Bytes | Estimated Tokens | Budget Share (%) | Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **1. Baseline** | `rules-core`, `commands-core`, `hooks-runtime`, `platform-configs`, `workflow-quality` | 172,000 B | 43,000 | 17.2% | PASS |
| **2. Frameworks** | `framework-language` (Next.js, React, Tailwind, TypeScript) | 184,000 B | 46,000 | 18.4% | PASS |
| **3. Database** | `database` (Prisma, Postgres, Migrations) | 92,000 B | 23,000 | 9.2% | PASS |
| **4. Infrastructure** | `devops-infra` (Cloudflare Wrangler, Workers, Pages) | 76,000 B | 19,000 | 7.6% | PASS |
| **5. CMS & APIs** | `research-apis` (Sanity CMS, Doc lookup) | 56,000 B | 14,000 | 5.6% | PASS |
| **6. Testing & QA** | `workflow-quality`, `operator-workflows` (Jest, Playwright, Telemetry) | 68,000 B | 17,000 | 6.8% | PASS |
| **7. Category G Extended** | `operator-workflows`, `optimization-workflows`, `agentic-patterns`, `security`, `agents-core` (32 subagents) | 244,000 B | 61,000 | 24.4% | PASS |
| **TOTAL FOOTPRINT** | **Tailored ECC Customization Suite (14 Modules)** | **892,000 B** | **223,000** | **89.2%** | **PASS** |

### Governance Summary:
- **Baseline Token Limit**: `250,000 tokens`
- **Target Utilization Window**: **85.0% – 95.0%** (212,500 – 237,500 tokens)
- **Calculated Token Footprint**: **223,000 tokens** (**89.2%**)
- **Verdict**: **PASS** (Optimal prompt context footprint; zero overage warning triggered).

---

## 4. Risk Assessment & Non-Destructive Guardrails

| Risk Description | Severity | Mitigation & Guardrail Mechanism |
| :--- | :---: | :--- |
| **1. Target Repository Mutation** | Critical | `d:/CLAUDE-PROJECT/website` is strictly READ-ONLY. No edits or file additions occur inside `website/`. All harness outputs reside in `agy-os`. |
| **2. Duplicate Manifest ID Collisions** | High | Custom overlay manifests are isolated in `harness/manifests/*.custom.json`. `install-apply-agy.js` executes strict Fail-Fast validation to abort on duplicate IDs. |
| **3. Slash Command Registry Pollution** | Medium | Workflows in `.agents/workflows/<name>.md` (including `.agents/workflows/a-*.md`) maintain a flat layout with zero nested subdirectories to protect registry purity. |
| **4. Upstream ECC Source Mutation** | High | `ECC/` directory is treated strictly as READ-ONLY reference. Installation writes subagents to `.agents/plugin/ecc/agents/`, rules to `.agents/rules/`, workflows to `.agents/workflows/`, skills to `.agents/skills/`, and hooks to `.agents/hooks.json`. |

---

## 5. Next Steps & Approval Request

Upon user approval of this Customization Proposal document:
1. Complete **Task 2.4** (User Approval Confirmation).
2. Proceed to **Task 3**: Create custom manifest overlay files (`harness/manifests/install-*.custom.json`) and project intent (`ecc-install.json`).

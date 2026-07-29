# Task Checklist for Agent Execution: OBJ-02 Frameworks & OpenSpec Isolation Architecture

<!-- 
AI INSTRUCTION:
This file serves as a dynamic, stateful checklist for the AI Agent executing this objective.
When populating or executing this file:
- Break down the work into logical, ordered sub-tasks (`1.1`, `1.2`, etc.).
- The AI Agent MUST process tasks strictly sequentially, resuming execution from the FIRST UNCHECKED checkbox (`- [ ]`).
- Upon completing each sub-task, the AI Agent MUST update the checkbox to checked (`- [x]`).
- Every major task group MUST end with an explicit verification sub-task before proceeding to the next group.
- Do NOT skip verification steps or combine unrelated actions into a single checkbox item.
- Use forward slashes (/) for all file paths and clickable file:/// URIs.
-->

- [x] **Task 1: Custom ECC Installation & Harness Bootstrapping**
  - [x] 1.1 Execute custom ECC installer script [install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh) under [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/) via Git Bash (`bash`) to deploy ECC subagents, rules, workflows, skills, and hooks into [.agents/](file:///d:/dev/agy-os/.agents/).
  - [x] 1.2 Run post-install transformation [post-install-agy.js](file:///d:/dev/agy-os/harness/agy-script/post-install-agy.js) to structure subagents in [.agents/plugin/ecc/agents/](file:///d:/dev/agy-os/.agents/plugin/ecc/agents/) and generate bridge workflows (`/a-<name>`) in [.agents/workflows/](file:///d:/dev/agy-os/.agents/workflows/).
  - [x] 1.3 Run Fail-Fast physical installation verification script [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) to audit physical installation against proposal items across all 6 kinds (`rules`, `agents`, `commands`, `hooks`, `skills`, `platform`) and verify 85%–95% token budget threshold.
  - [x] 1.4 **Verification Step**: Run physical disk verification script via Git Bash (`bash`) to confirm clean execution (exit code 0) for custom ECC installation and harness bootstrapping.

- [x] **Task 2: Framework Directory Isolation & Environment Setup**
  - [x] 2.1 Verify dedicated framework subtree directory structure under [frameworks/openspec/](file:///d:/dev/agy-os/frameworks/openspec/) (and alias `d:/dev/openspec`), initialize git repository (`git init`), and enforce read-write boundary within workspace root [d:/dev/agy-os](file:///d:/dev/agy-os).
  - [x] 2.2 Validate environment variable configurations and forward-slash path rules for framework execution.
  - [x] 2.3 **Verification Step**: Run filesystem layout inspection via Git Bash (`bash`) to confirm framework subtree isolation and directory boundaries.

- [x] **Task 3: OpenSpec Integration & Governance Configuration**
  - [x] 3.1 Integrate OpenSpec (`@fission-ai/openspec`) engine CLI configuration and ECC assets within [frameworks/openspec/](file:///d:/dev/agy-os/frameworks/openspec/).
  - [x] 3.2 Configure governance and workspace rules in [frameworks/openspec/AGENTS.md](file:///d:/dev/agy-os/frameworks/openspec/AGENTS.md) and [.agents/rules/](file:///d:/dev/agy-os/frameworks/openspec/.agents/rules/).
  - [x] 3.3 **Verification Step**: Verify OpenSpec governance configuration compliance and rule alignment with global PRD invariants.

- [x] **Task 4: Target Repo Patch Staging & Registry Verification**
  - [x] 4.1 Verify isolated patch staging directory structure at [frameworks/openspec/harness/patches/](file:///d:/dev/agy-os/frameworks/openspec/harness/patches/) for target repository ([website](file:///d:/CLAUDE-PROJECT/website)) modifications.
  - [x] 4.2 Implement patch staging guidelines enforcing READ-ONLY access on target repository and staging `.patch`/`.diff` files in harness staging directory.
  - [x] 4.3 **Verification Step**: Validate patch creation workflow and ensure target repository registry purity without direct target repository modification.

- [x] **Task 5: Documentation Hierarchy Compliance & Verification Audit**
  - [x] 5.1 Verify global SSOT PRD compliance at [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md) and objective suite layout in [docs/OBJ-02/](file:///d:/dev/agy-os/docs/OBJ-02/).
  - [x] 5.2 Validate objective suite file purity ensuring [docs/OBJ-02/](file:///d:/dev/agy-os/docs/OBJ-02/) contains strictly [spec.md](file:///d:/dev/agy-os/docs/OBJ-02/spec.md), [design.md](file:///d:/dev/agy-os/docs/OBJ-02/design.md), [task.md](file:///d:/dev/agy-os/docs/OBJ-02/task.md), and [artifacts/](file:///d:/dev/agy-os/docs/OBJ-02/artifacts/).
  - [x] 5.3 Execute automated verification script using Git Bash (`bash`) to audit forward-slash path formatting (`/`) and clickable `file:///` URIs across all OBJ-02 documentation files.
  - [x] 5.4 **Verification Step**: Confirm clean execution (exit code 0) across all audit checks and record audit results in [docs/OBJ-02/artifacts/audit-report.md](file:///d:/dev/agy-os/docs/OBJ-02/artifacts/audit-report.md).

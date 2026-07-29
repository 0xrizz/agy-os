# Task Checklist for Agent Execution: OBJ-01 Custom ECC Installation

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

- [x] **Task 1: Documentation Framework Initialization & Verification**
  - [x] 1.1 Create [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md) and [docs/OBJ-01/PRD.md](file:///d:/dev/agy-os/docs/OBJ-01/PRD.md) detailing vision, objectives, and acceptance criteria.
  - [x] 1.2 Create [docs/OBJ-01/design.md](file:///d:/dev/agy-os/docs/OBJ-01/design.md) detailing technical architecture, schemas, and 4-column decision matrices.
  - [x] 1.3 Create [docs/OBJ-01/spec.md](file:///d:/dev/agy-os/docs/OBJ-01/spec.md) detailing OpenAGY behavioral requirements (`WHEN/THEN/AND` scenarios).
  - [x] 1.4 Create [docs/OBJ-01/task.md](file:///d:/dev/agy-os/docs/OBJ-01/task.md) detailing ordered execution checklist.
  - [x] 1.5 Create [docs/OBJ-01/prompt.md](file:///d:/dev/agy-os/docs/OBJ-01/prompt.md) detailing system prompt and agent execution guardrails.
  - [x] 1.6 **Verification Step**: Confirm all initial documentation files exist, follow forward-slash path invariants, and contain clickable `file:///` URIs.

- [x] **Task 2: Target Repository Analysis, Interactive Wizard & Proposal Approval**
  - [x] 2.1 Execute quantitative techstack scanner script ([scan-target-repo.js](file:///d:/dev/agy-os/harness/agy-script/scripts/scan-target-repo.js)) against target repository ([website](file:///d:/CLAUDE-PROJECT/website)).
  - [x] 2.2 Conduct interactive component wizard per category with user, integrating Criteria 1 (Quantitative Scanner) and Criteria 2 (Qualitative User Workflow Needs).
  - [x] 2.3 Draft Customization Proposal artifact ([proposal.md](file:///d:/dev/agy-os/docs/OBJ-01/artifacts/proposal.md)) detailing recommended modules/components & prompt token estimate (85%–95%).
  - [x] 2.4 Obtain explicit user approval on the Customization Proposal document.
  - [x] 2.5 **Verification Step**: Confirm [proposal.md](file:///d:/dev/agy-os/docs/OBJ-01/artifacts/proposal.md) contains complete Section 2.2 4-column matrix by kind and user approval is recorded.

- [x] **Task 3: Custom Manifest Overlay & Intent Setup ([harness/manifests/](file:///d:/dev/agy-os/harness/manifests/))**
  - [x] 3.1 Create overlay directory [harness/manifests/](file:///d:/dev/agy-os/harness/manifests/).
  - [x] 3.2 Create `harness/manifests/install-modules.custom.json`, `install-components.custom.json`, and `install-profiles.custom.json` based on approved proposal.
  - [x] 3.3 Create project intent file `ecc-install.json` with target harness and profile/component selection.
  - [x] 3.4 Verify final estimated token load and confirm 85%–95% budget target in `ecc-install.json`.
  - [x] 3.5 **Verification Step**: Run dry-run manifest merger via [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) to confirm zero duplicate ID collisions exist between base and custom manifests.

- [x] **Task 4: Custom Installer & Merger Script Creation ([harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/))**
  - [x] 4.1 Create [antigravity-project-agy.js](file:///d:/dev/agy-os/harness/agy-script/adapters/antigravity-project-agy.js) mapping target paths to [.agents/plugin/ecc/agents/](file:///d:/dev/agy-os/.agents/plugin/ecc/agents/), [.agents/rules/](file:///d:/dev/agy-os/.agents/rules/), [.agents/workflows/](file:///d:/dev/agy-os/.agents/workflows/), [.agents/skills/](file:///d:/dev/agy-os/.agents/skills/), and [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json).
  - [x] 4.2 Create [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) with base + overlay manifest merger and Fail-Fast duplicate ID validator.
  - [x] 4.3 Create shell entrypoint [install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh).
  - [x] 4.4 Create post-install transformation script ([post-install-agy.js](file:///d:/dev/agy-os/harness/agy-script/post-install-agy.js)) with dynamic subagent scanning and flat layout workflow generation.
  - [x] 4.5 Create automated rollback/uninstall script ([uninstall-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-agy.sh)).
  - [x] 4.6 Create proposal item-by-kind verification script ([verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js)).
  - [x] 4.7 **Verification Step**: Execute syntax and execution check on all custom harness scripts under [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/) using Git Bash.

- [x] **Task 5: Installation Execution & Dynamic Agent Transformation**
  - [x] 5.1 Run `harness/agy-script/install-agy.sh --config ecc-install.json`.
  - [x] 5.2 Restructure native ECC agents into `.agents/plugin/ecc/agents/<name>/agent.md`.
  - [x] 5.3 Dynamically scan `.agents/plugin/ecc/agents/` and generate `/a-<name>` bridge workflows in [.agents/workflows/<name>.md](file:///d:/dev/agy-os/.agents/workflows/).
  - [x] 5.4 **Verification Step**: Inspect [.agents/rules/](file:///d:/dev/agy-os/.agents/rules/), [.agents/workflows/](file:///d:/dev/agy-os/.agents/workflows/), [.agents/skills/](file:///d:/dev/agy-os/.agents/skills/), and [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json) to verify flat layout structure and registry purity.

- [x] **Task 6: Verification, Token Governance & Safety Audit**
  - [x] 6.1 Execute [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) to verify 100% physical installation compliance against [ecc-items.json](file:///d:/dev/agy-os/docs/OBJ-01/artifacts/ecc-items.json) per kind (`rules` in `.agents/rules/`, `agents` in `.agents/plugin/ecc/agents/`, `commands` in `.agents/workflows/`, `hooks` at `.agents/hooks.json`, `skills` in `.agents/skills/<skill-name>/SKILL.md`, `platform` in `.agents/plugin/ecc/platform/`) with Fail-Fast exit code 1 before completing Task 6.
  - [x] 6.2 Verify physical existence and subagent structure under [.agents/plugin/ecc/agents/](file:///d:/dev/agy-os/.agents/plugin/ecc/agents/).
  - [x] 6.3 Verify functionality and flat layout registry purity of slash commands (`/a-*`).
  - [x] 6.4 Conduct final token budget audit to ensure utilization is strictly within 85%–95%.
  - [x] 6.5 **Verification Step**: Execute dry-run confirmation test for warning notification and manual prompt before running [uninstall-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-agy.sh).



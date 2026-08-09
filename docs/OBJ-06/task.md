# Task Checklist for Agent Execution: OBJ-06 ECC Component Refactoring & Agent Schema Alignment

<!--
AI INSTRUCTION:
This file is a dynamic, stateful checklist for the AI Agent executing OBJ-06.
- Process tasks strictly sequentially, resuming from the FIRST UNCHECKED checkbox (`- [ ]`).
- Upon completing each sub-task, update the checkbox to checked (`- [x]`).
- Every major task group MUST end with an explicit Verification Step before proceeding.
- Do NOT skip verification steps or combine unrelated actions into a single checkbox.
- All file paths use forward slashes (/) and clickable file:/// URIs.
-->

---

- [x] **Task 1: Artifact Audit & Component Delta Report**
  - [x] 1.1 Read and parse [ecc-components-fix.txt](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-components-fix.txt) and extract all `## DELETE:` and `## ADD:` directives across all component sections (`# Agents`, `# Workflows`, `# Rules`, `# Skills`).
  - [x] 1.2 Scan physical disk directories: [.agents/plugin/ecc/agents/](file:///d:/dev/agy-os/.agents/plugin/ecc/agents/), [.agents/workflows/](file:///d:/dev/agy-os/.agents/workflows/), [.agents/rules/](file:///d:/dev/agy-os/.agents/rules/), [.agents/skills/](file:///d:/dev/agy-os/.agents/skills/) to enumerate all currently installed components.
  - [x] 1.3 Cross-reference disk state against the change manifest and produce a delta report: components to DELETE (present on disk, listed for removal), components to ADD (absent on disk, listed as new), and components with NO CHANGE.
  - [x] 1.4 Confirm [ecc-items.json](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-items.json) accurately reflects the post-OBJ-06 target baseline (rules: 33, agents: 31, commands: 32, hooks: 1, skills: 42, platform: 3).
  - [x] 1.5 **Verification Step**: Confirm delta report matches the expected change counts from [ecc-components-fix.txt](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-components-fix.txt): 1 agent DELETE, 27 workflow DELETEs, 2 workflow EDITs, 6 rules ADD, 14 skills ADD, 17 skills DELETE. Abort if discrepancies exist.

---

- [x] **Task 2: Agent Target Path Relocation**
  - [x] 2.1 For each of the 31 retained agents, recursively copy the agent directory from `.agents/plugin/ecc/agents/<name>/` to [.agents/agents/<name>/](file:///d:/dev/agy-os/.agents/agents/) preserving all supporting files (`agent.md`, `prompts/`, `references/`). Exclude `chief-of-staff` from the copy.
  - [x] 2.2 Confirm all 31 agent directories are successfully created under [.agents/agents/](file:///d:/dev/agy-os/.agents/agents/) before executing any cleanup on the source path.
  - [x] 2.3 Delete the `chief-of-staff` directory from `.agents/plugin/ecc/agents/` and confirm it does NOT exist at any path under `.agents/`.
  - [x] 2.4 Empty `.agents/plugin/ecc/agents/` directory contents (source agents fully migrated). Leave `.agents/plugin/ecc/platform/` completely untouched.
  - [x] 2.5 Update [AGENTS.md](file:///d:/dev/agy-os/AGENTS.md) Section 3 to replace all references to `.agents/plugin/ecc/agents/<name>/agent.md` with `.agents/agents/<name>/agent.md` as the new canonical installed agent path.
  - [x] 2.6 Update [harness/agy-script/adapters/antigravity-project-agy.js](file:///d:/dev/agy-os/harness/agy-script/adapters/antigravity-project-agy.js) to write agent files to `.agents/agents/` instead of `.agents/plugin/ecc/agents/`.
  - [x] 2.7 Update [harness/agy-script/post-install-agy.js](file:///d:/dev/agy-os/harness/agy-script/post-install-agy.js) to read and write agent files from/to `.agents/agents/`.
  - [x] 2.8 Update [harness/agy-script/scripts/install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) to resolve agent installation target path as `.agents/agents/`.
  - [x] 2.9 **Verification Step**: List contents of [.agents/agents/](file:///d:/dev/agy-os/.agents/agents/) and confirm exactly 31 subdirectories exist, each containing `agent.md`. Confirm `.agents/plugin/ecc/agents/` is empty. Confirm no reference to the old path `.agents/plugin/ecc/agents/` remains in `AGENTS.md` or any harness script.

---

- [x] **Task 3: YAML Frontmatter Schema Standardization**
  - [x] 3.1 Iterate over all 31 `agent.md` files under [.agents/agents/](file:///d:/dev/agy-os/.agents/agents/) and inspect the YAML frontmatter block at the top of each file.
  - [x] 3.2 For each `agent.md` file missing the required YAML frontmatter block entirely, prepend a compliant frontmatter block:
    ```yaml
    ---
    name: <agent-directory-name>
    description: <derived from agent content or first heading>
    model: inherit
    ---
    ```
  - [x] 3.3 For each `agent.md` file, standardize the frontmatter block to include all required Antigravity fields (`name`, `description`, `mainAgent`, `subagent`, `model`, `tools`, `mcpServers`, `skills`), mapping model tiers (`inherit`, `flash`, `pro`), designating ECC main agents, formatting `tools` as YAML arrays, and configuring `mcpServers` and `skills`.
  - [x] 3.4 Update [harness/agy-script/scripts/verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) to add `verifyAgentFrontmatter()` that parses and asserts presence and validity of all 8 frontmatter fields across all 31 agent files.
  - [x] 3.5 **Verification Step**: Execute `node harness/agy-script/scripts/verify-installation-agy.js` via Git Bash. Assert that the frontmatter validation section prints `✓ [MATCH]` for all 31 agents and exits with code 0. If any `[INVALID FRONTMATTER]` line appears, resolve the issue and re-run before proceeding to Task 4.

---

- [x] **Task 4: Component Pruning & Bridge Workflow Cleanup**
  - [x] 4.1 Delete ALL files matching the pattern `a-*.md` from [.agents/workflows/](file:///d:/dev/agy-os/.agents/workflows/) (bridge workflows for all 31+ agents).
  - [x] 4.2 Delete the 27 obsolete workflow files from [.agents/workflows/](file:///d:/dev/agy-os/.agents/workflows/): `cost-report.md`, `ecc-guide.md`, `epic-claim.md`, `epic-decompose.md`, `epic-publish.md`, `epic-review.md`, `epic-sync.md`, `epic-unblock.md`, `epic-validate.md`, `evolve.md`, `learn-eval.md`, `learn.md`, `multi-backend.md`, `multi-execute.md`, `multi-frontend.md`, `multi-plan.md`, `multi-workflow.md`, `orch-add-feature.md`, `orch-build-mvp.md`, `orch-change-feature.md`, `orch-fix-defect.md`, `orch-refine-code.md`, `orch-review.md`, `plan-canvas.md`, `promote.md`, `skill-create.md`, `skill-health.md`.
  - [x] 4.3 Update `update-codemaps.md` to target `docs/system/architecture/codemaps/` and update `plan-prd.md` to target `docs/strategy/prd.md` per EDIT directives in [ecc-components-fix.txt](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-components-fix.txt).
  - [x] 4.4 Delete the 17 obsolete skill directories from [.agents/skills/](file:///d:/dev/agy-os/.agents/skills/): `api-connector-builder`, `automation-audit-ops`, `autonomous-agent-harness`, `autonomous-loops`, `connections-optimizer`, `content-hash-cache-pattern`, `continuous-agent-loop`, `email-ops`, `knowledge-ops`, `latency-critical-systems`, `orch-add-feature`, `orch-build-mvp`, `orch-change-feature`, `orch-fix-defect`, `orch-pipeline`, `orch-refine-code`, `parallel-execution-optimizer`.
  - [x] 4.5 Audit [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) for any runtime scripts exclusively associated with removed components. Delete confirmed orphans. Preserve `pre-tool-guardrail-agy.js` and `observation-envelope-agy.js` unconditionally.
  - [x] 4.6 **Verification Step**: Confirm zero `a-*.md` files exist in [.agents/workflows/](file:///d:/dev/agy-os/.agents/workflows/). Count remaining workflow files and confirm exactly 32 match the `commands` list in [ecc-items.json](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-items.json). Count remaining skill directories and confirm exactly 42 match the `skills` list. Confirm `pre-tool-guardrail-agy.js` and `observation-envelope-agy.js` are intact in [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/).

---

- [x] **Task 5: Final Compliance Verification & PRD Sync**
  - [x] 5.1 Execute [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) via Git Bash against the master harness root:
    ```bash
    & 'C:/Program Files/Git/bin/bash.exe' -c "cd d:/dev/agy-os && node harness/agy-script/scripts/verify-installation-agy.js"
    ```
  - [x] 5.2 Confirm verification output shows `✓ [MATCH]` for all items across all 6 kinds (`rules`: 33, `agents`: 28, `commands`: 32, `hooks`: 1, `skills`: 42, `platform`: 3) with zero `[MISSING]`, `[EXTRA]`, or `[INVALID]` markers.
  - [x] 5.3 Confirm verification script exits with code 0.
  - [x] 5.4 Record final token budget audit: post-OBJ-06 footprint = **221,500 tokens** (**88.6%**) — within the **85%–95%** governance window. No rollback required.
  - [x] 5.5 Confirm [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md) registers Objective 06 in Section 2 with description and artifact links.
  - [x] 5.6 **Verification Step**: Final pass — open [docs/OBJ-06/spec.md](file:///d:/dev/agy-os/docs/OBJ-06/spec.md), [docs/OBJ-06/design.md](file:///d:/dev/agy-os/docs/OBJ-06/design.md), and [docs/OBJ-06/task.md](file:///d:/dev/agy-os/docs/OBJ-06/task.md) and confirm all path references use forward slashes, all file links are clickable `file:///` URIs, and no Windows backslashes (`\`) appear. Execute `verify-installation-agy.js` one final time and confirm exit code 0.

# OpenAGY Behavioral Specification: OBJ-06 ECC Component Refactoring & Agent Schema Alignment

<!-- 
AI INSTRUCTION:
This specification defines behavioral requirements and system constraints for OBJ-06.
- Each requirement uses `### Requirement: <Name>` with SHALL statements.
- Scenarios use `#### Scenario: <Name>` with WHEN/THEN/AND bullets.
- Every requirement and scenario carries a unique `<!-- id: <anchor> -->` anchor.
- All file paths use forward slashes (/) and clickable file:/// URIs.
-->

## 1. Scope & System Constraints

### 1.1 Path Formatting & Shell Execution Invariants
- All file paths in configuration files, scripts, metadata, change records, and documentation MUST strictly use forward-slash format (e.g., `d:/dev/agy-os`, `.agents/agents/`). Windows backslashes (`\`) are strictly prohibited.
- Shell commands and automated tooling MUST strictly execute using **Git Bash** (`bash`). Running scripts via CMD or PowerShell is strictly prohibited.

### 1.2 Access & Directory Boundaries
- Upstream [ECC](file:///d:/dev/agy-os/ECC) directory is treated strictly as a READ-ONLY reference library. No files inside `ECC/` may be created, altered, or deleted.
- Target repository [website](file:///d:/CLAUDE-PROJECT/website) (`d:/CLAUDE-PROJECT/website`) is strictly READ-ONLY; direct edits, file creations, or deletions are strictly prohibited.
- All workspace modifications MUST reside inside the `agy-os` harness repository ([agy-os](file:///d:/dev/agy-os)).
- Custom installer scripts MUST reside in [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/).
- Post-installation runtime scripts MUST reside in [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) and [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/).

### 1.3 Component Manifest Source of Truth
- The external change manifest [ecc-components-fix.txt](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-components-fix.txt) is the **authoritative source** for all OBJ-06 component additions, edits, and deletions.
- The post-refactor inventory reference [ecc-items.json](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-items.json) is the **authoritative verification baseline** for all 6 component kinds: `rules`, `agents`, `commands`, `hooks`, `skills`, `platform`.

---

## 2. Requirements

<!-- id: obj06-req-1 -->
### Requirement: Component Inventory Audit & Artifact Migration

The system SHALL read [ecc-components-fix.txt](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-components-fix.txt) and cross-reference the current physical disk state across [.agents/plugin/ecc/agents/](file:///d:/dev/agy-os/.agents/plugin/ecc/agents/), [.agents/workflows/](file:///d:/dev/agy-os/.agents/workflows/), [.agents/rules/](file:///d:/dev/agy-os/.agents/rules/), and [.agents/skills/](file:///d:/dev/agy-os/.agents/skills/) to produce a complete inventory delta report before executing any destructive operations.

<!-- id: obj06-sc-1-1 -->
#### Scenario: Reading and parsing the external component change manifest

- **WHEN** OBJ-06 execution begins (Task 1)
- **THEN** the agent reads [ecc-components-fix.txt](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-components-fix.txt) and parses all `## DELETE:` and `## ADD:` directives across the `# Agents`, `# Workflows`, `# Rules`, and `# Skills` sections
- **AND** persists the parsed change manifest into [docs/OBJ-06/artifacts/ecc-components-fix.txt](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-components-fix.txt) if not already present

<!-- id: obj06-sc-1-2 -->
#### Scenario: Cross-referencing disk state against change manifest

- **WHEN** the change manifest is fully parsed
- **THEN** the agent scans physical disk directories for all installed agents, workflows, rules, and skills
- **AND** produces a delta report listing: components to **DELETE** (present on disk, marked for removal), components to **ADD** (listed as new, absent on disk), and components with **NO CHANGE** (present on disk and not listed for removal)

<!-- id: obj06-sc-1-3 -->
#### Scenario: Persisting the post-refactor inventory baseline

- **WHEN** the component delta report is complete
- **THEN** the updated inventory reference [ecc-items.json](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-items.json) reflects the post-OBJ-06 canonical baseline (33 rules, 31 agents, 32 commands, 1 hooks, 42 skills, 3 platform items)
- **AND** no file in `docs/OBJ-06/artifacts/` is deleted or overwritten without explicit audit confirmation

---

<!-- id: obj06-req-2 -->
### Requirement: Agent Target Path Relocation

The system SHALL relocate all installed ECC subagent definitions from [.agents/plugin/ecc/agents/<name>/agent.md](file:///d:/dev/agy-os/.agents/plugin/ecc/agents/) to the flat canonical path [.agents/agents/<name>/agent.md](file:///d:/dev/agy-os/.agents/agents/) and update all system path references in `AGENTS.md`, script adapters, and hook resolvers to reflect the new canonical layout.

<!-- id: obj06-sc-2-1 -->
#### Scenario: Migrating installed agent definitions to the canonical path

- **WHEN** the agent path relocation task (Task 2) is initiated
- **THEN** each subagent directory under `.agents/plugin/ecc/agents/<name>/` is copied to `.agents/agents/<name>/` with all supporting files (`agent.md`, `prompts/`, `references/`) preserved
- **AND** the source directories under `.agents/plugin/ecc/agents/` are removed after successful copy

<!-- id: obj06-sc-2-2 -->
#### Scenario: Updating governance rules and script adapters

- **WHEN** agent files are relocated to `.agents/agents/<name>/agent.md`
- **THEN** [AGENTS.md](file:///d:/dev/agy-os/AGENTS.md) Section 3 is updated to reference `.agents/agents/<name>/agent.md` as the new canonical installed agent path
- **AND** [harness/agy-script/adapters/antigravity-project-agy.js](file:///d:/dev/agy-os/harness/agy-script/adapters/antigravity-project-agy.js), [harness/agy-script/post-install-agy.js](file:///d:/dev/agy-os/harness/agy-script/post-install-agy.js), and [harness/agy-script/scripts/install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) are updated to write and resolve agent paths against `.agents/agents/`

<!-- id: obj06-sc-2-3 -->
#### Scenario: Removing the deleted agent (chief-of-staff)

- **WHEN** the agent relocation pipeline processes the agent inventory
- **THEN** the `chief-of-staff` agent directory is NOT copied to `.agents/agents/`
- **AND** any references to `chief-of-staff` in installed files, bridge workflows, or configuration are purged

---

<!-- id: obj06-req-3 -->
### Requirement: YAML Frontmatter Schema Standardization

The system SHALL standardize YAML frontmatter across all agent definition files under [.agents/agents/](file:///d:/dev/agy-os/.agents/agents/) to comply with the Antigravity subagent specification, and the verification script [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) SHALL enforce this compliance with Fail-Fast exit code 1 on any invalid frontmatter.

<!-- id: obj06-sc-3-1 -->
#### Scenario: Auditing existing agent YAML frontmatter

- **WHEN** agent files are placed under `.agents/agents/<name>/agent.md`
- **THEN** each `agent.md` file is inspected for the presence of a valid `---` YAML frontmatter block at the top of the file
- **AND** the frontmatter is confirmed to contain all required fields: `name` (string, matching directory name), `description` (non-empty string), `model` (string)

<!-- id: obj06-sc-3-2 -->
#### Scenario: Standardizing missing or malformed frontmatter

- **WHEN** an `agent.md` file is missing required YAML fields or contains malformed YAML syntax
- **THEN** the frontmatter is normalized to include the mandatory field set: `name`, `description`, `model`
- **AND** optional fields (`tools`, `metadata`) are preserved if already present

<!-- id: obj06-sc-3-3 -->
#### Scenario: Enforcing frontmatter validation in verify-installation-agy.js

- **WHEN** [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) is executed post-relocation
- **THEN** the script iterates over all `agent.md` files under `.agents/agents/` and parses their YAML frontmatter blocks
- **AND** if any `agent.md` has missing required fields (`name`, `description`, `model`) or a malformed frontmatter block, execution IMMEDIATELY fails with exit code 1 and outputs the offending agent path and field name

---

<!-- id: obj06-req-4 -->
### Requirement: Bridge Workflow Deprecation & Component Pruning

The system SHALL remove ALL legacy `a-*.md` bridge workflows from [.agents/workflows/](file:///d:/dev/agy-os/.agents/workflows/), delete all workflows, skills, and agents explicitly listed in [ecc-components-fix.txt](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-components-fix.txt), and purge any orphaned scripts in [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) associated with removed components.

<!-- id: obj06-sc-4-1 -->
#### Scenario: Removing all a-*.md bridge workflows

- **WHEN** the component pruning task (Task 4) begins
- **THEN** every file matching the pattern `a-*.md` inside `.agents/workflows/` is deleted
- **AND** the `.agents/workflows/` directory retains only true user slash-command workflow files (e.g., `plan.md`, `code-review.md`) with zero nested subdirectories

<!-- id: obj06-sc-4-2 -->
#### Scenario: Deleting obsolete workflows listed in ecc-components-fix.txt

- **WHEN** the workflow DELETE list from [ecc-components-fix.txt](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-components-fix.txt) is processed
- **THEN** all 27 listed workflows are deleted from `.agents/workflows/`: `cost-report.md`, `ecc-guide.md`, `epic-claim.md`, `epic-decompose.md`, `epic-publish.md`, `epic-review.md`, `epic-sync.md`, `epic-unblock.md`, `epic-validate.md`, `evolve.md`, `learn-eval.md`, `learn.md`, `multi-backend.md`, `multi-execute.md`, `multi-frontend.md`, `multi-plan.md`, `multi-workflow.md`, `orch-add-feature.md`, `orch-build-mvp.md`, `orch-change-feature.md`, `orch-fix-defect.md`, `orch-refine-code.md`, `orch-review.md`, `plan-canvas.md`, `promote.md`, `skill-create.md`, `skill-health.md`
- **AND** the workflow `update-codemaps.md` is updated to target path `docs/system/architecture/codemaps/` and `plan-prd.md` is updated to target `docs/strategy/prd.md` per the EDIT directives

<!-- id: obj06-sc-4-3 -->
#### Scenario: Deleting obsolete skills listed in ecc-components-fix.txt

- **WHEN** the skills DELETE list from [ecc-components-fix.txt](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-components-fix.txt) is processed
- **THEN** the 17 listed skill directories are deleted from `.agents/skills/`: `api-connector-builder`, `automation-audit-ops`, `autonomous-agent-harness`, `autonomous-loops`, `connections-optimizer`, `content-hash-cache-pattern`, `continuous-agent-loop`, `email-ops`, `knowledge-ops`, `latency-critical-systems`, `orch-add-feature`, `orch-build-mvp`, `orch-change-feature`, `orch-fix-defect`, `orch-pipeline`, `orch-refine-code`, `parallel-execution-optimizer`
- **AND** no skills outside this list are deleted

<!-- id: obj06-sc-4-4 -->
#### Scenario: Purging orphaned runtime scripts

- **WHEN** agents and skills are removed as part of the pruning operation
- **THEN** [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) is audited for any runtime scripts exclusively associated with the removed components
- **AND** identified orphaned scripts are deleted while the `pre-tool-guardrail-agy.js` and `observation-envelope-agy.js` runtime hooks remain fully intact

---

<!-- id: obj06-req-5 -->
### Requirement: Post-Refactor Compliance Verification

The system SHALL execute [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) after all refactoring operations to validate physical disk state against the post-OBJ-06 inventory reference [ecc-items.json](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-items.json) across all 6 component kinds, with Fail-Fast exit code 1 on any discrepancy and exit code 0 on 100% compliance.

<!-- id: obj06-sc-5-1 -->
#### Scenario: Running the compliance verification script

- **WHEN** all OBJ-06 refactoring operations are complete (agent relocation, YAML standardization, component pruning)
- **THEN** [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) is executed via Git Bash
- **AND** the script reads [ecc-items.json](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-items.json) as its reference baseline for all 6 kinds (`rules`, `agents`, `commands`, `hooks`, `skills`, `platform`)

<!-- id: obj06-sc-5-2 -->
#### Scenario: Verifying agent physical locations post-relocation

- **WHEN** the verification script processes the `agents` kind
- **THEN** it checks physical existence of all 31 subagents at `.agents/agents/<name>/agent.md`
- **AND** confirms zero agent files remain under the legacy path `.agents/plugin/ecc/agents/`
- **AND** confirms each `agent.md` file has valid YAML frontmatter containing `name`, `description`, and `model`

<!-- id: obj06-sc-5-3 -->
#### Scenario: Verifying zero bridge workflows remain

- **WHEN** the verification script processes the `commands` kind
- **THEN** it confirms zero files matching `a-*.md` exist inside `.agents/workflows/`
- **AND** confirms exactly 32 command workflow files are present matching the `commands` array in [ecc-items.json](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-items.json)

<!-- id: obj06-sc-5-4 -->
#### Scenario: Fail-Fast exit on any discrepancy

- **WHEN** any component is missing, any extra unapproved component is detected, or any `agent.md` YAML is invalid
- **THEN** the verification script outputs a detailed per-kind audit scorecard with `[MISSING]`, `[EXTRA]`, or `[INVALID]` markers
- **AND** execution IMMEDIATELY fails with exit code 1 without performing any further operations

---

## 3. Process Flow

1. **Step 1 — Artifact Audit**: Read [ecc-components-fix.txt](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-components-fix.txt); scan disk; produce delta report.
2. **Step 2 — Agent Relocation**: Copy `.agents/plugin/ecc/agents/<name>/` → `.agents/agents/<name>/`; update `AGENTS.md` and script adapters; remove `chief-of-staff`.
3. **Step 3 — YAML Standardization**: Audit and normalize frontmatter in all `.agents/agents/*/agent.md` files; update `verify-installation-agy.js` with YAML parse validation.
4. **Step 4 — Component Pruning**: Delete all `a-*.md` bridge workflows; delete 27 obsolete workflows, 17 obsolete skills, `chief-of-staff` agent; audit `.agents/scripts/` for orphans.
5. **Step 5 — Compliance Verification**: Execute `verify-installation-agy.js` against [ecc-items.json](file:///d:/dev/agy-os/docs/OBJ-06/artifacts/ecc-items.json); assert exit code 0; record token budget audit (**88.6%**).

# OpenAGY Behavioral Specification: OBJ-01 Custom ECC Installation

<!-- 
AI INSTRUCTION:
This template defines behavioral requirements and system constraints following the OpenAGY spec-driven format.
When populating this file:
- System constraints MUST define boundary rules, path invariants, and execution parameters.
- Each requirement MUST use the level-3 heading `### Requirement: <Name>` followed by SHALL statements.
- Scenarios MUST use level-4 headings `#### Scenario: <Name>` with bulleted WHEN/THEN/AND clauses.
- Use forward slashes (/) for all file paths.
-->

## 1. Scope & System Constraints

### 1.1 Path Formatting & Shell Execution Invariants
- All file paths in configuration files, scripts, metadata, change records, and documentation MUST strictly use forward-slash format (e.g., `d:/dev/agy-os`, `harness/agy-script/`). Windows backslashes (`\`) are strictly prohibited.
- Shell commands and automated tooling MUST strictly execute using **Git Bash** (`bash`). Running scripts via CMD or PowerShell is strictly prohibited.

### 1.2 Access & Directory Boundaries
- Upstream [ECC](file:///d:/dev/agy-os/ECC) directory is treated strictly as a READ-ONLY reference library.
- Target repository [website](file:///d:/CLAUDE-PROJECT/website) (`d:/CLAUDE-PROJECT/website`) is strictly READ-ONLY; direct edits, file creations, or deletions are strictly prohibited. All proposed target modifications MUST be staged as `.patch` or `.diff` files inside [harness/patches](file:///d:/dev/agy-os/harness/patches/).
- Custom manifest overlays MUST reside in [harness/manifests/*.custom.json](file:///d:/dev/agy-os/harness/manifests/).
- Custom installer scripts MUST reside in [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/).
- All workspace modifications MUST reside inside the `agy-os` harness repository ([agy-os](file:///d:/dev/agy-os)).

---

## 2. Requirements

### Requirement: Quantitative Scanner, Interactive Wizard & Proposal Approval
The system SHALL execute a quantitative scanner script ([scan-target-repo.js](file:///d:/dev/agy-os/harness/agy-script/scripts/scan-target-repo.js)) on the target repository ([website](file:///d:/CLAUDE-PROJECT/website)), combine scanner metrics (Kriteria 1) with qualitative user workflow needs (Kriteria 2) during an interactive component wizard, and obtain explicit proposal approval before creating custom manifest overlay files.

#### Scenario: Running quantitative techstack scanner script
- **WHEN** the agent initiates Task 2 (Target Repository Analysis & Proposal)
- **THEN** the agent executes [scan-target-repo.js](file:///d:/dev/agy-os/harness/agy-script/scripts/scan-target-repo.js) against target repository [website](file:///d:/CLAUDE-PROJECT/website)
- **AND** collects quantitative metrics on dependencies (`package.json`), frameworks, databases (`prisma`), cloud configurations (`wrangler.json`), and file extension breakdown

#### Scenario: Conducting 2-criteria component wizard
- **WHEN** quantitative scanner script execution completes
- **THEN** the agent conducts an interactive component wizard per category combining Kriteria 1 (Quantitative Scanner Metrics) and Kriteria 2 (Qualitative User Workflow Needs)
- **AND** captures user choices for inclusion or exclusion

#### Scenario: Generating proposal & obtaining approval
- **WHEN** the 2-criteria component wizard is completed
- **THEN** the agent generates a Customization Proposal document [proposal.md](file:///d:/dev/agy-os/docs/OBJ-01/artifacts/proposal.md) containing recommended modules and prompt token estimates (85%–95%)
- **AND** requests explicit user approval before executing Task 3 (Custom Manifest Overlay & Intent Setup)

---

### Requirement: Custom Manifest Backup & Overlay Isolation
The system SHALL store custom manifest extensions in [harness/manifests/*.custom.json](file:///d:/dev/agy-os/harness/manifests/) to prevent customization loss during upstream `ECC/` repository updates.

#### Scenario: Storing custom manifest definitions
- **WHEN** custom modules, components, or profiles are defined
- **THEN** they are written to `harness/manifests/install-modules.custom.json`, `install-components.custom.json`, or `install-profiles.custom.json`
- **AND** original base manifest files in `ECC/manifests/` remain unaltered

#### Scenario: Merging manifests without exclusion
- **WHEN** [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) resolves the installation plan
- **THEN** base manifests from `ECC/manifests/` and custom overlays from [harness/manifests/](file:///d:/dev/agy-os/harness/manifests/) are deep-merged
- **AND** all custom modules requested in `ecc-install.json` are included in the resolved plan

#### Scenario: Strict fail-fast on duplicate IDs
- **WHEN** a custom overlay manifest contains a module, component, or profile ID that already exists in the base manifest
- **THEN** the manifest merger engine IMMEDIATELY halts execution with a strict error message
- **AND** no target files are written

---

### Requirement: ECC Plugin Isolation & Target Layout Standard
The system SHALL install custom subagents inside [.agents/plugin/ecc/agents/<name>/agent.md](file:///d:/dev/agy-os/.agents/plugin/ecc/agents/), rules flat inside [.agents/rules/<name>.md](file:///d:/dev/agy-os/.agents/rules/), workflows flat inside [.agents/workflows/<name>.md](file:///d:/dev/agy-os/.agents/workflows/), skills inside [.agents/skills/<skill-name>/SKILL.md](file:///d:/dev/agy-os/.agents/skills/), and lifecycle hooks at [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json).

#### Scenario: Installing selected ECC modules
- **WHEN** the user executes the custom installer script [install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh)
- **THEN** selected ECC subagents are placed inside `.agents/plugin/ecc/agents/<name>/agent.md`, rules inside `.agents/rules/<name>.md`, workflows inside `.agents/workflows/<name>.md`, skills inside `.agents/skills/<skill-name>/SKILL.md`, and hooks at `.agents/hooks.json`
- **AND** no files are written directly into legacy `.agent/`

#### Scenario: Preserving upstream ECC source & target repo
- **WHEN** the custom installation pipeline executes
- **THEN** the original upstream [ECC](file:///d:/dev/agy-os/ECC) repository files remain completely unaltered
- **AND** target repository [website](file:///d:/CLAUDE-PROJECT/website) files remain completely untouched

---

### Requirement: Subagent Conversion Standard
The system SHALL convert native ECC agent definitions into Antigravity-compliant subagents stored at [.agents/plugin/ecc/agents/<name>/agent.md](file:///d:/dev/agy-os/.agents/plugin/ecc/agents/).

#### Scenario: Structuring agent directory
- **WHEN** the post-installation transformation script [post-install-agy.js](file:///d:/dev/agy-os/harness/agy-script/post-install-agy.js) processes installed agents
- **THEN** each agent is placed in its dedicated directory `.agents/plugin/ecc/agents/<name>/agent.md`
- **AND** supporting prompt assets and references are copied into `.agents/plugin/ecc/agents/<name>/`

---

### Requirement: Dynamic Workflow Generation & Flat Layout
The system SHALL dynamically scan [.agents/plugin/ecc/agents/](file:///d:/dev/agy-os/.agents/plugin/ecc/agents/) and generate root bridge workflows at [.agents/workflows/a-<name>.md](file:///d:/dev/agy-os/.agents/workflows/) using the `/a-<name>` slash command prefix for every installed subagent alongside base workflows in `.agents/workflows/<name>.md`.

#### Scenario: Dynamic subagent scanning and slash command generation
- **WHEN** subagents are placed in `.agents/plugin/ecc/agents/`
- **THEN** [post-install-agy.js](file:///d:/dev/agy-os/harness/agy-script/post-install-agy.js) dynamically scans all subagent directories
- **AND** a root workflow file `.agents/workflows/a-<name>.md` is created for each detected subagent
- **AND** the workflow delegates task execution to `.agents/plugin/ecc/agents/<name>/agent.md` via the `/a-<name>` command

#### Scenario: Maintaining registry purity
- **WHEN** workflows are deployed to [.agents/workflows/](file:///d:/dev/agy-os/.agents/workflows/)
- **THEN** all workflow files reside directly in `.agents/workflows/` as flat markdown files with zero nested subdirectories
- **AND** no non-workflow markdown or asset subdirectories are created inside `.agents/workflows/`

---

### Requirement: Proposal Item Compliance Verification per Kind
The system SHALL verify physical installation compliance against the approved deduplicated static reference artifact [ecc-items.json](file:///d:/dev/agy-os/docs/OBJ-01/artifacts/ecc-items.json) derived from Section 2.2 of [proposal.md](file:///d:/dev/agy-os/docs/OBJ-01/artifacts/proposal.md) using an automated verification script ([verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js)).

#### Scenario: Parsing reference JSON artifact by kind
- **WHEN** the verification script [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) is executed
- **THEN** it reads and parses static reference artifact [ecc-items.json](file:///d:/dev/agy-os/docs/OBJ-01/artifacts/ecc-items.json)
- **AND** extracts item lists across all 6 root keys (`rules`, `agents`, `commands`, `hooks`, `skills`, `platform`)

#### Scenario: Verifying physical target locations
- **WHEN** item lists per kind are loaded from [ecc-items.json](file:///d:/dev/agy-os/docs/OBJ-01/artifacts/ecc-items.json)
- **THEN** the script checks that every listed item exists physically in its designated path:
  - `rules` in `.agents/rules/<name>.md`
  - `agents` in `.agents/plugin/ecc/agents/<name>/agent.md`
  - `commands` in `.agents/workflows/<name>.md`
  - `hooks` at `.agents/hooks.json`
  - `skills` in `.agents/skills/<skill-name>/SKILL.md`
  - `platform` in `.agents/plugin/ecc/platform/`
- **AND** verifies zero missing or unapproved extra items exist

#### Scenario: Fail-Fast exit on item mismatch
- **WHEN** any listed item is missing or an extra unapproved item is detected
- **THEN** the verification script outputs a detailed audit report per kind detailing missing/extra items
- **AND** execution IMMEDIATELY fails with exit code 1

---

### Requirement: Token Budget Governance & Manual Rollback Confirmation
The system SHALL maintain total customization prompt token utilization strictly within the target threshold of **85% – 95%** and provide user-confirmed rollback teardown.

#### Scenario: Verifying token footprint
- **WHEN** module selection and token audit execution completes
- **THEN** total prompt token load is verified to be within 85% – 95% of maximum customization budget
- **AND** token footprint audit results are logged in [proposal.md](file:///d:/dev/agy-os/docs/OBJ-01/artifacts/proposal.md)

#### Scenario: Manual confirmation prompt on budget breach
- **WHEN** total customization token utilization exceeds 95%
- **THEN** a warning notification is displayed to the user detailing the token overage
- **AND** manual user confirmation is requested before executing [uninstall-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-agy.sh)
- **AND** upon confirmation, `.agents/plugin/ecc/` and generated bridge workflows (`.agents/workflows/a-*.md`) are completely removed

---

## 3. Process Flow

1. **Step 1 — Quantitative Scanner & 2-Criteria Wizard**: Run [scan-target-repo.js](file:///d:/dev/agy-os/harness/agy-script/scripts/scan-target-repo.js) on [website](file:///d:/CLAUDE-PROJECT/website), conduct 2-criteria wizard (Quantitative + Qualitative) per category, and draft Customization Proposal.
2. **Step 2 — Proposal Approval**: User reviews and explicitly approves the Customization Proposal document [proposal.md](file:///d:/dev/agy-os/docs/OBJ-01/artifacts/proposal.md).
3. **Step 3 — Custom Manifest Overlay & Intent Setup**: Create `harness/manifests/*.custom.json` and declare project intent in `ecc-install.json`.
4. **Step 4 — Auto-Merge & Strict Fail-Fast Validation**: Run [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) to merge base + custom manifests; abort immediately if duplicate IDs exist.
5. **Step 5 — Custom Script Execution**: Run [install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh), writing isolated assets into [.agents/plugin/ecc/](file:///d:/dev/agy-os/.agents/plugin/ecc/).
6. **Step 6 — Dynamic Subagent & Bridge Transformation**: Run [post-install-agy.js](file:///d:/dev/agy-os/harness/agy-script/post-install-agy.js) to dynamically scan subagents, restructure subagents, and generate `/a-<name>` bridge workflows.
7. **Step 7 — Proposal Item Compliance & Token Footprint Verification**: Run [verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) to verify physical installation matches proposal list per kind (fail-fast exit code 1 on discrepancy); verify 85%–95% token budget target (if >95%, prompt manual confirmation before executing `uninstall-agy.sh`).


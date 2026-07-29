# OpenAGY Behavioral Specification: <!-- [Objective ID & Title] -->

<!-- 
AI INSTRUCTION:
This template defines behavioral requirements and system constraints following the OpenAGY spec-driven format.
When populating this file:
- System constraints MUST define boundary rules, path invariants, and execution parameters.
- Each requirement MUST use the level-3 heading `### Requirement: <Name>` followed by SHALL statements.
- Scenarios MUST use level-4 headings `#### Scenario: <Name>` with bulleted WHEN/THEN/AND clauses.
- Use forward slashes (/) for all file paths.
- Use clickable file:/// links for all referenced file paths.
-->

## 1. Scope & System Constraints

### 1.1 Path Formatting & Shell Execution Invariants
- All file paths in rules, configurations, change records, and documentation MUST strictly use forward-slash format (e.g., `d:/dev/agy-os`, `harness/agy-script/`). Windows backslashes (`\`) are strictly prohibited.
- Terminal execution MUST be explicitly specified using **Git Bash** (`bash`). Running scripts via CMD or PowerShell is strictly prohibited.

### 1.2 Access & Directory Boundaries
- Target repositories designated as READ-ONLY (e.g., [website](file:///d:/CLAUDE-PROJECT/website)) MUST NOT be directly edited, created, or deleted. All proposed changes MUST be staged as `.patch` or `.diff` files inside [harness/patches/](file:///d:/dev/agy-os/harness/patches/).
- Workspace modifications MUST reside within designated read-write paths inside the harness workspace ([agy-os](file:///d:/dev/agy-os)).

---

## 2. Requirements

### Requirement: <!-- [Requirement Name 1] -->
The system SHALL <!-- [describe expected system capability or behavior] -->.

#### Scenario: <!-- [Scenario 1.1 Description] -->
- **WHEN** <!-- [trigger event, user input, or system state change] -->
- **THEN** <!-- [expected primary outcome or system response] -->
- **AND** <!-- [additional side effect or verification criteria] -->

#### Scenario: <!-- [Scenario 1.2 Edge Case Description] -->
- **WHEN** <!-- [edge case condition occurs] -->
- **THEN** <!-- [expected graceful handling or fallback outcome] -->
- **AND** <!-- [additional verification clause] -->

---

### Requirement: <!-- [Requirement Name 2] -->
The system SHALL <!-- [describe expected system capability or behavior] -->.

#### Scenario: <!-- [Scenario 2.1 Description] -->
- **WHEN** <!-- [trigger condition] -->
- **THEN** <!-- [expected outcome] -->
- **AND** <!-- [additional condition] -->

---

## 3. Process Flow

1. **Step 1 — Discovery & Setup**: <!-- [Description of step 1] -->
2. **Step 2 — Processing & Execution**: <!-- [Description of step 2] -->
3. **Step 3 — Output & Transformation**: <!-- [Description of step 3] -->
4. **Step 4 — Verification & Cleanup**: <!-- [Description of step 4] -->


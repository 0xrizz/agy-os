---
change_id: "CHG-005"
status: "completed"
decision_refs: ['ADR-005']
spec_delta_ref: null
owner_stage: "reviewer"
date: "2026-07-27"
---

# Change Record: CHG-005 README.md DDF Guide Remediation

## Objective
Remediate documentation drift in `README.md` Sections 4–6 and directory structure map to align 100% with actual governance implementation (`ADR-005`, `ddf-gate.yml`, `ddf-validate.sh`).

## Implemented Changes
- **Files Modified / Created**:
  - `README.md` - Remediation of Sections 4–6, tool taxonomy tables, directory tree, CI gate subsection, and removal of hardcoded static IDs in prompt examples.

## Verification Results
- **Build / Test Execution**:
  - Command: `bash harness/scripts/ddf-validate.sh`
  - Output: `Validation Summary: 14 passed, 0 failed, 0 warnings.`
- **Governance & Boundary Audit**:
  - Target repo `d:/CLAUDE-PROJECT/website` un-modified: `Pass`
  - Frontmatter schema validation: `Pass (100%)`

## Handoff Checklist
- [x] Add spec_delta_ref to CHG frontmatter example in README.md Fase 3
- [x] Add 3 new failure modes to Section 6 troubleshooting table
- [x] Add CI Gate subsection to Section 5 explaining .github/workflows/ddf-gate.yml
- [x] Rename Section 4 to 4-Phase Workflow and split ddf-spec-archive into explicit Fase 4
- [x] Add missing paths (harness/.target-baseline, harness/bin/, .github/workflows/) to directory tree
- [x] Split tool tables into Ambient Governance vs Active Commands and add missing ddf-gate.sh step
- [x] Replace static IDs (ADR-002, ADR-003, CHG-001) in prompts with dynamic instructions & clean Fase 1 prompt
- [x] Execute ddf-validate.sh and ddf-index-sync.sh


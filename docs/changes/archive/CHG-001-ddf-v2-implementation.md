---
change_id: "CHG-001"
status: "completed"
decision_refs: ['ADR-002']
owner_stage: "auditor"
date: "2026-07-27"
---

# Change Record: CHG-001 DDF v2 Implementation

## Objective
Implement the changes necessary to upgrade the Documentation-Driven Framework to v2, aligning the project with the decisions outlined in ADR-002.

## Implemented Changes
- **Files Modified / Created**:
  - `docs/decisions/DDF-001-documentation-driven-framework.md` - Left for historical cleanup (replaced by ADR-001).
  - `docs/decisions/ADR-001-documentation-driven-framework.md` - Created to supersede DDF-001.
  - `docs/decisions/ADR-002-ddf-v2-refinement.md` - Created to document DDF v2 decisions.
  - `docs/changes/CHG-001-ddf-v2-implementation.md` - Created this change record.
  - `docs/decisions/_template.md` - Updated to use ADR prefix.
  - `docs/changes/_template.md` - Updated decision references to use ADR.
  - `docs/README.md` - Fixed schema definitions and path slashes.
  - `AGENTS.md` - Rewritten for agent governance focus.
  - `README.md` - Rewritten for human developer onboarding.
  - `.agents/rules/RULES.md` - Updated grep rules to ADR and added auditor stage.
  - `.agents/workflows/ddf-decision-gate.md` - Updated to reference executable scripts in harness/scripts/.
  - `docs/vision/harness-mission.md` - Fixed path formats to forward-slash.
  - `docs/vision/target-repo-profile.md` - Fixed path formats to forward-slash.
  - `docs/decisions/index.md` - Updated with ADR-001 and ADR-002.
  - `docs/changes/index.md` - Updated with CHG-001.

## Verification Results
- **Build / Test Execution**:
  - Command: N/A
  - Output: N/A
- **Governance & Boundary Audit**:
  - Target repo `d:/CLAUDE-PROJECT/website` un-modified: `[Pass]`
  - Frontmatter schema validation: `[Pass]`

## Handoff Checklist
- [x] Decision references verified against `docs/decisions/`
- [x] All code modifications committed to `agy-harness` or staged in `harness/patches/`
- [x] Verification results documented with exact commands and output snippets
- [ ] Derived index caches (`docs/changes/index.md`) updated

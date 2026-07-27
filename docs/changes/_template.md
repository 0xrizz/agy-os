---
change_id: "CHG-000"
status: "draft"
decision_refs: ['ADR-001']
spec_delta_ref: "000-spec-delta-slug"
owner_stage: "builder"
date: "YYYY-MM-DD"
---

# Change Record: [CHG-XXX Title]

## Objective
[Brief description of the change objectives, linking directly to the decision reference(s).]

## Implemented Changes
- **Files Modified / Created**:
  - `path/to/file1` - [Summary of change]
  - `harness/patches/feature.patch` - [Staged target patch if applicable]

## Verification Results
- **Build / Test Execution**:
  - Command: `pytest` / `npm test`
  - Output: `Passed X tests in Y.Zs`
- **Governance & Boundary Audit**:
  - Target repo `d:/CLAUDE-PROJECT/website` un-modified: `[Pass/Fail]`
  - Frontmatter schema validation: `[Pass/Fail]`

## Handoff Checklist
- [ ] Decision references verified against `docs/decisions/`
- [ ] All code modifications committed to `agy-harness` or staged in `harness/patches/`
- [ ] Verification results documented with exact commands and output snippets
- [ ] Derived index caches (`docs/changes/index.md`) updated

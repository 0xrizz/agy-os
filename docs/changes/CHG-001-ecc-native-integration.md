---
change_id: "CHG-001"
status: "in_progress"
decision_refs: ['ADR-001', 'ADR-004']
spec_delta_ref: "001-ecc-native-integration"
owner_stage: "explorer"
date: "2026-07-28"
---

# Change Record: CHG-001 ECC Native Toolkit Integration for Antigravity

## Objective
Formalize and execute the integration of the upstream ECC Toolkit (`ECC/`) into the `agy-harness` operating system under `.agents/`, fulfilling Objective 1 of `docs/vision/harness-mission.md` (`VIS-001`).

---

## Implemented Changes

- **Spec-Delta Bundle Created**:
  - [requirements.md](file:///d:/dev/agy-harness/docs/vision/plans/001-ecc-native-integration/requirements.md) - Spec-Delta functional and non-functional requirements.
  - [design.md](file:///d:/dev/agy-harness/docs/vision/plans/001-ecc-native-integration/design.md) - Spec-Delta system architecture and component topology.
  - [tasks.md](file:///d:/dev/agy-harness/docs/vision/plans/001-ecc-native-integration/tasks.md) - Detailed task checklist and execution roadmap.

- **Files To Be Modified / Created in Builder Stage**:
  - `harness/patches/ecc-antigravity-adapter-fix.patch` - Adapter patch file.
  - `harness/scripts/ecc-integration/README.md` - Integration toolchain documentation.
  - `harness/scripts/ecc-integration/config/harness-rules-overlay.md` - Harness rule overlay config.
  - `harness/scripts/ecc-integration/01-patch-adapter.ps1` - Adapter patch script.
  - `harness/scripts/ecc-integration/02-dry-run-install.ps1` - Dry-run execution script.
  - `harness/scripts/ecc-integration/03-install-ecc.ps1` - Native install script.
  - `harness/scripts/ecc-integration/04-uninstall-ecc.ps1` - Uninstall rollback script.
  - `harness/scripts/ecc-integration/05-reinstall-patched.ps1` - Reinstall pipeline script.
  - `harness/scripts/ecc-integration/06-post-install-adapt.ps1` - Post-install custom mapping script.

---

## Verification Results

- **DDF Governance Audit**:
  - Frontmatter schema validation: `PASS (ddf-validate.sh)`
  - Target repo `d:/CLAUDE-PROJECT/website` immutability: `PASS (Clean)`

---

## Handoff Checklist

### Stage 1: Explorer Phase
- [x] Decision references verified against `docs/decisions/` (`ADR-001`, `ADR-004`)
- [x] Spec-Delta 3-file bundle initialized under `docs/vision/plans/001-ecc-native-integration/`
- [x] Detailed task breakdown populated in `tasks.md` referencing `implementation_plan.md`

### Stage 2: Builder Phase
- [ ] Task 2.1.1 - Task 2.1.3: Reusable Toolchain Scaffolding (`harness/scripts/ecc-integration/`)
- [ ] Task 2.2.1 - Task 2.2.2: ECC Target Adapter Patching (`ecc-antigravity-adapter-fix.patch`)
- [ ] Task 2.3.1 - Task 2.3.2: Dry-Run Installation & Verification (`02-dry-run-install.ps1`)
- [ ] Task 2.4.1 - Task 2.4.2: Actual ECC Native Installation (`03-install-ecc.ps1`)
- [ ] Task 2.5.1 - Task 2.5.2: Lifecycle Rollback & Reinstall Automation (`04-uninstall-ecc.ps1` & `05-reinstall-patched.ps1`)
- [ ] Task 2.6.1 - Task 2.6.4: Post-Install Adaptation (`06-post-install-adapt.ps1` Full Custom Mapping)

### Stage 3: Reviewer Phase
- [ ] Task 3.1: Tool name rewrite audit across `.agents/skills/`
- [ ] Task 3.2: Target repo immutability verification against `harness/.target-baseline`
- [ ] Task 3.3: DDF validation pass via `harness/scripts/ddf-validate.sh`
- [ ] Task 3.4: Derived index sync via `harness/scripts/ddf-index-sync.sh`

### Stage 4: Auditor Phase
- [ ] Task 4.1: Final DDF gate pipeline check via `harness/scripts/ddf-gate.sh`
- [ ] Task 4.2: Update CHG-001 status to `completed`
- [ ] Task 4.3: Archival of Spec-Delta bundle and Change Record via `harness/scripts/ddf-archive.sh`

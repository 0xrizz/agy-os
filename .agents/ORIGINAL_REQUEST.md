# Original User Request

## 2026-07-31T02:42:27Z

# Teamwork Project Prompt

Execute Tasks 3 & 4 of OBJ-03 ECC Script Integration in `d:/dev/agy-os` using a 3-agent parallel squad.

Working directory: d:/dev/agy-os
Integrity mode: development

## Requirements

### R1. Non-Destructive Merge-Hooks Utility Creation & Installer Modification (Tasks 3.1–3.5)
Squad Agent 1 (Installer Engineer / /a-architect):
- Create standalone installer utility script at harness/agy-script/scripts/merge-hooks-agy.js following AGENTS.md §4 naming conventions.
- Implement non-destructive hooks merging algorithm that ingests upstream ECC hooks.json while preserving existing AGY-native hook entries (post:agy-observation-envelope, pre:agy-guardrail).
- Implement platform filter in merge-hooks-agy.js to exclude Windows-incompatible desktop notification hooks (stop:desktop-notify).
- Implement atomic backup mechanism in merge-hooks-agy.js creating .agents/hooks.json.bak prior to writing .agents/hooks.json.
- Refactor harness/agy-script/scripts/install-apply-agy.js lines 287–303 to import and execute mergeHooks() from merge-hooks-agy.js, replacing file overwrites.

### R2. Integration Verification & Verification Expansion (Task 4.1)
Squad Agent 2 (Quality Verifier / /a-tdd-guide):
- Update harness/agy-script/scripts/verify-installation-agy.js to include verifier checks for .agents/hooks/scripts/lib/ AGY-native helper libraries alongside runtime hooks and CLAUDE_PLUGIN_ROOT environment validation.

### R3. Harness Execution, Verification & Checkpoint (Tasks 3.6, 4.2–4.5)
Squad Agent 3 (Integration & Verification Lead):
- Execute merge-hooks-agy.js test mode in Git Bash (bash) to confirm AGY-native hooks preservation, stop:desktop-notify omission, and atomic backup .agents/hooks.json.bak.
- Execute full harness installation pass via harness/agy-script/install-agy.sh using Git Bash (bash).
- Verify .agents/hooks.json contains merged hook definitions with pre:agy-guardrail at PreToolUse index 0 and zero occurrences of stop:desktop-notify.
- Validate in-place resolution of all 26 selected ECC runtime hooks referencing ECC via CLAUDE_PLUGIN_ROOT.
- Run harness/agy-script/scripts/verify-installation-agy.js using Git Bash (bash) to confirm 100% Fail-Fast verification compliance (exit code 0).
- Update docs/OBJ-03/task.md checklist items 3.1 - 4.5 to [x].
- Execute /checkpoint create "OBJ-03-Complete".

## Acceptance Criteria

### Task 3 Acceptance Criteria
- [ ] harness/agy-script/scripts/merge-hooks-agy.js exists and performs non-destructive merge of .agents/hooks.json.
- [ ] Atomic backup .agents/hooks.json.bak is created prior to modifying .agents/hooks.json.
- [ ] stop:desktop-notify is filtered out of .agents/hooks.json.
- [ ] install-apply-agy.js imports and invokes mergeHooks().

### Task 4 Acceptance Criteria
- [ ] verify-installation-agy.js checks .agents/hooks/scripts/lib/*-agy.js and CLAUDE_PLUGIN_ROOT.
- [ ] install-agy.sh runs cleanly via Git Bash (bash).
- [ ] verify-installation-agy.js exits with code 0 (Fail-Fast verification pass).
- [ ] docs/OBJ-03/task.md checklist updated with all sub-tasks marked [x].
- [ ] Git checkpoint "OBJ-03-Complete" created.

# Execution Plan: Tasks 3 & 4 of OBJ-03 ECC Script Integration

## Strategy & Topology
- **Pattern**: Project / Squad Orchestration
- **Squad Agents**:
  1. `Squad Agent 1 (Installer Engineer)`: Implement `merge-hooks-agy.js` and refactor `install-apply-agy.js` (Tasks 3.1 - 3.5).
  2. `Squad Agent 2 (Quality Verifier)`: Expand `verify-installation-agy.js` to validate helper libraries in `.agents/hooks/scripts/lib/` and `CLAUDE_PLUGIN_ROOT` (Task 4.1).
  3. `Squad Agent 3 (Integration & Verification Lead)`: Test `merge-hooks-agy.js`, run `install-agy.sh`, verify `.agents/hooks.json` & runtime hook resolution, run `verify-installation-agy.js`, update `docs/OBJ-03/task.md`, create git checkpoint (Tasks 3.6, 4.2 - 4.5).

## Work Breakdown

### Phase 1: Parallel Implementation (Agents 1 & 2)
- **Agent 1 (Installer Engineer)**:
  - Create `harness/agy-script/scripts/merge-hooks-agy.js` following AGENTS.md §4 rules.
  - Implement non-destructive algorithm: merge upstream `ECC/hooks/hooks.json` into target `.agents/hooks.json` while preserving AGY-native entries (`post:agy-observation-envelope`, `pre:agy-guardrail`).
  - Filter out `stop:desktop-notify`.
  - Implement atomic backup `.agents/hooks.json.bak` prior to writing `.agents/hooks.json`.
  - Refactor `harness/agy-script/scripts/install-apply-agy.js` (lines 287-303) to import and execute `mergeHooks()`.
- **Agent 2 (Quality Verifier)**:
  - Update `harness/agy-script/scripts/verify-installation-agy.js` to include verifier checks for `.agents/hooks/scripts/lib/*-agy.js` helper libraries alongside runtime hooks and `CLAUDE_PLUGIN_ROOT` environment validation.

### Phase 2: Integration, Execution & Verification (Agent 3)
- **Agent 3 (Integration & Verification Lead)**:
  - Test `merge-hooks-agy.js` in Git Bash (`bash`).
  - Run `harness/agy-script/install-agy.sh` in Git Bash (`bash`).
  - Verify `.agents/hooks.json` merged structure (`pre:agy-guardrail` at index 0, zero `stop:desktop-notify`).
  - Validate in-place resolution of all 26 selected ECC runtime hooks referencing `CLAUDE_PLUGIN_ROOT`.
  - Run `harness/agy-script/scripts/verify-installation-agy.js` via Git Bash (`bash`) ensuring exit code 0.
  - Update `docs/OBJ-03/task.md` checklist items 3.1 - 4.5 to `[x]`.
  - Create git checkpoint "OBJ-03-Complete".

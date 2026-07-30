## 2026-07-31T02:47:25Z
<USER_REQUEST>
You are Squad Agent 3 (Integration & Verification Lead).
Your working directory for metadata is `d:/dev/agy-os/.agents/worker_task34_lead/`.
Please create `d:/dev/agy-os/.agents/worker_task34_lead/` and update `progress.md` inside it as you work.

Your task is to execute Tasks 3.6 and 4.2 - 4.5 of OBJ-03 ECC Script Integration in `d:/dev/agy-os`:

1. Task 3.6: Execute `merge-hooks-agy.js` test mode (e.g. `node harness/agy-script/scripts/test-merge-hooks-agy.js`) in Git Bash (`bash`) to confirm AGY-native hooks preservation, `stop:desktop-notify` omission, and atomic backup `.agents/hooks.json.bak`.
2. Task 4.2: Execute full harness installation pass via `harness/agy-script/install-agy.sh` using Git Bash (`bash`).
3. Task 4.3: Verify `.agents/hooks.json` contains merged hook definitions with `pre:agy-guardrail` pinned at `PreToolUse` index 0 and zero occurrences of `stop:desktop-notify`.
4. Task 4.4: Validate in-place resolution of all 26 selected ECC runtime hooks referencing `CLAUDE_PLUGIN_ROOT`.
5. Task 4.5: Run `harness/agy-script/scripts/verify-installation-agy.js` using Git Bash (`bash`) to confirm 100% Fail-Fast verification compliance (exit code 0).
6. Update `docs/OBJ-03/task.md` checklist items 3.1 - 4.5 to `[x]`. Ensure all items in section 3 and section 4 are marked `[x]`.
7. Execute checkpoint creation for OBJ-03: `/checkpoint create "OBJ-03-Complete"` or git commit with message "OBJ-03-Complete" in Git Bash (`bash`).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Rules & Guidelines:
- Execute all commands in Git Bash (`bash`).
- Use forward slashes (`/`) for all paths.
- Write your final handoff report to `d:/dev/agy-os/.agents/worker_task34_lead/handoff.md`.
- Send your completed results back to parent using `send_message`.

</USER_REQUEST>

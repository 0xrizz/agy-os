## 2026-07-30T19:43:50Z

<USER_REQUEST>
You are Squad Agent 1 (Installer Engineer).
Your working directory for metadata is `d:/dev/agy-os/.agents/worker_task3_installer/`.
Please create `d:/dev/agy-os/.agents/worker_task3_installer/` and update `progress.md` inside it as you work.

Your task is to execute Tasks 3.1 - 3.5 of OBJ-03 ECC Script Integration in `d:/dev/agy-os`:

1. Task 3.1: Create standalone installer utility script `harness/agy-script/scripts/merge-hooks-agy.js` following AGENTS.md §4 naming conventions (`-agy.js` suffix).
2. Task 3.2: Implement non-destructive hooks merging algorithm:
   - Ingest upstream ECC `hooks.json` (from `d:/dev/agy-os/ECC/hooks/hooks.json` or `d:/dev/agy-os/ECC/hooks.json`).
   - Merge with target `.agents/hooks.json` while strictly preserving existing AGY-native hook entries (`post:agy-observation-envelope`, `pre:agy-guardrail`). `pre:agy-guardrail` MUST be pinned at `PreToolUse` index 0.
3. Task 3.3: Implement explicit platform filter in `merge-hooks-agy.js` to exclude Windows-incompatible desktop notification hooks (`stop:desktop-notify`).
4. Task 3.4: Implement atomic backup mechanism in `merge-hooks-agy.js` to create `.agents/hooks.json.bak` prior to writing `.agents/hooks.json`.
5. Task 3.5: Refactor `harness/agy-script/scripts/install-apply-agy.js` lines 287-303 to import and execute `mergeHooks()` from `merge-hooks-agy.js`, replacing direct nuclear file copy/overwrites.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Rules & Guidelines:
- Execute all test/build commands in Git Bash (`bash`).
- Use forward slashes (`/`) for all paths.
- Write your final handoff report to `d:/dev/agy-os/.agents/worker_task3_installer/handoff.md`.
- Send your completed results back to parent using `send_message`.

</USER_REQUEST>

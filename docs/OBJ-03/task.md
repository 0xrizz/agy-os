# Task Checklist for Agent Execution: OBJ-03 ECC Script Integration

<!-- 
AI INSTRUCTION:
This file serves as a dynamic, stateful checklist for the AI Agent executing this objective.
When populating or executing this file:
- Break down the work into logical, ordered sub-tasks (`1.1`, `1.2`, etc.).
- The AI Agent MUST process tasks strictly sequentially, resuming execution from the FIRST UNCHECKED checkbox (`- [ ]`).
- Upon completing each sub-task, the AI Agent MUST update the checkbox to checked (`- [x]`).
- Every major task group MUST end with an explicit verification sub-task before proceeding to the next group.
- Do NOT skip verification steps or combine unrelated actions into a single checkbox item.
- Use forward slashes (/) for all file paths and clickable file:/// URIs.
-->

- [x] **Task 1: Environment Variable Setup & Documentation ([harness/.env.example](file:///d:/dev/agy-os/harness/.env.example))**
  - [x] 1.1 Create environment configuration template at [harness/.env.example](file:///d:/dev/agy-os/harness/.env.example) to document required environment variables for ECC hook bootstrap resolution.
  - [x] 1.2 Add mandatory `CLAUDE_PLUGIN_ROOT=d:/dev/agy-os/ECC` definition with comprehensive comments explaining in-place ECC root path resolution for scripts ([ECC/scripts/hooks/](file:///d:/dev/agy-os/ECC/scripts/hooks/)) and shared libraries ([ECC/scripts/lib/](file:///d:/dev/agy-os/ECC/scripts/lib/)).
  - [x] 1.3 Document runtime configuration variables: `ECC_HOOK_PROFILE=standard`, `ECC_GOVERNANCE_CAPTURE=1`, `ECC_DISABLED_HOOKS=`, and `ECC_SESSION_ID=` with usage examples and descriptions.
  - [x] 1.4 Ensure strict adherence to forward-slash path formatting in all environment examples and zero hardcoded Windows backslashes or machine-specific absolute paths.
  - [x] 1.5 **Verification Step**: Confirm [harness/.env.example](file:///d:/dev/agy-os/harness/.env.example) exists in the harness root, uses forward-slash pathing, covers all required ECC environment variables, and parses cleanly without syntax errors.

- [x] **Task 2: AGY Guardrail Expansion & Registration ([.agents/hooks/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/hooks/scripts/pre-tool-guardrail-agy.js) & [.agents/hooks/scripts/lib/](file:///d:/dev/agy-os/.agents/hooks/scripts/lib/))**
  - [x] 2.1 Establish AGY-native runtime helper library structure in [.agents/hooks/scripts/lib/](file:///d:/dev/agy-os/.agents/hooks/scripts/lib/) using `-agy.js` suffix convention (AGENTS.md §11) for modular guardrail utility functions.
  - [x] 2.2 Inspect existing guardrail script at [.agents/hooks/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/hooks/scripts/pre-tool-guardrail-agy.js) and refactor to consume helper modules from [.agents/hooks/scripts/lib/](file:///d:/dev/agy-os/.agents/hooks/scripts/lib/).
  - [x] 2.3 Expand input payload parser in [.agents/hooks/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/hooks/scripts/pre-tool-guardrail-agy.js) to read stdin and extract tool execution arguments for `run_command`, Bash, and file editing tools.
  - [x] 2.4 Implement strict command string and path inspection logic to detect and block:
    - Direct write or delete operations targeting READ-ONLY target repository [website](file:///d:/CLAUDE-PROJECT/website) (`d:/CLAUDE-PROJECT/website`).
    - Windows backslash (`\`) pathing in tool parameters and file path parameters.
    - Destructive file writes or shell redirects (`echo >`, `rm -rf website`) outside staged patch boundaries in [harness/patches/](file:///d:/dev/agy-os/harness/patches/).
  - [x] 2.5 Wire `pre:agy-guardrail` into [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json) as the primary `PreToolUse` hook entry (`node .agents/hooks/scripts/pre-tool-guardrail-agy.js`).
  - [x] 2.6 **Verification Step**: Execute syntax check on [.agents/hooks/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/hooks/scripts/pre-tool-guardrail-agy.js) and helper scripts in [.agents/hooks/scripts/lib/](file:///d:/dev/agy-os/.agents/hooks/scripts/lib/) via Node.js in Git Bash (`bash`), and verify `pre:agy-guardrail` correctly returns exit code 0 for valid commands and exit code 2 with a blocking error message for unauthorized target repo mutations.

- [x] **Task 3: Non-Destructive Merge-Hooks Utility Creation & Installer Modification ([merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js) & [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js))**
  - [x] 3.1 Create standalone installer utility script at [harness/agy-script/scripts/merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js) following AGENTS.md §4 naming conventions.
  - [x] 3.2 Implement non-destructive hooks merging algorithm that ingests upstream ECC `hooks.json` while preserving existing AGY-native hook entries (`post:agy-observation-envelope`, `pre:agy-guardrail`).
  - [x] 3.3 Implement explicit platform filter in [merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js) to exclude Windows-incompatible desktop notification hooks (`stop:desktop-notify`).
  - [x] 3.4 Implement atomic backup mechanism in [merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js) to create a copy at [.agents/hooks.json.bak](file:///d:/dev/agy-os/.agents/hooks.json.bak) prior to executing any write operations on [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json).
  - [x] 3.5 Update [harness/agy-script/scripts/install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) lines 287–303 to import and execute `mergeHooks()` from [merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js), replacing nuclear `fs.copyFileSync` hook file overwrites.
  - [x] 3.6 **Verification Step**: Execute [harness/agy-script/scripts/merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js) in test execution mode using Git Bash (`bash`) to confirm AGY-native hooks are preserved, `stop:desktop-notify` is omitted, and atomic backup [.agents/hooks.json.bak](file:///d:/dev/agy-os/.agents/hooks.json.bak) is generated correctly.

- [x] **Task 4: Integration Verification & Documentation Audit ([verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js))**
  - [x] 4.1 Update [harness/agy-script/scripts/verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) to include optional/required verifier checks for [.agents/hooks/scripts/lib/](file:///d:/dev/agy-os/.agents/hooks/scripts/lib/) AGY-native helper libraries alongside runtime hooks and `CLAUDE_PLUGIN_ROOT` environment validation.
  - [x] 4.2 Execute full harness installation pass via [harness/agy-script/install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh) using Git Bash (`bash`).
  - [x] 4.3 Verify [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json) contains merged hook definitions with `pre:agy-guardrail` pinned at `PreToolUse` index 0 and zero occurrences of `stop:desktop-notify`.
  - [x] 4.4 Validate in-place resolution of all 26 selected ECC runtime hooks referencing [ECC](file:///d:/dev/agy-os/ECC) via `CLAUDE_PLUGIN_ROOT`.
  - [x] 4.5 **Verification Step**: Execute [harness/agy-script/scripts/verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) using Git Bash (`bash`) to confirm 100% Fail-Fast verification compliance, exit code 0, and update the task checklist states upon completion.

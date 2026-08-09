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

- [x] **Task 1: Physical Script Migration, Path Alignment Transformer & Environment Documentation ([.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) & [harness/.env.example](file:///d:/dev/agy-os/harness/.env.example))**
  - [x] 1.1 Establish canonical 100% self-contained script directory structure under [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) and [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/) per Proposal-02 and AGENTS.md §11.
  - [x] 1.2 Update installer engine [harness/agy-script/scripts/install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) to copy all 26 active hook scripts, 46 support scripts (and subfolders `ci/`, `codemaps/`, `codex/`, `discord/`), and 7 shared libraries into [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) and [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/).
  - [x] 1.3 Implement `alignUnifiedScriptPaths` transformer in [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) to rewrite relative import paths (`require('../lib/utils')` -> `require('./lib/utils')`), hook script paths in `hooks.json` (`"ECC/scripts/hooks/"` -> `".agents/scripts/"`), and workflow command paths (`node ECC/scripts/...` -> `node .agents/scripts/...`).
  - [x] 1.4 Update [harness/.env.example](file:///d:/dev/agy-os/harness/.env.example) to reflect zero reliance on `CLAUDE_PLUGIN_ROOT` for runtime script resolution, documenting optional runtime configuration variables (`ECC_HOOK_PROFILE=standard`, `ECC_GOVERNANCE_CAPTURE=1`, `ECC_DISABLED_HOOKS=`, `ECC_SESSION_ID=`).
  - [x] 1.5 Ensure strict adherence to forward-slash path formatting across all installer copy routines, path alignment transformers, and environment examples with zero Windows backslashes.
  - [x] 1.6 **Verification Step**: Confirm [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) and [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/) contain migrated scripts, verify `alignUnifiedScriptPaths` rewrites relative imports cleanly, confirm adapter-free library loading, and verify [harness/.env.example](file:///d:/dev/agy-os/harness/.env.example) exists using forward slashes (`/`) without syntax errors.

- [x] **Task 2: AGY Guardrail Expansion, Co-location & Hook Registration ([.agents/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/scripts/pre-tool-guardrail-agy.js) & [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json))**
  - [x] 2.1 Co-locate AGY-native guardrail script [.agents/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/scripts/pre-tool-guardrail-agy.js) and post-tool envelope script [.agents/scripts/observation-envelope-agy.js](file:///d:/dev/agy-os/.agents/scripts/observation-envelope-agy.js) in [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) with shared helpers in [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/) using `-agy.js` suffix convention (AGENTS.md §11).
  - [x] 2.2 Refactor [.agents/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/scripts/pre-tool-guardrail-agy.js) to import helper modules directly from co-located [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/) via relative paths (e.g. `require('./lib/utils')`).
  - [x] 2.3 Expand input payload parser in [.agents/scripts/pre-tool-guardrail-agy.js](file:///d:/dev/agy-os/.agents/scripts/pre-tool-guardrail-agy.js) to read stdin and extract tool execution arguments for `run_command`, Bash, and file editing tools.
  - [x] 2.4 Implement strict command string and path inspection logic to detect and block:
    - Direct write or delete operations targeting READ-ONLY target repository [website](file:///d:/CLAUDE-PROJECT/website) (`d:/CLAUDE-PROJECT/website`).
    - Windows backslash (`\`) pathing in tool parameters and file path parameters.
    - Destructive file writes or shell redirects (`echo >`, `rm -rf website`) outside staged patch boundaries in [harness/patches/](file:///d:/dev/agy-os/harness/patches/).
  - [x] 2.5 Wire `pre:agy-guardrail` into [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json) as the primary `PreToolUse` hook entry (`node .agents/scripts/pre-tool-guardrail-agy.js`).
  - [x] 2.6 **Verification Step**: Execute syntax compilation check via Node.js in Git Bash (`node -c .agents/scripts/pre-tool-guardrail-agy.js`) and helper scripts in [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/), and verify `pre:agy-guardrail` correctly returns exit code 0 for valid commands and exit code 2 with a blocking error message for unauthorized target repo mutations.

- [x] **Task 3: Non-Destructive Merge-Hooks Utility Creation & Installer Path Integration ([merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js) & [install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js))**
  - [x] 3.1 Create standalone installer utility script at [harness/agy-script/scripts/merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js) following AGENTS.md §4 naming conventions.
  - [x] 3.2 Implement non-destructive hooks merging algorithm that ingests upstream ECC `hooks.json` while preserving existing AGY-native hook entries (`post:agy-observation-envelope`, `pre:agy-guardrail`).
  - [x] 3.3 Transform all merged hook execution script paths from `"ECC/scripts/hooks/<name>.js"` to point directly to co-located `".agents/scripts/<name>.js"`.
  - [x] 3.4 Implement explicit platform filter in [merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js) to exclude Windows-incompatible desktop notification hooks (`stop:desktop-notify`).
  - [x] 3.5 Implement atomic backup mechanism in [merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js) to create a copy at [.agents/hooks.json.bak](file:///d:/dev/agy-os/.agents/hooks.json.bak) prior to executing any write operations on [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json).
  - [x] 3.6 Update [harness/agy-script/scripts/install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) to import and execute `mergeHooks()` from [merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js), replacing nuclear `fs.copyFileSync` hook file overwrites.
  - [x] 3.7 **Verification Step**: Execute [harness/agy-script/scripts/merge-hooks-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/merge-hooks-agy.js) in test execution mode using Git Bash (`bash`) to confirm AGY-native hooks are preserved, script paths point to `.agents/scripts/*.js`, `stop:desktop-notify` is omitted, and atomic backup [.agents/hooks.json.bak](file:///d:/dev/agy-os/.agents/hooks.json.bak) is generated correctly.

- [x] **Task 4: Integration Verification, Adapter-Free Syntax Audit & Documentation Compliance ([verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js))**
  - [x] 4.1 Update [harness/agy-script/scripts/verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) to verify physical script existence across [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) and [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/) without reliance on `CLAUDE_PLUGIN_ROOT`.
  - [x] 4.2 Execute full harness installation pass via [harness/agy-script/install-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-agy.sh) using Git Bash (`bash`).
  - [x] 4.3 Verify [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json) contains merged hook definitions with execution paths pointing to [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/), `pre:agy-guardrail` pinned at `PreToolUse` index 0, and zero occurrences of `stop:desktop-notify`.
  - [x] 4.4 Perform comprehensive adapter-free Node.js syntax compilation verification (`node -c`) across all 81 co-located hook and support scripts in [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) and [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/), confirming 0 syntax errors or unaligned module paths.
  - [x] 4.5 **Verification Step**: Execute [harness/agy-script/scripts/verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) using Git Bash (`bash`) to confirm 100% Fail-Fast verification compliance, exit code 0, and update task checklist states upon completion.

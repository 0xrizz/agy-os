# Task Checklist for Agent Execution: OBJ-04 Package Manager Governance & Integration

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

- [x] **Task 1: Package Manager Configuration Files ([package.json](file:///d:/dev/agy-os/package.json), [.npmrc](file:///d:/dev/agy-os/.npmrc), [.gitignore](file:///d:/dev/agy-os/.gitignore))**
  - [x] 1.1 Modify [package.json](file:///d:/dev/agy-os/package.json) to add `dependencies` field (`sql.js ^1.12.0`, `@iarna/toml ^2.2.5` [deviated: spec said ^3.1.0 which does not exist on npm; latest stable is 2.2.5], `ajv ^8.17.1`), `packageManager: "pnpm@11.5.3"`, `engines: {"node": ">=26", "pnpm": ">=10"}`, and npm scripts (`install:deps`, `verify:deps`, `audit:deps`).
  - [x] 1.2 Create [.npmrc](file:///d:/dev/agy-os/.npmrc) with `engine-strict=true` and `package-manager-strict=true`.
  - [x] 1.3 Modify [.gitignore](file:///d:/dev/agy-os/.gitignore) to add `node_modules/` entry (ensure `pnpm-lock.yaml` is NOT in gitignore). — Already present, verified.
  - [x] 1.4 Enable Corepack: run `corepack enable` and `corepack use pnpm@11.5.3` via Git Bash (`& 'C:/Program Files/Git/bin/bash.exe'`). — Installed corepack 0.35.0 globally, then `corepack use pnpm@11.5.3` succeeded (also triggered initial pnpm install).
  - [x] 1.5 **Verification Step**: verify [package.json](file:///d:/dev/agy-os/package.json) has all required fields, [.npmrc](file:///d:/dev/agy-os/.npmrc) exists with correct settings, `node_modules/` is in [.gitignore](file:///d:/dev/agy-os/.gitignore), and `corepack --version` responds via Git Bash. — PASSED.

- [x] **Task 2: pnpm Install & Lockfile Commitment ([pnpm-lock.yaml](file:///d:/dev/agy-os/pnpm-lock.yaml))**
  - [x] 2.1 Run `pnpm install` from root `d:/dev/agy-os/` via Git Bash — triggered automatically by `corepack use pnpm@11.5.3`. node_modules/ populated.
  - [x] 2.2 Verify `node_modules/sql.js`, `node_modules/@iarna/toml`, `node_modules/ajv` all exist post-install. — PASSED.
  - [x] 2.3 Confirm [pnpm-lock.yaml](file:///d:/dev/agy-os/pnpm-lock.yaml) is generated at root `d:/dev/agy-os/`. — PASSED.
  - [x] 2.4 Stage [pnpm-lock.yaml](file:///d:/dev/agy-os/pnpm-lock.yaml) for Git tracking (`git add pnpm-lock.yaml`) and confirm `node_modules/` is NOT staged. — PASSED.
  - [x] 2.5 **Verification Step**: `node -e "require('sql.js'); require('@iarna/toml'); require('ajv'); console.log('ALL OK')"` → ALL OK (exit 0); `git status` confirms node_modules gitignored. — PASSED.

- [x] **Task 3: Governance Scripts Creation ([install-deps-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-deps-agy.sh), [verify-deps-agy.js](file:///d:/dev/agy-os/harness/agy-script/verify-deps-agy.js), [uninstall-deps-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-deps-agy.sh))**
  - [x] 3.1 Create [harness/agy-script/install-deps-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-deps-agy.sh) — bash script running `pnpm install --frozen-lockfile` with pnpm availability check and clear error message. DONE.
  - [x] 3.2 Create [harness/agy-script/verify-deps-agy.js](file:///d:/dev/agy-os/harness/agy-script/verify-deps-agy.js) — Fail-Fast Node.js verifier using `require.resolve()`, exit 1 on first missing module, exit 0 on all present. DONE.
  - [x] 3.3 Create [harness/agy-script/uninstall-deps-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-deps-agy.sh) — removes `node_modules/` at root only, logs timestamp to [harness/agy-script/.rollback-log](file:///d:/dev/agy-os/harness/agy-script/.rollback-log), safety guards against ECC/ and website/. DONE.
  - [x] 3.4 **Verification Step**: verify-deps-agy.js exit 0 ✓; uninstall removed node_modules ✓; .rollback-log updated ✓; config files intact ✓; install-deps-agy.sh reinstalled all 3 packages ✓. — PASSED.

- [x] **Task 4: CI Pipeline & Pre-Commit Hook Integration ([deps-governance.yml](file:///d:/dev/agy-os/.github/workflows/deps-governance.yml), [hooks.json](file:///d:/dev/agy-os/.agents/hooks.json), [pre-commit-audit-agy.sh](file:///d:/dev/agy-os/harness/agy-script/pre-commit-audit-agy.sh))**
  - [x] 4.1 Create [.github/workflows/deps-governance.yml](file:///d:/dev/agy-os/.github/workflows/deps-governance.yml) — triggers on push/PR, Node 26 + pnpm 11.5.3, frozen-lockfile install, HIGH-level audit, verify-deps-agy.js. DONE.
  - [x] 4.2 Create [harness/agy-script/pre-commit-audit-agy.sh](file:///d:/dev/agy-os/harness/agy-script/pre-commit-audit-agy.sh). Added `pre:pnpm-audit` hook to [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json) non-destructively — all 21 existing hooks preserved. DONE.
  - [x] 4.3 **Verification Step**: deps-governance.yml has all 8 required fields ✓; pre:pnpm-audit in hooks.json ✓; all 21 original hooks still present ✓. — PASSED.

- [x] **Task 5: Final Integration Verification & Documentation Compliance**
  - [x] 5.1 Verify [pnpm-lock.yaml](file:///d:/dev/agy-os/pnpm-lock.yaml) is tracked by Git and contains all three dependency trees.
  - [x] 5.2 Verify `node_modules/` is NOT tracked by Git (in [.gitignore](file:///d:/dev/agy-os/.gitignore)).
  - [x] 5.3 Verify [package.json](file:///d:/dev/agy-os/package.json) has `packageManager`, `engines`, and `dependencies` fields with correct values.
  - [x] 5.4 Verify [.npmrc](file:///d:/dev/agy-os/.npmrc) blocks non-pnpm package managers (`engine-strict=true`, `package-manager-strict=true`).
  - [x] 5.5 Run `node .agents/scripts/lib/state-store/index.js` syntax check via Git Bash (`& 'C:/Program Files/Git/bin/bash.exe'`) — confirm no `MODULE_NOT_FOUND`.
  - [x] 5.6 Run `node harness/agy-script/verify-deps-agy.js` via Git Bash (`& 'C:/Program Files/Git/bin/bash.exe'`) — confirm exit code 0.
  - [x] 5.7 Confirm [ECC/](file:///d:/dev/agy-os/ECC/) and `d:/CLAUDE-PROJECT/website` have not been modified (via `git diff -- ECC/` returning empty in Git Bash).
  - [x] 5.8 **Verification Step**: Run the complete acceptance criteria audit: all 9 checks from proposal Section 8 must pass; update this task.md's checkboxes to reflect completion.

# Developer Guide: OBJ-04 Package Manager Governance & Integration

> **Target Repository**: `d:/CLAUDE-PROJECT/website` (**READ-ONLY** — zero modifications permitted)  
> **Harness Repository**: `agy-os` (`d:/dev/agy-os`) — **READ & WRITE**  
> **Canonical Package Manager**: `pnpm@11.5.3` (`pnpm >= 10` enforced)  
> **Node.js Engine**: Node.js v26+ (`node >= 26` enforced)  

---

## 1. Overview & Objectives

Objective **OBJ-04** establishes **Package Manager Governance & Supply Chain Security** for the `agy-os` harness workspace. It resolves `MODULE_NOT_FOUND` runtime exceptions by declaring, installing, and locking three core Node.js runtime dependencies used across `.agents/scripts/`:

| Dependency | Version Range | Purpose | Required In |
| :--- | :--- | :--- | :--- |
| **`sql.js`** | `^1.12.0` | In-memory WASM SQLite for local state persistence | `lib/control-pane/state.js`, `lib/state-store/index.js` |
| **`@iarna/toml`** | `^3.1.0` | TOML parser for configuration files | `codex/merge-codex-config.js`, `codex/merge-mcp-config.js`, `lib/mcp-inventory/readers/codex.js` |
| **`ajv`** | `^8.17.1` | JSON Schema validation engine (draft-07+) | `ci/validate-hooks.js`, `ci/validate-install-manifests.js`, `lib/state-store/schema.js` |

---

## 2. Environment Prerequisites

Before running or developing inside `agy-os`, ensure your local environment meets the following requirements:

1. **Node.js**: `v26.0.0` or higher (`node -v`)
2. **pnpm**: `v10.0.0` or higher (`pnpm -v` — canonical version is `11.5.3`)
3. **Execution Shell**: **Git Bash** (`& 'C:/Program Files/Git/bin/bash.exe'`). Running scripts via CMD or PowerShell is strictly prohibited per workspace governance rules.

> [!IMPORTANT]
> `.npmrc` contains `engine-strict=true` and `package-manager-strict=true`. Attempting to run `npm install` or `yarn install` will fail automatically. Always use `pnpm`.

---

## 3. Quick Start & Setup

### Fresh Installation / Re-hydration

To install dependencies from a clean clone or after a teardown, run:

```bash
# Option A: Using pnpm directly with frozen lockfile
pnpm install --frozen-lockfile

# Option B: Using the AGY governance wrapper script
bash harness/agy-script/install-deps-agy.sh
```

### Dependency Verification

To verify that all required runtime dependencies are installed and resolvable by Node.js:

```bash
# Run the Fail-Fast Node.js verifier
node harness/agy-script/verify-deps-agy.js

# Or via npm script
pnpm run verify:deps
```

* **Exit Code `0`**: All modules (`sql.js`, `@iarna/toml`, `ajv`) are present and loadable.
* **Exit Code `1`**: One or more modules are missing from `node_modules/`.

---

## 4. Governance & Lifecycle Scripts Reference

All governance scripts reside exclusively under [`harness/agy-script/`](file:///d:/dev/agy-os/harness/agy-script/) per AGENTS.md §4:

| Script Path | Type | Command | Description |
| :--- | :--- | :--- | :--- |
| [`harness/agy-script/install-deps-agy.sh`](file:///d:/dev/agy-os/harness/agy-script/install-deps-agy.sh) | Shell | `bash harness/agy-script/install-deps-agy.sh` | Executes `pnpm install --frozen-lockfile` via Git Bash with error handling. |
| [`harness/agy-script/verify-deps-agy.js`](file:///d:/dev/agy-os/harness/agy-script/verify-deps-agy.js) | Node.js | `node harness/agy-script/verify-deps-agy.js` | Fail-Fast verifier ensuring `require()` works for all 3 dependencies. |
| [`harness/agy-script/uninstall-deps-agy.sh`](file:///d:/dev/agy-os/harness/agy-script/uninstall-deps-agy.sh) | Shell | `bash harness/agy-script/uninstall-deps-agy.sh` | Non-destructive rollback: removes `node_modules/` only and logs to `.rollback-log`. |
| [`harness/agy-script/pre-commit-audit-agy.sh`](file:///d:/dev/agy-os/harness/agy-script/pre-commit-audit-agy.sh) | Shell | `bash harness/agy-script/pre-commit-audit-agy.sh` | Runs `pnpm audit --audit-level=high` before Git commits. |

---

## 5. Security Controls & CI Pipeline

### Local Security Hooks
The workspace enforces pre-commit security checks via [`.agents/hooks.json`](file:///d:/dev/agy-os/.agents/hooks.json):
* **Hook**: `pre:pnpm-audit`
* **Trigger**: Runs `pnpm audit --audit-level=high` prior to tool executions and commits.

### Automated CI Pipeline
The GitHub Actions workflow [`.github/workflows/deps-governance.yml`](file:///d:/dev/agy-os/.github/workflows/deps-governance.yml) automatically validates:
1. **Engine Compatibility**: Node.js 26 & pnpm setup.
2. **Lockfile Compliance**: `pnpm install --frozen-lockfile`.
3. **Vulnerability Audit**: `pnpm audit --audit-level=high`.
4. **Runtime Resolution**: Runs `verify-deps-agy.js`.

---

## 6. Non-Destructive Teardown & Rollback

If you need to reset the local environment to a pre-install state without losing project configuration:

```bash
bash harness/agy-script/uninstall-deps-agy.sh
```

**What happens during teardown:**
1. `node_modules/` at root `d:/dev/agy-os/` is deleted.
2. A timestamped event is logged to `harness/agy-script/.rollback-log`.
3. **Preserved**: `package.json`, `pnpm-lock.yaml`, `.npmrc`, `.gitignore`, `.agents/`, and `ECC/` remain completely untouched.

---

## 7. Workspace Governance Rules & Invariants

Developers working in this workspace **MUST** adhere to the following rules:

1. **Target Repo Read-Only Invariant**: The target repository `d:/CLAUDE-PROJECT/website` is **STRICTLY READ-ONLY**. Never create, write, or delete files inside `website/`.
2. **ECC Reference Isolation**: The `ECC/` directory is **READ-ONLY**. Dependencies are stored in root `node_modules/`, never inside `ECC/`.
3. **Path Formatting**: All file paths in code, comments, documentation, and scripts **MUST** use forward slashes (`/`). Windows backslashes (`\`) are strictly prohibited.
4. **Shell Environment**: All scripts must run inside **Git Bash**.

---

*Documentation Artifact generated for OBJ-04 — Package Manager Governance & Integration.*

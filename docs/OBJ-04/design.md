# Technical Design Document: OBJ-04 Package Manager Governance & Integration

## 1. Overview & Architecture Goals
### Context
Objective 04 defines the Package Manager Governance & Integration plan for the Antigravity harness environment ([agy-os](file:///d:/dev/agy-os)). The problem centers on the fact that active scripts in the `.agents/scripts/` directory rely on three external modules (`sql.js`, `@iarna/toml`, and `ajv`) which are `require()`-d but never officially installed, causing `MODULE_NOT_FOUND` runtime exceptions when executed.

The solution establishes `pnpm` as the canonical package manager, pins the three required dependencies in a root `package.json`, generates a deterministic `pnpm-lock.yaml`, and enforces supply chain security through CI audits and pre-commit hooks. This architecture maintains strict boundary isolation, ensuring that neither the read-only upstream [ECC](file:///d:/dev/agy-os/ECC/) folder nor the target [website](file:///d:/CLAUDE-PROJECT/website) repository is polluted by the package manager installation.

### Goals / Non-Goals
- **Goals**:
  - Establish `pnpm` (>= 10) as the sole package manager via [package.json](file:///d:/dev/agy-os/package.json) constraints and [.npmrc](file:///d:/dev/agy-os/.npmrc).
  - Install and pin exactly three dependencies required by the harness: `sql.js` (`^1.12.0`), `@iarna/toml` (`^3.1.0`), and `ajv` (`^8.17.1`).
  - Enforce supply chain security using `pnpm audit --audit-level=high` in a GitHub Actions CI pipeline and local pre-commit hooks.
  - Create strict governance scripts for setup, verification, and non-destructive rollback in [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/).

- **Non-Goals**:
  - Managing, installing, or modifying packages in the target repository [website/](file:///d:/CLAUDE-PROJECT/website).
  - Modifying any files inside the read-only upstream reference directory [ECC/](file:///d:/dev/agy-os/ECC/).
  - Migrating the entire project to a multi-workspace structure (a single root `package.json` is sufficient).
  - Permitting or supporting `npm`, `yarn`, or `bun` for package management within the `agy-os` repository.

## 2. Directory Layout & Component Structure

```text
d:/dev/agy-os/
├── .agents/
│   └── hooks.json                         # [MODIFY] Add pre:pnpm-audit hook entry
├── .github/
│   └── workflows/
│       └── deps-governance.yml            # [CREATE] CI workflow for pnpm install & audit
├── harness/
│   └── agy-script/
│       ├── install-deps-agy.sh            # [CREATE] Governance installer wrapper
│       ├── uninstall-deps-agy.sh          # [CREATE] Non-destructive rollback script
│       └── verify-deps-agy.js             # [CREATE] Governance verifier for node_modules/
├── .gitignore                             # [MODIFY] Add node_modules/ exclusion
├── .npmrc                                 # [CREATE] Enforce package-manager-strict and engine-strict
├── package.json                           # [MODIFY] Add dependencies, packageManager, engines, scripts
└── pnpm-lock.yaml                         # [CREATE] Deterministic lockfile (committed)
```

## 3. Technical Design

### 3.1 package.json Schema & Dependencies
The root [package.json](file:///d:/dev/agy-os/package.json) serves as the primary enforcement layer:
- **`packageManager`**: Set to `"pnpm@11.5.3"` for Corepack recognition and enforcement.
- **`engines`**: Set to `{"node": ">=26", "pnpm": ">=10"}`.
- **`dependencies`**: Populated only with required production dependencies:
  - `sql.js`: `"^1.12.0"`
  - `@iarna/toml`: `"^3.1.0"`
  - `ajv`: `"^8.17.1"`
- **`scripts`**: Contains alias commands for governance operations:
  - `"install:deps"`: Triggers `bash harness/agy-script/install-deps-agy.sh`
  - `"verify:deps"`: Triggers `node harness/agy-script/verify-deps-agy.js`
  - `"audit:deps"`: Triggers `pnpm audit --audit-level=high`

### 3.2 .npmrc Configuration
A new [.npmrc](file:///d:/dev/agy-os/.npmrc) file in the root enforces the canonical package manager:
- `engine-strict=true` (Blocks installs running with incorrect Node.js or pnpm versions).
- `package-manager-strict=true` (Explicitly blocks `npm install` and `yarn install`).

### 3.3 Governance Scripts Design
Governance scripts reside in [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/) per AGENTS.md §4:
- **install-deps-agy.sh**: A bash wrapper executing `pnpm install --frozen-lockfile`. Handles graceful error messages if Corepack or `pnpm` is missing.
- **verify-deps-agy.js**: A Node.js module verifying the exact resolution of the three libraries using `require.resolve()`. Employs a Fail-Fast pattern, exiting with code `1` and displaying a diagnostic message if `node_modules/` is incomplete.
- **uninstall-deps-agy.sh**: A non-destructive rollback script that strictly removes [node_modules/](file:///d:/dev/agy-os/node_modules/) while preserving all configuration files and lockfiles.

### 3.4 CI & Security Workflow Design
- **Local Pre-commit Hook**: The [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json) file incorporates a `pre:pnpm-audit` entry that executes `pnpm audit --audit-level=high` before code is committed, acting as a local security guard.
- **GitHub Actions Workflow**: The [.github/workflows/deps-governance.yml](file:///d:/dev/agy-os/.github/workflows/deps-governance.yml) workflow triggers on pushes and PRs, executing a hardened pipeline: `pnpm install --frozen-lockfile` followed by `pnpm audit --audit-level=high` and `node harness/agy-script/verify-deps-agy.js`.

## 4. Architectural Decision Records (4-Column Table)

| Decision | Selected Option | Rationale | Alternatives Considered |
|---|---|---|---|
| Package Manager | pnpm | Disk-efficient, deterministic lockfile, detection priority #1 in lib, no Windows spawn bug | npm (universal but no hard-linking), bun (Windows spawn bug), yarn (ecosystem moving away) |
| Runtime Dependencies | dependencies (production field) | Used by operational runtime scripts — session hooks, state store, CI validators | devDependencies (incorrect — not build-only tooling) |
| Dependency Selection | sql.js + @iarna/toml + ajv (all three) | All three are require()-d in active code; no native Node equivalent | Zero-dependency fallback (would require extensive rewrite), partial install (would leave some scripts broken) |
| Semver Ranges | ^1.12.0, ^3.1.0, ^8.17.1 | Allows patch security updates; caret prefix is pnpm standard | Exact pinning (too rigid for patch updates), latest (non-deterministic) |
| Lockfile Policy | pnpm-lock.yaml committed to Git | Reproducible install; deterministic in CI | No lockfile (drift risk), zero-install (repo too large) |
| node_modules location | Root agy-os/ only | Standard; does not contaminate ECC/ (READ-ONLY) | Inside .agents/ (complex resolution), inside ECC/ (forbidden) |
| Corepack | Enabled (corepack enable + corepack use pnpm@11.5.3) | Node.js-level PM enforcement; packageManager field already recognized by Corepack | Not using Corepack (only .npmrc enforcement — less strict), optional docs only |
| pnpm store | Default global store (~/.local/share/pnpm/store) | No config needed; disk-efficient hard-linking | Project-local store (increases repo size), network store (team-only) |
| Engine Constraint | node >= 26, pnpm >= 10 | Matches active system (Node 26.1.0, pnpm 11.5.3); flexible to minor upgrades | node >= 22 (too conservative), node >= 26.1.0 (too strict patch pinning) |
| Enforcement Mechanism | packageManager field + .npmrc | Corepack-compatible; blocks npm install / yarn install | Lockfile only (insufficient), documentation only (no enforcement) |
| Security Enforcement | pnpm audit CI + --frozen-lockfile | Prevents drift; blocks HIGH/CRITICAL vulns in pipeline | Manual audit only (not automated), moderate threshold (too permissive) |
| Governance Scripts | harness/agy-script/ | Consistent with AGENTS.md §4 — installer/verifier/teardown | .agents/scripts/ (wrong domain — runtime, not installer) |
| CI Integration | GitHub Actions + pre-commit hook | Dual enforcement: local + remote | GitHub Actions only (no local guard), pre-commit only (no remote guard) |
| Fallback Behavior | Hard fail + clear error message | Scripts must be explicit about missing deps; silent degradation hides problems | Graceful degradation (masks install issues), lazy auto-install (requires internet) |
| Rollback | Non-destructive — delete node_modules/ only | package.json and lockfile remain; easy recovery | Full revert including lockfile (too destructive), git checkout (manual only) |

## 5. Non-Destructive Rollback Architecture

### 5.1 Trigger Conditions
- High or critical vulnerabilities found in the dependency tree that cannot be resolved via patch updates.
- Detection of a corrupted `node_modules/` cache or lockfile desync leading to missing module exceptions.
- The requirement for a clean-slate reset before executing orchestrated verification checks or tests.

### 5.2 Rollback Script Specification (uninstall-deps-agy.sh)
- **Path**: [harness/agy-script/uninstall-deps-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-deps-agy.sh) (Executed via Git Bash).
- **Execution Rule**: Exclusively executes `rm -rf node_modules/` within the `agy-os/` repository root.
- **Immutability Constraints**: The script MUST NOT mutate, alter, or delete [package.json](file:///d:/dev/agy-os/package.json), [pnpm-lock.yaml](file:///d:/dev/agy-os/pnpm-lock.yaml), [.npmrc](file:///d:/dev/agy-os/.npmrc), or [.gitignore](file:///d:/dev/agy-os/.gitignore). It MUST strictly ignore [ECC/](file:///d:/dev/agy-os/ECC/) and [website/](file:///d:/CLAUDE-PROJECT/website).

### 5.3 Post-Rollback State
- The [node_modules/](file:///d:/dev/agy-os/node_modules/) directory is completely eradicated from the project root.
- The `package.json` file and the `pnpm-lock.yaml` lockfile remain fully intact and available in Git.
- System state reverts to pre-installation behavior; subsequent execution of dependent scripts will predictably throw clear `MODULE_NOT_FOUND` errors demanding a fresh `pnpm install`.

### 5.4 Re-install Recovery Path
- Recovery is performed by running [harness/agy-script/install-deps-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-deps-agy.sh).
- This explicitly invokes `pnpm install --frozen-lockfile`, guaranteeing that dependencies are restored exactly as locked in `pnpm-lock.yaml` without unintentional upgrades or drift.

### 5.5 Audit Trail
- A successful execution of the rollback script securely appends a timestamped log entry to `harness/agy-script/.rollback-log` to maintain an audit trail indicating when the `node_modules/` directory was defensively scrubbed by `uninstall-deps-agy.sh`.

### 5.6 Corepack Revert Steps
- The rollback process natively targets filesystem dependencies (`node_modules/`), not global binaries.
- If developers wish to remove `pnpm` usage from their environment entirely, they can run `corepack disable pnpm`. The strict project configuration in `.npmrc` provides an independent safeguard, ensuring structural integrity even if Corepack enforcement is disabled locally.

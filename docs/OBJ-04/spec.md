# OpenAGY Behavioral Specification: OBJ-04 Package Manager Governance & Integration

<!-- 
AI INSTRUCTION:
This template defines behavioral requirements and system constraints following the OpenAGY spec-driven format.
When populating this file:
- System constraints MUST define boundary rules, path invariants, and execution parameters.
- Each requirement MUST use the level-3 heading `### Requirement: <Name>` followed by SHALL statements.
- Scenarios MUST use level-4 headings `#### Scenario: <Name>` with bulleted WHEN/THEN/AND clauses.
- Use forward slashes (/) for all file paths.
- Use clickable file:/// links for all referenced file paths.
-->

## 1. Scope & System Constraints

### 1.1 Path Formatting & Shell Execution Invariants
- All file paths in rules, configurations, change records, and documentation MUST strictly use forward-slash format (e.g., [d:/dev/agy-os](file:///d:/dev/agy-os), [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/)). Windows backslashes (`\`) are strictly prohibited in metadata, paths, and documentation instructions.
- Terminal execution MUST be explicitly specified using **Git Bash** (`bash`). Running package manager commands via CMD or PowerShell is strictly prohibited in governance scripts.

### 1.2 Access & Directory Boundaries
- Upstream [ECC](file:///d:/dev/agy-os/ECC) directory is treated strictly as an isolated, READ-ONLY reference library. No files inside `ECC/` may be created, modified, deleted, or overwritten. `node_modules/` MUST NOT be placed inside `ECC/`.
- Target repository [website](file:///d:/CLAUDE-PROJECT/website) (`d:/CLAUDE-PROJECT/website`) is strictly READ-ONLY. OBJ-04 produces zero patches or modifications targeting `website/`.
- All installer, verifier, and teardown governance scripts MUST reside under [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/) per AGENTS.md §4.
- `node_modules/` MUST reside at root `agy-os/` level only: [d:/dev/agy-os/node_modules/](file:///d:/dev/agy-os/node_modules/).

### 1.3 Documentation Hierarchy & SSOT Invariants
- Exactly ONE Single Source of Truth global PRD exists at [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md).
- Objective suite [docs/OBJ-04/](file:///d:/dev/agy-os/docs/OBJ-04/) consists strictly of `spec.md`, `design.md`, `task.md`, and `artifacts/`. No `PRD.md` or `prompt.md` files are permitted inside `docs/OBJ-04/` per AGENTS.md §8.

### 1.4 Runtime Environment Constraints
- **Node.js**: `>= 26` (active system: v26.1.0)
- **pnpm**: `>= 10` (active system: v11.5.3)
- **Canonical Package Manager**: `pnpm` — no other package manager (npm, yarn, bun) may be used to install or manage dependencies in `agy-os`
- **Runtime Dependencies**: Exactly three external packages: `sql.js ^1.12.0`, `@iarna/toml ^3.1.0`, `ajv ^8.17.1`

---

## 2. Requirements

### Requirement: pnpm Canonical Package Manager Declaration
<!-- id: pkg.pnpm.canonical_declaration -->
<!-- entities: PackageManager, PackageJson, NpmRc -->
<!-- enforced: package.json, .npmrc -->

The system SHALL declare `pnpm` as the sole canonical package manager for `agy-os` by:
1. Setting the `packageManager` field in [package.json](file:///d:/dev/agy-os/package.json) to `"pnpm@11.5.3"`
2. Creating [.npmrc](file:///d:/dev/agy-os/.npmrc) with `package-manager-strict=true` and `engine-strict=true`
3. Setting `engines` field in [package.json](file:///d:/dev/agy-os/package.json) to `{"node": ">=26", "pnpm": ">=10"}`

#### Scenario: Enforcing pnpm when npm install is attempted
- **WHEN** a user attempts to run `npm install` in the root `agy-os/` directory
- **THEN** npm aborts with an error because `package-manager-strict=true` in [.npmrc](file:///d:/dev/agy-os/.npmrc) blocks non-canonical package managers
- **AND** the error message directs the user to use `pnpm install` instead

#### Scenario: Enforcing pnpm when yarn is attempted
- **WHEN** a user attempts to run `yarn install` in the root `agy-os/` directory
- **THEN** yarn aborts with a Corepack or `.npmrc` enforcement error
- **AND** `pnpm-lock.yaml` remains the only lockfile present; no `yarn.lock` is created

#### Scenario: Successful pnpm install on a fresh clone
- **WHEN** a developer clones `agy-os` and runs `pnpm install` from the root directory
- **THEN** pnpm reads `pnpm-lock.yaml` and installs `sql.js`, `@iarna/toml`, and `ajv` into [node_modules/](file:///d:/dev/agy-os/node_modules/)
- **AND** the install completes with exit code 0 and no version drift from the committed lockfile

---

### Requirement: Deterministic Lockfile & Gitignore Policy
<!-- id: pkg.lockfile.deterministic -->
<!-- entities: LockfilePolicy, GitignoreConfig -->
<!-- enforced: pnpm-lock.yaml, .gitignore -->

The system SHALL maintain `pnpm-lock.yaml` as the single deterministic lockfile committed to Git, and SHALL exclude `node_modules/` from version control.

#### Scenario: Verifying lockfile is committed and node_modules is gitignored
- **WHEN** a developer inspects the `agy-os` repository state after initial OBJ-04 setup
- **THEN** `pnpm-lock.yaml` exists at [d:/dev/agy-os/pnpm-lock.yaml](file:///d:/dev/agy-os/pnpm-lock.yaml) and is tracked by Git
- **AND** `node_modules/` is listed in [.gitignore](file:///d:/dev/agy-os/.gitignore) and absent from Git tracking

#### Scenario: Preventing lockfile drift via frozen-lockfile enforcement
- **WHEN** [harness/agy-script/install-deps-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-deps-agy.sh) is executed in a CI environment or fresh clone
- **THEN** the script runs `pnpm install --frozen-lockfile`
- **AND** if the local state would require updating `pnpm-lock.yaml`, pnpm aborts with a non-zero exit code instead of silently modifying the lockfile

#### Scenario: Detecting lockfile modification attempt
- **WHEN** a developer runs `pnpm install` and a dependency version would cause lockfile changes
- **THEN** pnpm warns about lockfile changes (if not `--frozen-lockfile`)
- **AND** the CI pipeline catches any uncommitted lockfile changes via `git diff --exit-code pnpm-lock.yaml`

---

### Requirement: Three Runtime Dependencies Available at Script Execution
<!-- id: pkg.deps.runtime_availability -->
<!-- entities: RuntimeDependency, ModuleResolver, NodeModules -->
<!-- enforced: node_modules/, package.json dependencies field -->

The system SHALL ensure `sql.js`, `@iarna/toml`, and `ajv` are resolvable via Node.js `require()` from any script in [.agents/scripts/](file:///d:/dev/agy-os/.agents/scripts/) and [.agents/scripts/lib/](file:///d:/dev/agy-os/.agents/scripts/lib/) after `pnpm install` is executed.

#### Scenario: Resolving sql.js from lib/state-store
- **WHEN** [.agents/scripts/lib/state-store/index.js](file:///d:/dev/agy-os/.agents/scripts/lib/state-store/index.js) is executed after `pnpm install`
- **THEN** `require('sql.js')` resolves successfully from [node_modules/sql.js/](file:///d:/dev/agy-os/node_modules/sql.js/)
- **AND** the SQLite in-memory database initializes without `MODULE_NOT_FOUND` error

#### Scenario: Resolving @iarna/toml from codex scripts
- **WHEN** [.agents/scripts/codex/merge-codex-config.js](file:///d:/dev/agy-os/.agents/scripts/codex/merge-codex-config.js) or [merge-mcp-config.js](file:///d:/dev/agy-os/.agents/scripts/codex/merge-mcp-config.js) is executed
- **THEN** `require('@iarna/toml')` resolves successfully from [node_modules/@iarna/toml/](file:///d:/dev/agy-os/node_modules/@iarna/toml/)
- **AND** TOML config files are parsed correctly without error

#### Scenario: Resolving ajv from CI validation scripts
- **WHEN** [.agents/scripts/ci/validate-hooks.js](file:///d:/dev/agy-os/.agents/scripts/ci/validate-hooks.js) or [validate-install-manifests.js](file:///d:/dev/agy-os/.agents/scripts/ci/validate-install-manifests.js) is executed
- **THEN** `require('ajv')` resolves successfully from [node_modules/ajv/](file:///d:/dev/agy-os/node_modules/ajv/)
- **AND** JSON Schema validation runs without `MODULE_NOT_FOUND` error

---

### Requirement: Hard-Fail Guard for Missing node_modules
<!-- id: pkg.deps.hard_fail_guard -->
<!-- entities: DependencyGuard, ErrorMessage, NodeModules -->
<!-- enforced: harness/agy-script/verify-deps-agy.js -->

The system SHALL provide hard-fail behavior when required runtime dependencies are absent — scripts MUST NOT silently degrade and MUST output a clear installation instruction.

#### Scenario: Executing a dependent script without node_modules installed
- **WHEN** any script that depends on `sql.js`, `@iarna/toml`, or `ajv` is executed before `pnpm install`
- **THEN** Node.js throws `Error: Cannot find module 'sql.js'` (or equivalent) at the `require()` call
- **AND** the error message clearly indicates the module name and the `node_modules/` directory was not found

#### Scenario: verify-deps-agy.js fails fast on missing module
- **WHEN** [harness/agy-script/verify-deps-agy.js](file:///d:/dev/agy-os/harness/agy-script/verify-deps-agy.js) is executed and any of the three required modules is absent
- **THEN** the script outputs a diagnostic message listing the missing module(s) and instructs the user to run `pnpm install` from the root `agy-os/` directory
- **AND** the script exits with code `1` (Fail-Fast), making CI pipelines and hook chains aware of the failure

#### Scenario: verify-deps-agy.js passes after successful install
- **WHEN** [harness/agy-script/verify-deps-agy.js](file:///d:/dev/agy-os/harness/agy-script/verify-deps-agy.js) is executed after `pnpm install` completes successfully
- **THEN** the script verifies all three modules are resolvable via `require.resolve()`
- **AND** the script exits with code `0`, confirming dependency health

---

### Requirement: Supply Chain Security Enforcement
<!-- id: pkg.security.supply_chain -->
<!-- entities: AuditPipeline, CI, PreCommitHook -->
<!-- enforced: .github/workflows/deps-governance.yml, .agents/hooks.json -->

The system SHALL enforce supply chain security via automated audit scanning in both CI and local pre-commit environments, blocking HIGH and CRITICAL vulnerability packages from being installed or retained.

#### Scenario: GitHub Actions blocks HIGH vulnerability in CI
- **WHEN** the [deps-governance.yml](file:///d:/dev/agy-os/.github/workflows/deps-governance.yml) GitHub Actions workflow is triggered on push or pull request
- **THEN** the workflow runs `pnpm audit --audit-level=high`
- **AND** if any dependency has a HIGH or CRITICAL severity vulnerability, the workflow exits with a non-zero code, blocking the PR merge

#### Scenario: Pre-commit hook catches audit failure locally
- **WHEN** a developer attempts a Git commit in `agy-os/` and the `pre:pnpm-audit` hook entry in [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json) is active
- **THEN** the hook executes `pnpm audit --audit-level=high`
- **AND** if the audit fails, the commit is blocked with a message instructing the developer to resolve vulnerabilities before committing

#### Scenario: Clean audit allows commit and CI pass
- **WHEN** `pnpm audit --audit-level=high` reports zero HIGH or CRITICAL vulnerabilities
- **THEN** the pre-commit hook exits with code 0, allowing the commit to proceed
- **AND** the CI workflow passes the audit step and continues to subsequent checks

---

### Requirement: Non-Destructive node_modules Isolation
<!-- id: pkg.isolation.non_destructive -->
<!-- entities: NodeModulesDir, ECCReadOnly, WebsiteReadOnly -->
<!-- enforced: harness/agy-script/uninstall-deps-agy.sh, package.json location -->

The system SHALL ensure `node_modules/` is isolated to root `agy-os/` level, with zero contamination of `ECC/` (READ-ONLY) or `d:/CLAUDE-PROJECT/website` (READ-ONLY).

#### Scenario: pnpm install does not create node_modules inside ECC/
- **WHEN** `pnpm install` is run from the root `d:/dev/agy-os/` directory
- **THEN** pnpm installs packages exclusively into [d:/dev/agy-os/node_modules/](file:///d:/dev/agy-os/node_modules/)
- **AND** zero files are created, modified, or deleted inside [d:/dev/agy-os/ECC/](file:///d:/dev/agy-os/ECC/)

#### Scenario: Rollback via uninstall-deps-agy.sh preserves config files
- **WHEN** [harness/agy-script/uninstall-deps-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-deps-agy.sh) is executed
- **THEN** `node_modules/` at root `d:/dev/agy-os/` is deleted
- **AND** [package.json](file:///d:/dev/agy-os/package.json), [pnpm-lock.yaml](file:///d:/dev/agy-os/pnpm-lock.yaml), [.npmrc](file:///d:/dev/agy-os/.npmrc), and [.gitignore](file:///d:/dev/agy-os/.gitignore) remain unmodified
- **AND** [ECC/](file:///d:/dev/agy-os/ECC/) and [d:/CLAUDE-PROJECT/website](file:///d:/CLAUDE-PROJECT/website) are not touched

---

### Requirement: Governance Script Harness Location Invariant
<!-- id: pkg.governance.scripts_location -->
<!-- entities: GovernanceScripts, HarnessAgyScript -->
<!-- enforced: harness/agy-script/install-deps-agy.sh, harness/agy-script/verify-deps-agy.js, harness/agy-script/uninstall-deps-agy.sh -->

The system SHALL enforce that all OBJ-04 governance scripts (installer, verifier, teardown) reside exclusively under [harness/agy-script/](file:///d:/dev/agy-os/harness/agy-script/) per AGENTS.md §4 and §11.

#### Scenario: install-deps-agy.sh exists at correct location
- **WHEN** the OBJ-04 governance install script is invoked
- **THEN** it is executed from [harness/agy-script/install-deps-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-deps-agy.sh)
- **AND** no governance install script exists inside `.agents/scripts/` (which is the runtime domain, not installer domain)

#### Scenario: verify-deps-agy.js produces Fail-Fast exit code 1 on discrepancy
- **WHEN** [harness/agy-script/verify-deps-agy.js](file:///d:/dev/agy-os/harness/agy-script/verify-deps-agy.js) detects that any of `sql.js`, `@iarna/toml`, or `ajv` cannot be resolved
- **THEN** the script exits with code `1` immediately upon the first missing module (Fail-Fast pattern)
- **AND** outputs a structured error to stdout listing: module name, expected path, and recovery instruction (`pnpm install`)

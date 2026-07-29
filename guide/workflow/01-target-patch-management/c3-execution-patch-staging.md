---
title: "UC01-C3: TDD Execution & Patch Staging"
audience:
  - "AI-Agent"
  - "Human-Developer"
scope: "workflow/01-target-patch-management/c3"
prerequisites:
  - "/opsx-apply"
  - "HITL Gate 1 approval"
  - "Mandatory patch staging protocol"
related_commands:
  - "/opsx-apply"
  - "spec-to-test"
  - "tdd-guide"
  - "build-error-resolver"
---

# UC01-C3: TDD Execution & Patch Staging

## 1. Overview & Operational Scope

Stage C3 (TDD Execution & Patch Staging) covers the test-driven implementation phase of the Target Patch Management workflow (`UC01`). Following approved plans from Stage C2, AI agents generate unit/integration test specifications, execute code modifications, resolve build issues, and stage output patches.

---

## 2. Mandatory Target Patch Staging Guardrail (CRITICAL)

In compliance with `AGENTS.md` Rule 1 & Rule 2:

1. **Target Repo Read-Only Restriction**: Under NO circumstances may files in `d:/CLAUDE-PROJECT/website` be directly edited, created, or deleted by AI agents during implementation.
2. **Mandatory Patch Staging Directory**: Every proposed code change targeting `d:/CLAUDE-PROJECT/website` **MUST** be generated as a unified diff patch file (`.patch` or `.diff`) and saved strictly inside:
   `d:/dev/agy-os/harness/patches/`
3. **Patch Naming Standard**: Patch files must follow the canonical naming pattern:
   `harness/patches/YYYYMMDD-UC01-<feature-name>.patch`

---

## 3. Key Agents & Workflow Steps

| Role / Tool | Identity / Command | Operational Purpose |
|:---|:---|:---|
| Command | `/opsx-apply` | Executes task implementation following approved proposal. |
| Test Agent | `spec-to-test` | Converts spec requirements and scenario clauses into executable test suites. |
| Execution Agent | `tdd-guide` | Drives the Red-Green-Refactor cycle and minimal code modifications. |
| Resolver Agent | `build-error-resolver` | Diagnoses and resolves compilation, typecheck, or build errors. |

---

## 4. Execution Workflow

### Step 4.1: Command Triggering
Execute `/opsx-apply` to start the execution runner.

```bash
# Example execution command
/opsx-apply task="Implement navigation state hydration fix"
```

### Step 4.2: Test Creation (Red Phase)
Deploy `spec-to-test` to generate test fixtures matching spec requirements.
- Tests verify expected target behavior.
- Execute test command to confirm tests fail as expected prior to patching (Red state).

### Step 4.3: Implementation & Patch Generation (Green Phase)
Deploy `tdd-guide` to formulate necessary file changes:
1. Synthesize minimal code changes required to satisfy the failing test.
2. Stage changes into a `.patch` file in `harness/patches/`:

```bash
# Example git diff generation targeting harness patch staging
git diff --no-prefix > harness/patches/20260729-UC01-nav-hydration.patch
```

3. Verify patch syntax and formatting using standard `git apply --check` or patch verification utilities.

### Step 4.4: Build & Test Verification
If build or typecheck errors occur:
1. Deploy `build-error-resolver` to inspect build logs.
2. Adjust staged patch content in `harness/patches/` until all tests pass cleanly (Green state).

---

## 5. Deliverable Outputs

- Staged Patch File: `d:/dev/agy-os/harness/patches/<patch_name>.patch`
- Test Execution Log: Documented pass/fail metrics in `progress.md`.
- Staged Verification Script: Test runner scripts verifying patch behavior.

---

## 6. Next Stage Transition

Proceed to **UC01-C4: Review & Verification** (`guide/workflow/01-target-patch-management/c4-review-verification.md`).

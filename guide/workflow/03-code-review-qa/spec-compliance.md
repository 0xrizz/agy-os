---
title: "4-Step Spec Compliance Verification Algorithm"
audience: [AI-Agent, Human-Developer]
scope: "guide/workflow/03-code-review-qa/spec-compliance"
prerequisites:
  - "d:/dev/agy-os/guide/README.md"
  - "d:/dev/agy-os/AGENTS.md"
  - "d:/dev/agy-os/guide/workflow/03-code-review-qa/review-workflow.md"
related_commands:
  - "/review-pr"
  - "/review-code"
---

# 4-Step Spec Compliance Verification Algorithm

## 1. Overview & Purpose

The **4-Step Spec Compliance Verification Algorithm** is the core compliance engine executed by the `code-reviewer` subagent during code review and QA operations. It mathematically guarantees that code changes match active OpenSpec specification contracts, maintain core system invariants, fulfill all scenario behavioral clauses, and introduce **zero undocumented specification drift**.

```text
+-------------------------------------------------------------------------+
| 4-Step Spec Compliance Verification Algorithm                            |
| Execution Subagent: code-reviewer                                       |
| Target Scope: Staged Patches (harness/patches/) & Active Specs          |
+-------------------------------------------------------------------------+
                                    |
  +---------------------------------+---------------------------------+
  |                                                                   |
  v                                                                   v
[Step 1: Find Enforced Specs]                            [Step 2: Verify System Invariants]
  |                                                                   |
  v                                                                   v
[Step 3: Verify Requirements]                            [Step 4: Check Delta Compliance]
```

---

## 2. Comprehensive 4-Step Verification Algorithm

### Step 1: Find Enforced Specs

In Step 1, `code-reviewer` scans both the target codebase diff and `openspec/specs/` (as well as active delta specs in `openspec/changes/<change-name>/specs/`) to locate all enforced specifications governing the affected feature area.

- **Anchor Parsing**: Locates metadata comment blocks containing capability anchors:
  ```markdown
  <!-- id: user-auth -->
  <!-- enforced: true -->
  ```
- **Mapping Entrypoints**: Correlates file paths modified in the patch (e.g., `src/auth/jwt.ts`) to spec capability IDs (`user-auth`).
- **Enforcement Validation**: If `enforced: true` is set, all requirements and invariants in that spec MUST be strictly validated. If no spec exists for a modified module, `code-reviewer` flags a missing baseline spec warning.

---

### Step 2: Verify System Invariants

In Step 2, `code-reviewer` extracts system invariants from enforced specs and verifies whether implementation and architecture guarantee these invariants under all execution paths.

- **Invariant Extraction**: Scans specs for system invariant declarations:
  ```markdown
  ## System Invariants
  - System Invariant: JWT tokens MUST be signed using HS256 algorithm.
  - System Invariant: Target repository MUST NOT be mutated directly.
  ```
- **Code Flow Trace**: Traces control flow, configuration constants, and data paths to ensure invariants cannot be bypassed by edge cases, invalid inputs, or error states.
- **Verification Rule**: Any code path that violates a system invariant causes an immediate **FAIL** status.

---

### Step 3: Verify Requirements

In Step 3, `code-reviewer` audits every requirement (`### Requirement: <Name>`) and scenario (`#### Scenario: <Name>`) against unit/integration test suites and implementation code.

- **Clause Matching**: Extracts `- **WHEN**`, `- **THEN**`, and `- **AND**` clauses from each scenario block.
- **Test Assertion Audit**: Verifies that executable tests explicitly assert the `THEN` and `AND` expectations for each `WHEN` trigger.
- **Behavioral Path Verification**: Traces source code to confirm that business logic handles the scenario conditions correctly.

#### Verification Mapping Table
| Scenario ID | Spec Clause (WHEN/THEN) | Test File & Line | Status |
|:---|:---|:---|:---|
| `user-auth-01` | **WHEN** token expires **THEN** return HTTP 401 | `tests/auth.test.ts:45` | ✅ VERIFIED |
| `user-auth-02` | **WHEN** rate limit exceeded **THEN** return HTTP 429 | `tests/rate_limit.test.ts:28` | ✅ VERIFIED |

---

### Step 4: Check Delta Compliance

In Step 4, `code-reviewer` performs a strict diff alignment check between the git diff / staged patch and the active delta spec (`ADDED`, `MODIFIED`, `REMOVED` sections).

- **Added Code Coverage**: Verifies that every new function, endpoint, or feature introduced in the patch is documented under `## ADDED Requirements`.
- **Modified Behavior Coverage**: Verifies that any change to existing behavior is documented under `## MODIFIED Requirements`.
- **Removed Code Coverage**: Verifies that any deleted feature is documented under `## REMOVED Requirements`.
- **Undocumented Drift Prohibition**: If the git diff contains code changes or behavioral modifications that do NOT have a corresponding entry in the delta spec, `code-reviewer` flags **Undocumented Spec Drift Violation** and rejects the change.

---

## 3. Compliance Report Structure & Status Outcomes

`code-reviewer` emits a structured compliance evaluation section within the final review report:

```markdown
## Spec Compliance Verification Matrix

- **Step 1: Enforced Specs**: 2 specs located (`user-auth`, `rate-limiter`).
- **Step 2: System Invariants**: PASS (HS256 signature invariant intact).
- **Step 3: Requirement Scenarios**: PASS (8/8 scenarios verified in tests).
- **Step 4: Delta Compliance**: PASS (100% diff alignment, 0 undocumented drift).

### Final Status: SPEC COMPLIANT ✅
```

### Remediation Protocol on Failure
If any step fails:
1. `code-reviewer` flags the specific failing step and line number.
2. For Step 4 failure (undocumented drift), `spec-delta-writer` is invoked to update the delta spec or developer is prompted to remove undocumented changes.
3. Re-run verification until all 4 steps achieve PASS status.

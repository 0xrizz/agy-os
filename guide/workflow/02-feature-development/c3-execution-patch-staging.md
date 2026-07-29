---
title: "Phase C3: TDD Execution & Mandatory Patch Staging"
audience: [AI-Agent, Human-Developer]
scope: "guide/workflow/02-feature-development/c3-execution-patch-staging"
prerequisites:
  - "d:/dev/agy-os/guide/README.md"
  - "d:/dev/agy-os/AGENTS.md"
  - "d:/dev/agy-os/guide/workflow/02-feature-development/c2-proposal-delta-spec.md"
related_commands:
  - "/opsx-apply"
---

# Phase C3: TDD Execution & Mandatory Patch Staging

## 1. Overview & Objectives

**Phase C3 (TDD Execution & Patch Staging)** is the execution phase where proposed feature specifications are translated into executable test suites, implemented following Test-Driven Development (TDD) principles, and safely staged as patch files under `d:/dev/agy-os/harness/patches/`.

```text
+-------------------------------------------------------------------------+
| Phase C3: TDD Execution & Patch Staging                                 |
| Command: /opsx-apply                                                    |
| Key Subagents: spec-to-test, tdd-guide, build-error-resolver             |
| Pipeline Skill: orch-spec-delta                                         |
| Invariant: Mandatory Patch Staging in harness/patches/                  |
+-------------------------------------------------------------------------+
```

---

## 2. Key Subagents & Pipeline Skill Integration

| Subagent / Skill | Role & Operational Responsibility |
|:---|:---|
| `spec-to-test` | Automatically parses scenario blocks (`- **WHEN**`, `- **THEN**`, `- **AND**`) from delta specs and generates executable TDD test skeletons. |
| `tdd-guide` | Orchestrates the Red-Green-Refactor TDD cycle, writing minimal code to make tests pass. |
| `build-error-resolver` | Intercepts build and compilation errors, providing targeted fixes for build configuration and type errors. |
| `orch-spec-delta` | Pipeline orchestration skill that ties delta spec parsing, TDD generation, patch staging, and verification loops together. |

---

## 3. Automated Spec-to-Test TDD Generation

The `spec-to-test` subagent parses scenario clauses from the active delta spec (`openspec/changes/<change-name>/specs/`) and constructs executable unit/integration test suites.

### Spec Scenario Input
```markdown
#### Scenario: Rate Limit Exceeded
- **WHEN** client sends more than 100 requests within 60 seconds
- **THEN** API returns HTTP 429 Too Many Requests response
- **AND** rate limit header `Retry-After` is populated.
```

### Generated Test Output (`tests/auth/rate_limit.test.ts`)
```typescript
import { describe, it, expect } from 'vitest';

describe('Auth Rate Limiting [spec: user-auth]', () => {
  it('should return 429 and Retry-After header when limit exceeded', async () => {
    // WHEN: client sends more than 100 requests within 60 seconds
    for (let i = 0; i < 100; i++) {
      await makeAuthRequest();
    }
    const res = await makeAuthRequest();

    // THEN: API returns HTTP 429 Too Many Requests response
    expect(res.status).toBe(429);
    // AND: rate limit header Retry-After is populated
    expect(res.headers.get('retry-after')).toBeTruthy();
  });
});
```

---

## 4. Mandatory Patch Staging Invariant

All code modifications targeting the **Target Repository (`d:/CLAUDE-PROJECT/website`)** **MUST** strictly follow the Target Modification via Patch Staging rule:

1. **NO Direct Writes**: AI agents MUST NOT create, edit, or delete files directly inside `d:/CLAUDE-PROJECT/website`.
2. **Patch Creation**: All changes MUST be captured as patch/diff files using forward-slash path references.
3. **Patch Staging Location**: Patches MUST be saved in `d:/dev/agy-os/harness/patches/` using descriptive names:
   - Format: `d:/dev/agy-os/harness/patches/<YYYYMMDD>-<change-name>-<feature>.patch`

### Patch Creation Workflow
```bash
# Generate patch file from staged modifications targeting website repo
git diff > d:/dev/agy-os/harness/patches/20260729-user-auth-rate-limit.patch
```

---

## 5. Sequential Task Execution Checklist

During Phase C3 execution, agents update `openspec/changes/<change-name>/tasks.md` sequentially:

- Check off tasks (`- [x]`) strictly as work is completed.
- Never mark a task complete without executing its co-located **Verification Step**.
- If a build failure occurs, invoke `build-error-resolver` immediately to achieve a clean build before advancing.

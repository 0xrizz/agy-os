---
title: "Semantic Spec Fuzzing with Spec-Fuzzer"
audience: [AI-Agent, Human-Developer]
scope: "guide/workflow/04-security-audit/spec-fuzzing"
prerequisites:
  - "d:/dev/agy-os/guide/README.md"
  - "d:/dev/agy-os/AGENTS.md"
  - "d:/dev/agy-os/guide/workflow/04-security-audit/security-workflow.md"
related_commands:
  - "/security-scan"
  - "/fuzz-spec"
---

# Semantic Spec Fuzzing with Spec-Fuzzer

## 1. Overview & Concepts

**Semantic Spec Fuzzing** is an advanced QA and security testing technique performed by the `spec-fuzzer` subagent. Unlike traditional random byte fuzzing, semantic spec fuzzing derives intelligent edge-case vectors, boundary conditions, malformed payloads, and invalid state transitions directly from OpenSpec scenario specifications (`- **WHEN**`, `- **THEN**`, `- **AND**`).

```text
+-------------------------------------------------------------------------+
| Semantic Spec Fuzzing Workflow                                          |
| Key Subagent: spec-fuzzer                                               |
| Input: OpenSpec Scenarios (WHEN / THEN clauses)                         |
| Output: Edge-case fuzz vectors, failure reports, regression test cases  |
+-------------------------------------------------------------------------+
```

---

## 2. Derivation of Fuzz Vectors from OpenSpec Scenarios

`spec-fuzzer` analyzes scenario clause syntax in `openspec/specs/` or `openspec/changes/<change-name>/specs/` to automatically generate mutation strategies:

```markdown
#### Scenario: Rate Limit Exceeded
- **WHEN** client sends more than 100 requests within 60 seconds
- **THEN** API returns HTTP 429 Too Many Requests response
```

### Generated Semantic Fuzz Strategies

| Fuzzing Mutation Strategy | Input Vector Mutation | Expected Behavioral Guardrail |
|:---|:---|:---|
| **Boundary Value Fuzzing** | Send exactly 99, 100, and 101 requests at 59.99 seconds | 100th request succeeds; 101st request returns 429. |
| **Clock / Window Manipulation** | Send 50 requests, pause 60 seconds, send 51 requests | Counter resets cleanly; all 101 requests succeed. |
| **Header Injection Vector** | Send `X-Forwarded-For: 127.0.0.1 (CRLF) Set-Cookie: admin=true` | Header injection stripped; IP extracted cleanly. |
| **Concurrent Spike Vector** | Burst 200 concurrent requests across 10 parallel threads | Gateway handles burst safely without unhandled exception or memory leak. |

---

## 3. `spec-fuzzer` Execution Lifecycle

### Step 1: Scenario Extraction
`spec-fuzzer` parses active specs and extracts target input types, data limits, and state preconditions.

### Step 2: Fuzz Suite Generation
Generates a dynamic fuzzing harness file in test working memory (`tests/fuzz/auth-rate-limit.fuzz.ts`).

### Step 3: Campaign Execution
Runs fuzzing campaign using project test runner (e.g., `vitest` / `jest` with fuzz iterations).

### Step 4: Failure Triaging & TDD Integration
If an unhandled exception, crash, or invariant failure is discovered during fuzzing:
- `spec-fuzzer` captures the exact seed and minimal reproduction payload.
- Automatically constructs a failing TDD regression test case in `tests/fuzz/repro-*.test.ts`.
- Updates security report with remediation recommendations.

---

## 4. Fuzzing Report & Integration

`spec-fuzzer` appends fuzzing findings to the security audit artifact:

```markdown
# Spec Fuzzing Audit Report

## Campaign Parameters
- Target Spec: `user-auth` (Rate Limiting)
- Total Fuzz Iterations: 1,000
- Mutation Vectors: Boundary, Concurrent Burst, Header Injection

## Results
- **Pass Rate**: 99.8% (998/1000 passed)
- **Edge-Case Bugs Discovered**: 1 (Handled gracefully via auto-generated TDD test)
- **Reproduction Test**: `tests/fuzz/repro-burst-race.test.ts`
```

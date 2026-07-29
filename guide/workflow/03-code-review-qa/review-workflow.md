---
title: "Multi-Agent Parallel Code Review & QA Workflow"
audience: [AI-Agent, Human-Developer]
scope: "guide/workflow/03-code-review-qa/review-workflow"
prerequisites:
  - "d:/dev/agy-os/guide/README.md"
  - "d:/dev/agy-os/AGENTS.md"
related_commands:
  - "/review-pr"
  - "/review-code"
  - "/pr"
---

# Multi-Agent Parallel Code Review & QA Workflow

## 1. Overview & Architecture

Use Case 03 (**Code Review & Quality Assurance**) establishes a multi-agent parallel review pipeline designed to evaluate staged patch files, code quality, security posture, test coverage, and specification compliance without blocking or single-agent context exhaustion.

```text
                               +-------------------------+
                               | Lead Review Orchestrator|
                               +-------------------------+
                                            |
         +----------------------------------+----------------------------------+
         |                                  |                                  |
         v                                  v                                  v
+------------------+              +-------------------+              +--------------------+
|  code-reviewer   |              | security-reviewer |              |  pr-test-analyzer  |
| - Immutability   |              | - SAST Scanning   |              | - Scenario Coverage|
| - Coding Style   |              | - Secret Leakage  |              | - Assertion Depth  |
| - 4-Step Check   |              | - OWASP Top 10    |              | - Flaky Test Audit |
+------------------+              +-------------------+              +--------------------+
         |                                  |                                  |
         +----------------------------------+----------------------------------+
                                            |
                                            v
                               +-------------------------+
                               | Unified Review Report   |
                               +-------------------------+
```

---

## 2. Reviewer Subagents & Focus Areas

| Subagent | Primary Scope | Evaluation Criteria |
|:---|:---|:---|
| `code-reviewer` | Code Quality & Spec Compliance | Executes the 4-Step Spec Compliance Verification Algorithm, checks immutability rules, function length (<50 lines), file size (<800 lines), and early returns. |
| `security-reviewer` | Security & Vulnerability Scan | Audits code for SQL injection, XSS, unsafe deserialization, missing auth guards, hardcoded secrets, and dependency CVEs. |
| `pr-test-analyzer` | Test Coverage & Quality | Audits test suite coverage against OpenSpec scenario clauses (`- **WHEN**`, `- **THEN**`), checks edge cases, and flags flaky assertions. |

---

## 3. Delegation Completion Contract

All review orchestration workflows MUST strictly adhere to the **Delegation Completion Contract** defined in `d:/dev/agy-os/AGENTS.md`:

1. **Ownership of Collection**: The orchestrating agent that dispatches `code-reviewer`, `security-reviewer`, or `pr-test-analyzer` in parallel **MUST** wait for all child tasks to complete, collect their structured outputs, and integrate them into a unified report.
2. **No Fire-and-Forget**: Ending a turn while child review agents are still running is strictly forbidden. Spawning tasks and returning "waiting for background agents" orphans child results.
3. **Single Deliverable**: The final integrated review report IS the deliverable.

---

## 4. Operational Workflow (/review-pr & /review-code)

### Step 1: Trigger Parallel Review
Run the PR review slash command:
```bash
/review-pr
```

### Step 2: Parallel Task Dispatch
The review orchestrator dispatches subagent review tasks concurrently:
```markdown
# Parallel Task Execution
1. Subagent code-reviewer: Perform 4-step spec compliance check and code style audit on staged patch.
2. Subagent security-reviewer: Conduct SAST vulnerability scan and secret leakage check on staged patch.
3. Subagent pr-test-analyzer: Audit unit/integration test coverage against delta spec scenarios.
```

### Step 3: Synthesis & Report Generation
The orchestrator compiles all subagent findings into a structured review report:

```markdown
# Code Review & QA Verification Report

## 1. Summary Status: APPROVED WITH MINOR FEEDBACK

## 2. Spec Compliance Audit (code-reviewer)
- [x] Step 1: Enforced specs identified (`user-auth`)
- [x] Step 2: System Invariants verified (HS256 JWT signature mandatory)
- [x] Step 3: Requirements verified (Scenario clauses mapped to test suites)
- [x] Step 4: Delta Compliance verified (Zero undocumented spec drift)

## 3. Security Vulnerability Scan (security-reviewer)
- Status: CLEAR (0 High, 0 Medium, 0 Low)
- Secret Scanning: Clean

## 4. Test Coverage Analysis (pr-test-analyzer)
- Delta Scenario Coverage: 100% (4/4 scenarios covered)
- Assertion Quality: High
```

---

## 5. Review Criteria Checklist

Before marking code review complete, verify:
- [ ] Immutable data patterns used (no in-place mutations).
- [ ] No deep nesting (>4 levels).
- [ ] All functions under 50 lines; files under 800 lines.
- [ ] All 4 steps of Spec Compliance algorithm verified.
- [ ] Zero unhandled errors or swallowed promises.
- [ ] Delegation Completion Contract satisfied.

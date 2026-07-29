---
title: "Phase C4: Multi-Agent Parallel Review & Verification"
audience: [AI-Agent, Human-Developer]
scope: "guide/workflow/02-feature-development/c4-review-verification"
prerequisites:
  - "d:/dev/agy-os/guide/README.md"
  - "d:/dev/agy-os/AGENTS.md"
  - "d:/dev/agy-os/guide/workflow/02-feature-development/c3-execution-patch-staging.md"
related_commands:
  - "/review-pr"
---

# Phase C4: Multi-Agent Parallel Review & Verification

## 1. Overview & Objectives

**Phase C4 (Review & Verification)** executes comprehensive quality assurance, security auditing, and specification compliance verification prior to delivery. In this phase, multi-agent parallel review pipelines audit staged patch files, verify system invariants, analyze test coverage, and stage pull request draft descriptions.

```text
+-------------------------------------------------------------------------+
| Phase C4: Multi-Agent Parallel Review & Verification                    |
| Commands: /review-pr, /review-code                                      |
| Parallel Subagents: code-reviewer, security-reviewer, pr-test-analyzer  |
| Output: Multi-agent verification report & PR draft                      |
+-------------------------------------------------------------------------+
```

---

## 2. Multi-Agent Parallel Review Pipeline

To ensure rigorous quality without context bottlenecking, Phase C4 dispatches three specialized review agents concurrently:

```text
                        +----------------------+
                        | Phase C4 Review Hub  |
                        +----------------------+
                                   |
         +-------------------------+-------------------------+
         |                         |                         |
         v                         v                         v
+------------------+     +-------------------+     +--------------------+
|  code-reviewer   |     | security-reviewer |     |  pr-test-analyzer  |
| 4-Step Spec Check|     | Vulnerability Scan|     | Test Coverage Audit|
+------------------+     +-------------------+     +--------------------+
         |                         |                         |
         +-------------------------+-------------------------+
                                   |
                                   v
                        Unified Verification Report
```

| Agent | Focus Area | Primary Tasks |
|:---|:---|:---|
| `code-reviewer` | Code Quality & Spec Compliance | Executes 4-Step Spec Compliance Check, audits immutability rules, checks coding standards. |
| `security-reviewer` | Security & Vulnerability Scan | Scans patch files for hardcoded credentials, injection vectors, OWASP Top 10, and unsafe calls. |
| `pr-test-analyzer` | Test Coverage & Quality | Audits test suite coverage against delta spec scenarios, verifies edge-case test assertions. |

---

## 3. Staged Patch Verification Workflow

Review agents inspect staged patch files located in `d:/dev/agy-os/harness/patches/` rather than modifying live codebase state:

1. **Patch Integrity Audit**: Verify patch format, forward-slash file paths, and absence of target directory mutations.
2. **Spec Compliance**: `code-reviewer` checks that every modified or added requirement in `openspec/changes/<change-name>/specs/` has matching code and test coverage.
3. **Build & Test Verification**: Execute project build and test commands to verify zero build regressions:
   ```bash
   # Run tests against target repo with staged patch applied
   npm test -- --filter=auth
   ```

---

## 4. PR Draft Creation via MCP GitHub

Once all parallel review lanes pass without critical defects, the lead agent generates a PR description and draft payload via MCP `github`:

```markdown
## Change Description
Implemented Refresh Token Rotation and Rate Limiting for Auth Gateway.

## Spec Delta Impact
- **ADDED**: `user-auth` Rate Limiting (100 req/min/IP)
- **MODIFIED**: `user-auth` Token Verification (Refresh Token Rotation)
- **REMOVED**: `user-legacy-session` Cookie Auth Fallback

## Verification Evidence
- [x] All unit/integration tests passing (42 tests)
- [x] 4-Step Spec Compliance Verification passed
- [x] Security Review scan clear (0 vulnerabilities)
- [x] Patch staged: `d:/dev/agy-os/harness/patches/20260729-user-auth-rate-limit.patch`
```

---

## 5. Transition to Phase C5

Upon successful multi-agent review completion:
- Save verification report to `.agents/<agent-name>/verification-report.md`.
- Prepare patch bundle and PR description for **HITL Gate 2** approval in Phase C5.

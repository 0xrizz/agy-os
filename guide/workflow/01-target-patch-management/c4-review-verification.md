---
title: "UC01-C4: Review & Verification"
audience:
  - "AI-Agent"
  - "Human-Developer"
scope: "workflow/01-target-patch-management/c4"
prerequisites:
  - "/review-pr"
  - "Staged patch in harness/patches/"
  - "Green test suite results"
related_commands:
  - "/review-pr"
  - "code-reviewer"
  - "security-reviewer"
  - "pr-test-analyzer"
---

# UC01-C4: Review & Verification

## 1. Overview & Operational Scope

Stage C4 (Review & Verification) executes a multi-agent review pipeline against staged patch deliverables before delivery or merging. It deploys specialized agents (`code-reviewer`, `security-reviewer`, `pr-test-analyzer`) to run a rigorous 4-step spec compliance verification protocol.

---

## 2. Key Agents & MCP Tooling

| Role / Tool | Identity / Command | Operational Purpose |
|:---|:---|:---|
| Command | `/review-pr` | Triggers automated multi-agent code and spec review. |
| Primary Reviewer | `code-reviewer` | Conducts code quality audit and the 4-step spec compliance check. |
| Security Reviewer | `security-reviewer` | Audits vulnerability hazards, secret leaks, and security invariants. |
| Test Reviewer | `pr-test-analyzer` | Validates test coverage quality, edge case handling, and assertion strength. |

---

## 3. The 4-Step Spec Compliance Check

The `code-reviewer` agent **MUST** execute the 4-step spec compliance protocol on every staged patch file in `d:/dev/agy-os/harness/patches/`:

```text
┌────────────────────────────────────────────────────────┐
│           4-STEP SPEC COMPLIANCE CHECK                 │
├────────────────────────────────────────────────────────┤
│ Step 1: Context & Scope Check                          │
│   ── Verify patch targets only declared scope paths.   │
├────────────────────────────────────────────────────────┤
│ Step 2: Invariant & Contract Verification              │
│   ── Confirm no broken invariants or API contracts.    │
├────────────────────────────────────────────────────────┤
│ Step 3: Delta Spec Alignment                           │
│   ── Ensure patch behavior matches spec requirements.  │
├────────────────────────────────────────────────────────┤
│ Step 4: Patch Integrity & Rollback Verification         │
│   ── Validate patch dry-run apply and clean rollback.  │
└────────────────────────────────────────────────────────┘
```

### Detailed Protocol Steps:

#### Step 1: Context & Scope Check
- Inspect staged `.patch` file in `harness/patches/`.
- Ensure files touched by the patch match the Spec Impact Table in Stage C2.
- Detect and flag any unapproved "while-I-am-here" refactoring outside scope.

#### Step 2: Invariant & Contract Verification
- Check interface declarations, exported types, and return values.
- Verify immutability requirements and error boundary handling.
- Confirm zero direct modification of target repository files outside patch staging.

#### Step 3: Delta Spec Alignment
- Compare patch behavior against spec scenarios (`WHEN`, `THEN`, `AND` clauses).
- Verify edge case coverage (null/undefined checks, boundary bounds, empty collections).

#### Step 4: Patch Integrity & Rollback Verification
- Test patch application via dry run against target tree:
  `git apply --check harness/patches/<patch_name>.patch`
- Verify non-destructive rollback guarantee: confirm patch can be cleanly reversed (`git apply -R`).

---

## 4. Security Audit & Test Analysis

### 4.1 Security Audit (`security-reviewer`)
- Scan patch content for hardcoded credentials, secret keys, or tokens.
- Inspect input validation boundaries for injection risks.
- Verify CORS, CSP, or authentication guardrails if applicable.

### 4.2 Test Analysis (`pr-test-analyzer`)
- Audit test suite assertion quality (ensure tests fail on bad inputs, not just pass blindly).
- Confirm test coverage meets project targets.

---

## 5. Review Findings & Gate Preparation

Upon completing the review pipeline:
1. `code-reviewer` generates a Review Finding Summary.
2. If blocking issues or spec deviations exist, return to Stage C3 for patch refinement.
3. If all checks pass cleanly, flag the patch as **Approved for Delivery (HITL Gate 2 Ready)**.

---

## 6. Next Stage Transition

Proceed to **UC01-C5: Delivery, Delta Spec Writing, Sync & Archiving** (`guide/workflow/01-target-patch-management/c5-delivery-archiving.md`).

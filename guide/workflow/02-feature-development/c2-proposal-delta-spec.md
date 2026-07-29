---
title: "Phase C2: Proposal & Delta Spec Definition"
audience: [AI-Agent, Human-Developer]
scope: "guide/workflow/02-feature-development/c2-proposal-delta-spec"
prerequisites:
  - "d:/dev/agy-os/guide/README.md"
  - "d:/dev/agy-os/AGENTS.md"
  - "d:/dev/agy-os/guide/workflow/02-feature-development/c1-exploration-analysis.md"
related_commands:
  - "/opsx-propose"
---

# Phase C2: Proposal & Delta Spec Definition

## 1. Overview & Objectives

**Phase C2 (Proposal & Delta Spec Definition)** transforms baseline exploration findings into a formal OpenSpec proposal package for feature development. During this phase, agents define system architectural decisions, construct delta specifications (`ADDED`, `MODIFIED`, `REMOVED`), write stateful task checklists, and trigger **Human-in-the-Loop (HITL) Gate 1** for developer approval.

```text
+-------------------------------------------------------------------------+
| Phase C2: Proposal & Delta Spec Definition                              |
| Command: /opsx-propose <change-name>                                    |
| Key Subagents: planner, architect                                       |
| Output: proposal.md, specs/ (delta), design.md, tasks.md                |
| Gate: Human-in-the-Loop (HITL) Gate 1 Approval                          |
+-------------------------------------------------------------------------+
```

---

## 2. Key Subagents & Roles

| Subagent | Function & Artifact Responsibility |
|:---|:---|
| `planner` | Ingests baseline specs, calculates **Spec Impact Tables**, and writes `proposal.md` and `tasks.md` with explicit verification steps. |
| `architect` | Evaluates architectural trade-offs, drafts 4-column decision matrices, and specifies system invariants in `design.md`. |

---

## 3. Spec Impact Analysis & Delta Spec Structure

The `planner` subagent constructs a comprehensive **Spec Impact Table** within `proposal.md` to map proposed functional changes against system capabilities:

### Spec Impact Table Example

| Capability ID | Section / Requirement | Change Type | Impact Description |
|:---|:---|:---|:---|
| `user-auth` | Token Verification | `MODIFIED` | Add support for refresh token rotation alongside access token verification |
| `user-auth` | Rate Limiting | `ADDED` | Enforce 100 req/min rate limit per IP on auth endpoints |
| `user-legacy-session` | Cookie Auth | `REMOVED` | Deprecate fallback cookie-based authentication |

### Delta Spec Schema (`openspec/changes/<change-name>/specs/<capability>/spec.md`)

Delta specs MUST strictly structure changes under `## ADDED Requirements`, `## MODIFIED Requirements`, and `## REMOVED Requirements`:

```markdown
<!-- id: user-auth -->
# Delta Spec: User Authentication Refresh & Rate Limiting

## ADDED Requirements

### Requirement: Auth Rate Limiting
The API gateway MUST limit authentication requests to 100 per minute per IP address.

#### Scenario: Rate Limit Exceeded
- **WHEN** client sends more than 100 requests within 60 seconds
- **THEN** API returns HTTP 429 Too Many Requests response
- **AND** rate limit header `Retry-After` is populated.

## MODIFIED Requirements

### Requirement: Token Verification
The authentication handler MUST accept access tokens and handle refresh token rotation upon expiration.

#### Scenario: Refresh Token Rotation
- **WHEN** access token expires and valid refresh token is submitted
- **THEN** new access token and new rotated refresh token are issued
- **AND** old refresh token is invalidated immediately.

## REMOVED Requirements

### Requirement: Legacy Cookie Session Fallback
- Deprecated legacy cookie session fallback handler is removed.
```

---

## 4. Proposal Package Artifact Standard

Every `/opsx-propose` run generates a standardized artifact package inside `openspec/changes/<change-name>/`:

```text
openspec/changes/<change-name>/
├── proposal.md       # High-level goals, Spec Impact Table, and scope
├── design.md         # 4-column decision matrix & Non-Destructive Rollback Plan
├── tasks.md          # Stateful checklist with verification steps
└── specs/            # Active delta specifications
    └── <capability>/
        └── spec.md
```

### Design Decision Matrix (`design.md`)

`design.md` MUST include a 4-column decision matrix:

| Decision | Selected Option | Rationale | Alternatives Considered |
|:---|:---|:---|:---|
| Token Rotation Store | Redis KV | Sub-millisecond latency & native TTL expiration | PostgreSQL table (higher latency), In-memory Map (not distributed) |

---

## 5. Human-in-the-Loop (HITL) Gate 1 Approval

Before any implementation work begins in Phase C3, the proposal MUST pass **HITL Gate 1**:

1. **Agent Action**: Present `proposal.md`, `design.md`, and `tasks.md` to developer.
2. **Developer Action**: Review spec impact, design decisions, and task scope.
3. **Approval Status**:
   - ✅ **Approved**: Proceed to Phase C3 (`/opsx-apply`).
   - ❌ **Revision Requested**: Agent refines proposal via `planner` / `architect` without touching code.

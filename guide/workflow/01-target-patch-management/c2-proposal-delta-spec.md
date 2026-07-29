---
title: "UC01-C2: Proposal & Spec Impact Planning"
audience:
  - "AI-Agent"
  - "Human-Developer"
scope: "workflow/01-target-patch-management/c2"
prerequisites:
  - "/opsx-propose"
  - "HITL Gate 1 approval"
  - "Stage C1 analysis output"
related_commands:
  - "/opsx-propose"
  - "planner"
  - "architect"
  - "sequential-thinking"
---

# UC01-C2: Proposal & Spec Impact Planning

## 1. Overview & Operational Scope

Stage C2 (Proposal & Spec Impact Planning) translates exploration findings from Stage C1 into a structured change proposal and delta specification. It defines system architectural decisions, specifies exact modifications required for target functionality, and sets up Human-in-the-Loop (HITL) Gate 1 for plan authorization.

---

## 2. Key Agents & MCP Tooling

| Role / Tool | Identity / Command | Operational Purpose |
|:---|:---|:---|
| Command | `/opsx-propose` | Generates delta spec proposals and design change artifacts. |
| Lead Agent | `planner` | Formulates step-by-step implementation plans and task breakdown schedules. |
| Support Agent | `architect` | Evaluates system design tradeoffs, invariants, and architectural impact. |
| MCP Tool | `sequential-thinking` | Performs deep multi-step reasoning for risk assessment and dependency analysis. |

---

## 3. Proposal Formulation Protocol

### Step 3.1: Command Triggering
Execute `/opsx-propose` to initiate proposal creation in the harness environment.

```bash
# Example proposal generation command
/opsx-propose change="refactor-target-navigation" rationale="Improve state hydration speed"
```

### Step 3.2: Architecture & Decision Matrix
Deploy `architect` and use `sequential-thinking` to construct the Decision Matrix table:

| Decision | Selected Option | Rationale | Alternatives Considered |
|:---|:---|:---|:---|
| Patch Staging Strategy | External `.patch` file in `harness/patches/` | Preserves Target Repo Read-Only invariant | Direct branch editing (violates AGENTS.md Rule 1) |
| Delta Spec Structure | Per-PR Delta File | Isolates specification changes per pull request | Global spec overwrite (risk of spec drift) |

### Step 3.3: Spec Impact Analysis Table
The proposal must include a Spec Impact Table mapping requested changes to target files and spec delta outputs:

| Target File (`d:/CLAUDE-PROJECT/website`) | Spec Status | Impact Description | Staged Patch File |
|:---|:---|:---|:---|
| `src/components/Nav.tsx` | Modified | Update navigation state hook handling | `harness/patches/0001-nav-state.patch` |
| `src/utils/auth.ts` | Intact | Read-only import dependency | None |

---

## 4. Mandatory Human-in-the-Loop (HITL) Gate 1 Approval

Before any implementation work or test creation begins in Stage C3, **HITL Gate 1** must be satisfied.

### Gate 1 Criteria:
1. **Proposal Completeness**: Proposal contains clear rationale, step-by-step plan, and Spec Impact table.
2. **Read-Only Target Guardrail Check**: Plan explicitly confirms that no direct edits will be made to `d:/CLAUDE-PROJECT/website` and all code outputs will be staged inside `d:/dev/agy-os/harness/patches/`.
3. **Per-PR Delta Commitment**: Plan mandates per-PR delta spec generation via `spec-delta-writer`.
4. **Developer Sign-off**: Human developer explicitly approves the plan via review response or CLI approval prompt.

---

## 5. Artifact Outputs

- Proposal Document: `docs/OBJ-XX/artifacts/proposal.md` or OpenSpec change proposal.
- Updated `task.md` checklist with sequential execution steps and verification milestones.

---

## 6. Next Stage Transition

Upon obtaining HITL Gate 1 approval, proceed to **UC01-C3: TDD Execution & Patch Staging** (`guide/workflow/01-target-patch-management/c3-execution-patch-staging.md`).

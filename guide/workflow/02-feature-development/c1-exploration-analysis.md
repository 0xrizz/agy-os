---
title: "Phase C1: Exploration & System Baseline Analysis"
audience: [AI-Agent, Human-Developer]
scope: "guide/workflow/02-feature-development/c1-exploration-analysis"
prerequisites:
  - "d:/dev/agy-os/guide/README.md"
  - "d:/dev/agy-os/AGENTS.md"
related_commands:
  - "/opsx-explore"
---

# Phase C1: Exploration & System Baseline Analysis

## 1. Overview & Objectives

**Phase C1 (Exploration & Baseline Analysis)** is the entry phase of the OpenSpec Spec-Driven Development (SDD) lifecycle for new features and capability enhancements under Use Case 02 (Feature Development).

The primary objective of Phase C1 is to explore the codebase, discover target system behavior, analyze code entrypoints, and establish baseline specifications before proposing any structural or functional modifications.

```text
+-------------------------------------------------------------------------+
| Phase C1: Exploration & Baseline Mining                                |
| Command: /opsx-explore                                                  |
| Key Subagents: code-explorer, spec-miner                                |
| Boundary Invariant: READ-ONLY target repo (d:/CLAUDE-PROJECT/website)   |
+-------------------------------------------------------------------------+
                                    |
                                    v
                 Outputs: Baseline Specs & Entrypoint Maps
```

---

## 2. Key Subagents & Responsibilities

| Subagent | Role & Operation | Execution Tools / MCP |
|:---|:---|:---|
| `code-explorer` | Conducts deep code exploration, dependency graph traversal, AST parsing, and entrypoint identification in the target codebase. | `filesystem` (read-only), `code_search` |
| `spec-miner` | Analyzes existing code logic, domain models, and API endpoints to mine baseline specifications (`openspec/specs/`) when no formal spec exists. | `sequential-thinking`, `context7` |

---

## 3. Strict Read-Only Boundary Invariant

During Phase C1 (and all exploration tasks), AI agents **MUST** strictly adhere to the Target Repository Boundary Invariant defined in `d:/dev/agy-os/AGENTS.md`:

1. **Target Repository (`d:/CLAUDE-PROJECT/website`)**: **READ-ONLY**.
   - Agents are strictly prohibited from writing, editing, or deleting files directly in the target repository.
2. **Harness Repository (`d:/dev/agy-os`)**: **READ & WRITE**.
   - Analysis reports, exploration notes, and mined baseline specs are written to the harness workspace under `openspec/` or agent working directories.

---

## 4. Operational Workflow & Tool Invocation

### Step 1: Trigger Exploration Command
Initiate exploration using the OpenSpec explore slash command:
```bash
/opsx-explore
```

### Step 2: Context Resolution via Context7 MCP
When analyzing third-party libraries, frameworks, or system APIs during exploration, agents **MUST** use Context7 MCP per global rules:
```typescript
// 1. Resolve library ID
resolve-library-id({ libraryName: "next", query: "app router layout server components" })

// 2. Query documentation
query-docs({ libraryId: "/vercel/next.js", query: "app router layout server components" })
```

### Step 3: Baseline Spec Mining
If the target feature area lacks pre-existing OpenSpec documentation, `spec-miner` scans the codebase and generates baseline specification markdown files with anchored requirement IDs under `openspec/specs/<capability>/spec.md`:

```markdown
<!-- id: auth-jwt-session -->
<!-- enforced: true -->
# Capability: Auth JWT Session

## 1. System Invariants
- System Invariant: Tokens must be signed with HS256 algorithm and verified on every request.

## 2. Requirements

### Requirement: Token Verification
The system MUST verify JWT signature and expiration timestamp.

#### Scenario: Valid JWT Token Presented
- **WHEN** client sends a request with header `Authorization: Bearer <valid-jwt>`
- **THEN** request is authenticated and passed to route handler
- **AND** user context is attached to request scope.
```

---

## 5. Phase Exit Criteria & Artifacts

Before proceeding to Phase C2 (Proposal & Delta Spec), verify that:
- [ ] Target codebase entrypoints and affected modules are fully identified.
- [ ] Baseline specs are generated/located under `openspec/specs/`.
- [ ] No files in `d:/CLAUDE-PROJECT/website` have been altered.
- [ ] Exploration summary report is generated.

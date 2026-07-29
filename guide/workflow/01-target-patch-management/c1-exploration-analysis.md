---
title: "UC01-C1: Exploration & Baseline Mining"
audience:
  - "AI-Agent"
  - "Human-Developer"
scope: "workflow/01-target-patch-management/c1"
prerequisites:
  - "/opsx-explore"
  - "context7 MCP"
  - "Read-Only workspace policy"
related_commands:
  - "/opsx-explore"
  - "code-explorer"
  - "spec-miner"
  - "context7"
---

# UC01-C1: Exploration & Baseline Mining

## 1. Overview & Operational Scope

Stage C1 (Exploration & Baseline Mining) initiates the Target Patch Management workflow (`UC01`). In this stage, AI agents and developers perform non-destructive code analysis, AST parsing, and implicit specification mining against the Target Repository (`d:/CLAUDE-PROJECT/website`).

The objective is to establish an accurate baseline understanding of the target codebase before proposing any changes, without violating workspace access boundaries.

---

## 2. Mandatory Read-Only Policy & Governance

Per `AGENTS.md` Rule 1, the Target Repository (`d:/CLAUDE-PROJECT/website`) is strictly **READ-ONLY**.

- **Permitted Operations**: File inspection, read-only search, AST analysis, static dependency tracing, and spec extraction.
- **Prohibited Operations**: Direct file edits, line insertions, file deletions, or terminal commands that mutate `d:/CLAUDE-PROJECT/website`.
- **Harness Scope**: All analysis logs, exploration artifacts, and temporary notes must be saved inside `d:/dev/agy-os/.agents/` or `d:/dev/agy-os/docs/`.

---

## 3. Key Agents & MCP Tooling

| Role / Tool | Identity / Command | Operational Purpose |
|:---|:---|:---|
| Command | `/opsx-explore` | Triggers the exploration pipeline for OpenSpec workflow. |
| Primary Agent | `code-explorer` | Scans codebase layout, traces module dependencies, and maps AST symbols. |
| Specialist Agent | `spec-miner` | Extracts implicit business rules, data schemas, and API contracts. |
| MCP Tool | `context7` | Fetches up-to-date documentation for third-party libraries and SDKs via `resolve-library-id` and `query-docs`. |
| MCP Tool | `filesystem` | Performs read-only inspection of target source files. |

---

## 4. Step-by-Step Execution Guide

### Step 4.1: Command Initialization
Invoke `/opsx-explore` to initialize the exploration context for the assigned objective or feature area.

```bash
# Example command invocation in harness environment
/opsx-explore scope="d:/CLAUDE-PROJECT/website/src/components" intent="Audit navigation state management"
```

### Step 4.2: Codebase Structure & AST Analysis
Deploy `code-explorer` to inspect target directory structure and generate dependency maps:
1. Parse top-level module organization under `d:/CLAUDE-PROJECT/website`.
2. Trace import dependency chains to identify critical shared utilities.
3. Identify entry points and boundary interfaces.

### Step 4.3: Implicit Spec Mining
Deploy `spec-miner` to extract existing implicit specifications:
1. Locate type definitions, interface contracts, and schema validators.
2. Document invariant rules (e.g., immutability constraints, error handling boundaries).
3. Identify existing test coverage and gap areas.

### Step 4.4: Context Documentation Lookup
If target components rely on external libraries (e.g., Next.js, React, Tailwind):
1. Call `context7:resolve-library-id` with the library name.
2. Call `context7:query-docs` to retrieve accurate, version-specific API guidelines.

---

## 5. Artifact Output & Verification

At the conclusion of Stage C1, the exploration phase must produce:
1. **Exploration Report**: Saved in harness working directory (e.g., `d:/dev/agy-os/.agents/<agent_folder>/analysis.md`).
2. **Baseline Invariants List**: Summary of target codebase invariants to preserve.
3. **Verification**: Confirm zero files modified in target repo `d:/CLAUDE-PROJECT/website`.

---

## 6. Next Stage Transition

Upon completing exploration analysis, proceed to **UC01-C2: Proposal & Spec Impact Planning** (`guide/workflow/01-target-patch-management/c2-proposal-delta-spec.md`).

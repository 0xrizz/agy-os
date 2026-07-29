---
name: openspec-brownfield-workflow
description: Complete architecture, lifecycle, and execution guide for OpenSpec on existing (brownfield) codebases. Activate when adopting OpenSpec on active repos, proposing changes, running iterative workflows, or managing delta specs.
---

# OpenSpec Brownfield Workflow & Architecture Guide

## Core Principles & Philosophy
- **Brownfield-First & Delta Specs**: Do NOT document the entire codebase upfront. `openspec/specs/` grows organically change-by-change as delta specs (`ADDED`, `MODIFIED`, `REMOVED`) are merged upon archiving.
- **Fluid Dependencies (DAG)**: Artifacts build on each other (`proposal` ──► `specs` & `design` ──► `tasks` ──► `apply`), acting as enablers rather than rigid waterfall gates.
- **Two Halves Execution Split**:
  - `openspec ...` commands run in the **Terminal** (e.g., `openspec init`, `openspec status`, `openspec archive`).
  - `/opsx:...` slash commands run in **AI Assistant Chat** (e.g., `/opsx:explore`, `/opsx:propose`, `/opsx:apply`).

---

## Complete Lifecycle Workflow

### Step 0: Exploration & Problem Mapping (No-Stakes)
**Command**: `/opsx:explore`
- The AI acts as a thinking partner reading the existing codebase.
- No code or artifacts are created yet.
- Clarifies scope, evaluates trade-offs, and maps insertion points before drafting plans.

### Step 1: Proposal & Delta Specs Generation
**Command**: `/opsx:propose <change-name>` (Core Profile) or `/opsx:new` + `/opsx:ff` (Expanded Profile)
- Creates folder `openspec/changes/<change-name>/`:
  - `proposal.md`: Problem intent, scope (in-scope / out-of-scope), and high-level approach.
  - `specs/<domain>/spec.md`: Delta spec with `## ADDED Requirements`, `## MODIFIED Requirements`, `## REMOVED Requirements` using RFC 2119 keywords (`SHALL`/`MUST`) and Given/When/Then scenarios.
  - `design.md`: Technical approach, architecture decisions, data flow, and file modification lists.
  - `tasks.md`: Sequential implementation checklist with checkboxes (`- [ ]`).

### Step 2: Plan Review & Iteration
- Review `proposal.md`, delta specs, and `tasks.md` **before writing code**.
- Catching errors in Markdown costs almost nothing.
- Adjust artifacts manually or ask AI via `/opsx:update`.

### Step 3: Implementation Execution
**Command**: `/opsx:apply`
- AI executes tasks from `tasks.md` sequentially, marking checkboxes completed (`- [x]`).
- Reads current live files; if design shifts during coding, edit `design.md` or `tasks.md` and re-run `/opsx:apply`.

### Step 4: Verification & Drift Reconciliation
**Command**: `/opsx:verify` (Expanded Profile) or `openspec validate <change-name>` (CLI)
- Checks implementation against Completeness, Correctness, and Coherence.
- Reconciles any drift between code and delta specs.

### Step 5: Sync & Archiving (Merging to Truth)
**Command**: `/opsx:sync` (optional) then `/opsx:archive` (or CLI `openspec archive <change-name>`)
1. Merges `ADDED`, `MODIFIED`, and `REMOVED` requirements into main specs at `openspec/specs/<domain>/spec.md`.
2. Moves change folder to `openspec/changes/archive/YYYY-MM-DD-<change-name>/`.
3. Main `openspec/specs/` now represents the updated source of truth for future changes.

---

## Project Customization (`openspec/config.yaml`)
- `context:` Injects project-wide stack conventions and architectural constraints into all AI prompts.
- `rules:` Sets per-artifact guidelines (e.g. `specs`, `proposal`, `design`, `tasks`).
- `references:` Links multi-repo standalone stores (beta) for cross-repository planning.

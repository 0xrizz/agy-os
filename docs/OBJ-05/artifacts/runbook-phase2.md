# Phase 2 User Interactive Execution Runbook: OBJ-05 Graphify Knowledge Harness (Re-Run)

**Author:** Systems Infrastructure Engineer / Antigravity Agent  
**Date:** 2026-08-02  
**Status:** READY FOR USER EXECUTION  
**Objective Suite:** [docs/OBJ-05/](file:///d:/dev/agy-os/docs/OBJ-05/)  
**Approved Proposal:** [docs/OBJ-05/artifacts/proposal-2.md](file:///d:/dev/agy-os/docs/OBJ-05/artifacts/proposal-2.md)  
**Technical Design:** [docs/OBJ-05/design.md](file:///d:/dev/agy-os/docs/OBJ-05/design.md)  

---

## 1. Overview & Execution Context

This Runbook provides exact, step-by-step instructions for executing **Phase 2 (User Interactive Extraction & Merge)** of OBJ-05.

### Critical Requirement: Host LLM Session Continuity
Phase 2 MUST be executed interactively inside an active Antigravity session. Graphify's **Step 5 (Community Labeling)** and **Part B (Semantic Subagent Extraction)** require the host LLM session to assign concise, human-readable 2–5 word topic titles (e.g. `"RFC Standard References"`, `"MCP Server & Registered Tools"`) to detected community hubs instead of generic placeholders (`"Community 0"`).

---

## 2. Recommended LLM Configuration

Before starting, configure your Antigravity session model:

| Preference | Model Selection | Thinking / Reasoning Level | Rationale |
|---|---|---|---|
| **Primary (Recommended)** | **Gemini 3.1 Pro** | **High** | Superior deep reasoning and conceptual abstraction for Step 5 semantic community labeling and complex multi-file relationship mapping. |
| **Alternative (High Speed)** | **Gemini 3.6 Flash** | **High** | High throughput and lower latency for subagent extraction batches while maintaining high reasoning for community labeling. |

> [!IMPORTANT]
> Always maintain **High** reasoning/thinking effort level during Phase 2 execution to prevent degradation in community labeling quality.

---

## 3. Step-by-Step Execution Sequence

Run each step sequentially in your Antigravity chat session. Wait for the agent confirmation at each step before proceeding to the next.

### Step 2.1 — Main Harness Root Scan
- **Command (type in chat):**
  ```text
  /graphify .
  ```
- **Execution Pipeline:** AST Parsing -> Semantic Extraction (Subagents) -> Clustering -> Step 5 Community Labeling.
- **Verification Gate:** Agent confirms `graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md` exist and contain named semantic community labels.

---

### Step 2.2 — Upstream ECC Sub-repo Scan
- **Command (type in chat):**
  ```text
  /graphify ./ECC
  ```
- **Execution Pipeline:** Scans isolated `ECC/` repository using `ECC/.graphifyignore`.
- **Verification Gate:** Agent confirms `ECC/graphify-out/graph.json` exists and is non-empty (>= 1KB).

---

### Step 2.3 — OpenSpec Sub-repo Scan
- **Command (type in chat):**
  ```text
  /graphify ./OpenSpec
  ```
- **Execution Pipeline:** Scans isolated `OpenSpec/` repository using `OpenSpec/.graphifyignore`.
- **Verification Gate:** Agent confirms `OpenSpec/graphify-out/graph.json` exists and is non-empty (>= 1KB).

---

### Step 2.4 — Frameworks/OpenSpec Sub-repo Scan
- **Command (type in chat):**
  ```text
  /graphify ./frameworks/openspec
  ```
- **Execution Pipeline:** Scans isolated `frameworks/openspec/` repository using `frameworks/openspec/.graphifyignore`.
- **Verification Gate:** Agent confirms `frameworks/openspec/graphify-out/graph.json` exists and is non-empty (>= 1KB).

---

### Step 2.5 — Idempotent Multi-Root Graph Merge
- **Prompt Agent (type in chat):**
  ```text
  Run the graphify merge script d:/dev/agy-os/harness/agy-script/graphify-merge-agy.sh
  ```
- **Execution Pipeline:** Merges all 4 per-repo graphs into unified `graphify-out/graph.json` with shrink-guard protection.
- **Verification Gate:** Script exits `0` and reports non-decreasing node count.

---

### Step 2.6 — Cross-Repo Wiki Generation
- **Prompt Agent (type in chat):**
  ```text
  Generate the wiki on the unified graph via graphify export wiki
  ```
- **Execution Pipeline:** Generates `graphify-out/wiki/index.md` and per-community articles covering all 4 repositories.
- **Verification Gate:** `graphify-out/wiki/index.md` exists and contains links with semantic community names.

---

### Step 2.7 — Handoff to Phase 3 Verification
- **Prompt Agent (type in chat):**
  ```text
  Phase 2 complete. Proceed with Phase 3 verification and harness integration.
  ```

---

## 4. Verification Scorecard (Phase 2 Acceptance)

| Metric / Check | Target / Success Criterion | Verification Command |
|---|---|---|
| **Sub-repo Graphs** | All 3 sub-repo `graph.json` files exist & non-empty | `ls -la */graphify-out/graph.json` |
| **Merged Graph** | `graphify-out/graph.json` contains multi-repo nodes | `graphify query "cross-repo ECC skills"` |
| **Label Quality (SC-06)** | Zero generic `"Community [0-9]+"` labels | `grep -c "Community [0-9]" graphify-out/.graphify_labels.json == 0` |
| **Wiki Index** | `graphify-out/wiki/index.md` present with links | `head -n 20 graphify-out/wiki/index.md` |

---

## 5. Non-Destructive Rollback & Troubleshooting

- **Shrink-Guard Rejection:** If `graphify-merge-agy.sh` returns exit code 1, check if any sub-repo scan failed or yielded 0 nodes.
- **Labeling Fallback:** If generic labels appear in `.graphify_labels.json`, verify that the session model reasoning level is set to **High** (Gemini 3.1 Pro High / Gemini 3.6 Flash High).
- **Rollback Option:** Individual sub-repo outputs can be cleared via `rm -rf <repo>/graphify-out` without affecting other sub-repo outputs or root files.

# Proposal-2: OBJ-05 - Graphify Knowledge Harness (Re-Run)

**Author:** Antigravity Agent
**Date:** 2026-08-02
**Status:** PROPOSED - Awaiting User Review
**Supersedes:** [docs/OBJ-05/artifacts/proposal.md](file:///d:/dev/agy-os/docs/OBJ-05/artifacts/proposal.md)
**Objective Suite:** [docs/OBJ-05/](file:///d:/dev/agy-os/docs/OBJ-05/)
**PRD Reference:** [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md)

> **IMPORTANT - Read Before Acting**
> This proposal is fundamentally different from proposal.md in one critical dimension:
> it defines a **hybrid human-agent workflow** where the user directly triggers the
> graphify session in Antigravity, and the agent plays a preparation and verification
> role - not an execution role for the LLM-dependent pipeline steps.

---

## 1. Problem Statement

### 1.1 Root Cause

The OBJ-05 first attempt produced a structurally intact but **semantically empty** graph.
Evidence from [d:/dev/agy-os/graphify-out/](file:///d:/dev/agy-os/graphify-out/) versus the
manually-run control at D:/CLAUDE-PROJECT/rizz-sa/graphify-out/ reveals a **two-layer failure**
in the agent-triggered execution path.

#### Layer 1 - Labeling Failure (Step 5, Community Naming)

| Metric | agy-os (agent-run) | rizz-sa (user-run) |
|---|---|---|
| graph.json size | **175 MB** (6,445 nodes) | 1.27 MB (1,044 nodes) |
| GRAPH_REPORT.md lines | 2,207 | 242 |
| Community labels | "Community 0" ... "Community 457" - **all generic** | "RFC Standard References", "REST API Active File Endpoints" - **all semantic** |
| Token cost reported | **0 input / 0 output** | 0 input / 0 output |
| .graphify_labels.json | 458 entries, all "Community N" | 41 entries, all named |

The graphify SKILL.md Step 5 says: "Read .graphify_analysis.json. For each community key,
look at its node labels and write a 2-5 word plain-language name." This step is executed
**by the host agent**, not by the graphify Python process. When the agent ran graphify from
the terminal, the Step 5 labeling was never triggered with an active LLM session. Result:
458 communities with generic numeric IDs, making the graph unusable for agent navigation.

#### Layer 2 - Scope Bleed (Missing .graphifyignore)

Without a root .graphifyignore excluding sub-repos (ECC/, OpenSpec/, frameworks/openspec/)
and binaries, the agent first-attempt root scan ingested 549 files indiscriminately, producing
a 175MB graph too large to query meaningfully.

### 1.2 Evidence

```text
agy-os/graphify-out/.graphify_labels.json (excerpt):
  {"0": "Community 0", "1": "Community 1", ... "457": "Community 457"}
  ^ Step 5 LLM labeling: COMPLETELY SKIPPED or returned empty

rizz-sa/graphify-out/GRAPH_REPORT.md (Community Hubs section):
  - RFC Standard References
  - REST API Active File Endpoints
  - Zod Schema Transformations
  - MCP Server & Registered Tools
  ^ Step 5 LLM labeling: COMPLETED SUCCESSFULLY
```

The only difference between these two runs: the rizz-sa run was triggered **by the user
directly from an active Antigravity session**. The agy-os run was triggered **by the agent
from a terminal command**, which ran the graphify Python pipeline but lost the LLM labeling
step because it was not embedded in the active session flow.

### 1.3 Impact

| Impact Area | Description |
|---|---|
| **Navigation failure** | graphify-out/wiki/index.md cannot exist without community labels; REQ-05 is blocked |
| **Agent orientation failure** | The graphify.md rule says "navigate wiki first" - impossible with 458 unnamed communities |
| **Cross-repo query degradation** | 175MB graph makes graphify query BFS traversals slow and token-expensive |
| **Spec non-compliance** | REQ-01-S1 requires wiki/ and GRAPH_REPORT.md with labels - both are absent/incomplete |
| **Cascading block** | REQ-03 (sub-repo extraction), REQ-04 (merge), REQ-05 (wiki), REQ-06 (MCP) all blocked |

---

## 2. Proposed Workflow

The core architectural shift in Proposal-2 is the explicit partitioning of work into phases
based on who can execute them correctly: the **agent** does preparation and verification; the
**user** does the LLM-active extraction steps from within the live Antigravity session.

### 2.1 Phase 1 - Agent Preparation (Agent-Owned)

The agent creates all pre-conditions so the user can trigger graphify with a single command
and get a clean, scoped result. No graphify extraction commands are run by the agent.

**Agent actions:**

1. Create [d:/dev/agy-os/.graphifyignore](file:///d:/dev/agy-os/.graphifyignore) - scoped root exclusions
2. Create [d:/dev/agy-os/ECC/.graphifyignore](file:///d:/dev/agy-os/ECC/.graphifyignore)
3. Create [d:/dev/agy-os/OpenSpec/.graphifyignore](file:///d:/dev/agy-os/OpenSpec/.graphifyignore)
4. Create [d:/dev/agy-os/frameworks/openspec/.graphifyignore](file:///d:/dev/agy-os/frameworks/openspec/.graphifyignore)
5. Create [harness/agy-script/graphify-merge-agy.sh](file:///d:/dev/agy-os/harness/agy-script/graphify-merge-agy.sh) - idempotent 4-repo merge script
6. Wipe the existing incomplete graph: rm -rf d:/dev/agy-os/graphify-out/
7. Pre-validate Python environment: confirm graphify is on PATH and installable
8. Produce a ready-to-run **User Runbook** with exact commands for each Phase 2 step

**Output of Phase 1:**
- All .graphifyignore files in place - the user run will be correctly scoped from line 1
- Merge script is ready and validated for syntax
- Root graphify-out/ is wiped - no stale data can corrupt the fresh run
- User has a clear, copy-pasteable set of commands for Phase 2

### 2.2 Phase 2 - User Execution (User-Owned, Active Antigravity Session)

The user runs each graphify extraction step **from within a live Antigravity session**. This
is the only execution mode that guarantees Step 5 (community labeling) and Step B2 (semantic
subagent dispatch) work correctly, because both require an active host-agent session as the
LLM backend.

**Required execution order (each step triggers the full graphify pipeline under the active agent):**

```text
Step 2.1 - Root scan
  User runs: /graphify d:/dev/agy-os
  Agent (Antigravity): detect -> AST -> semantic (subagents) -> build -> cluster -> label -> wiki -> html

Step 2.2 - ECC sub-repo extraction
  User runs: /graphify d:/dev/agy-os/ECC
  Agent: same pipeline, writes -> ECC/graphify-out/graph.json

Step 2.3 - OpenSpec sub-repo extraction
  User runs: /graphify d:/dev/agy-os/OpenSpec
  Agent writes -> OpenSpec/graphify-out/graph.json

Step 2.4 - frameworks/openspec sub-repo extraction
  User runs: /graphify d:/dev/agy-os/frameworks/openspec
  Agent writes -> frameworks/openspec/graphify-out/graph.json

Step 2.5 - Unified merge (agent-delegated via merge script)
  User prompts: "Run the graphify merge script"
  Agent executes: bash harness/agy-script/graphify-merge-agy.sh
  Result: unified graphify-out/graph.json

Step 2.6 - Wiki generation on unified graph
  User prompts: "Generate the wiki on the unified graph"
  Agent executes: graphify export wiki
  Result: graphify-out/wiki/index.md
```

**Critical constraint:** Steps 2.1-2.6 MUST be triggered **interactively** - never from a
bare terminal command outside an Antigravity session. The user does not need to type
extraction commands themselves; they can prompt the agent ("run graphify on the agy-os root").
The key is that the Antigravity session is the **running host** when graphify executes.

### 2.3 Phase 3 - Agent Verification & Harness Integration (Agent-Owned)

After Phase 2 outputs exist, the agent resumes ownership to:

1. Verify acceptance criteria (Section 5) - all 10 criteria must pass
2. Register graphify MCP server in [.mcp.json](file:///d:/dev/agy-os/.mcp.json)
3. Install post-commit hook via graphify hook install (Git Bash - deterministic, no LLM required)
4. Update [.agents/rules/graphify.md](file:///d:/dev/agy-os/.agents/rules/graphify.md) with multi-root + wiki-first instructions
5. Update [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md) OBJ-05 section

### 2.4 Handoff Protocol

```text
+------------------------------------------------------------------+
| PHASE 1: AGENT                                                   |
|  [x] .graphifyignore files x4                                    |
|  [x] graphify-merge-agy.sh                                       |
|  [x] rm -rf graphify-out/                                        |
|  [x] validate graphify install + PATH                            |
|                                                                  |
|  -> HANDOFF: Agent produces User Runbook, awaits user            |
+------------------------------------------------------------------+
         |
         v
+------------------------------------------------------------------+
| PHASE 2: USER (active Antigravity session)                       |
|  /graphify d:/dev/agy-os           (root scan + label)           |
|  /graphify d:/dev/agy-os/ECC       (ECC sub-repo)                |
|  /graphify d:/dev/agy-os/OpenSpec  (OpenSpec sub-repo)           |
|  /graphify d:/dev/agy-os/frameworks/openspec                     |
|  "run the merge script"            (agent executes bash)         |
|  "generate the wiki"               (agent executes wiki export)  |
|                                                                  |
|  -> HANDOFF: User says "graphify complete" or pings agent        |
+------------------------------------------------------------------+
         |
         v
+------------------------------------------------------------------+
| PHASE 3: AGENT                                                   |
|  [x] Verify 10 acceptance criteria                               |
|  [x] .mcp.json registration                                      |
|  [x] graphify hook install (Git Bash)                            |
|  [x] .agents/rules/graphify.md update                            |
|  [x] docs/PRD.md OBJ-05 section                                  |
+------------------------------------------------------------------+
```

**Agent decision rule for Phase 2 steps**: If the user triggers a graphify command that
dispatches subagents (Part B, Step 3 of SKILL.md), the agent MUST wait for ALL subagent
chunks to complete before proceeding to Step 4 (build/cluster/label). Fire-and-forget
semantic subagent dispatch is strictly forbidden per common-agents.md Delegation Completion
Contract.

---

## 3. Architecture Decision Records

### ADR-01: Phase Separation - User Triggers Extraction, Agent Does Prep/Verify

| Field | Detail |
|---|---|
| **Decision** | Split the pipeline at the LLM-active boundary: agent owns preparation and verification; user owns graphify extraction steps |
| **Selected Option** | Hybrid human-agent workflow with explicit phase gates |
| **Rationale** | Evidence shows Step 5 (community labeling) and Step B2 (semantic subagent dispatch) require an active host-agent session. These steps cannot be reliably triggered from a bare terminal bash call by the agent - the agent loses session continuity. User-triggered /graphify runs keep the active Antigravity session as the orchestrating LLM for both semantic extraction and Step 5 labeling. |
| **Consequences** | (+) Community labels will be meaningful semantic names, not generic "Community N" placeholders. (+) Semantic subagents dispatch and collect correctly under user-triggered sessions. (-) Requires explicit user participation in Phase 2. (-) Cannot be fully automated in a single agent task. |

### ADR-02: Pre-scope via .graphifyignore Before Any Extraction

| Field | Detail |
|---|---|
| **Decision** | All .graphifyignore files are created by the agent in Phase 1, before the user triggers any /graphify command |
| **Selected Option** | Agent writes all four .graphifyignore files as the first action in Phase 1 |
| **Rationale** | The previous run produced a 175MB graph from 549 files because no .graphifyignore excluded sub-repos, binaries, and graphify-out/ itself. Pre-scoping ensures the first /graphify run immediately produces a correctly-bounded corpus. There is no recovery path if the user runs without scoping - the shrink-guard will reject any subsequent attempt to replace a 175MB graph with a smaller one without --force. |
| **Consequences** | (+) Corpus size is bounded before first run. (+) Sub-repo isolation is correct from line 1. (-) Agent must complete Phase 1 before user starts Phase 2. |

### ADR-03: Corpus Wipe Required Before Phase 2

| Field | Detail |
|---|---|
| **Decision** | Agent explicitly wipes d:/dev/agy-os/graphify-out/ in Phase 1 before handing off |
| **Selected Option** | rm -rf d:/dev/agy-os/graphify-out/ as a Phase 1 agent step |
| **Rationale** | The shrink-guard (#479) in graphify rejects any new build that produces fewer nodes than the existing graph.json. The existing 175MB graph (6,445 nodes) would permanently block any correct smaller scoped build unless wiped first. The wipe is non-destructive to harness functionality - nothing depends on the current graph being correct (it is known-bad). |
| **Consequences** | (+) Shrink-guard cannot block the correct Phase 2 build. (+) Clean state guarantees no stale manifest/cache. (-) Existing graph is lost; re-run required if Phase 2 fails midway. |

### ADR-04: Sequential Per-Repo Extraction (Not Parallel)

| Field | Detail |
|---|---|
| **Decision** | User runs each /graphify <repo> command sequentially, one repo at a time |
| **Selected Option** | Sequential execution: root -> ECC -> OpenSpec -> frameworks/openspec |
| **Rationale** | Each extraction dispatches multiple semantic subagents internally (Part B). Running four repo extractions in parallel would overwhelm the session with 4x concurrent subagent dispatches, risking context window overflow and orphaned chunk results. Sequential execution ensures each repo subagents complete and merge before the next repo starts. |
| **Consequences** | (+) Each repo extraction is atomic and verifiable before proceeding. (+) Agent can verify SC-03 after each sub-repo run, catching failures early. (-) Total elapsed time is 4x a single-repo run. |

### ADR-05: Merge Script is Agent-Executable (No LLM Required)

| Field | Detail |
|---|---|
| **Decision** | The graphify-merge-agy.sh merge step (Step 2.5) is agent-executable from within the Antigravity session |
| **Selected Option** | Agent executes bash harness/agy-script/graphify-merge-agy.sh when user delegates |
| **Rationale** | graphify merge-graphs is a deterministic Python operation - it reads four existing graph.json files and merges them. No subagents are dispatched, no LLM inference is required. This step is safe for agent-only execution, unlike the extraction steps that require an active host LLM for labeling. |
| **Consequences** | (+) User does not need to manually run the merge command. (+) Merge is idempotent and re-runnable. (-) If the agent session context resets between Phase 2 and merge, the agent must re-read task state before executing. |

### ADR-06: Wiki Generation Tied to Root Merge, Not Per-Repo

| Field | Detail |
|---|---|
| **Decision** | graphify --wiki (Step 2.6) runs once on the unified merged graph, not per-repo |
| **Selected Option** | Single wiki generation after merge completes |
| **Rationale** | The wiki value is the cross-repo community index. Generating it before merge means it reflects only the agy-os root, not the full 4-repo graph. Generating it after merge means it reflects the complete namespace including ECC skills, OpenSpec schemas, and framework harness. |
| **Consequences** | (+) Wiki index is comprehensive, covering all 4 repositories. (+) Agent navigation rule "wiki first" is meaningful with cross-repo content. (-) Wiki must be regenerated whenever the merge is re-run. |

---

## 4. Implementation Steps

Steps are ordered by phase. Each step includes an **Owner** (Agent / User) and a **Verification** check.

### Phase 1 - Agent Preparation

| # | Step | Owner | Verification |
|---|---|---|---|
| 1.1 | Wipe d:/dev/agy-os/graphify-out/ via rm -rf (Git Bash) | Agent | ls graphify-out/ returns "No such file" |
| 1.2 | Create d:/dev/agy-os/.graphifyignore per SSOT in proposal.md section 3.4.1 | Agent | cat .graphifyignore shows ECC/, OpenSpec/ excluded |
| 1.3 | Create d:/dev/agy-os/ECC/.graphifyignore per SSOT in proposal.md section 3.4.2 | Agent | cat ECC/.graphifyignore shows vendor IDE dirs excluded |
| 1.4 | Create d:/dev/agy-os/OpenSpec/.graphifyignore per SSOT in proposal.md section 3.4.3 | Agent | cat OpenSpec/.graphifyignore shows website/ excluded |
| 1.5 | Create d:/dev/agy-os/frameworks/openspec/.graphifyignore per SSOT in proposal.md section 3.4.4 | Agent | cat frameworks/openspec/.graphifyignore shows harness/patches/ excluded |
| 1.6 | Create harness/agy-script/graphify-merge-agy.sh per design.md section 3.4 | Agent | bash -n harness/agy-script/graphify-merge-agy.sh exits 0 (syntax check) |
| 1.7 | Verify graphify is installed and on PATH | Agent | graphify --version returns a version string |
| 1.8 | Produce User Runbook with Phase 2 commands and surface to user | Agent | User confirms runbook received |

### Phase 2 - User Execution (Active Antigravity Session)

> **User instruction**: Run each /graphify command from the Antigravity chat. After each run,
> wait for the agent to confirm the output before proceeding to the next step.

| # | Step | Owner | Verification |
|---|---|---|---|
| 2.1 | Trigger root scan: type /graphify d:/dev/agy-os in Antigravity | **User** | Agent confirms: graphify-out/graph.json exists, community labels are named (not "Community N") |
| 2.2 | Trigger ECC extraction: type /graphify d:/dev/agy-os/ECC | **User** | Agent confirms: ECC/graphify-out/graph.json exists and is non-empty |
| 2.3 | Trigger OpenSpec extraction: type /graphify d:/dev/agy-os/OpenSpec | **User** | Agent confirms: OpenSpec/graphify-out/graph.json exists and is non-empty |
| 2.4 | Trigger framework extraction: type /graphify d:/dev/agy-os/frameworks/openspec | **User** | Agent confirms: frameworks/openspec/graphify-out/graph.json exists and is non-empty |
| 2.5 | Prompt agent: "Run the graphify merge script" | **User** -> Agent executes | Agent confirms: unified graphify-out/graph.json node count >= node count from step 2.1 |
| 2.6 | Prompt agent: "Generate the wiki on the unified graph" | **User** -> Agent executes | Agent confirms: graphify-out/wiki/index.md exists with named community links |

### Phase 3 - Agent Verification & Harness Integration

| # | Step | Owner | Verification |
|---|---|---|---|
| 3.1 | Run all 10 acceptance criteria checks (Section 5) | Agent | All 10 pass; output logged |
| 3.2 | Add graphify MCP server entry to .mcp.json | Agent | cat .mcp.json contains "graphify" key with --mcp args |
| 3.3 | Install post-commit hook: graphify hook install (Git Bash) | Agent | graphify hook status returns installed |
| 3.4 | Update .agents/rules/graphify.md with multi-root + wiki-first navigation instructions | Agent | Rule file contains wiki/index.md, cross-repo path examples, update policy |
| 3.5 | Update docs/PRD.md to add OBJ-05 completion section | Agent | PRD references graphify-out/graph.json and wiki location |

---

## 5. Success Criteria

OBJ-05 (re-run) is **complete** when ALL of the following conditions are verified:

| ID | Condition | Verification Command |
|---|---|---|
| SC-01 | graphify-out/GRAPH_REPORT.md exists and community labels are semantic names | head -20 graphify-out/GRAPH_REPORT.md shows named community hubs |
| SC-02 | graphify-out/wiki/index.md exists and contains >=1 named community link | cat graphify-out/wiki/index.md shows links with semantic names |
| SC-03 | All three sub-repo graph.json files exist and are non-empty | ls -la ECC/graphify-out/graph.json OpenSpec/graphify-out/graph.json frameworks/openspec/graphify-out/graph.json - all >= 1KB |
| SC-04 | Unified graphify-out/graph.json contains nodes from >=2 different repo attribute values | graphify query "cross-repo ECC skills" returns multi-repo results |
| SC-05 | Cross-repo path query resolves between ECC and installed harness | graphify path "ECC/agents/planner" ".agents/plugin/ecc/agents/planner" returns a path |
| SC-06 | .graphify_labels.json contains NO entries matching "Community [0-9]+" pattern | grep -c "Community [0-9]" graphify-out/.graphify_labels.json returns 0 |
| SC-07 | Post-commit hook is installed | graphify hook status returns installed |
| SC-08 | MCP entry present in .mcp.json | cat .mcp.json grep graphify returns match |
| SC-09 | .agents/rules/graphify.md updated with wiki-first navigation instruction | grep "wiki" .agents/rules/graphify.md returns match |
| SC-10 | All Phase 1 .graphifyignore files are present | ls .graphifyignore ECC/.graphifyignore OpenSpec/.graphifyignore frameworks/openspec/.graphifyignore - all 4 found |

> **Note on SC-06**: This is the single strongest signal that the re-run succeeded where the
> first attempt failed. Generic "Community N" labels are the observable symptom of the
> root-cause failure. Named semantic labels are the proof of fix.

---

## 6. Non-Destructive Guarantee

This proposal maintains all non-destructive guarantees from proposal.md section 6:

- **ECC/ files are never written** - graphify reads ECC for extraction but writes only to ECC/graphify-out/
- **website/ is untouched** - OBJ-05 produces zero patches or modifications to d:/CLAUDE-PROJECT/website
- **Phase 1 wipe is reversible** - graphify-out/ can be regenerated by re-running Phase 2; no unique data is stored there
- **Hook is removable** - graphify hook uninstall cleanly removes the post-commit entry
- **MCP entry is removable** - delete the graphify key from .mcp.json
- **.graphifyignore files are text files** - revert with git checkout <path> or delete

---

## 7. Key Differences from proposal.md

| Dimension | Proposal-1 (proposal.md) | Proposal-2 (this document) |
|---|---|---|
| **Execution model** | Fully agent-automated: agent runs all graphify commands from terminal | Hybrid: agent prepares + verifies; user triggers extraction in active Antigravity session |
| **Who triggers /graphify** | Agent (via bash terminal command) | User (from Antigravity chat, keeping session active) |
| **Step 5 labeling** | Agent runs bash steps that produce "Community N" labels (no active LLM) | User-triggered session keeps host LLM active; Step 5 produces semantic names |
| **Pre-scoping** | .graphifyignore created but graph-wipe not guaranteed before run | Phase 1 mandates wipe + all .graphifyignore files before any Phase 2 command |
| **Failure mode addressed** | Does not address agent-vs-user LLM session boundary | Explicitly models and resolves the LLM session continuity requirement |
| **Parallelism** | Sub-repo extractions could run in parallel | Sequential per-repo (prevents session overload from 4x concurrent subagent dispatches) |
| **Verification cadence** | Single acceptance check at end | Verification after EACH Phase 2 step; SC-06 label check as primary signal |
| **Merge ownership** | User runs bash script manually | Agent executes merge script when user delegates |

---

## 8. References

- [proposal.md](file:///d:/dev/agy-os/docs/OBJ-05/artifacts/proposal.md) - Prior proposal (superseded for re-run execution)
- [spec.md](file:///d:/dev/agy-os/docs/OBJ-05/spec.md) - Behavioral requirements (REQ-01 through REQ-08, all still applicable)
- [design.md](file:///d:/dev/agy-os/docs/OBJ-05/design.md) - Technical architecture, .graphifyignore SSOT, merge script contract
- [task.md](file:///d:/dev/agy-os/docs/OBJ-05/task.md) - Execution checklist (to be updated after this proposal is approved)
- [AGENTS.md](file:///d:/dev/agy-os/AGENTS.md) - Project governance (section 0 Git Bash invariant, section 10 target repo read-only)
- [.agents/skills/graphify/SKILL.md](file:///d:/dev/agy-os/.agents/skills/graphify/SKILL.md) - Graphify invocation spec (Step 5 labeling, Part B subagent dispatch)
- [graphify-out/GRAPH_REPORT.md](file:///d:/dev/agy-os/graphify-out/GRAPH_REPORT.md) - Agent-run failure evidence (token cost: 0, community labels: generic)
- D:/CLAUDE-PROJECT/rizz-sa/graphify-out/GRAPH_REPORT.md - User-run success evidence (semantic community names)
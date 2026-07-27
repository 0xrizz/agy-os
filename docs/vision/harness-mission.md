---
title: "agy-harness Mission Statement & Subsystem Architecture"
doc_type: "vision"
doc_id: "VIS-001"
status: "active"
author: "teamwork_preview_worker_m1_1"
created_at: "2026-07-27"
updated_at: "2026-07-27"
tags: ["mission", "vision", "architecture", "harness"]
references:
  - "AGENTS.md"
  - "README.md"
  - "frameworks/README.md"
  - ".agents/rules/RULES.md"
---

# agy-harness Mission Statement & Subsystem Architecture

## 1. Executive Summary

`agy-harness` is an agentic development workspace, harness-native operating environment, agentic testbed, and framework isolation sandbox created to support development for the target project `website` (`d:/CLAUDE-PROJECT/website`).

It serves as the core testbed for orchestrating autonomous agents, validating agentic skills, executing workflows, and preparing experimental engineering paradigms under strict security boundaries.

---

## 2. Dual Primary Objectives

### Objective 1: Harness-Native Operating System for Agentic Work
- Serve as a production-grade execution and testing environment for agentic toolkits, integrating upstream reference tools from `ECC/`.
- Test, refine, and validate agent roles, custom skills, workflows, sidecars, and multi-agent coordination models in `.agents/` before applying proven patterns to target codebases.
- Provide a robust harness environment (`harness/`) where patch files can be staged, verified, and audited empirically.

### Objective 2: Framework Development Experiment Readiness
- Provide a dedicated, isolated sandbox in `frameworks/` for evaluating modern software engineering methodologies.
- Support experimentation across:
  - **Spec-Driven Development (`frameworks/sdd/`)**: Testing specification-first agent workflows.
  - **Behavior-Driven Multi-Agent Development (`frameworks/bmad/`)**: Testing multi-agent behavior specifications.
  - **Agentic Design Patterns (`frameworks/agentic-patterns/`)**: Testing design patterns for agentic execution.
  - **Custom Frameworks (`frameworks/custom/`)**: Experimenting with novel custom methodologies.

---

## 3. Subsystem Architecture & Topology

The topology below illustrates the relationships, isolation boundaries, and data flows between subsystems:

```
+-------------------------------------------------------------------+
|                            agy-harness                            |
|                                                                   |
|  +----------------+    +----------------+    +-----------------+  |
|  |     docs/      |    |    .agents/    |    |   frameworks/   |  |
|  | (DDF Vision &  |    |  (Antigravity  |    | (SDD, BMAD,     |  |
|  |  Governance)   |    | Rules/Workflows|    | Agentic Sandbox)|  |
|  +-------+--------+    +-------+--------+    +--------+--------+  |
|          |                     |                      |           |
|          +---------------------+----------------------+           |
|                                |                                  |
|                      +---------v---------+                        |
|                      |     harness/      |                        |
|                      | (Execution Scripts|                        |
|                      |  & Patch Staging) |                        |
|                      +---------+---------+                        |
+--------------------------------|----------------------------------+
                                 | (Patch Files: harness/patches/*.patch)
                                 v
+-------------------------------------------------------------------+
|               Target Repo: d:/CLAUDE-PROJECT/website              |
|                      (STRICTLY READ-ONLY)                         |
+-------------------------------------------------------------------+
```

---

## 4. Operational Boundaries & Governance Alignment

1. **Isolated Execution**: All harness code, scripts, agent definitions, and framework prototypes execute strictly within `d:/dev/agy-harness`.
2. **Reference Preservation**: Upstream `ECC/` files remain clean, read-only reference benchmarks. Modifications are adapted into `.agents/`.
3. **Patch-Only Target Delivery**: Proposed changes to the target repository (`d:/CLAUDE-PROJECT/website`) are delivered exclusively via patch staging in `harness/patches/`.
4. **Governance Alignment**: All operations adhere to workspace rules defined in `.agents/rules/RULES.md` and operating procedures in `AGENTS.md`.

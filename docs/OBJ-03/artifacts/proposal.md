# Customization Proposal Document: Objective OBJ-03 ECC Script Integration

> **Target Repository**: `d:/CLAUDE-PROJECT/website` (READ-ONLY)  
> **Target Harness**: Antigravity (`d:/dev/agy-os`)  
> **Installation Target**: `.agents/hooks/scripts/` (runtime) + `harness/agy-script/scripts/` (installer)  
> **Custom Profile Name**: `agy-developer`  
> **Token Governance Result**: **89.31%** utilization (223,275 / 250,000 tokens) — **PASS** (net +275 tokens from OBJ-03 additions; see Section 3)

---

## 1. Executive Summary & Architecture Target

This proposal defines the **ECC Script Integration** plan for Objective OBJ-03. It establishes the strategy for activating the full ECC hook pipeline in the Antigravity harness (`d:/dev/agy-os`) by resolving four critical gaps identified in the source analysis ([ecc-hook-integration-analysis.md](file:///C:/Users/Windows%2010/.gemini/antigravity-ide/brain/32496187-4ec0-4b6c-84c5-5245eb1cb874/ecc-hook-integration-analysis.md)) and clarified during design review:

1. **CLAUDE_PLUGIN_ROOT is unset** — ECC hook bootstrap resolvers silently fail, making all ECC hooks non-functional (Q2). Resolved by documenting and exporting `CLAUDE_PLUGIN_ROOT=d:/dev/agy-os/ECC` in `harness/.env.example`.
2. **`pre-tool-guardrail-agy.js` is dead code & limited in scope** — the script exists at `.agents/hooks/scripts/` but has no entry in `.agents/hooks.json` (Q4). Resolved by wiring `pre:agy-guardrail` into `hooks.json` AND expanding its logic to inspect Bash `command` strings to block writes/backslashes targeting `d:/CLAUDE-PROJECT/website`.
3. **`install-apply-agy.js` performs a nuclear hooks copy** — every reinstall destroys AGY-native hooks (`post:agy-observation-envelope`, `pre:agy-guardrail`) (Q8). Resolved by introducing `merge-hooks-agy.js` with non-destructive merging.
4. **Platform-incompatible desktop notification hook** — `stop:desktop-notify` is excluded from the `.agents/hooks.json` merger target list for clean execution on Windows native environments.

### Installation Architecture & Isolation Strategy

The architecture follows the **in-place reference model**:

- **ECC Scripts Are NOT Copied**: The `ECC/` directory at `d:/dev/agy-os/ECC/` is the canonical READ-ONLY ECC source. Setting `CLAUDE_PLUGIN_ROOT=d:/dev/agy-os/ECC` instructs every hook bootstrap resolver to load `scripts/hooks/`, `scripts/lib/`, and all transitive dependencies from this location — zero file duplication required.
- **AGY-Native Script Boundary**: Only scripts with the `-agy.js` suffix reside in `.agents/hooks/scripts/` per AGENTS.md §11. These are harness-specific adaptations or new agy-native scripts.
- **Installer/Runtime Separation**: Installer scripts (setup, verification, teardown) reside in `harness/agy-script/` with the `-agy` suffix per AGENTS.md §4. Runtime hook interceptors reside in `.agents/hooks/scripts/` per AGENTS.md §11.
- **Non-Destructive Hooks Merge**: The `install-apply-agy.js` installer uses a `merge-hooks` operation that preserves AGY-native hook IDs (`post:agy-observation-envelope`, `pre:agy-guardrail`) across reinstalls, while explicitly filtering out `stop:desktop-notify`.
- **Environment Variable Configuration**: Required env vars (`CLAUDE_PLUGIN_ROOT`, `ECC_HOOK_PROFILE=standard`, `ECC_GOVERNANCE_CAPTURE=1`, `ECC_DISABLED_HOOKS`) are documented in a new `harness/.env.example` file.

---

## 2. Component Selection & Deduplicated Item Matrix

### Section 2.1: Category Summary

| Category | Description | Scope | Action |
| :--- | :--- | :--- | :--- |
| **Category A** | ECC-Native Hook Scripts | `ECC/scripts/hooks/*.js` (26 selected files; `desktop-notify` excluded) | **KEEP** — referenced in-place via `CLAUDE_PLUGIN_ROOT`; zero copy required |
| **Category B** | ECC Shared Libraries | `ECC/scripts/lib/{utils.js, hook-flags.js, resolve-ecc-root.js, state-store/}` | **KEEP** — resolved transitively by hook scripts via `CLAUDE_PLUGIN_ROOT`; no co-location needed |
| **Category C** | AGY-Native Runtime Scripts | `.agents/hooks/scripts/*-agy.js` | **ADAPT + WIRE** — `pre-tool-guardrail-agy.js` expanded to inspect Bash `command` strings and wired into `hooks.json` |
| **Category D** | Installer Modifications | `harness/agy-script/scripts/install-apply-agy.js` | **ADAPT** — replace nuclear hooks copy (lines 287-303) with `merge-hooks` operation call |
| **Category E** | New Installer Utility | `harness/agy-script/scripts/merge-hooks-agy.js` | **CREATE** — new standalone merge utility implementing preserve/filter logic |
| **Category F** | Environment Variable Docs | `harness/.env.example` | **CREATE** — documents required env vars (`CLAUDE_PLUGIN_ROOT`, `standard` profile, etc.) |

---

### Section 2.2: Deduplicated Final ECC Item Matrix by Kind

| Kind | Item ID | Source Path | Destination Path | Action | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **scripts/hooks** | `plugin-hook-bootstrap` | `ECC/scripts/hooks/plugin-hook-bootstrap.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Required by ALL ECC hooks as bootstrap chain entry point. Q6 dependency tree. |
| **scripts/hooks** | `run-with-flags` | `ECC/scripts/hooks/run-with-flags.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Profile gating and hook enable/disable for every ECC dispatcher. Q6 dependency tree. |
| **scripts/hooks** | `pre-bash-dispatcher` | `ECC/scripts/hooks/pre-bash-dispatcher.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Entry point for `pre:bash:dispatcher`. Chains block-no-verify, gateguard, auto-tmux. Q1 KEEP. |
| **scripts/hooks** | `bash-hook-dispatcher` | `ECC/scripts/hooks/bash-hook-dispatcher.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Core Bash PreToolUse chain dispatcher. Direct dependency of `pre-bash-dispatcher`. Q6. |
| **scripts/hooks** | `block-no-verify` | `ECC/scripts/hooks/block-no-verify.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Prevents `--no-verify` git pushes. Strict profile chain. Q6 dependency. |
| **scripts/hooks** | `gateguard-fact-force` | `ECC/scripts/hooks/gateguard-fact-force.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Fact-forcing gate for Edit/Write/MultiEdit. Core GateGuard skill. Q1 KEEP, Q6. |
| **scripts/hooks** | `doc-file-warning` | `ECC/scripts/hooks/doc-file-warning.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Non-blocking doc file name warning. `pre:write:doc-file-warning`. Q1 KEEP. |
| **scripts/hooks** | `suggest-compact` | `ECC/scripts/hooks/suggest-compact.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Compaction suggestion at context intervals. `pre:edit-write:suggest-compact`. Q1 KEEP. |
| **scripts/hooks** | `observe-runner` | `ECC/scripts/hooks/observe-runner.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Async observe.sh for continuous-learning-v2. `pre:observe:continuous-learning`. Q1 KEEP. |
| **scripts/hooks** | `governance-capture` | `ECC/scripts/hooks/governance-capture.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Secret/policy scanner. Enabled via `ECC_GOVERNANCE_CAPTURE=1`. Q1 KEEP. |
| **scripts/hooks** | `config-protection` | `ECC/scripts/hooks/config-protection.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Blocks linter/formatter config weakening. `pre:config-protection`. Q1 KEEP. |
| **scripts/hooks** | `mcp-health-check` | `ECC/scripts/hooks/mcp-health-check.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Guards unhealthy MCP calls. `pre:mcp-health-check`. Q1 KEEP. |
| **scripts/hooks** | `pre-compact` | `ECC/scripts/hooks/pre-compact.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | State save before compaction. `pre:compact`. Q1 KEEP. |
| **scripts/hooks** | `posttooluse-dispatcher` | `ECC/scripts/hooks/posttooluse-dispatcher.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Consolidated PostToolUse sync dispatcher. Q1 KEEP. |
| **scripts/hooks** | `post-edit-format` | `ECC/scripts/hooks/post-edit-format.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Biome/Prettier format on edit. Q6 dependency of posttooluse-dispatcher. |
| **scripts/hooks** | `post-edit-typecheck` | `ECC/scripts/hooks/post-edit-typecheck.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | TypeScript type check on edit. Q6 dependency of posttooluse-dispatcher. |
| **scripts/hooks** | `post-edit-accumulator` | `ECC/scripts/hooks/post-edit-accumulator.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Tracks modified files for batch stop processing. Q6 dependency. |
| **scripts/hooks** | `session-start` | `ECC/scripts/hooks/session-start.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Loads prior context + package manager detection. `session:start`. Q1 KEEP. |
| **scripts/hooks** | `session-start-bootstrap` | `ECC/scripts/hooks/session-start-bootstrap.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Bootstrap wrapper for session-start. Q6 dependency. |
| **scripts/hooks** | `plan-canvas-sessions` | `ECC/scripts/hooks/plan-canvas-sessions.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Surfaces open Plan Canvas reviews. `session-start:plan-canvas-sessions`. Q1 KEEP. |
| **scripts/hooks** | `session-end` | `ECC/scripts/hooks/session-end.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Session state persistence. `stop:session-end`. Q1 KEEP. |
| **scripts/hooks** | `session-end-marker` | `ECC/scripts/hooks/session-end-marker.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Non-blocking lifecycle marker. `session:end:marker`. Q1 KEEP. |
| **scripts/hooks** | `evaluate-session` | `ECC/scripts/hooks/evaluate-session.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Pattern extraction for `/learn`. `stop:evaluate-session`. Q1 KEEP. |
| **scripts/hooks** | `cost-tracker` | `ECC/scripts/hooks/cost-tracker.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Feeds `/cost-report`. `stop:cost-tracker`. Q1 KEEP. |
| **scripts/hooks** | `stop-format-typecheck` | `ECC/scripts/hooks/stop-format-typecheck.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Batch Biome/Prettier + tsc at Stop. Q1 KEEP. |
| **scripts/hooks** | `check-console-log` | `ECC/scripts/hooks/check-console-log.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Catches stray `console.log` in modified files. Q1 KEEP. |
| **scripts/hooks** | `desktop-notify` | `ECC/scripts/hooks/desktop-notify.js` | _Excluded_ | **EXCLUDE** | Platform-incompatible on Windows native. Excluded during merger per design review. |
| **scripts/lib** | `utils` | `ECC/scripts/lib/utils.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Used by ~15 hooks for logging, platform detection. Q6 key shared library. |
| **scripts/lib** | `hook-flags` | `ECC/scripts/lib/hook-flags.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Profile/enable gating. Required by `run-with-flags.js`. Q6 key shared library. |
| **scripts/lib** | `resolve-ecc-root` | `ECC/scripts/lib/resolve-ecc-root.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Root path resolution bootstrap. Required by `plugin-hook-bootstrap.js`. Q6 key shared library. |
| **scripts/lib** | `state-store/index` | `ECC/scripts/lib/state-store/index.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Used by ~10 hooks for state persistence. Q6 key shared library. |
| **scripts/lib** | `state-store/queries` | `ECC/scripts/lib/state-store/queries.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Query layer for state-store. Q6 transitive dependency. |
| **scripts/lib** | `state-store/schema` | `ECC/scripts/lib/state-store/schema.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Schema definitions for state-store. Q6 transitive dependency. |
| **scripts/lib** | `state-store/migrations` | `ECC/scripts/lib/state-store/migrations.js` | Referenced via `CLAUDE_PLUGIN_ROOT` | **KEEP** | Migration runner for state-store. Q6 transitive dependency. |
| **agy-native** | `pre-tool-guardrail-agy` | `.agents/hooks/scripts/pre-tool-guardrail-agy.js` | `.agents/hooks/scripts/pre-tool-guardrail-agy.js` | **ADAPT + WIRE** | Expanded to inspect `command` string in Bash tool payload. Wired as first PreToolUse entry in `hooks.json`. |
| **agy-native** | `observation-envelope-agy` | `.agents/hooks/scripts/observation-envelope-agy.js` | `.agents/hooks/scripts/observation-envelope-agy.js` | **KEEP** | AGY-native PostToolUse Error Recovery Contract envelope. Already wired. |
| **hooks-config** | `hooks.json` | `.agents/hooks.json` | `.agents/hooks.json` | **ADAPT** | Add `pre:agy-guardrail` as first PreToolUse entry; exclude `stop:desktop-notify`. Preserved on reinstall by merge-hooks. |
| **installer** | `install-apply-agy` | `harness/agy-script/scripts/install-apply-agy.js` | `harness/agy-script/scripts/install-apply-agy.js` | **ADAPT** | Replace lines 287-303 with `merge-hooks` operation. Q8 critical fix. |
| **installer** | `merge-hooks-agy` | _(new file)_ | `harness/agy-script/scripts/merge-hooks-agy.js` | **CREATE** | New standalone merge utility implementing preserve (`post:agy-observation-envelope`, `pre:agy-guardrail`) and filter (`stop:desktop-notify`) lists. |
| **docs** | `env-example` | _(new file)_ | `harness/.env.example` | **CREATE** | Documents `CLAUDE_PLUGIN_ROOT`, `ECC_HOOK_PROFILE=standard`, `ECC_GOVERNANCE_CAPTURE=1`, `ECC_DISABLED_HOOKS`, `ECC_SESSION_ID`. |

---

## 3. Token Footprint & Governance Audit

The prompt token budget impact of OBJ-03 is limited to new documentation and configuration files:

| Component | File | Estimated Bytes | Estimated Tokens | Budget Share |
| :--- | :--- | :---: | :---: | :---: |
| Environment variable documentation | `harness/.env.example` | ~800 B | ~200 T | +0.08% |
| Hooks config delta (new `pre:agy-guardrail` entry) | `.agents/hooks.json` | ~300 B | ~75 T | +0.03% |
| Merge utility (installer only, not prompt-loaded) | `harness/agy-script/scripts/merge-hooks-agy.js` | ~3,000 B | 0 T | 0% |
| Installer modification (runtime only) | `install-apply-agy.js` delta | ~600 B | 0 T | 0% |
| **OBJ-03 Net Addition** | | **~4,700 B** | **~275 T** | **+0.11%** |

### Governance Summary

| Metric | OBJ-01 Baseline | OBJ-03 Addition | Updated Total |
| :--- | :---: | :---: | :---: |
| Token Footprint | 223,000 T | +275 T | **223,275 T** |
| Budget Utilization | 89.20% | +0.11% | **89.31%** |
| Target Window (85%-95%) | PASS | PASS | **PASS** |
| Token Budget Limit (250,000 T) | — | — | 26,725 T headroom |

**Verdict**: **PASS** — OBJ-03 adds +275 tokens (+0.11%). Total utilization is **89.31%**, comfortably within the 85%–95% target window.

---

## 4. Risk Assessment & Non-Destructive Guardrails

| Risk Description | Severity | Mitigation & Guardrail Mechanism |
| :--- | :---: | :--- |
| **1. CLAUDE_PLUGIN_ROOT Unset (Silent Hook Failure)** | Critical | All ECC hooks silently skip. Mitigation: Documented in `harness/.env.example` and verified post-install. |
| **2. Nuclear Hooks Copy Destroys AGY-Native Hooks** | Critical | Mitigation: `merge-hooks-agy.js` with explicit `preserveIds` list (`post:agy-observation-envelope`, `pre:agy-guardrail`). Backup to `.agents/plugin/ecc/hooks.json.bak` before write. |
| **3. Script Version Drift (ECC Upstream Changes)** | High | Mitigation: `ECC/` directory pinned as READ-ONLY reference; controlled update workflow. |
| **4. Token Budget Overage** | Low | Mitigation: Net addition is +0.11% (275 tokens). Headroom is 26,725 tokens. |

### Non-Destructive Guarantee Summary

- `ECC/` directory is strictly READ-ONLY (AGENTS.md §3).
- `ECC/install.sh` and `ECC/scripts/install-apply.js` are NOT modified (AGENTS.md §4).
- `d:/CLAUDE-PROJECT/website` is NOT touched (AGENTS.md §1).
- `merge-hooks-agy.js` backs up `.agents/hooks.json` before writing.

---

## 5. Next Steps & Approval Request

Upon user approval of this Customization Proposal document:

1. **Create `docs/OBJ-03/spec.md`** — Behavioral requirements for: (a) CLAUDE_PLUGIN_ROOT resolution guarantee, (b) `pre:agy-guardrail` activation & Bash command string scanning, (c) non-destructive merge-hooks invariant with `stop:desktop-notify` exclusion, (d) environment variable documentation requirement.
2. **Create `docs/OBJ-03/design.md`** — Technical design covering 4-column decision matrix, annotated directory layout, merge-hooks algorithm, and Section 5 Rollback Architecture.
3. **Create `docs/OBJ-03/task.md`** — Sequential stateful task checklist across 4 task groups with explicit Verification Steps.
4. **Implementation** (post-approval): Create `harness/.env.example`, expand `pre-tool-guardrail-agy.js`, create `merge-hooks-agy.js`, modify `install-apply-agy.js`, update `.agents/hooks.json`.

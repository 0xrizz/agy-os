---
decision_id: "ADR-005"
status: "approved"
supersedes: "ADR-003"
goal: "Hardening and remediation of DDF enforcement mechanics, resolving all 11 audit findings across validation scripts, checksums, patch coupling, role authorities, and CI automation."
affected_scope:
  - "docs/"
  - "docs/decisions/"
  - "docs/changes/"
  - "docs/vision/"
  - ".agents/rules/"
  - "harness/scripts/"
  - "AGENTS.md"
  - "README.md"
  - ".github/workflows/"
invariants:
  - "Target repository read-only integrity must be enforced using a baseline commit hash snapshot stored in harness/.target-baseline during initial baseline setup and compared on every check_target_repo run."
  - "External dependency bootstrapping (yq in ensure_yq) must immediately hard-fail (exit 1) on SHA256 checksum mismatch or unsupported OS/architecture platform combination."
  - "Patch-to-CHG coupling invariant must be enforced mechanically by check_patch_coupling() in ddf-validate.sh, ensuring every .patch file in harness/patches/ is referenced by at least one active or completed Change Record decision_refs/file scope."
  - "ADR extraction authority is exclusively assigned to the Auditor/Reviewer roles during the Spec-Gate phase (/ddf-spec-gate); Builder agents implement specifications but do not approve ADR invariants."
  - "RULES.md §5.2.3 (Enforcement Failure Policy) must explicitly state that validation script failures block pipeline handoffs, git commits, and patch staging."
  - "AGENTS.md and README.md must strictly reference docs/vision/ and docs/README.md for narrative descriptions rather than duplicating full philosophy or objective prose."
  - "Change Records (CHG-XXX) must have their touched files/paths checked against decision_refs[].affected_scope, emitting a warning if edits fall outside approved decision scope."
  - "test-governance.sh must report missing optional tools like shellcheck as explicit [WARN] items without masking them as clean passes in summary counts."
  - "Automated CI workflows (.github/workflows/ddf-gate.yml) must run ddf-gate.sh --check-only on pull requests and pushes to enforce governance regardless of contributor local hook setup."
  - "Document frontmatter schema must standardize on doc_id for vision and journal documents in docs/README.md and ddf-validate.sh."
  - "Spec-Delta bundles must be explicitly linked to Parent Change Records using the spec_delta_ref field in CHG frontmatter, replacing heuristic regex slug guessing in ddf-archive.sh."
date: "2026-07-27"
---

# ADR-005: DDF Enforcement Hardening & Remediation

## Context

Following the adoption of DDF v2 (`ADR-002`), DDF Hardening (`ADR-003`), and the Spec-Delta Increment Pipeline (`ADR-004`), a comprehensive governance red-teaming audit was conducted across the `agy-harness` workspace. The audit identified 11 critical enforcement gaps where governance mechanisms either relied on narrative-only instructions, exhibited validation script bypasses, contained supply-chain vulnerabilities, or suffered from role responsibility contradictions:

1. **Target Repo Read-Only Bypass**: `check_target_repo` in `ddf-validate.sh` only ran `git status --porcelain`, which could fail to detect commit hash drift or dirty baseline states existing prior to agent execution.
2. **Bootstrapping Silent Failure Risk**: `ensure_yq()` in `ddf-lib.sh` failed silently or attempted unverified binary executions upon platform detection failures or SHA256 checksum mismatches.
3. **Uncoupled Patch Leakage**: Patch files could be created in `harness/patches/` without automated verification linking them to active or completed Change Records (`CHG-XXX`).
4. **Role Contradiction on ADR Extraction**: `AGENTS.md` §3 designated the Builder role as responsible for extracting ADRs, contradicting the Spec-Gate pipeline (`.agents/workflows/ddf-spec-gate.md`) which assigns ADR extraction authority exclusively to Auditor/Reviewer roles for checks and balances.
5. **Incomplete Enforcement Policy**: `.agents/rules/RULES.md` §5.2.3 (Enforcement Failure Policy) was missing explicit rules governing script failure handling and non-zero exit code enforcement.
6. **Narrative Vision Duplication**: `AGENTS.md` and `README.md` contained lengthy narrative summaries of system vision and objectives, introducing documentation drift relative to `docs/vision/harness-mission.md` (`VIS-001`).
7. **Unverified Affected Scope**: `ddf-validate.sh` did not cross-validate modified file paths in Change Records against the `affected_scope` declared in bound ADRs.
8. **Silent Pass Masking for Missing Tools**: `test-governance.sh` categorized skipped `shellcheck` execution as a clean pass rather than an explicit warning in the output summary.
9. **Lack of Automated CI Enforcement**: Local git hooks could be bypassed or uninitialized; automated CI workflow integration was missing.
10. **Frontmatter Schema Key Drift**: Discrepancies existed between `docs/README.md` and `ddf-validate.sh` regarding required frontmatter keys (`doc_id` vs `id`) for vision and journal documents.
11. **Heuristic Spec-Delta Archival**: `ddf-archive.sh` relied on heuristic regex matching to discover Spec-Delta folders rather than an explicit `spec_delta_ref` binding in Change Record frontmatter.

To resolve these 11 audit findings permanently, `ADR-005` supersedes `ADR-003` and establishes mechanical enforcement invariants.

## Rationale for the 11 Invariants

- **Invariant 1 (Target Baseline Hash Snapshot)**: Enforces target repository immutability deterministically by comparing `git rev-parse HEAD` against `harness/.target-baseline` commit hash snapshot on every run.
- **Invariant 2 (`yq` Hard-Fail Security)**: Guarantees supply-chain integrity by immediately aborting (`exit 1`) whenever binary checksum validation fails or an unsupported platform is encountered.
- **Invariant 3 (Patch-to-CHG Coupling Verification)**: Mechanically scans `harness/patches/` to ensure every staged patch file is declared within at least one active or completed Change Record.
- **Invariant 4 (Auditor/Reviewer ADR Extraction Authority)**: Reconciles role separation of duties, ensuring Builder agents implement code while Auditor/Reviewer agents validate technical designs and approve ADR invariants during Spec-Gate.
- **Invariant 5 (Explicit Enforcement Failure Policy)**: Codifies `.agents/rules/RULES.md` §5.2.3 to make validation script failures strictly blocking for commits, handoffs, and patch staging.
- **Invariant 6 (Single Source of Truth for Narrative Vision)**: Refactors root documentation (`README.md`, `AGENTS.md`) to point directly to `docs/vision/harness-mission.md`, eliminating narrative duplication and drift.
- **Invariant 7 (Scope Cross-Validation Warning)**: Adds mechanical checking in `ddf-validate.sh` to alert agents when modified files cross boundaries beyond the approved `affected_scope` of bound ADRs.
- **Invariant 8 (Explicit Warning Categorization)**: Prevents false positive governance summaries by tracking missing lint tools explicitly as `WARN` in `test-governance.sh`.
- **Invariant 9 (Automated CI Pipeline Integration)**: Guarantees continuous governance enforcement via `.github/workflows/ddf-gate.yml` running `ddf-gate.sh --check-only` on PRs and main branch pushes.
- **Invariant 10 (Standardized Document Schema Key)**: Harmonizes frontmatter schema validation across `docs/README.md` and `ddf-validate.sh` using standardized `doc_id` key for vision and journal documents.
- **Invariant 11 (Explicit `spec_delta_ref` Binding)**: Replaces fragile regex folder guessing in `ddf-archive.sh` with explicit 1:1 binding between Change Records and Spec-Delta plan folders.

## Consequences

### Positive Outcomes
- Complete elimination of narrative-only governance rules across all 11 audit findings.
- Mechanical, deterministic enforcement via scripts, hooks, and automated CI pipelines.
- Ironclad read-only protection for target repository `d:/CLAUDE-PROJECT/website`.
- Clear separation of duties: Explorer (plan), Auditor/Reviewer (approve ADR invariants & audit), Builder (implement & execute).
- Immutable baseline auditing and error-free 1:1 Spec-Delta archival.

### Trade-Offs & Liabilities
- Requires initial setup of `.target-baseline` commit snapshot during target baseline setup.
- Strict `exit 1` behavior on checksum mismatch prevents fallbacks to unverified binaries.
- Contributors must populate `spec_delta_ref` when initializing Parent Change Records linked to Spec-Delta increments.

## Options Considered

1. **Option A: Narrative Guidance & Manual Checklists (Rejected)**
   - *Pros*: Zero script changes required.
   - *Cons*: High vulnerability to agent non-compliance, silent pass masking, and supply-chain drift.
   - *Reason for Rejection*: Inconsistent with `agy-harness` mission of automated, deterministic agentic governance.

2. **Option B: Strict Mechanical Hardening & 1:1 Schema Coupling (Selected)**
   - *Pros*: Closes all 11 governance vulnerabilities with deterministic script checks, hard-fail security, CI integration, and role clarity.
   - *Cons*: One-time refactoring overhead for scripts, rules, and documentation.
   - *Reason for Selection*: **Selected Approach**. Provides complete protection, auditability, and compliance enforcement across the workspace.

## Action Items

1. [x] Create `ADR-005` in `docs/decisions/ADR-005-ddf-enforcement-remediation.md` with `status: approved` (supersedes `ADR-003`).
2. [x] Update `AGENTS.md` §3 to resolve role contradiction for ADR extraction.
3. [x] Complete `.agents/rules/RULES.md` §5.2.3 Enforcement Failure Policy.
4. [x] Update frontmatter `status: active` in `requirements.md`, `design.md`, and `tasks.md` under `docs/vision/plans/005-ddf-enforcement-remediation/`.
5. [x] Implement script enhancements across `harness/scripts/` (`ddf-validate.sh`, `ddf-lib.sh`, `ddf-archive.sh`, `test-governance.sh`).
6. [x] Create `.github/workflows/ddf-gate.yml` for automated CI enforcement.
7. [x] Execute `ddf-validate.sh` and `ddf-index-sync.sh` to confirm purity of `docs/decisions/index.md`.

---
title: "Analisis Workflow ECC (Everything-as-Code) Agentic Harness"
stage: "2A"
audience: [AI-Agent, Human-Developer]
scope: research/ecc-analysis
source_agent: "ECC Workflow Analyst"
date: "2026-07-29"
sources_read:
  - "d:/dev/agy-os/ECC/WORKING-CONTEXT.md"
  - "d:/dev/agy-os/ECC/the-shortform-guide.md"
  - "d:/dev/agy-os/ECC/the-longform-guide.md"
  - "d:/dev/agy-os/ECC/COMMANDS-QUICK-REF.md"
  - "d:/dev/agy-os/ECC/agent.yaml"
  - "d:/dev/agy-os/ECC/hooks/README.md"
  - "d:/dev/agy-os/ECC/docs/ECC-PRO-SECURITY-ROADMAP.md (Lines 270-348: PR #2318 & Issue #2283 triage data)"
  - "d:/dev/agy-os/ECC/agents/spec-miner.md (Lines 1-218: OpenSpec baseline extraction logic)"
  - "d:/dev/agy-os/ECC/agents/planner.md (OpenSpec Awareness section)"
  - "d:/dev/agy-os/ECC/agents/code-reviewer.md (Spec Compliance Verification section)"
  - "d:/dev/agy-os/ECC/agents/pr-test-analyzer.md (PR coverage analysis logic)"
  - "GitHub Pull Request affaan-m/ECC#2318 (Diff payload: agents/spec-delta-writer.md, agents/spec-fuzzer.md, agents/spec-to-test.md, agents/spec-freshness-checker.md, agents/spec-guardian.md, scripts/ci/validate-openspec-syntax.js, scripts/ci/check-spec-freshness.js)"
  - "d:/dev/agy-os/frameworks/openspec/.agents/plugin/ecc/agents/ (32 agent.md files)"
  - "d:/dev/agy-os/frameworks/openspec/.agents/workflows/ (91 workflow files)"
  - "d:/dev/agy-os/frameworks/openspec/.agents/rules/ (27 rule files)"
  - "d:/dev/agy-os/frameworks/openspec/.agents/skills/ (45 skill directories)"
---

# Stage 2A: Analisis Workflow ECC Agentic Harness

## 1. Daftar Sumber Daya & File yang Dibaca (Audit Log)

Pemeriksaan dan analisis dilakukan secara empiris dengan membaca file-file berikut:

1. `d:/dev/agy-os/ECC/WORKING-CONTEXT.md` — Prinsip arsitektur inti agen dan harness.
2. `d:/dev/agy-os/ECC/the-shortform-guide.md` — Ringkasan alur instruksi agen.
3. `d:/dev/agy-os/ECC/the-longform-guide.md` — Panduan mendalam ekosistem ECC.
4. `d:/dev/agy-os/ECC/COMMANDS-QUICK-REF.md` — Referensi perintah dan shims.
5. `d:/dev/agy-os/ECC/agent.yaml` — Registry sub-agent sistem.
6. `d:/dev/agy-os/ECC/hooks/README.md` — Spesifikasi lifecycle hooks dispatcher.
7. `d:/dev/agy-os/ECC/docs/ECC-PRO-SECURITY-ROADMAP.md` — Data triase PR #2318 & Issue #2283.
8. `d:/dev/agy-os/ECC/agents/spec-miner.md` — Instruksi agen baseline mining OpenSpec.
9. `d:/dev/agy-os/ECC/agents/planner.md` — Ekstensi OpenSpec Awareness untuk pembuatan plan.
10. `d:/dev/agy-os/ECC/agents/code-reviewer.md` — Ekstensi verifikasi spec compliance 4-langkah.
11. `d:/dev/agy-os/ECC/agents/pr-test-analyzer.md` — Evaluasi test coverage pada Pull Request.
12. **GitHub PR affaan-m/ECC#2318** (`feat: add OpenSpec ecosystem`):
    - `agents/spec-delta-writer.md` — Konversi `git diff` → delta spec (`ADDED`/`MODIFIED`/`REMOVED`)
    - `agents/spec-fuzzer.md` — Fuzzer semantik adversaria untuk Invariants
    - `agents/spec-to-test.md` — Skeleton test generator dari skenario
    - `agents/spec-freshness-checker.md` — Verification commit hash freshness auditor
    - `agents/spec-guardian.md` — Weekly/automated spec drift auditor
    - `scripts/ci/validate-openspec-syntax.js` & `scripts/ci/check-spec-freshness.js` — Script CI validation.
13. `d:/dev/agy-os/frameworks/openspec/.agents/plugin/ecc/agents/` (32 sub-agent terpasang).
14. `d:/dev/agy-os/frameworks/openspec/.agents/workflows/` (91 workflow files).
15. `d:/dev/agy-os/frameworks/openspec/.agents/rules/` (27 rule files).
16. `d:/dev/agy-os/frameworks/openspec/.agents/skills/` (45 skill directories).

---

## 2. Arsitektur Inti ECC

Berdasarkan pembacaan mendalam terhadap file-file di atas, ECC dibangun dengan prinsip:

- **Skills-First Architecture**: Kapabilitas didefinisikan secara deklaratif dalam file Markdown (`SKILL.md`) mengikuti spesifikasi `agentskills.io`.
- **Hooks Lifecycle**: Dispatcher `hooks.json` mengatur eksekusi via `PreToolUse`, `PostToolUse`, dan `Stop` events untuk menjamin guardrails.
- **Custom Plugin & Agent Separation**: Memisahkan agen terpasang ke `.agents/plugin/ecc/agents`, workflow ke `.agents/workflows/`, dan rules ke `.agents/rules/`.
- **Non-Destructive Rules**: Tooling memaksa staging rollback dan membatasi manipulasi langsung ke target read-only.

---

## 3. Ekosistem Sub-Agent Terpasang & PR #2318 (37 Agents)

### Planning Phase (5 Agents)
- `planner`: Perencanaan implementasi fitur kompleks (dilengkapi *OpenSpec Awareness*).
- `architect`: Perancangan arsitektur sistem dan keputusan desain.
- `code-architect`: Perancangan fitur berbasis pola codebase yang ada.
- `gan-planner`: Pengembang prompt satu baris menjadi spesifikasi produk lengkap.
- `a11y-architect`: Arsitek Aksesibilitas WCAG 2.2.

### Building/Implementation Phase (6 Agents)
- `code-explorer`: Penelusur jalur eksekusi dan fitur codebase.
- `code-simplifier`: Penyederhana kode tanpa mengubah perilaku.
- `build-error-resolver`: Perbaikan error build/type dengan diff minimal.
- `react-build-resolver`: Diagnostik dan pemulihan build React (Vite, Next.js, Webpack).
- `gan-generator`: Implementator fitur berbasis feedback teriterasi.
- `refactor-cleaner`: Pembersih dead code dan konsolidasi.

### Testing/QA Phase (7 Agents)
- `tdd-guide`: Spesialis TDD (write-tests-first).
- `e2e-runner`: Manajer pengujian Playwright/Vercel end-to-end.
- `agent-evaluator`: Evaluator output agen berbasis rubrik 5-aksis.
- `pr-test-analyzer`: Pemeriksa kualitas dan kelengkapan test coverage pada Pull Request.
- `silent-failure-hunter`: Pemeriksa swallowed errors dan silent failures.
- `spec-to-test` *(PR #2318)*: Generator skeleton test otomatis dari skenario markdown (`WHEN/THEN/AND`).
- `spec-fuzzer` *(PR #2318)*: Fuzzer perilaku semantik untuk menguji batas Invariants secara adversaria.

### Review Phase (8 Agents)
- `code-reviewer`: Reviewer kode terintegrasi dengan verifikasi *Spec Compliance 4-Langkah*.
- `security-reviewer`: Deteksi dan remediasi kerentanan keamanan.
- `react-reviewer`: Reviewer performa, hooks, dan boundaries React/JSX.
- `typescript-reviewer`: Reviewer type safety TypeScript/JavaScript.
- `database-reviewer`: Spesialis optimasi query dan migrasi PostgreSQL.
- `type-design-analyzer`: Penganalisis desain tipe dan enkapsulasi.
- `comment-analyzer`: Penganalisis akurasi komentar dan comment rot.
- `gan-evaluator`: Penguji aplikasi live untuk umpan balik generator.

### Operations/Maintenance Phase (11 Agents)
- `doc-updater`: Spesialis dokumentasi dan pembaruan codemap.
- `docs-lookup`: Pengambil dokumentasi API terkini via Context7 MCP.
- `seo-specialist`: Auditor teknis SEO dan Core Web Vitals.
- `harness-optimizer`: Penganalisis konfigurasi harness lokal.
- `loop-operator`: Operator loop agen otonom dan pengawas intervensi.
- `performance-optimizer`: Spesialis analisis dan optimasi performa.
- `chief-of-staff`: Asisten triase komunikasi.
- `spec-miner`: Ekstraktor behavioral specs dari codebase yang ada untuk baseline OpenSpec.
- `spec-delta-writer` *(PR #2318)*: Generator file delta spec (`ADDED`/`MODIFIED`/`REMOVED`) dari `git diff` per-PR.
- `spec-freshness-checker` *(PR #2318)*: Auditor staleness commit hash `Last verified` terhadap HEAD di CI.
- `spec-guardian` *(PR #2318)*: Agen pengawas mingguan/otomatis untuk kesehatan spec.

---

## 4. Taksonomi Workflow & Perintah Pull Request

1. **Base Workflows**: `plan.md` (interaktif, gate WAIT FOR CONFIRMATION), `build-fix.md`, `save-session.md`, `resume-session.md`.
2. **Bridge Workflows**: `a-planner.md`, `a-code-reviewer.md`, `a-react-reviewer.md`.
3. **Orchestration Workflows**:
   - `orch-add-feature.md`: Pipeline Research → Plan → TDD → Review → Commit.
   - `prp-implement.md`: Eksekusi plan dengan validation loop atomik.
   - `orch-spec-lifecycle` *(PR #2318)*: Lifecycle onboarding/audit spec (`spec-miner` → `spec-fuzzer` → `spec-to-test` → `tdd-guide` → `code-reviewer`).
   - `orch-spec-delta` *(PR #2318)*: Workflow per-PR (`spec-delta-writer` → `planner` → `tdd-guide` → `code-reviewer`).
4. **Quality, Review & PR Workflows**:
   - `/pr` & `/prp-pr`: Pembuat Pull Request otomatis via `gh` CLI.
   - `/review-pr`: Menjalankan review multi-perspektif paralel pada PR.
   - `quality-gate.md`, `security-scan.md`, `test-coverage.md`.

---

## 5. Matriks Coverage Rules & Hooks

- **Rules (`.agents/rules/`)**: `common-agents.md` (Delegation Completion Contract), `common-coding-style.md` (Immutability), `common-code-review.md` (ditambah 4-step Spec Compliance check), `common-git-workflow.md` (Pull Request & conventional commits).
- **Hooks (`hooks.json` & CI Scripts)**:
  - Event `PreToolUse`, `PostToolUse`, dan `Stop`.
  - Integrasi AgentShield.
  - Script CI PR: `validate-openspec-syntax.js` & `check-spec-freshness.js` (dengan `ECC_SPEC_STALE_WARN_ONLY=true`).

---

## 6. Observasi Kunci Stage 2A

1. **Alur Per-PR Berbasis Delta (`orch-spec-delta`)**: Menghubungkan perubahan `git diff` langsung ke delta spec tanpa merusak baseline spec utama.
2. **Verifikasi Compliance 4-Langkah pada Review PR**: `code-reviewer` memverifikasi bahwa perubahan kode tidak melanggar Invariants yang didefinisikan pada OpenSpec.
3. **Audit Hash Commit Terverifikasi**: `spec-freshness-checker` menjamin spec tidak pernah usang dibanding kode terkini pada HEAD.

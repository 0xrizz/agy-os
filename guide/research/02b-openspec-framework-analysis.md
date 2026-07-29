---
title: "Analisis Framework OpenSpec Spec-Driven Development"
stage: "2B"
audience: [AI-Agent, Human-Developer]
scope: research/openspec-analysis
source_agent: "OpenSpec Framework Analyst (7587a732)"
date: "2026-07-29"
sources_read:
  - d:/dev/agy-os/OpenSpec/docs/concepts.md
  - d:/dev/agy-os/OpenSpec/docs/overview.md
  - d:/dev/agy-os/OpenSpec/docs/opsx.md
  - d:/dev/agy-os/OpenSpec/docs/workflows.md
  - d:/dev/agy-os/OpenSpec/docs/agent-contract.md
  - d:/dev/agy-os/OpenSpec/docs/existing-projects.md
  - d:/dev/agy-os/OpenSpec/docs/explore.md
  - d:/dev/agy-os/OpenSpec/docs/writing-specs.md
  - d:/dev/agy-os/OpenSpec/docs/reviewing-changes.md
  - d:/dev/agy-os/OpenSpec/docs/supported-tools.md
  - d:/dev/agy-os/OpenSpec/docs/getting-started.md
  - d:/dev/agy-os/OpenSpec/docs/how-commands-work.md
  - d:/dev/agy-os/OpenSpec/schemas/spec-driven/schema.yaml
  - d:/dev/agy-os/OpenSpec/openspec/config.yaml
  - d:/dev/agy-os/OpenSpec/skills/ (12 upstream skills)
  - d:/dev/agy-os/frameworks/openspec/.agent/skills/ (6 installed skills)
  - d:/dev/agy-os/frameworks/openspec/.agent/workflows/ (6 installed workflows)
---

# Stage 2B: Analisis Framework OpenSpec Spec-Driven Development

## 1. Arsitektur OpenSpec

OpenSpec adalah framework **Spec-Driven Development (SDD)** yang berfungsi sebagai "lapisan persetujuan ringan antara manusia dan AI." Framework ini memaksa alur kerja di mana manusia dan AI menyepakati *apa yang akan dibangun* sebelum kode apa pun ditulis, melawan halusinasi AI dan scope creep.

### 5 Konsep Inti

1. **Specs are the truth**: Direktori `openspec/specs/` bertindak sebagai Single Source of Truth untuk perilaku sistem saat ini, diorganisir berdasarkan domain.
2. **A change is one unit of work**: Setiap fitur atau perbaikan mendapat folder dedicated di `openspec/changes/` berisi semua artefak perencanaan dan tugas.
3. **Delta specs for brownfield editing**: Tidak perlu menulis ulang seluruh spec sistem. Cukup deskripsikan diff (`ADDED`, `MODIFIED`, `REMOVED`) relatif terhadap perilaku saat ini.
4. **Artifacts build on each other**: Pekerjaan mengalir natural melalui `proposal` → `specs` → `design` → `tasks`.
5. **Archiving folds the change back into truth**: Setelah diimplementasi, delta specs digabung ke main specs, dan folder change dipindahkan ke `changes/archive/`.

### OPSX vs Legacy

OpenSpec telah beralih dari workflow "phase-locked" legacy ke **OPSX**, workflow iteratif berbasis **Directed Acyclic Graph (DAG)** artefak. Dalam OPSX, dependensi adalah *enabler*, bukan *gate*. Design bisa diperbarui di tengah implementasi tanpa merusak proses.

---

## 2. Peta Lifecycle Lengkap

| Fase | Trigger | Apa yang Terjadi | Output | Transisi State |
|:---|:---|:---|:---|:---|
| **Explore** | `/opsx:explore` | AI menyelidiki codebase, memetakan perilaku saat ini, dan mendiskusikan opsi dengan user. | Percakapan/Insights | Tidak ada perubahan state. |
| **Propose** | `/opsx:propose <name>` | Membuat direktori change baru. Scaffolding dan menghasilkan artefak perencanaan berurutan (Proposal → Specs → Design → Tasks). | `proposal.md`, `specs/**/*.md`, `design.md`, `tasks.md` | Artefak transisi dari `blocked` → `ready` → `done`. |
| **Apply** | `/opsx:apply` | Agent membaca semua artefak yang selesai, iterasi melalui tasks, menulis kode, dan memperbarui checkbox (`- [ ]` ke `- [x]`). | Modifikasi kode, `tasks.md` tercentang | Tasks ditandai selesai. |
| **Update** | `/opsx:update` | Merevisi artefak perencanaan yang ada agar tetap koheren saat plan berubah di tengah jalan. | Artefak yang direvisi | Koherensi artefak dipulihkan. |
| **Sync** | `/opsx:sync` | Menggabungkan delta specs ke main specs. | Main specs yang diperbarui | Specs utama diperbarui. |
| **Verify** | `/opsx:verify` | Memvalidasi implementasi terhadap artefak: Completeness, Correctness, dan Coherence. (Expanded workflow only) | Laporan verifikasi/peringatan | Validasi pre-archive. |
| **Archive** | `/opsx:archive` | Memeriksa penyelesaian tasks dan artefak. Memindahkan folder change ke archive. | Specs ter-sync, folder ter-arsip | Change dipindahkan ke `changes/archive/YYYY-MM-DD-<name>`. |

---

## 3. Schema & Model Data

OpenSpec digerakkan oleh schema (`schemas/spec-driven/schema.yaml`).

### Struktur Artefak

- **`proposal.md`**: Menetapkan *MENGAPA* dan *APA*. Bagian: Why, What Changes, Capabilities (New/Modified), Impact.
- **`spec.md`**: Mendefinisikan perilaku yang dapat diamati. Format: `### Requirement: <name>` dan `#### Scenario: <name>` dengan klausa `WHEN/THEN/AND`. Operasi delta menggunakan `## ADDED`, `MODIFIED`, atau `REMOVED Requirements`.
- **`design.md`**: Menjelaskan *BAGAIMANA*. Bagian: Context, Goals/Non-Goals, Decisions, Risks/Trade-offs, Migration Plan, Open Questions.
- **`tasks.md`**: Checklist implementasi dengan checkbox Markdown (`- [ ]`).

### Konfigurasi (`openspec/config.yaml`)

Mencakup schema, `context` global (tech stack, konvensi), dan `rules` per-artefak. Context diinjeksikan ke semua prompt agen.

---

## 4. Analisis Kontrak Agen

OpenSpec dibangun untuk otomasi AI via CLI `openspec`:

- **JSON Output Interface**: CLI menghasilkan JSON machine-readable menggunakan envelope `StoreDiagnostic` standar (`severity`, `code`, `message`, `target`, `fix`).
- **DAG Engine**: Agen mengandalkan `openspec status --change <name> --json` untuk mendapatkan topological sort artefak dan readiness-nya (`done`, `ready`, `blocked`, `skipped`).
- **Context Injection**: Saat agen meminta instruksi untuk artefak (`openspec instructions <id> --json`), ia menerima `template`, `instruction`, `context`, dan `rules`.
- **Strict Boundaries**: Agen diinstruksikan untuk TIDAK menyalin `<context>` atau `<rules>` langsung ke artefak, melainkan menggunakannya sebagai constraint.

---

## 5. Analisis Gap Skills

### Upstream Repository (12 Skills)
`explore`, `propose`, `apply-change`, `update-change`, `sync-specs`, `archive-change`, `new-change`, `continue-change`, `ff-change`, `verify-change`, `bulk-archive-change`, `onboard`.

### Installed Framework (6 Skills)
`explore`, `propose`, `apply-change`, `update-change`, `sync-specs`, `archive-change`.

### Gap & Alasan

6 skill yang hilang adalah bagian dari **"expanded" workflow profile**:

| Missing Skill | Fungsi | Alasan Tidak Terpasang |
|:---|:---|:---|
| `new-change` | Membuat artefak satu per satu (bukan batch) | Profil core menggunakan `propose` (batch) |
| `continue-change` | Melanjutkan pembuatan artefak yang belum selesai | Profil core menggunakan `propose` (batch) |
| `ff-change` | Fast-forward change | Fitur expanded |
| `verify-change` | Validasi pre-archive | Fitur expanded |
| `bulk-archive-change` | Arsip banyak change sekaligus | Fitur expanded |
| `onboard` | Tutorial terpandu untuk pengguna baru | Fitur expanded |

Pengguna harus opt-in via `openspec config profile` dan `openspec update` untuk menginstal.

---

## 6. Analisis Flow Workflow

### `/opsx-propose`
1. Memanggil `openspec new change <name>`
2. Loop: `openspec status --json` → temukan artefak `ready`
3. Memanggil `openspec instructions` untuk setiap artefak
4. Menghasilkan file
5. Lanjutkan sampai dependensi `applyRequires` terpenuhi

### `/opsx-apply`
1. Mendapatkan `contextFiles` dari `openspec instructions apply`
2. Membaca proposal, specs, design, dan tasks
3. Iterasi implementasi checklist task demi task

### `/opsx-archive`
1. Memeriksa penyelesaian tasks dan artefak
2. Mengevaluasi delta specs
3. Menggunakan `openspec-sync-specs` skill jika user memilih sync
4. Memindahkan direktori ke `changes/archive/YYYY-MM-DD-<name>`

---

## 7. Observasi Kunci

1. **Brownfield-First Design**: Delta specs memungkinkan tim mengadopsi OpenSpec di codebase besar yang sudah ada tanpa perlu mendokumentasikan semuanya di depan.
2. **"Enablers, not gates"**: Framework meninggalkan fase waterfall kaku. Design bisa direvisi di tengah implementasi tanpa merusak toolchain.
3. **Store Beta Capability**: OpenSpec mendukung repositori "store" mandiri, artinya artefak perencanaan dan specs tidak harus tinggal di dalam repo kode aktual, memungkinkan koordinasi fitur lintas-repo.
4. **Tool Agnosticism**: Desain dual CLI/Chat memungkinkan framework beroperasi lintas Claude Code, Cursor, Copilot, Devin, dll., dengan mengkonversi schema identik ke skills/commands spesifik tool.

---

## 8. Contoh Data Kerja

### `openspec/changes/` (Pekerjaan Aktif)
19 direktori change aktif, termasuk `add-devin-desktop-support`, `fix-cli-local-date-semantics`, `add-update-workflow`, dan folder `archive/`. Juga termasuk file `IMPLEMENTATION_ORDER.md`.

### `openspec/explorations/` (Eksplorasi)
Dokumentasi dari fase eksplorasi: `explore-workflow-ux.md`, `workspace-architecture.md`, `workspace-roadmap.md`, `workspace-user-journeys.md`, `workspace-ux-simplification.md`.

### `openspec/specs/` (Truth Utama)
36 domain/kapabilitas, termasuk `cli-validate`, `context-injection`, `artifact-graph`, `schema-resolution`, `legacy-cleanup`, membuktikan organisasi requirements berbasis domain.

---

## 9. Ekosistem Integrasi OpenSpec di Upstream ECC (PR #2318 / Issue #2283)

Upstream ECC (`affaan-m/ECC` PR #2318) menambahkan ekosistem native untuk spec-driven development yang menghubungkan OpenSpec langsung ke alur kerja Pull Request dan CI:

### A. Sub-Agents Baru
1. **`spec-delta-writer`**: Mengomparasi diff kode terhadap baseline specs (`openspec/specs/`) dan secara otomatis menghasilkan file `openspec/deltas/<capability>/delta.md` (`ADDED`/`MODIFIED`/`REMOVED`) berjangkar `<!-- id: -->`.
2. **`spec-fuzzer`**: Fuzzer perilaku semantik yang menganalisis Invariants/Requirements untuk menghasilkan input uji adversaria.
3. **`spec-to-test`**: Mengkonversi skenario markdown (`WHEN/THEN/AND`) menjadi skeleton pengujian otomatis (Vitest, Jest, PyTest, Playwright).
4. **`spec-freshness-checker`**: Memeriksa apakah commit tag `Last verified` pada spec masih fresh terhadap HEAD dan source files yang berubah.
5. **`spec-guardian`**: Agent pengawas otomatis/mingguan untuk mendeteksi drift spec dan un-spec'd code.

### B. Orchestration Skills
- **`orch-spec-lifecycle`**: Pipeline audit & onboarding terpadu (`spec-miner` → `spec-fuzzer` → `spec-to-test` → `tdd-guide` → `code-reviewer`).
- **`orch-spec-delta`**: Pipeline per-PR terpadu (`spec-delta-writer` → `planner` → `tdd-guide` → `code-reviewer`).

### C. Integrasi CI & Validasi Automatis
- **`validate-openspec-syntax.js`**: Validasi syntax dan anchor tags pada file spec/delta.
- **`check-spec-freshness.js`**: Enforcing staleness gate dengan flag `ECC_SPEC_STALE_WARN_ONLY=true`.


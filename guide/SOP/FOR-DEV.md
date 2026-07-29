---
title: "Human Developer Standard Operating Procedure: HITL Review & Approval Gates"
audience: [Human-Developer, Technical-Lead, Code-Reviewer]
scope: "guide/SOP/FOR-DEV"
prerequisites:
  - "d:/dev/agy-os/AGENTS.md"
  - "d:/dev/agy-os/guide/README.md"
  - "d:/dev/agy-os/guide/architecture/overview.md"
related_commands:
  - "/opsx-propose"
  - "/opsx-apply"
  - "/review-pr"
  - "/opsx-sync"
---

# Human Developer SOP: HITL Review & Approval Gates

## 1. Overview & Objective

Document ini menetapkan Standard Operating Procedure (SOP) bagi Pengembang Manusia (Human Developer / Technical Lead) dalam melakukan peninjauan (*review*), evaluasi kuantitatif, dan persetujuan (*approval*) terhadap *artifact* serta *patch* yang dihasilkan oleh AI Agent di dalam ekosistem **OpenAGY / ECC**.

Proses integrasi ini menerapkan mekanisme **Human-in-the-Loop (HITL)** pada 2 titik kritis (Gate 1 dan Gate 2) untuk menjamin keamanan repositori target read-only (`d:/CLAUDE-PROJECT/website`), kepatuhan spesifikasi OpenSpec, serta kualitas kode tanpa kompromi.

---

## 2. HITL Gate 1: Proposal & Tasks Review (Pre-Execution Gate)

HITL Gate 1 dilakukan setelah AI Agent menjalankan command `/opsx-propose` dan sebelum eksekusi pengkodean/TDD (`/opsx-apply`) dimulai. Pengembang manusia wajib memverifikasi proposal rancangan dan rencana tugas yang dihasilkan oleh agen `planner` dan `architect`.

### 2.1 Quantitative Approval Criteria (HITL Gate 1)

Untuk meloloskan proposal ke tahap eksekusi, seluruh kriteria kuantitatif berikut wajib terpenuhi 100%:

| Kriteria Evaluasi | Ambang Batas Kuantitatif (Threshold) | Cara Verifikasi | Status Approval |
| :--- | :--- | :--- | :--- |
| **1. Artifact Presence** | **100% Complete** (4/4 file wajib ada) | Periksa keberadaan `proposal.md`, `specs/`, `design.md`, dan `tasks.md` pada folder change. | `[ ] PASS / [ ] FAIL` |
| **2. Spec Impact Table** | **100% Populated** | Agen `planner` menyertakan tabel dampak spesifikasi yang mencakup modul terdampak, tipe delta (`ADDED`/`MODIFIED`/`REMOVED`), dan link spec terkait. | `[ ] PASS / [ ] FAIL` |
| **3. Explicit Non-Goals** | **>= 1 Non-Goal** tercantum secara jelas | Memastikan `proposal.md` memuat seksi "Non-Goals" atau "Out of Scope" untuk mencegah scope creep. | `[ ] PASS / [ ] FAIL` |
| **4. Non-Destructive Arch Check** | **100% Compliant** | Memastikan rencana pengkodean tidak melakukan penulisan langsung ke `d:/CLAUDE-PROJECT/website`, dan semua patch diarahkan ke `d:/dev/agy-os/harness/patches/`. | `[ ] PASS / [ ] FAIL` |

### 2.2 Gate 1 Verification Checklist

- [ ] **Artifact Integrity**: Apakah folder change memuat file `proposal.md`, `specs/`, `design.md`, dan `tasks.md`?
- [ ] **Spec Impact Completeness**: Apakah tabel dampak spesifikasi di `proposal.md` sudah merinci seluruh modul target yang akan dimodifikasi?
- [ ] **Scope Control**: Apakah seksi Non-Goals dengan tegas membatasi perubahan yang speculative atau unnecessary?
- [ ] **Safety Guarantee**: Apakah rencana eksekusi mematuhi batas read-only repositori target dan patch staging?

> **Tindakan Reviewer**: Jika salah satu kriteria bernilai `FAIL`, kembalikan ke AI Agent dengan instruksi perbaikan plan sebelum memberikan persetujuan eksekusi.

---

## 3. HITL Gate 2: Patch & PR Review (Post-Execution Gate)

HITL Gate 2 dilakukan setelah AI Agent menyelesaikan eksekusi TDD (`/opsx-apply`) dan verifikasi awal `code-reviewer` (`/review-pr`). Human Developer meninjau patch yang ada di `d:/dev/agy-os/harness/patches/` sebelum diterapkan secara fisik ke repositori target (`d:/CLAUDE-PROJECT/website`).

### 3.1 Quantitative Approval Criteria (HITL Gate 2)

Untuk meloloskan patch dan menerima Pull Request, patch wajib memenuhi 6 kriteria kuantitatif berikut secara absolut:

| Kriteria Evaluasi | Ambang Batas Kuantitatif (Threshold) | Cara Verifikasi | Status Approval |
| :--- | :--- | :--- | :--- |
| **1. Build Errors** | **0 Errors** | Menjalankan kompilasi / build check pada repositori target setelah patch disimulasikan. | `[ ] PASS / [ ] FAIL` |
| **2. Test Failures** | **0 Failures** (100% Pass Rate) | Menjalankan test suite pada unit test & integration test terkait. | `[ ] PASS / [ ] FAIL` |
| **3. Spec Compliance Check** | **100% Pass** (4-Step Verification) | Verifikasi 4-Langkah `code-reviewer`: Locators `<!-- enforced: -->`, Invariants, Requirements, dan Delta Match. | `[ ] PASS / [ ] FAIL` |
| **4. Security Audit** | **0 High / Critical Vulnerabilities** | Pemindaian `security-reviewer` dan static security scan bersih dari temuan bahaya tinggi. | `[ ] PASS / [ ] FAIL` |
| **5. Dry Run Patch Check** | **Clean Pass** (`0 Conflicts`) | Eksekusi `git apply --check <patch_file>` menghasilkan status 0 / tanpa rejected hunks. | `[ ] PASS / [ ] FAIL` |
| **6. Delta Spec Match** | **1:1 Correlation** | Setiap entri `ADDED`/`MODIFIED`/`REMOVED` pada delta spec mencerminkan baris perubahan pada diff patch secara akurat. | `[ ] PASS / [ ] FAIL` |

### 3.2 4-Step Spec Compliance Verification Protocol

Sebagai bagian dari Gate 2, pengembang manusia mengonfirmasi hasil pengujian 4-langkah agen `code-reviewer`:

1. **Step 1 — Enforced Spec Locators**: Memastikan semua kode baru/dimodifikasi terhubung dengan jangkar `<!-- enforced: <spec_id> -->`.
2. **Step 2 — Architectural Invariants**: Memastikan tidak ada aturan immutability, boundary encapsulation, atau coding style yang dilanggar.
3. **Step 3 — Functional Requirements**: Memastikan setiap skenario spec (`WHEN` -> `THEN` -> `AND`) tercover oleh unit/integration test.
4. **Step 4 — Delta Spec Consistency**: Memastikan perubahan spec di `openspec/deltas/` tepat seimbang dengan patch fisik.

---

## 4. Patch Acceptance & Git Apply Procedure

Setelah patch lolos pengujian kriteria HITL Gate 2 secara kuantitatif, Pengembang Manusia mengeksekusi penerapan patch dari `d:/dev/agy-os/harness/patches/` ke repositori target `d:/CLAUDE-PROJECT/website/` menggunakan **Git Bash**.

> **PENTING**: Semua perintah shell wajib dijalankan dalam lingkungan **Git Bash** dengan format *forward-slash* (`/`).

### 4.1 Step-by-Step Command Execution Guide

#### Step 1: Staging Patch Inspection & Dry Run (`git apply --check`)

Lakukan pengujian *dry run* untuk memastikan patch dapat diterapkan tanpa konflik atau hambatan format:

```bash
# Pindah ke direktori target website
cd d:/CLAUDE-PROJECT/website

# Jalankan dry run check terhadap file patch di harness
git apply --check d:/dev/agy-os/harness/patches/feature-name.patch
```

*Jika output tidak menghasilkan error/conflict, lanjutkan ke Step 2.*

#### Step 2: Apply Patch to Target Repository (`git apply`)

Terapkan patch secara resmi ke repositori target:

```bash
# Terapkan patch fisik
git apply d:/dev/agy-os/harness/patches/feature-name.patch

# Verifikasi status perubahan file di target
git status
```

#### Step 3: Target Repository Build & Verification Pass

Jalankan pengujian build dan test suite pada repositori target untuk mengonfirmasi stabilitas kode:

```bash
# Jalankan kompilasi / typecheck / build target
npm run build

# Jalankan unit test repositori target
npm test
```

#### Step 4: Commit & Push Changes

Setelah verifikasi build dan test bernilai PASS, lakukan commit dan push perubahan ke repositori target:

```bash
# Add perubahan file target
git add .

# Commit dengan pesan konvensional sesuai delta spec
git commit -m "feat(scope): implement changes from delta spec feature-name"

# Push ke repositori remote target
git push origin main
```

#### Step 5: Post-Apply Spec Archiving & Sync

Setelah patch sukses diterapkan dan dipush, panggil workflow OpenSpec untuk memperbarui spesifikasi utama dan mengarsip perubahan:

```bash
# Pindah kembali ke workspace harness agy-os
cd d:/dev/agy-os

# Eksekusi sync dan archive via slash commands
/opsx-sync
/opsx-archive
```

---

## 5. Rejection & Remediation Workflow

Jika *artifact* atau *patch* gagal memenuhi kriteria HITL Gate 1 atau Gate 2:

1. **Catat Defek**: Buat ringkasan item kegagalan (misalnya: test failure pada module X, atau miss match pada delta spec).
2. **Kirim Feedback ke Agent**: Sediakan pesan umpan balik terstruktur berisi lokasi file, log error, dan ekspektasi perbaikan.
3. **Re-Execution Loop**: Minta AI Agent melakukan perbaikan ulang (`/opsx-apply` atau perbaikan plan) tanpa melakukan bypass gate.
4. **Re-Audit**: Ulangi pemeriksaan kuantitatif Gate 1 / Gate 2 hingga seluruh syarat bernilai `PASS`.

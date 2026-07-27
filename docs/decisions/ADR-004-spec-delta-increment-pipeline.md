---
decision_id: "ADR-004"
status: "approved"
supersedes: null
goal: "Mengadopsi pola Spec-Delta/Increment-Based Development (OpenSpec) untuk mendekomposisi sub-misi Vision menjadi paket spesifikasi teknis, keputusan invariant (ADR), dan unit eksekusi Change Record (CHG)."
affected_scope:
  - "docs/"
  - "docs/vision/"
  - "docs/decisions/"
  - "docs/changes/"
  - ".agents/rules/"
  - "harness/scripts/"
  - "AGENTS.md"
  - "README.md"
invariants:
  - "Dekomposisi sub-misi Vision (VIS-001) menjadi rencana teknis wajib menggunakan format Spec-Delta Bundle di bawah folder docs/vision/plans/<increment-slug>/ yang terdiri dari requirements.md, design.md, dan tasks.md."
  - "Satu paket Spec-Delta diizinkan dan berwenang mengekstrak nol, satu, atau banyak (1-to-N) Decision Records (ADR-XXX) independen yang memuat aturan arsitektural kaku dari dokumen design.md."
  - "Setiap satu paket Spec-Delta dikelola oleh tepat satu Parent Change Record (CHG-XXX); checklist langkah kerja pada tasks.md wajib diimpor menjadi handoff checklist eksekusi pada CHG-XXX tersebut."
  - "Indeks docs/decisions/index.md wajib dijaga kemurniannya dan HANYA mencatat ADR yang berstatus approved atau superseded sebagai active binding constraints."
  - "Setelah Change Record (CHG-XXX) pendukung disetujui dan diselesaikan (status: completed/archived), seluruh folder paket Spec-Delta wajib dipindahkan ke docs/vision/plans/archive/<increment-slug>/ sebagai rekam jejak historis."
date: "2026-07-27"
---

# ADR-004: Spec-Delta Increment Development & Task Decomposition Pipeline

## Context

Pada arsitektur DDF v2 dan Hardened (`ADR-002`, `ADR-003`), alur dokumentasi memiliki gap mekanis antara dokumen misi strategis makro (`docs/vision/harness-mission.md` / `VIS-001`) dan keputusan hukum kaku (`docs/decisions/ADR-XXX`). Tidak ada alur baku untuk mendekomposisi sub-misi makro dari Vision menjadi unit-unit task kecil yang terukur tanpa merusak kesucian dokumen vision atau mencemari indeks keputusan.

Tiga pendekatan awal mengalami kegagalan karena:
1. Memaksa draf eksplorasi dimasukkan langsung ke `ADR-XXX` (mencemari `decisions/index.md` dan gagal memuat kardinalitas 1-to-N).
2. Memaksa pembengkakan dokumen `VIS-001` dengan detail taktis yang merusak sifat strategis jangka panjangnya.
3. Mencampuradukkan pencatatan tugas eksekusi dengan dokumen hukum arsitektural.

## Rationale

Untuk memfasilitasi pembagian kerja yang terstruktur berbasis **Spec-Driven Development (SDD)** ala OpenSpec/spec-kit, kita menetapkan mekanisme **Spec-Delta Increment Pipeline**:

1. **Paket Spec-Delta (`docs/vision/plans/<increment-slug>/`)**:
   - Setiap kali sub-misi dari `VIS-001` akan diturunkan menjadi kerja nyata, agen `explorer` membuat folder **Spec-Delta Bundle** di `docs/vision/plans/<increment-slug>/` yang memuat 3 file standar:
     - `requirements.md`: Mendefinisikan kebutuhan fungsional/non-fungsional dan kriteria penerimaan (*acceptance criteria*), merujuk ke `VIS-001`.
     - `design.md`: Memuat rancangan teknis, alur data, topologi komponen, serta analisis *trade-off*.
     - `tasks.md`: Memuat daftar terurut langkah-langkah tugas eksekusi atomik.

2. **Ekstraksi Decision Anchors (Kardinalitas 1-to-N)**:
   - Apabila penyusunan `design.md` menghasilkan aturan kaku (*invariants*) yang wajib dipatuhi sistem di masa depan, agen mengekstrak $N$ dokumen `ADR-XXX` terpisah ke dalam `docs/decisions/`.
   - Setiap `ADR-XXX` yang diekstrak diaudit oleh `auditor` hingga berstatus `approved` sebelum eksekusi dimulai.

3. **Penyelarasan Eksekusi Parent CHG-XXX**:
   - Satu paket Spec-Delta diikat oleh satu **Parent Change Record (`CHG-XXX`)**.
   - Agen `builder` mengimpor daftar tugas dari `tasks.md` ke dalam bagian *Handoff Checklist* di `CHG-XXX` dan mencantumkan `decision_refs: ['ADR-XXX']` yang telah disetujui.

4. **Pengarsipan Terisolasi (Archival Lifecycle)**:
   - Setelah `CHG-XXX` selesai dieksekusi, diverifikasi `reviewer`, dan diaudit `auditor` (`status: completed`), seluruh folder paket Spec-Delta dipindahkan dari `docs/vision/plans/<increment-slug>/` ke `docs/vision/plans/archive/<increment-slug>/`.
   - Folder `docs/vision/` dan `docs/decisions/index.md` tetap bersih dari draf atau spesifikasi masa lalu yang sudah selesai dikerjakan.

## Consequences

- **Positive Outcomes**:
  - Alur dekomposisi misi strategis menjadi task eksekusi menjadi sangat jelas, terukur, dan transparan.
  - Memisahkan secara tegas antara *Kebutuhan* (`requirements.md`), *Desain Teknis* (`design.md`), *Langkah Kerja* (`tasks.md`), *Aturan Hukum* (`ADR-XXX`), dan *Log Eksekusi* (`CHG-XXX`).
  - Mendukung hubungan 1 Spec-Delta ke Banyak ($N$) ADR secara alami tanpa pemecahan atau penggabungan paksa file decision.
  - Indeks `docs/decisions/index.md` terjaga 100% murni memuat aturan sah yang sedang berlaku.
  - Rekam jejak historis spesifikasi tersimpan rapi di folder `docs/vision/plans/archive/`.

- **Trade-Offs & Liabilities**:
  - Diperlukan struktur folder baru `docs/vision/plans/<increment-slug>/` dan `docs/vision/plans/archive/`.
  - Memerlukan pembaruan pada skrip `harness/scripts/ddf-validate.sh` dan `ddf-archive.sh` untuk memvalidasi dan memindahkan folder Spec-Delta saat pengarsipan.

## Options Considered

1. **Option 1: Draft-ADR Inline Spec (Ditolak)**
   - *Pros*: Tanpa folder baru.
   - *Cons*: Mencemari indeks keputusan; gagal menangani kardinalitas 1-to-N; mencampur draf cair dengan dokumen hukum kaku.
   - *Reason for Rejection*: Merusak utilitas `decisions/index.md`.

2. **Option 2: Single-File Plan Documents (Ditolak)**
   - *Pros*: Satu file per rencana teknis.
   - *Cons*: Menggabungkan syarat, desain, dan task list ke dalam 1 file markdown raksasa yang sulit diurai agen secara terpisah.
   - *Reason for Rejection*: Kurang modular dibanding paket Spec-Delta 3-file.

3. **Option 3: Spec-Delta Increment Development & Archival Pipeline (Selected)**
   - *Pros*: Sangat modular; terpisah antara requirements, design, dan tasks; mendukung kardinalitas 1-to-N; otomatis diarsipkan setelah selesai; memetakan peran agen secara sempurna.
   - *Cons*: Memerlukan penyesuaian minor pada skrip `ddf-validate.sh` & `ddf-archive.sh`.
   - *Reason for Selection*: **Selected Approach**. Solusi paling matang, terstruktur, dan akurat secara Spec-Driven Development.

---
decision_id: "ADR-003"
status: "superseded"
supersedes: null
goal: "Mengeraskan (harden) lapisan governance DDF dengan penegakan otomatis, kosakata status yang konsisten, cakupan validasi frontmatter yang lengkap, dan bootstrap script yang lebih aman."
affected_scope:
  - "docs/"
  - ".agents/rules/"
  - ".agents/workflows/"
  - "harness/scripts/"
  - "AGENTS.md"
  - "README.md"
invariants:
  - "Validasi DDF (ddf-gate.sh --check-only) harus dijalankan secara otomatis melalui git hook (pre-commit) atau CI, bukan hanya berdasarkan instruksi manual di markdown."
  - "Setiap tipe dokumen (ADR, CHG, vision, journal) harus memiliki satu enum status kanonik yang didefinisikan sekali di docs/README.md dan direferensikan oleh seluruh script/template, tanpa duplikasi definisi yang berbeda."
  - "Field affected_scope pada setiap Decision Record harus mencerminkan direktori yang benar-benar terdampak oleh perubahan yang dijelaskan pada saat draft/approval, dan diverifikasi ulang saat ADR baru dibuat."
  - "ddf-validate.sh harus memvalidasi frontmatter untuk seluruh tipe dokumen bertata-kelola di docs/ (vision, journal), bukan hanya file berpola ADR-*.md dan CHG-*.md."
  - "Dependensi eksternal yang diunduh oleh script harness (mis. yq) harus dipin ke versi spesifik dan diverifikasi checksum-nya sebelum digunakan, serta mendukung deteksi OS/arch secara dinamis, bukan hardcoded ke satu platform."
  - "Pemeriksaan integritas target repo (read-only guarantee) harus menggunakan perbandingan snapshot hash (baseline commit vs commit saat validasi) sebagai pelengkap git status --porcelain, agar dapat mendeteksi kasus target bukan repo git yang valid maupun dirty-state pre-existing yang tidak terkait sesi agent."
  - "AGENTS.md dan README.md tidak boleh menduplikasi narasi arsitektur/misi secara substantif; keduanya harus merujuk (link) ke docs/vision/ sebagai satu-satunya sumber kebenaran naratif, guna mencegah drift antar dokumen."
  - "Script governance di harness/scripts/ harus memiliki pengujian sendiri (shellcheck lint minimum, idealnya unit test skenario pass/fail) sebagai bagian dari pipeline ddf-gate.sh, sehingga kegagalan logika validasi tidak lolos tanpa terdeteksi."
date: "2026-07-27"
---

# ADR-003: DDF Enforcement & Consistency Hardening

## Context

Setelah ADR-002 (DDF v2 Refinement) diimplementasikan melalui CHG-001, dilakukan tinjauan arsitektur menyeluruh terhadap seluruh subsistem DDF (`docs/`, `.agents/rules/RULES.md`, `harness/scripts/`). Tinjauan ini menemukan bahwa fondasi DDF v2 sudah solid — pemisahan read-only/read-write yang jelas, pola supersede pada decision record, dan coupling invariant antara CHG dan ADR yang approved — namun terdapat delapan celah desain yang mengurangi keandalan sistem sebagai *cognitive bridge* lintas sesi agent:

1. **Governance bersifat disarankan, bukan ditegakkan.** Tidak ada git hook atau CI yang memaksa `ddf-gate.sh` dijalankan; agent yang stokastik bisa saja lupa menjalankannya.
2. **Bootstrap `yq` rawan supply-chain dan tidak portabel.** `ensure_yq()` mengunduh binary `latest` release tanpa pin versi/checksum, dan hardcoded untuk Windows amd64 saja.
33. **Duplikasi single-source-of-truth.** `AGENTS.md` dan `README.md` menceritakan ulang misi/arsitektur secara substantif, alih-alih sekadar merujuk ke `docs/vision/`, membuka celah drift antar dokumen yang seharusnya satu sumber kebenaran.
4. **Skema status tidak konsisten.** `docs/README.md` mendefinisikan status generik (`draft|proposed|approved|accepted|superseded|archived`), template ADR hanya mengizinkan subset berbeda, dan CHG tidak punya enumerasi resmi sama sekali padahal `ddf-archive.sh` memeriksa status `completed`/`verified` yang tidak terdefinisi di manapun.
5. **`affected_scope` ADR-002 tidak mencerminkan cakupan aktual** — identik dengan ADR-001 padahal ADR-002 memperkenalkan `frameworks/` dan `harness/scripts/` sebagai perubahan besar.
6. **Validasi hanya menyasar ADR/CHG.** `docs/vision/*.md` dan `docs/journal/*.md` juga wajib punya frontmatter menurut skema DDF, tetapi `ddf-validate.sh` tidak pernah memeriksanya — dan `docs/journal/` sejauh ini kosong, hanya berisi template.
7. **Pemeriksaan integritas target repo lemah.** `check_target_repo` hanya mengandalkan `git status --porcelain`, yang gagal membedakan dirty-state pre-existing dari perubahan akibat sesi agent, dan tidak menangani kasus target bukan repo git.
8. **Tidak ada test untuk script governance itu sendiri**, padahal script inilah yang menjadi tulang punggung seluruh mekanisme compliance.

## Rationale

Setiap invariant baru pada ADR ini dirancang untuk menutup satu celah spesifik di atas, dengan prinsip: *agent memutuskan konten (status, scope), sementara script/hook menegakkan mekanismenya secara deterministik* — konsisten dengan filosofi hybrid lifecycle yang sudah ditetapkan ADR-002.

- **Enforcement otomatis (invariant 1)** mengubah kepatuhan dari opsional menjadi wajib secara struktural, sejalan dengan tujuan DDF mencegah *rationale evaporation* akibat sesi agent yang lupa menjalankan langkah manual.
- **Unifikasi enum status (invariant 2)** menghilangkan ambiguitas antara skema umum di `docs/README.md` dan skema spesifik di template ADR/CHG, sehingga validasi tidak bisa "salah lolos" karena istilah status yang tidak terdaftar di mana pun.
- **Verifikasi `affected_scope` (invariant 3)** menjaga integritas audit trail — kalau scope tidak akurat, kemampuan menelusuri dampak keputusan di masa depan berkurang drastis.
- **Perluasan cakupan validasi (invariant 4)** menutup celah bahwa sebagian besar dokumen DDF (vision, journal) sebenarnya tidak pernah divalidasi mesin sama sekali, padahal wajib menurut skema.
- **Pin & verifikasi dependensi eksternal (invariant 5)** mengurangi risiko supply-chain dari mengunduh binary tanpa checksum, sekaligus memperbaiki portabilitas lintas platform.
- **Snapshot hash untuk target repo (invariant 6)** memberi jaminan read-only yang lebih presisi dibanding sekadar `git status`.
- **Larangan duplikasi naratif (invariant 7)** menegakkan kembali prinsip *single source of truth* yang sebenarnya sudah menjadi filosofi inti DDF sejak ADR-001, tetapi belum konsisten dipraktikkan di `AGENTS.md`/`README.md`.
- **Test untuk script governance (invariant 8)** memastikan lapisan penegakan itu sendiri tidak menjadi titik lemah yang tidak teraudit.

## Consequences

- **Positive Outcomes**:
  - Kepatuhan governance tidak lagi bergantung pada disiplin agent per sesi — ditegakkan secara mekanis.
  - Satu kosakata status yang konsisten mengurangi risiko validasi keliru dan mempermudah onboarding kontributor baru.
  - Cakupan validasi yang lebih lengkap (vision, journal) membuat DDF benar-benar berfungsi sebagai cognitive bridge yang teraudit penuh, bukan hanya untuk ADR/CHG.
  - Bootstrap script yang lebih aman dan portabel mendukung kontributor lintas OS.
- **Trade-Offs & Liabilities**:
  - Menambah kompleksitas setup awal (hook/CI, checksum pinning, test suite untuk shell script).
  - Memerlukan pekerjaan migrasi satu kali untuk menyelaraskan status di seluruh dokumen existing (ADR-001, ADR-002, CHG-001) ke enum baru.
  - Menambah friksi kecil bagi kontributor manusia yang tadinya bisa commit tanpa menunggu gate lokal — perlu dikompensasi dengan gate yang cepat (`--check-only`) di pre-commit dan gate penuh di CI.

## Options Considered

1. **Option 1: Perbaikan dokumentasi saja (tanpa enforcement mekanis baru)**
   - *Pros*: Implementasi cepat, tidak menyentuh script/CI.
   - *Cons*: Tidak menyelesaikan akar masalah — kepatuhan tetap bergantung pada ingatan agent; celah drift antar dokumen tetap ada.
   - *Reason for Rejection*: Hanya menambal gejala, bukan penyebab; risiko *rationale evaporation* yang menjadi alasan awal DDF dibuat (ADR-001) tetap tidak tertangani untuk lapisan enforcement.

2. **Option 2: Enforcement mekanis penuh + unifikasi skema + hardening script (Selected)**
   - *Pros*: Menutup seluruh delapan celah secara terstruktur; menyelaraskan implementasi dengan prinsip hybrid lifecycle yang sudah disepakati di ADR-002; membuat sistem benar-benar *self-enforcing*.
   - *Cons*: Biaya implementasi lebih tinggi (hook, CI, checksum, test suite, migrasi status).
   - *Reason for Selection*: **Selected Approach**. Sejalan dengan tujuan jangka panjang DDF sebagai lapisan governance yang andal lintas sesi agent yang episodik; biaya implementasi satu kali sepadan dengan pengurangan risiko drift dan validasi palsu secara berkelanjutan.

## Action Items
1. [x] Tambahkan git pre-commit hook / CI job yang menjalankan `ddf-gate.sh --check-only`
2. [x] Definisikan enum status kanonik per tipe dokumen di `docs/README.md`, sinkronkan ke `_template.md` dan `RULES.md`
3. [x] Perbarui `affected_scope` pada ADR-002 agar mencakup `frameworks/` dan `harness/scripts/`
4. [x] Perluas `ddf-validate.sh` untuk memvalidasi frontmatter `docs/vision/*.md` dan `docs/journal/*.md`
5. [x] Pin versi & checksum `yq` di `ensure_yq()`, tambahkan deteksi OS/arch
6. [x] Ganti/ tambah pemeriksaan `check_target_repo` dengan snapshot hash baseline
7. [x] Ringkas `AGENTS.md`/`README.md` agar merujuk ke `docs/vision/` alih-alih menduplikasi narasi
8. [x] Tambahkan shellcheck lint + skenario test pass/fail untuk `harness/scripts/*.sh` ke `ddf-gate.sh`
9. [x] Buat Change Record (CHG-002) yang mereferensikan ADR-003 setelah status disetujui (`approved`)

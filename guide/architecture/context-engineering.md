---
title: "Context Engineering, Token Governance & Memory MCP Integration"
audience: [AI-Agent, Human-Developer]
scope: "guide/architecture/context-engineering"
prerequisites:
  - "d:/dev/agy-os/guide/architecture/overview.md"
  - "d:/dev/agy-os/AGENTS.md"
related_commands:
  - "/opsx-explore"
  - "/opsx-propose"
  - "/opsx-apply"
  - "/opsx-sync"
  - "/verify"
---

# Context Engineering, Token Governance & Memory MCP Integration

Dokumen ini memaparkan strategi **Context Engineering** di dalam ekosistem OpenAGY / ECC. Pengelolaan konteks mengatur pemanfaatan token budget, pemadatan konteks (*context compaction*), manajemen memori entitas, dan mekanisme pencarian informasi terstruktur agar eksekusi AI Agent tetap berakurasi tinggi, hemat biaya, dan terhindar dari *context window truncation*.

---

## 1. Token Budget Governance (Ambang Batas 85% - 95%)

Penggunaan token budget pada custom prompt, instruksi agen, dan konteks percakapan diatur secara ketat untuk mempertahankan kualitas respon model dan efisiensi biaya.

```text
+-------------------------------------------------------------------------------+
|  Token Window Utilization Budget                                             |
|                                                                               |
|  [ 0% ------------------------ 85% =========== 95% ------------ 100% ]       |
|            Safe Region          Target Zone     Overhead      Fail-Safe Trigger
|            (High Signal)       (Optimal Use)   (Risk Zone)    (Rollback & Prune)
+-------------------------------------------------------------------------------+
```

### 1.1 Target Utilization Threshold

- **Target Utilization**: Penggunaan token prompt kustom dan konteks agen **WAJIB** dijaga berada pada rentang ambang batas **85% hingga 95%**.
- **Rasionalitas**:
  - **Di bawah 85%**: Konteks belum dimanfaatkan secara optimal, berpotensi kekurangan informasi latar belakang yang diperlukan untuk membuat keputusan yang presisi.
  - **Di atas 95%**: Risiko terjadinya *silent truncation* (pemotongan konteks secara diam-diam oleh LLM) yang dapat menghilangkan instruksi sistem penting, guardrails keamanan, atau aturan `AGENTS.md`.

### 1.2 Prosedur Melebihi Ambang Batas (Fail-Safe & Rollback)

Jika akumulasi token kustom atau state percakapan melampaui **95%**:
1. AI Agent harus menghentikan penambahan modul atau instruksi baru.
2. Konfirmasi manual dari pengembang manusia diperlukan untuk menjalankan skrip pembersihan state:
   ```bash
   harness/agy-script/uninstall-agy.sh
   ```
3. Skrip ini akan mengembalikan state kustomisasi, membersihkan file sementara, dan memulihkan alokasi modul yang sesuai dengan batas budget.

---

## 2. Strategi Context Compaction & Progressive Disclosure

Untuk mencegah *context bloat* pada alur kerja agent yang berjalan lama, digunakan 4 teknik pemadatan konteks terstruktur:

```text
+-------------------------------------------------------------------------------+
|  Context Compaction Architecture                                             |
|                                                                               |
|  +------------------------+   +------------------------+                      |
|  | SKILL.md (<500 lines)  |   | BRIEFING.md (<100 lines) |                     |
|  |  (Main Instructions)   |   |   (Active State Index) |                      |
|  +-----------+------------+   +-----------+------------+                      |
|              |                            |                                   |
|              v Lazy Load                  v Prune & Archive                   |
|  +------------------------+   +------------------------+                      |
|  | references/*.md        |   | BRIEFING_ARCHIVE.md    |                      |
|  | assets/*.schema.json   |   | (Preserves 🔒 Sections)|                      |
|  +------------------------+   +------------------------+                      |
+-------------------------------------------------------------------------------+
```

### 2.1 Standard `agentskills.io` (<500 Baris)

1. **Ringkas & Fokus**: Batas utama file `SKILL.md` di bawah `.agents/skills/<skill-name>/` dianjurkan maksimal **500 baris**.
2. **Progressive Disclosure**: Instruksi mendalam, dokumen referensi teknis, schema JSON, dan template kompleks harus dipisahkan ke dalam folder `references/*.md` atau `assets/`.
3. **On-Demand Loading**: AI Agent hanya membaca file referensi sekunder ketika instruksi tugas utama secara eksplisit membutuhkannya.

### 2.2 Siklus Hidup `BRIEFING.md` & Archiving (<100 Baris)

File `BRIEFING.md` berfungsi sebagai indeks memori aktif agent yang berukuran ramping.

1. **Batas Ukuran**: Dipertahankan secara ketat di bawah **100 baris**.
2. **Append-Only Sections (🔒)**:
   - `## 🔒 My Identity`
   - `## 🔒 Key Constraints`
   - Bagian bertanda 🔒 bersifat **append-only** dan **DILARANG KERAS** dihapus atau di-overwrite selama konteks di-prune.
3. **Mekanisme Archiving**: Ketika `BRIEFING.md` melebihi ~100 baris, isi mutable yang sudah tidak aktif dipindahkan ke `BRIEFING_ARCHIVE.md`.

### 2.3 Progress Heartbeat (`progress.md`)

File `progress.md` berfungsi sebagai penanda detak jantung liveness (*liveness heartbeat*) tim agent.

1. **Update Periodic**: Diperbarui setelah setiap langkah berarti selesai, mencantumkan timestamp `Last visited: [timestamp]`.
2. **Pencegahan Prompt Expansion**: Informasi eksekusi detail ditulis ke file `progress.md` daripada dimasukkan sebagai pesan percakapan panjang, menjaga window percakapan tetap bersih.

### 2.4 Registri Workflow Flat & Lean

Semua workflow di `.agents/workflows/` berupa file `.md` tunggal tanpa sub-folder bersarang. Hal ini mencegah overhead pemindaian direktori secara rekursif saat mencocokkan *slash command*.

---

## 3. Integrasi Memory MCP & Retrieval Semantik

OpenAGY memanfaatkan MCP Server terintegrasi untuk mengelola pengetahuan jangka panjang dan dokumen proyek tanpa membebani context window.

```text
+-------------------------------------------------------------------------------+
|  Memory & Dynamic Retrieval Pipeline                                          |
|                                                                               |
|  +-----------------------+     +------------------------+                     |
|  | Memory MCP Server     |     | Context7 MCP Server    |                     |
|  | - Knowledge Graph     |     | - resolve-library-id   |                     |
|  | - Entity Tracking     |     | - query-docs           |                     |
|  | - Semantic Relations  |     | - Scoped Documentation |                     |
|  +-----------+-----------+     +-----------+------------+                     |
|              |                             |                                  |
|              +--------------+--------------+                                  |
|                             |                                                 |
|                             v                                                 |
|            +--------------------------------+                                 |
|            | High-Signal Context Delivery   |                                 |
|            +--------------------------------+                                 |
+-------------------------------------------------------------------------------+
```

### 3.1 Memory MCP Server (Knowledge Graph)

- **Entity & Relation Management**: Menyimpan entitas proyek, fakta arsitektur, dan relasi komponen kunci dalam Knowledge Graph terstruktur.
- **Persistent State across Resets**: Ketika context percakapan di-reset, agent dapat memanggil `read_graph` atau `search_nodes` pada `memory` MCP untuk memulihkan pengetahuan proyek yang telah dipelajari sebelumnya.

### 3.2 Context7 MCP (Dokumentasi Pustaka Dynamic)

Sesuai aturan `user_global`, penggalian dokumentasi pustaka external (seperti React, Next.js, Prisma, Express, Tailwind) **WAJIB** menggunakan Context7 MCP daripada melakukan web search atau mengandalkan memori LLM lama.

1. **`resolve-library-id`**: Mengubah nama pustaka dan topik menjadi Library ID terverifikasi (misalnya `/vercel/next.js`).
2. **`query-docs`**: Mengambil dokumentasi spesifik yang terfokus sesuai dengan konsep tunggal yang dicari, sehingga menghindari pengunggahan seluruh dokumen pustaka ke dalam konteks.

### 3.3 Pelacakan Status Berbasis File OpenSpec

Status kemajuan tugas berbasis spesifikasi dilacak secara deterministik menggunakan file JSON output dari OpenSpec CLI:

```bash
openspec status --json
```

Output terstruktur ini dibaca oleh agent tanpa perlu mempertahankan riwayat obrolan yang panjang mengenai status tugas sebelumnya.

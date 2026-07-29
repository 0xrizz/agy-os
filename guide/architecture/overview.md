---
title: "3-Layer Stack Architecture & Target Repository Boundaries"
audience: [AI-Agent, Human-Developer]
scope: "guide/architecture/overview"
prerequisites:
  - "d:/dev/agy-os/guide/README.md"
  - "d:/dev/agy-os/AGENTS.md"
related_commands:
  - "/opsx-explore"
  - "/opsx-propose"
  - "/opsx-apply"
  - "/opsx-sync"
  - "/review-pr"
---

# 3-Layer Stack Architecture & Target Repository Boundaries

Dokumen ini menjelaskan arsitektur tingkat tinggi dari **OpenAGY / Everything-as-Code (ECC) System**, susunan **3-Layer Stack**, serta batas-batas hak akses repositori (*Target Repository Boundaries*) yang menjamin pengembangan perangkat lunak yang aman, modular, dan non-destruktif.

---

## 1. Arsitektur 3-Layer Stack

Sistem OpenAGY dirancang dalam 3 lapisan fungsional independen yang memisahkan definisi spesifikasi (*intent*), eksekusi agen terorganisir (*harness*), dan perkakas infrastruktur (*MCP & Global Tools*).

```text
+-----------------------------------------------------------------------+
|  Layer 1: OpenSpec Framework (Spec-Driven Development / SDD)          |
|  - Single Source of Truth (`openspec/specs/`)                          |
|  - Active Changes (`openspec/changes/<change-name>/`)                  |
|  - OPSX DAG Lifecycle (Explore -> Propose -> Apply -> Update -> Sync)  |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|  Layer 2: ECC Agentic Harness (Execution & Subagent System)           |
|  - Subagents (`.agents/plugin/ecc/agents/<name>/agent.md`)            |
|  - Workflows (`.agents/workflows/*.md` & bridge `a-*.md`)             |
|  - Rules (`.agents/rules/*.md`, e.g., Delegation Completion Contract) |
|  - Lifecycle Hooks (`.agents/hooks.json` & AgentShield)               |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|  Layer 3: Global Antigravity Tools & Active MCP Servers               |
|  - Builtin/Config Skills (`antigravity-guide`, `find-docs`, etc.)      |
|  - Global Plugins (Cloudflare, Notion, Prompt Engineering, etc.)       |
|  - 28 Active MCP Servers (Context7, Firecrawl, Neon, Memory, etc.)    |
+-----------------------------------------------------------------------+
```

---

### Layer 1: OpenSpec SDD Framework (Spec-Driven Development)

**Role**: Lapisan kesepakatan (*intent specification*) antara manusia dan AI Agent yang mendefinisikan *apa yang harus dibangun* sebelum kode dieksekusi.

1. **Single Source of Truth (`openspec/specs/`)**:
   - Menyimpan spesifikasi fungsional domain utama.
   - Format penulisan berbasis Markdown dengan anchor requirement jelas (`<!-- id: req-xxx -->`).

2. **Active Changes (`openspec/changes/<change-name>/`)**:
   - Menampung unit perubahan aktif yang mencakup `proposal.md`, `design.md`, `task.md`, dan delta specs.
   - Delta spec mengklasifikasikan perubahan persyaratan ke dalam blok `ADDED`, `MODIFIED`, atau `REMOVED`.

3. **OPSX DAG Engine & Lifecycle**:
   - Pengelolaan lifecycle spesifikasi berbasis Directed Acyclic Graph (DAG):
     - `Explore`: Investigasi codebase dan pengumpulan bukti awal (`/opsx-explore`).
     - `Propose`: Penyusunan proposal, spesifikasi delta, dan checklist tugas (`/opsx-propose`).
     - `Apply`: Eksekusi tugas coding berbasis TDD dan pembuatan patch (`/opsx-apply`).
     - `Update` / `Sync`: Sinkronisasi delta specs ke spesifikasi utama (`/opsx-sync`).
     - `Verify` / `Archive`: Pengarsipan perubahan setelah lulus verifikasi.

---

### Layer 2: ECC Execution & Review Harness

**Role**: Mesin operasional tempat AI Agent bekerja, mengeksekusi tugas, menegakkan aturan coding, dan berinteraksi melalui skrip workflow.

1. **Subagents (`.agents/plugin/ecc/agents/<name>/agent.md`)**:
   - Terdiri dari 37 sub-agent terpasang yang terbagi ke dalam 5 fase: Planning (`planner`, `architect`), Building (`code-explorer`, `build-error-resolver`), Testing (`tdd-guide`, `spec-to-test`), Review (`code-reviewer`, `security-reviewer`), dan Operations (`spec-delta-writer`, `spec-freshness-checker`).

2. **Workflows (`.agents/workflows/`)**:
   - Tata letak **Flat & Lean**: Setiap file di `.agents/workflows/` adalah file `.md` tunggal yang dipetakan ke slash command (misalnya `/plan`, `/verify`, dan bridge commands `/a-planner`).
   - Tidak ada folder bersarang di `.agents/workflows/` untuk mencegah polusi registry slash command AGY.

3. **Rules Governance (`.agents/rules/`)**:
   - File aturan berformat datar seperti `common-agents.md` (menegakkan *Delegation Completion Contract*), `common-coding-style.md` (menegakkan Immutability), dan `common-security.md`.

4. **Lifecycle Hooks (`.agents/hooks.json`)**:
   - Event trigger untuk `PreToolUse`, `PostToolUse`, dan `Stop` yang terintegrasi dengan pengaman keamanan AgentShield.

---

### Layer 3: Global Antigravity Tools & Active MCP Servers

**Role**: Lapisan perkakas dan infrastruktur penyedia akses ke database, dokumentasi API, mesin pencari, serta ekosistem sistem luar.

1. **Global Plugins & Skills**:
   - Plugin terpasang seperti `cloudflare`, `prompt-engineering` (`prompt-architect`, `research-documentation`), `notion`, dan `tavily`.
   - Builtin skills seperti `antigravity-guide` dan `permissioned-github`.

2. **28 Active MCP Servers (350+ Tools)**:
   - **Documentation & Retrieval**: `context7` (penyelesai dokumentasi pustaka native yang menggantikan pencarian CLI manual) dan `firecrawl` (pencarian web primer).
   - **Knowledge & State**: `memory` (Knowledge Graph untuk pelacakan entitas dan relasi proyek) dan `notion-mcp-server`.
   - **Database & Cloud**: `mcp-server-neon`, Cloudflare D1/KV/R2 bindings, `railway`.
   - **Code & Browser Automation**: `github`, `playwright`, `browser-use`, `token-optimizer`.

---

## 2. Batas Repositori & Arsitektur Patch Staging

Untuk mencegah kerusakan pada kode produksi dan memastikan keamanan eksekusi AI Agent, repositori dibagi secara ketat menjadi dua zona akses:

```text
+-------------------------------------------------------------------------------+
|  Target Repository: d:/CLAUDE-PROJECT/website                                |
|  - Status: STRICTLY READ-ONLY                                                 |
|  - Akses: Inspect, Analyze, AST Parsing, Diff Generation                      |
|  - DILARANG KERAS: Write, Edit, Create File, Delete File langsung             |
+-------------------------------------------------------------------------------+
                                      |
                                      | Reads & Computes Diff
                                      v
+-------------------------------------------------------------------------------+
|  Harness Repository: d:/dev/agy-os                                            |
|  - Status: READ & WRITE                                                       |
|  - Akses: Agen Metadata, OpenSpec Specs, Workflows, Harness Scripts           |
|  - Staging Patch: d:/dev/agy-os/harness/patches/*.patch                       |
+-------------------------------------------------------------------------------+
                                      |
                                      | Human Review & Approval (HITL Gate 2)
                                      v
+-------------------------------------------------------------------------------+
|  Target Execution: `git apply d:/dev/agy-os/harness/patches/feature.patch`   |
+-------------------------------------------------------------------------------+
```

### 2.1 Aturan Batas Hak Akses

1. **Target Repository (`d:/CLAUDE-PROJECT/website`) — STRICTLY READ-ONLY**:
   - AI Agent **DILARANG KERAS** melakukan perubahan langsung (edit file, membuat file baru, atau menghapus file) di dalam repositori target `website/`.
   - Repositori ini hanya digunakan untuk pembacaan (*read-only inspection*), pengujian AST, pencarian pola, dan perhitungan perbandingan *diff*.

2. **Harness Repository (`d:/dev/agy-os`) — READ & WRITE**:
   - Repositori harness menyediakan kebebasan penuh bagi AI Agent untuk mengelola file spesifikasi (`openspec/`), catatan kerja agent (`.agents/`), skrip pengujian, dan file hasil kerja.

### 2.2 Arsitektur Staging Patch

Semua perubahan kode yang diusulkan untuk Repositori Target **WAJIB** dihasilkan dalam bentuk file patch (`.patch` atau `.diff`) dan disimpan di lokasi resmi berikut:

```text
d:/dev/agy-os/harness/patches/
```

**Workflow Eksekusi Patch**:
1. AI Agent menganalisis kebutuhan perubahan di `d:/CLAUDE-PROJECT/website`.
2. AI Agent membuat draf perubahan dan menguji fungsionalitas di area staging `d:/dev/agy-os/`.
3. AI Agent membuat file patch resmi, misalnya `d:/dev/agy-os/harness/patches/2026-07-29-add-user-auth.patch`.
4. Reviewer manusia meninjau patch melalui **HITL Gate 2** (mengecek kesesuaian invariant spesifikasi dan kualitas kode).
5. Setelah disetujui, reviewer atau skrip pengaplikasi menerapkan patch ke repositori target menggunakan perintah:
   ```bash
   git apply d:/dev/agy-os/harness/patches/2026-07-29-add-user-auth.patch
   ```

Arsitektur penahapan patch ini menjamin bahwa setiap intervensi kode AI Agent bersifat non-destruktif, terisolasi, mudah ditinjau, dan dapat di-rollback secara instan jika terjadi ketidaksesuaian.

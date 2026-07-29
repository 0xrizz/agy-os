---
title: "Analisis Global Antigravity Skills, Plugins, dan Active MCP Servers"
stage: "2C"
audience: [AI-Agent, Human-Developer]
scope: research/global-antigravity-mcp
source_agent: "Global Tools & MCP Analyst (7fce298d)"
date: "2026-07-29"
sources_read:
  - C:/Users/Windows 10/.gemini/config/plugins/ (7 plugins)
  - C:/Users/Windows 10/.gemini/config/skills/find-docs/SKILL.md
  - C:/Users/Windows 10/.gemini/antigravity/builtin/skills/ (3 builtin skills)
  - C:/Users/Windows 10/.gemini/antigravity/mcp/ (28 MCP servers)
---

# Stage 2C: Analisis Global Antigravity Skills, Plugins, & Active MCP Servers

## 1. Inventaris Global Plugins

| Plugin | Deskripsi | Jumlah Skills | Relevansi untuk Guide |
|:---|:---|:---|:---|
| **academic-and-tools** | Skills untuk penulisan laporan akademis dan pemrosesan dokumen/PDF | N/A | Rendah — Khusus akademis |
| **cloudflare** | Plugin resmi Cloudflare Skills dan MCP Servers | 7 | **Tinggi** — Integrasi inti ekosistem Cloudflare |
| **modern-web-guidance-plugin** | Koleksi terkurasi skill agen untuk pengembangan web modern | 0 | Rendah — Direktori skills kosong |
| **notion** | Skills untuk interaksi dengan Notion workspace, database, dan dokumentasi | N/A | **Sedang** — Integrasi Notion via MCP |
| **prompt-engineering** | Skills untuk arsitektur prompt, engineering, dan dokumentasi riset | 2 | **Tinggi** — Structuring tugas AI tingkat lanjut |
| **superpowers** | Ekstensi inti untuk integrasi IDE (.claude-plugin, .cursor-plugin) | N/A | Rendah — Scaffolding level sistem |
| **tavily** | Skills untuk Tavily web search dan riset AI mendalam | N/A | **Sedang** — Integrasi pencarian eksternal |

---

## 2. Detail Skills Plugin

### Cloudflare Skills (7 Skills)

| Skill | Deskripsi | Trigger Utama |
|:---|:---|:---|
| `cloudflare` | Platform komprehensif: Workers, Pages, storage (KV, D1, R2), AI, networking, security, IaC | Tugas Cloudflare apa pun |
| `cloudflare-email-service` | Pengiriman/penerimaan email transaksional (Workers binding atau REST API) | Setup email, deliverability |
| `durable-objects` | Pola Durable Objects (stateful coordination, WebSockets, alarms, SQLite) | Stateful coordination |
| `turnstile-spin` | Setup Cloudflare Turnstile end-to-end (CAPTCHA alternative) | Proteksi form dari bot |
| `web-perf` | Audit performa web: Core Web Vitals (LCP, INP, CLS) via Chrome DevTools MCP | Audit performa halaman |
| `workers-best-practices` | Review kode Workers terhadap best practices (floating promises, global state) | Review/authoring Workers |
| `wrangler` | Panduan Cloudflare Workers CLI | Menjalankan perintah wrangler |

### Prompt Engineering Skills (2 Skills)

| Skill | Deskripsi |
|:---|:---|
| `prompt-architect` | Menganalisis dan meningkatkan prompt menggunakan 27 framework riset di 7 kategori intent (Create, Transform, Reason, Critique, Recover, Clarify, Agentic) |
| `research-documentation` | Mencari di seluruh Notion workspace, mensintesis temuan, dan membuat dokumentasi riset terstruktur dengan sitasi |

---

## 3. Analisis Builtin Skills

| Skill | Fungsi Utama |
|:---|:---|
| **`antigravity-guide`** | Sitemap dan referensi komprehensif Google Antigravity: CLI (`agy`), IDE, App (2.0), Python SDK. Mengarahkan agen ke `https://antigravity.google/docs` untuk info terkini |
| **`agy-customizations`** | Panduan detail Sistem Kustomisasi Antigravity: lokasi discovery (`.agents/`, `~/.gemini/config/`), prioritas loading (Workspace → Global), aturan progressive disclosure |
| **`permissioned-github`** | Memaksa penggunaan `gh` CLI dan `git` command untuk interaksi GitHub. Menentukan format tepat untuk meminta elevated permissions dari user via `ask_permission` |

---

## 4. Analisis Config Skills

| Skill | Fungsi |
|:---|:---|
| **`find-docs`** | Resolves nama library ke ID spesifik dan mengambil dokumentasi terkini via Context7 CLI (`npx ctx7@latest`). Workflow 2 langkah: `library` (dapatkan ID `/org/project`) → `docs` (query topik spesifik). **Catatan**: Rule `user_global` meng-override skill ini untuk menggunakan MCP `context7` native secara langsung |

---

## 5. Inventaris MCP Server Aktif (28 Server)

| Server | Jumlah Tools | Kategori Kapabilitas | Relevansi |
|:---|:---|:---|:---|
| **Sanity** | 35 | CMS & Content | **Tinggi** — Manajemen schema, GROQ query, dokumen |
| **browser-use** | 6 | Web Automation | Sedang — Profil browser dan eksekusi tugas |
| **cloudflare-bindings** | 23 | Cloud Infrastructure | **Tinggi** — Manajemen D1, KV, R2, Hyperdrive |
| **cloudflare-builds** | 7 | CI/CD | **Tinggi** — Build logs dan deployment status |
| **cloudflare-docs** | 2 | Documentation | Sedang — Retrieval docs Cloudflare resmi |
| **cloudflare-observability** | 9 | Observability | **Tinggi** — Structured logs dan metrik Workers |
| **cloudflare-workers-bindings** | 23 | Cloud Infrastructure | **Tinggi** — Duplikat cloudflare-bindings |
| **cloudflare-workers-builds** | 8 | CI/CD | **Tinggi** — Mirip cloudflare-builds + `set_active_worker` |
| **confluence** | 25 | CMS & Docs | Sedang — Interaksi wiki enterprise |
| **context7** | 3 | Documentation | **Tinggi** — Resolusi & query docs library native |
| **exa-web-search** | 2 | Search | Sedang — Web search dan fetch |
| **fal-ai** | 12 | AI Generation | Rendah — Media/AI model |
| **fetch** | 1 | Web Fetching | Sedang — URL fetching sederhana |
| **filesystem** | 14 | File Operations | **Tinggi** — Core read/write/tree file |
| **firecrawl** | 27 | Web Crawling | **Tinggi** — Search tool primer, extraction, monitoring |
| **github** | 26 | Version Control | **Tinggi** — PRs, issues, commits, code search |
| **github-mcp-server** | 26 | Version Control | **Tinggi** — Duplikat github |
| **jira** | 0 | Project Management | N/A — Direktori kosong |
| **laraplugins** | 5 | Package Registry | Rendah — Spesifik Laravel |
| **magic** | 3 | Registry | Rendah — Generic registry query |
| **mcp-server-neon** | 34 | Database | **Tinggi** — Manajemen Postgres, tuning, migrasi |
| **memory** | 9 | Knowledge Graph | **Tinggi** — Entity dan relation tracking |
| **notion-mcp-server** | 24 | CMS & Docs | **Tinggi** — Manipulasi workspace, DB, halaman |
| **playwright** | 24 | Web Automation | **Tinggi** — Kontrol browser detail (click, eval, network) |
| **railway** | 14 | Deployment | Sedang — Manajemen environment dan deployment |
| **sequential-thinking** | 1 | Reasoning | Sedang — Structured reasoning loop lanjut |
| **stitch** | 15 | UI Generation | Rendah — Design system dan screen generation |
| **token-optimizer** | 67 | Optimization & SysOps | **Tinggi** — Suite cache, AST grep, logs, diffs, linting |

---

## 6. Kategori Kapabilitas MCP

| Kategori | Server |
|:---|:---|
| **Cloud & DevOps** | cloudflare-builds, cloudflare-workers-builds, github, github-mcp-server, railway, token-optimizer |
| **Database & Storage** | cloudflare-bindings, cloudflare-workers-bindings, mcp-server-neon |
| **Search & Documentation** | cloudflare-docs, context7, exa-web-search, laraplugins |
| **Web Crawling & Automation** | browser-use, fetch, firecrawl, playwright |
| **Content & Knowledge (CMS/Docs)** | Sanity, confluence, notion-mcp-server, memory |
| **AI & Reasoning** | fal-ai, sequential-thinking |
| **Design & UI** | stitch |

---

## 7. Peta Cross-Reference

| Skill/Rule | MCP Server yang Digunakan | Catatan |
|:---|:---|:---|
| `find-docs` (Rule Override: `user_global`) | **context7** | Rule global meng-redirect ke MCP native, bukan CLI |
| `research-documentation` | **notion-mcp-server** | Mengandalkan Notion MCP untuk search teamspaces |
| `cloudflare-*` (7 skills) | **cloudflare-bindings**, **cloudflare-builds**, **cloudflare-docs**, **cloudflare-observability** | Skills diperkuat oleh 4 MCP spesifik Cloudflare |
| `permissioned-github` | **github** MCP | Skill menentukan `gh` CLI, tapi MCP menyediakan API langsung |
| (Built-in search) | **firecrawl** | Instruksi firecrawl: ini adalah search tool primer, mengoverride exa/tavily |

---

## 8. Observasi Kunci

### Pola Redundansi
1. **`github`** dan **`github-mcp-server`**: Keduanya memiliki 26 tools identik.
2. **`cloudflare-bindings`** dan **`cloudflare-workers-bindings`**: Keduanya memiliki 23 tools identik.
3. **`cloudflare-builds`** (7 tools) dan **`cloudflare-workers-builds`** (8 tools): Overlap berat.

### Direktori Kosong
1. **`jira`** MCP: Direktori sepenuhnya kosong.
2. **`modern-web-guidance-plugin`**: Direktori skills kosong.

### Instruction Overrides
Beberapa MCP menginjeksikan instruksi behavioral spesifik ke konteks agen:
- `laraplugins`: Membutuhkan format atribusi URL spesifik.
- `Sanity`: Memaksa pengecekan Sanity rules sebelum bertindak.
- `firecrawl`: Memaksa feedback loop (`firecrawl_search_feedback`) untuk refund credits.

### Token Footprint
**`token-optimizer`** MCP mengekspos **67 tools** ke konteks — jumlah terbesar dari semua MCP. Ini berpotensi berdampak berat pada context window jika di-load eagerly.

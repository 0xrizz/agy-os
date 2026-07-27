# Framework Development Experiments (`frameworks/`)

Direktori ini diisolasi khusus untuk menampung riset, rancangan arsitektur, dan eksperimen pengembangan framework software engineering modern (**Tujuan 2**).

---

## 🎯 Tujuan & Batasan Isolasi

1. **Terisolasi dari Harness Runtime**: Seluruh modul, spesifikasi, dan kode eksperimen framework disimpan di dalam direktori `frameworks/` agar tidak bercampur dengan runtime sistem operasi harness utama di `.agents/` atau `harness/`.
2. **Eksperimentasi Modular**: Mendukung pengembangan berbagai metodologi terpisah yang dapat diuji secara mandiri sebelum diadopsi ke sistem utama.

---

## 📂 Struktur Direktori Metodologi

```
frameworks/
├── README.md                   # Panduan induk & isolasi framework (file ini)
├── sdd/                        # Eksperimen Spec-Driven Development (SDD)
│   └── README.md
├── bmad/                       # Eksperimen Behavior-Driven / Multi-Agent Development (BMAD)
│   └── README.md
├── agentic-patterns/          # Eksperimen Agentic Design Patterns
│   └── README.md
└── custom/                    # Eksperimen Metodologi Buatan Sendiri
    └── README.md
```

---

## 🚀 Panduan Eksperimen

- **SDD**: Fokus pada pendefinisian spesifikasi formal, skema kontrak, dan validasi berbasis spesifikasi.
- **BMAD**: Fokus pada alur kerja kolaborasi multi-agent berbasis perilaku (behavior-driven).
- **Agentic Patterns**: Fokus pada pola desain agen AI (seperti ReAct, Reflection, Planning, Tool use).
- **Custom**: Wadah terbuka untuk merancang metodologi rekayasa perangkat lunak buatan sendiri.

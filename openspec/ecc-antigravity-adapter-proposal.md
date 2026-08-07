# ECC Antigravity Adapter — Comparative Analysis & Final Toolkit Proposal

Repository: 0xrizz/agy-os
Author: Lead System Architect & Senior Refactoring Engineer (Antigravity)
Date: 2026-08-07

Tujuan: Membandingkan cara instalasi dan pola integrasi dari upstream ECC (https://github.com/affaan-m/ECC) terhadap kebutuhan Antigravity untuk arsitektur `pxrzival404/arostech-hub`, lalu mengusulkan desain akhir toolkit adapter yang akan diimplementasikan pada repo ini (`0xrizz/agy-os`). Artefak ini adalah proposal System Blueprint untuk disetujui sebelum implementasi kode.

---

Ringkasan singkat
- upstream ECC adalah ekosistem lengkap (agents, skills, scaffolds, commands, hooks, workflows, installer scripts) yang dirancang untuk general-purpose Engineering Context Companion.
- Pendekatan terbaik untuk Antigravity: tidak memodifikasi upstream ECC langsung; buat paket adapter di `0xrizz/agy-os` yang (1) menyertakan opini konfigurasi untuk Antigravity, (2) menyediakan generator (.agent templates → .agent/antigravity.yaml), (3) menyediakan lightweight runtime adapters (role/skill metadata & shim implementations), dan (4) CI/CD untuk publish ke GitHub Packages.

---

1) Temuan kunci dari `affaan-m/ECC`
- Struktur lengkap: `agents/`, `skills/`, `rules/`, `workflows/`, `commands/`, `hooks/`, `manifests/`, `scaffolds/`.
- Dual installer: `install.sh` / `install.ps1` untuk quick bootstrap.
- agent.yaml / manifests sebagai ground truth untuk role/skill bindings.
- Rich examples & integrations; but intentionally generic (broad surface area).
- Good practices tersedia: `RULES.md`, `AGENTS.md`, `COMMANDS-QUICK-REF.md`, `workflows/` (GH Actions), serta testing scaffolds.

Kelebihan ECC upstream
- Battle-tested conventions & a complete toolchain.
- Reusable scaffolds & example workflows for many agent backends.
- Clear rule & manifest abstractions.

Risiko / Hal yang harus diwaspadai
- Terlalu generik; tanpa opinionation bisa menyebabkan scope creep jika langsung di-apply ke arostech-hub.
- Installer yang melakukan repo-wide changes tanpa policy-check berisiko.
- Banyak fitur yang tidak diperlukan oleh Antigravity (keamanan, kebersihan konfigurasi penting).

---

2) Opsi integrasi ECC → Antigravity (evaluasi)

Opsi A — Fork & Direct Apply (naikkan ECC ke antigravity-specific)
- Cara: fork ECC, ubah agent.yaml + rules + workflows, kemudian gunakan fork sebagai paket.
- Pro: cepat untuk custom; semua kemampuan tersedia lokal.
- Kontra: maintenance heavy, divergensi dari upstream, security patching sulit.

Opsi B — Paket Adapter (Recommended)
- Cara: buat paket `@agy-os/ecc-antigravity` yang bergantung pada ECC (optional peer dep) dan menyertakan:
  - templates `.agent/antigravity.yaml.tpl`
  - adapters/ yang menerjemahkan `agent.yaml` ECC → Antigravity opinionated config
  - CLI generator `agy-cli generate` yang menghasilkan `.agent/*` di repo target
  - metadata & light-weight skill shims (tdd-workflow, verification-loop, search-first)
- Pro: minimal dan maintainable; upstream ECC tetap utuh; patching upstream mudah; jelas audit surface.
- Kontra: perlu menulis adapter layer, tapi biaya satu-kali.

Opsi C — Installer Scripts + Manual Review
- Cara: gunakan `install.sh` dari ECC tapi modify untuk dry-run + create PR artifacts.
- Pro: Very fast bootstrap.
- Kontra: Risky — may create changes without spec approvals. Not recommended unless gated.

Kesimpulan arsitektural: Opsi B (Paket Adapter) adalah best-practice untuk Antigravity — meminimalkan risiko, memudahkan audit, dan mendukung traceability OpenSpec.

---

3) Rekomendasi distribusi & publishing
- Repository package: nama `@agy-os/ecc-antigravity` (scope `@agy-os` atau `@0xrizz`).
- Registry: GitHub Packages (preferred) → private internal distribution, integrated with GH Actions, leverages GITHUB_TOKEN.
- Versioning: semver; gunakan CI publish on tag (vX.Y.Z).
- Signed releases: publish signed tag and include artifact checksum in release notes.

---

4) Final Toolkit Composition (what `0xrizz/agy-os` will provide)

A. Skills (implementations / shims)
- tdd-workflow: orchestrates Red→Green→Refactor steps; provides test-stub generation and test-run hooks.
- search-first: wrappers around lexical & semantic search functions (calls to repo code-search APIs); ensures evidence is attached to agent suggestions.
- verification-loop: end-to-end gating sequence (lint, unit, integration, playwright smoke, coverage check).
- evidence-collector: gather lexical/semantic search snapshots and include in PR metadata.
- safe-scanner: file-listing & whitelist scanning that obey contextBudget and allowedPaths.

B. Agents (role metadata & capability bindings)
- architect (read-only full-docs & openspec access; can request full scans but requires Architect approval)
- code-reviewer (static checks, search evidence, linter enforcement)
- tdd-guide (creates Jest/Playwright test stubs and wiring)
- refactor-cleaner (TS-Morph based refactorers; limited to approved files)
- sandbox-runner (runs tests in ephemeral environment; interacts with verification-loop)

C. Commands & CLI
- agy generate-config --repo=<owner/repo> --template=antigravity --out=.agent/  -> generate agent files (dry-run & apply)
- agy scan --evidence --max-files=N  -> runs lexical/semantic scan and produces openspec/changes/* candidates
- agy verify --task=OP-XXX -> runs verification-loop for given OpenSpec Task
- agy publish-adapter -> package publish helper (CI only)

D. Workflows (GitHub Actions)
- publish.yml — build/test/publish package to GH Packages
- antigravity-setup.yml (consumer action for pxrzival404/arostech-hub) — installs package and runs generator in PR-preview mode (no auto-commit)
- antigravity-verifier.yml — full verification-loop for PRs (lint → unit → integration → playwright smoke → coverage gate)

E. Rules & Policy (enforced by adapter + workflows)
- Source-of-Truth: every code change requires OpenSpec Task ID in PR body; generator refuses apply if missing.
- ContextBudget: default 8 files / 2000 tokens per agent run; full scans require Architect approval and logged justification.
- Test Gate: PR must include failing→passing test evidence for new behavior. Coverage delta must not reduce project coverage below 80%.
- Approval Gate: auto-commit of generated .agent artifacts only after Architect team approval (protected branch rules + required reviewers).

F. Hooks & Scripts
- pre-commit (husky) → pnpm lint, pnpm test:unit (fast subset)
- pre-push → optional verification-loop quick check
- post-generate -> append metadata header to generated files (generatorVersion, packageVersion, runId, openspecTask)
- sign-manifest -> create signed manifest of generated artifacts for audit

G. Tests & Quality
- Unit tests (Jest) for generator/adapters
- Integration tests that run generator against a fixture repo
- Smoke e2e tests for CLI & GH Actions (using GitHub Actions `workflow_call` simulation or local runner)

---

5) Security & Governance
- Do not embed long-lived tokens in generator; all runtime secrets come from repo-level GH Actions secrets.
- Use signed releases and checksum verification in consumer CI.
- Minimal default permissions for agents; destructive operations require explicit Architect approval and ephemeral credentials.

---

6) Acceptance Criteria (for proposal to be approved)
1. `0xrizz/agy-os` contains a `proposal` document (this file) in `openspec/` and a high-level `README.md` describing usage.
2. `0xrizz/agy-os` CI includes `publish.yml` that builds/tests the package and is ready to publish v0.1.0.
3. `@agy-os/ecc-antigravity` package includes at minimum: `templates/antigravity.yaml.tpl`, `adapters/antigravity-adapter.ts`, `cli/bin/generate.ts`, `agents/` metadata, and unit tests.
4. Consumer workflow (pxrzival404/arostech-hub) is approved to run generator in preview mode and requires Architect approval for apply.

---

7) Next steps (if Anda setuju saya lakukan implementasi)
- Saya buat PR draft di `0xrizz/agy-os` yang berisi:
  - `openspec/this-proposal` (file ini),
  - skeleton package (`package.json`, `src/adapters/antigravity-adapter.ts` stub, `templates/antigravity.yaml.tpl`, `cli/`),
  - `.github/workflows/publish.yml` (CI skeleton),
  - `tests/` (basic unit test for template rendering).
- Setelah PR hijau, publish v0.1.0 to GH Packages (manual tag/approval by Anda).
- Buat PR di `pxrzival404/arostech-hub` consumer yang menambahkan CI `antigravity-setup.yml` (preview only) and PR template changes.

---

Appendix: Quick mapping of ECC upstream → Antigravity adapter
- ECC `agents/`  -> `0xrizz/agy-os/agents/` (opinionated subset)
- ECC `skills/`  -> `0xrizz/agy-os/skills/` (stubs implementing required orchestration)
- ECC `workflows/` -> `0xrizz/agy-os/workflows/` (consumer-focused GH Actions)
- ECC `scaffolds/` -> `0xrizz/agy-os/templates/` (antigravity-specific)

---

Saya akan menunggu persetujuan Anda untuk membuat PR draft skeleton di `0xrizz/agy-os` yang berisi artefak awal (proposal ini + skeleton package + CI). Jika Anda setuju, saya langsung membuat PR draft sekarang.

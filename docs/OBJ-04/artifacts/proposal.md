# Customization Proposal Document: Objective OBJ-04 Package Manager Governance & Integration

> **Target Repository**: `d:/CLAUDE-PROJECT/website` (READ-ONLY — not modified by this objective)  
> **Harness Repository**: Antigravity (`d:/dev/agy-os`) — READ & WRITE  
> **Package Manager**: `pnpm` v11.5.3 (canonical; `pnpm >= 10` enforced)  
> **Node.js Runtime**: Node.js v26.1.0 (enforced; `node >= 26` enforced)  
> **Objective Scope**: Governance, installation, and security policy for Node.js runtime dependencies

---

## 1. Executive Summary & Architecture Target

This proposal defines the **Package Manager Governance & Integration** plan for Objective OBJ-04. It establishes `pnpm` as the canonical package manager for `agy-os`, governs the installation of three runtime libraries (`sql.js`, `@iarna/toml`, `ajv`) already used by active scripts in `.agents/scripts/`, and enforces supply chain security via deterministic lockfile policy, CI audit pipeline, and non-destructive rollback.

### Problem Statement

An audit of `.agents/scripts/` reveals **three external npm packages** that are `require()`-d in active production code but have **never been installed**:

| Package | Used In | Use Case |
| :--- | :--- | :--- |
| `sql.js` | `lib/control-pane/state.js`, `lib/state-store/index.js` | In-memory SQLite for state persistence |
| `@iarna/toml` | `codex/merge-codex-config.js`, `codex/merge-mcp-config.js`, `lib/mcp-inventory/readers/codex.js`, `lib/control-pane/state.js` | TOML config file parsing |
| `ajv` | `ci/validate-hooks.js`, `ci/validate-install-manifests.js`, `lib/install/config.js`, `lib/state-store/schema.js` | JSON Schema validation |

Without OBJ-04, any script path that touches these modules will throw `MODULE_NOT_FOUND` at runtime. The `package.json` at root `agy-os/` has no `dependencies` field, no lockfile, and no `node_modules/`.

### Solution Architecture

OBJ-04 introduces:
1. **pnpm as canonical PM** — declared in `package.json` `packageManager` field, enforced via `.npmrc` + `engines`
2. **Three runtime dependency installs** — `sql.js`, `@iarna/toml`, `ajv` with pinned semver ranges in `package.json`
3. **Deterministic lockfile** — `pnpm-lock.yaml` committed to Git; `node_modules/` gitignored
4. **Supply chain security** — `pnpm install --frozen-lockfile` for all non-interactive installs; `pnpm audit --audit-level=high` in CI
5. **Hard-fail error guards** — skrip yang bergantung pada modul eksternal mengeluarkan error message yang jelas jika `node_modules/` belum ter-install
6. **Governance scripts** — `harness/agy-script/install-deps-agy.sh` dan `harness/agy-script/verify-deps-agy.js` untuk fresh setup dan verification
7. **Non-destructive rollback** — `harness/agy-script/uninstall-deps-agy.sh` hanya menghapus `node_modules/`; `package.json` dan `pnpm-lock.yaml` tetap

---

## 2. Decision Matrix Summary

| Decision | Selected Option | Rationale |
| :--- | :--- | :--- |
| Package Manager | **pnpm** | Disk-efficient via hard-linking, deterministic lockfile (`pnpm-lock.yaml`), detection priority #1 di kode aktif, tidak memiliki Windows spawn bug (berbeda dengan bun) |
| Runtime Dependencies | **Install ketiganya** (`sql.js`, `@iarna/toml`, `ajv`) | Ketiga library sudah di-`require()` di kode aktif; tidak ada native Node.js equivalent yang setara |
| Lockfile Policy | **`pnpm-lock.yaml` di-commit** | Reproducible install; deterministik di CI dan mesin developer lain |
| `node_modules/` | **Gitignored, di root `agy-os/`** | Standar; tidak bocor ke `ECC/` (READ-ONLY) |
| Security Enforcement | **`pnpm audit` CI + `--frozen-lockfile`** | Prevents dependency drift; blocks HIGH/CRITICAL vulnerabilities in pipeline |
| Fallback Behavior | **Hard fail + clear error message** | Skrip harus jelas memberi tahu bahwa `pnpm install` diperlukan; silent degradation menyembunyikan masalah |
| Engine Constraint | **`node >= 26`, `pnpm >= 10`** | Sesuai sistem aktif (Node 26.1.0, pnpm 11.5.3); fleksibel terhadap minor upgrades |
| Enforcement Mechanism | **`packageManager` field + `.npmrc`** | Corepack-compatible, memblok `npm install` / `yarn install` yang tidak diinginkan |
| Workspace Structure | **Single `package.json` di root** | Sederhana, cukup untuk 3 runtime libraries; tidak perlu workspace complexity |
| Governance Scripts Location | **`harness/agy-script/`** | Konsisten dengan AGENTS.md §4 — installer/verifier/teardown di `harness/agy-script/` |
| CI Integration | **GitHub Actions + pre-commit hook** | Dual enforcement: local (pre-commit) + remote (CI pipeline) |
| Rollback | **Non-destructive** — hanya hapus `node_modules/` | `package.json` dan lockfile tidak diubah; mudah recover |

---

## 3. Component Selection & Item Matrix

### Section 3.1: Category Summary

| Category | Description | Files | Action |
| :--- | :--- | :--- | :--- |
| **Category A** | `package.json` updates | Root `agy-os/package.json` | **MODIFY** — tambah `dependencies`, `packageManager`, `engines` fields |
| **Category B** | `.npmrc` creation | Root `agy-os/.npmrc` | **CREATE** — enforce pnpm only, `engine-strict=true` |
| **Category C** | `.gitignore` update | Root `agy-os/.gitignore` | **MODIFY** — tambah `node_modules/` entry |
| **Category D** | Governance installer | `harness/agy-script/install-deps-agy.sh` | **CREATE** — fresh setup script (clone baru, CI cold start) |
| **Category E** | Governance verifier | `harness/agy-script/verify-deps-agy.js` | **CREATE** — verify `node_modules/` sync dengan lockfile |
| **Category F** | Governance teardown | `harness/agy-script/uninstall-deps-agy.sh` | **CREATE** — non-destructive rollback (hapus `node_modules/` saja) |
| **Category G** | GitHub Actions CI | `.github/workflows/deps-governance.yml` | **CREATE** — `pnpm audit` + `--frozen-lockfile` + integrity check |
| **Category H** | Pre-commit hook integration | `.agents/hooks.json` | **MODIFY** — tambah `pre:pnpm-audit` hook entry untuk local enforcement |
| **Category I** | `package.json` npm scripts | Root `agy-os/package.json` scripts field | **MODIFY** — tambah `install`, `verify`, `audit` scripts |

---

### Section 3.2: Deduplicated Final OBJ-04 Item Matrix

| Kind | Item ID | Source / Target Path | Action | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **package.json** | `root-package-json` | [package.json](file:///d:/dev/agy-os/package.json) | **MODIFY** | Tambah `dependencies: {sql.js, @iarna/toml, ajv}`, `packageManager: pnpm@11.5.3`, `engines: {node >= 26, pnpm >= 10}`, npm scripts `install`/`verify`/`audit` |
| **config** | `npmrc` | [.npmrc](file:///d:/dev/agy-os/.npmrc) | **CREATE** | `engine-strict=true`, `package-manager-strict=true` untuk blok npm/yarn |
| **config** | `gitignore-update` | [.gitignore](file:///d:/dev/agy-os/.gitignore) | **MODIFY** | Tambah `node_modules/` entry; `pnpm-lock.yaml` dikecualikan dari gitignore (harus di-commit) |
| **scripts/installer** | `install-deps-agy` | [harness/agy-script/install-deps-agy.sh](file:///d:/dev/agy-os/harness/agy-script/install-deps-agy.sh) | **CREATE** | `pnpm install --frozen-lockfile` wrapper dengan error handling dan instruksi jelas |
| **scripts/verifier** | `verify-deps-agy` | [harness/agy-script/verify-deps-agy.js](file:///d:/dev/agy-os/harness/agy-script/verify-deps-agy.js) | **CREATE** | Verifikasi ketiga modul tersedia di `node_modules/`; exit code 1 jika gagal (Fail-Fast) |
| **scripts/teardown** | `uninstall-deps-agy` | [harness/agy-script/uninstall-deps-agy.sh](file:///d:/dev/agy-os/harness/agy-script/uninstall-deps-agy.sh) | **CREATE** | Non-destructive rollback — hanya `rm -rf node_modules/`; lockfile dan `package.json` tetap utuh |
| **ci/workflow** | `deps-governance-yml` | [.github/workflows/deps-governance.yml](file:///d:/dev/agy-os/.github/workflows/deps-governance.yml) | **CREATE** | GitHub Actions: `pnpm install --frozen-lockfile` → `pnpm audit --audit-level=high` → verify modul |
| **hooks** | `pre-pnpm-audit` | [.agents/hooks.json](file:///d:/dev/agy-os/.agents/hooks.json) | **MODIFY** | Tambah pre-commit hook entry `pre:pnpm-audit` yang memanggil `pnpm audit --audit-level=high` |
| **lockfile** | `pnpm-lock-yaml` | [pnpm-lock.yaml](file:///d:/dev/agy-os/pnpm-lock.yaml) | **CREATE** | Generated otomatis oleh `pnpm install`; di-commit ke Git sebagai satu-satunya lockfile |

---

## 4. Dependency Version Pinning

| Package | Semver Range | Rationale |
| :--- | :--- | :--- |
| `sql.js` | `^1.12.0` | Latest stable; WASM binary; `^` untuk patch security updates |
| `@iarna/toml` | `^3.1.0` | Latest stable TOML parser; actively maintained |
| `ajv` | `^8.17.1` | AJV v8 (JSON Schema draft-07+); `^` untuk patch updates |

---

## 5. Supply Chain Security Controls

| Control | Mechanism | Trigger |
| :--- | :--- | :--- |
| Lockfile integrity | `pnpm install --frozen-lockfile` | Setiap CI run dan fresh install |
| Vulnerability scan | `pnpm audit --audit-level=high` | CI pipeline + pre-commit hook |
| PM enforcement | `packageManager` field + `.npmrc` | Setiap `npm install` / `yarn install` attempt |
| Engine enforcement | `engines` field + `engine-strict=true` | Setiap `pnpm install` dengan Node/pnpm version yang tidak sesuai |
| Hard-fail guard | Error message di skrip jika modul tidak ditemukan | Runtime — ketika `node_modules/` belum ter-install |

---

## 6. Rollback Architecture

Rollback OBJ-04 adalah **non-destructive**:

```
harness/agy-script/uninstall-deps-agy.sh
```

Script ini melakukan:
1. `rm -rf node_modules/` di root `agy-os/`
2. Log rollback timestamp ke `harness/agy-script/.rollback-log`
3. **TIDAK** mengubah `package.json`, `pnpm-lock.yaml`, `.npmrc`, atau `.gitignore`
4. **TIDAK** menyentuh `ECC/`, `.agents/`, atau `d:/CLAUDE-PROJECT/website`

Setelah rollback, state kembali ke kondisi "pre-install" — identik dengan kondisi sebelum OBJ-04, dengan `package.json` dan lockfile tetap siap untuk reinstall.

---

## 7. ECC/ & website/ Read-Only Invariant Compliance

OBJ-04 **tidak melanggar** prinsip READ-ONLY:

- **`ECC/`**: Zero file creation, modification, atau deletion di dalam `ECC/`. `node_modules/` ditempatkan di root `agy-os/`, bukan di dalam `ECC/`.
- **`website/`**: OBJ-04 tidak menghasilkan patch atau modifikasi apapun terhadap `d:/CLAUDE-PROJECT/website`.
- **`pnpm install` scope**: `pnpm` beroperasi dari root `agy-os/` dan resolve ke `d:/dev/agy-os/node_modules/` saja.

---

## 8. Acceptance Criteria

1. `pnpm-lock.yaml` ter-commit di Git root `agy-os/` dengan ketiga dependensi terkunci.
2. `node_modules/` tidak di-commit (ada di `.gitignore`).
3. `package.json` memiliki `packageManager: "pnpm@11.5.3"`, `engines: {node: ">=26", pnpm: ">=10"}`, dan `dependencies` field.
4. `.npmrc` memblok `npm install` dan `yarn install` dengan `package-manager-strict=true`.
5. `node .agents/scripts/lib/state-store/index.js` tidak throw `MODULE_NOT_FOUND` setelah `pnpm install`.
6. `harness/agy-script/verify-deps-agy.js` exit code 0 setelah install sukses.
7. GitHub Actions workflow `deps-governance.yml` pass pada `pnpm audit --audit-level=high`.
8. `harness/agy-script/uninstall-deps-agy.sh` berhasil menghapus `node_modules/` tanpa mengubah file lain.
9. `ECC/` dan `d:/CLAUDE-PROJECT/website` tidak termodifikasi selama seluruh proses OBJ-04.

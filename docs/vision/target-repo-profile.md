---
title: "Target Repository Profile: website (d:/CLAUDE-PROJECT/website)"
doc_type: "vision"
doc_id: "VIS-002"
status: "active"
author: "teamwork_preview_worker_m1_1"
created_at: "2026-07-27"
updated_at: "2026-07-27"
tags: ["target-profile", "tech-stack", "read-only", "patch-strategy"]
references:
  - "AGENTS.md"
  - ".agents/rules/RULES.md"
---

# Target Repository Profile: website

## 1. Overview & Repository Identity

- **Target Directory Absolute Path**: `d:/CLAUDE-PROJECT/website`
- **Corpus Mapping**: `pampam666/dayaberkah`
- **Project Name / Package**: `my-website` (`dbsnweb-vbeta`)
- **Access Level**: **STRICTLY READ-ONLY**

---

## 2. Verified Technical Stack Profile

The technical stack of the target project has been verified via manifest analysis (`d:/CLAUDE-PROJECT/website/package.json`):

| Domain | Technology / Package | Details & Version |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `v16.2.6` (React `19.2.4`, TypeScript `^5`) |
| **Styling & UI** | Tailwind CSS / Radix UI | Tailwind CSS `v4` (`@tailwindcss/postcss`), Radix UI primitives, Framer Motion `v12`, Lucide Icons |
| **State & Validation** | Zustand / Zod / React Hook Form | Zustand `v5.0`, React Hook Form `v7.76`, Zod `v4.4` |
| **Database & ORM** | Prisma / Neon Postgres | Prisma `v6.19.3`, `@prisma/adapter-neon`, `@neondatabase/serverless` |
| **Headless CMS** | Sanity CMS | `@sanity/client` `v7.22`, `next-sanity` `v12.4`, `@portabletext/react` |
| **Authentication** | NextAuth.js | `v5.0.0-beta.31` with Prisma Adapter, bcryptjs |
| **Deployment / Edge** | Cloudflare Pages / Wrangler | `@cloudflare/next-on-pages` `v1.13`, Wrangler `v4.97.0`, custom `scripts/preserve-manifest.js` and `scripts/pages-build.js` |
| **Observability** | Sentry / PostHog | `@sentry/nextjs` `v10.56`, PostHog |
| **Testing** | Jest / Playwright | Jest `v30.4` (`@swc/jest`, `jest-environment-jsdom`, `@testing-library/react`), Playwright `v1.60` (E2E) |

---

## 3. Strict Read-Only Security Governance

To protect the target codebase integrity and prevent accidental contamination:
- Agents, automated scripts, and tool executions MUST NEVER edit, create, or delete files inside `d:/CLAUDE-PROJECT/website`.
- Target repository access is strictly restricted to read-only inspection operations: `view_file`, `grep_search`, `find_by_name`, `list_dir`, AST parsing, and diff auditing.

---

## 4. Patch Generation & Staging Strategy

1. **Unified Diff Generation**: All recommended modifications targeting `website` must be authored as standard unified diff files (`.patch` or `.diff`).
2. **Staging Location**: Patch files must be stored in `d:/dev/agy-harness/harness/patches/`.
3. **Naming Convention**: `YYYY-MM-DD-<feature-slug>.patch` (e.g. `2026-07-27-auth-fix.patch`).
4. **Verification & Audit Protocol**:
   - Verify patch syntax and line numbers against target files.
   - Run verification test suites inside `agy-harness` or staging environments.
   - Conduct security boundary audit (`git status` check in target repository to verify zero mutated files).

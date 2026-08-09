const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');
const rulesDir = `${REPO_ROOT}/.agents/rules`;

const rulesToCreate = {
  'cloudflare-edge-runtime.md': `# Cloudflare Edge Runtime Guidelines

## Core Invariants
- Enforce V8 isolate limits, streaming responses, and Web API compatibility for Cloudflare Workers.
- Prefer KV, D1, and R2 bindings for edge state management.
`,
  'cloudflare-pages-deploy.md': `# Cloudflare Pages Deployment Guidelines

## Core Invariants
- Configure static asset routing, build output directories, and edge function bindings cleanly.
- Ensure zero-downtime deployment pipelines with atomic git commit tagging.
`,
  'sanity-cms-federation.md': `# Sanity CMS Federation Guidelines

## Core Invariants
- Maintain strict GROQ query typings and Sanity Studio schema federation.
- Validate dataset versioning, CORS origin rules, and draft document handling.
`,
  'monorepo-workspace.md': `# Monorepo Workspace Guidelines

## Core Invariants
- Enforce strict package boundary isolation, shared workspace dependencies, and pnpm/npm workspace resolution.
- Prevent cross-package internal leakage and enforce clean build DAG order.
`,
  'tailwind-v4.md': `# Tailwind CSS v4 Guidelines

## Core Invariants
- Use CSS-first configuration via \`@theme\` blocks and native CSS cascade layers.
- Avoid legacy \`tailwind.config.js\` overrides in v4 projects.
`,
  'prisma-neon-edge.md': `# Prisma & Neon Edge Guidelines

## Core Invariants
- Use \`@neondatabase/serverless\` driver adapter with Prisma client on edge runtimes.
- Enforce connection pooling boundaries and zero-downtime database migrations.
`
};

console.log('=== Seeding missing 6 rule files to .agents/rules/ ===\n');

for (const [filename, content] of Object.entries(rulesToCreate)) {
  const filePath = `${rulesDir}/${filename}`;
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ [CREATED RULE] .agents/rules/${filename}`);
  } else {
    console.log(`  [ALREADY EXISTS] .agents/rules/${filename}`);
  }
}

console.log('\nRules seeding complete!');

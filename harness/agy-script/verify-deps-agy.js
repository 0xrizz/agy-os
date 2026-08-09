#!/usr/bin/env node
// harness/agy-script/verify-deps-agy.js
// OBJ-04: Fail-Fast verifier for three required runtime modules.
// Exits with code 1 if any module is missing, code 0 if all pass.
// Per spec: pkg.deps.hard_fail_guard, pkg.governance.scripts_location

'use strict';

const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');

const REQUIRED_MODULES = [
  {
    name: 'sql.js',
    expectedPath: 'node_modules/sql.js',
  },
  {
    name: '@iarna/toml',
    expectedPath: 'node_modules/@iarna/toml',
  },
  {
    name: 'ajv',
    expectedPath: 'node_modules/ajv',
  },
];

let allPassed = true;
const missing = [];

for (const mod of REQUIRED_MODULES) {
  try {
    require.resolve(mod.name, { paths: [ROOT_DIR] });
    console.log(`[verify-deps] OK: ${mod.name}`);
  } catch (err) {
    const expectedPath = path.join(ROOT_DIR, mod.expectedPath);
    console.error(`[verify-deps] MISSING: ${mod.name}`);
    console.error(`  Expected path: ${expectedPath}`);
    console.error(`  Error: ${err.message}`);
    missing.push(mod.name);
    allPassed = false;

    // Fail-Fast: exit immediately on first missing module per spec
    console.error('');
    console.error('FAIL-FAST: Dependency verification failed.');
    console.error(`Missing module(s): ${missing.join(', ')}`);
    console.error('');
    console.error('Recovery instruction:');
    console.error('  Run the following command from the agy-os root directory in Git Bash:');
    console.error('    pnpm install');
    console.error('  Or use the governance installer:');
    console.error('    bash harness/agy-script/install-deps-agy.sh');
    console.error('');
    process.exit(1);
  }
}

if (allPassed) {
  console.log('');
  console.log('[verify-deps] All required runtime modules are present and resolvable.');
  console.log('[verify-deps] Status: PASS (exit code 0)');
  process.exit(0);
}

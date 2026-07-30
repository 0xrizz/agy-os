/**
 * Unit & Integration Tests for merge-hooks-agy.js (Antigravity agy-os)
 * 
 * Verifies non-destructive merging, AGY-native hook preservation,
 * pre:agy-guardrail index 0 pinning, desktop-notify filtering,
 * and atomic backup creation.
 * 
 * Usage: node harness/agy-script/scripts/test-merge-hooks-agy.js
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { mergeHooks } = require('./merge-hooks-agy.js');

const rootDir = path.resolve(__dirname, '../../..').replace(/\\/g, '/');
const tmpDir = `${rootDir}/harness/agy-script/scripts/tmp_test_hooks`;

function cleanupTmpDir() {
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

function runTests() {
  console.log('[Test Suite] Starting merge-hooks-agy.js test suite...');
  cleanupTmpDir();
  fs.mkdirSync(tmpDir, { recursive: true });

  const mockEccSource = `${tmpDir}/ecc_hooks.json`;
  const mockTarget = `${tmpDir}/target_hooks.json`;
  const mockBackup = `${tmpDir}/target_hooks.json.bak`;

  // Mock upstream ECC hooks configuration (contains stop:desktop-notify and standard hooks)
  const eccData = {
    $schema: 'https://json.schemastore.org/claude-code-settings.json',
    hooks: {
      PreToolUse: [
        { id: 'pre:bash:dispatcher', matcher: 'Bash', hooks: [{ type: 'command', command: 'node pre-bash.js' }] },
        { id: 'pre:write:doc-file-warning', matcher: 'Write', hooks: [{ type: 'command', command: 'node doc-warn.js' }] }
      ],
      Stop: [
        { id: 'stop:format-typecheck', matcher: '*', hooks: [{ type: 'command', command: 'node format.js' }] },
        { id: 'stop:desktop-notify', matcher: '*', hooks: [{ type: 'command', command: 'node notify.js' }] }
      ]
    }
  };
  fs.writeFileSync(mockEccSource, JSON.stringify(eccData, null, 2), 'utf8');

  // Mock initial target hooks configuration (contains AGY-native hooks and stop:desktop-notify)
  const initialTargetData = {
    $schema: 'https://json.schemastore.org/claude-code-settings.json',
    hooks: {
      PreToolUse: [
        { id: 'pre:bash:dispatcher', matcher: 'Bash', hooks: [{ type: 'command', command: 'node old-bash.js' }] },
        { id: 'pre:agy-guardrail', matcher: '*', hooks: [{ type: 'command', command: 'node .agents/hooks/scripts/pre-tool-guardrail-agy.js' }] }
      ],
      PostToolUse: [
        { id: 'post:agy-observation-envelope', matcher: '*', hooks: [{ type: 'command', command: 'node .agents/hooks/scripts/observation-envelope-agy.js' }] }
      ],
      Stop: [
        { id: 'stop:desktop-notify', matcher: '*', hooks: [{ type: 'command', command: 'node old-notify.js' }] }
      ]
    }
  };
  fs.writeFileSync(mockTarget, JSON.stringify(initialTargetData, null, 2), 'utf8');

  // --- Test Case 1: Atomic Backup Creation ---
  console.log('[Test 1] Verifying atomic backup creation...');
  assert.strictEqual(fs.existsSync(mockBackup), false, 'Backup file should not exist before merge');
  mergeHooks(mockEccSource, mockTarget, mockBackup);
  assert.strictEqual(fs.existsSync(mockBackup), true, 'Backup file MUST exist after merge');
  const backupContent = JSON.parse(fs.readFileSync(mockBackup, 'utf8'));
  assert.deepStrictEqual(backupContent, initialTargetData, 'Backup content MUST match pre-merge target file exactly');
  console.log('✔ Test 1 Passed: Atomic backup created successfully.');

  // --- Test Case 2: Preserving AGY-Native Hooks & Pinning pre:agy-guardrail at Index 0 ---
  console.log('[Test 2] Verifying AGY-native hook preservation & PreToolUse index 0 pinning...');
  const mergedData = JSON.parse(fs.readFileSync(mockTarget, 'utf8'));
  
  const preToolUseHooks = mergedData.hooks.PreToolUse || [];
  assert.ok(preToolUseHooks.length > 0, 'PreToolUse array must not be empty');
  assert.strictEqual(preToolUseHooks[0].id, 'pre:agy-guardrail', 'pre:agy-guardrail MUST be pinned at PreToolUse index 0');

  const postToolUseHooks = mergedData.hooks.PostToolUse || [];
  const hasEnvelope = postToolUseHooks.some(h => h.id === 'post:agy-observation-envelope');
  assert.strictEqual(hasEnvelope, true, 'post:agy-observation-envelope MUST be preserved in PostToolUse');
  console.log('✔ Test 2 Passed: AGY-native hooks preserved and pre:agy-guardrail pinned at index 0.');

  // --- Test Case 3: Filtering Platform-Incompatible Hooks (stop:desktop-notify) ---
  console.log('[Test 3] Verifying exclusion of stop:desktop-notify...');
  let hasDesktopNotify = false;
  for (const category of Object.keys(mergedData.hooks)) {
    for (const entry of mergedData.hooks[category]) {
      if (entry.id === 'stop:desktop-notify') {
        hasDesktopNotify = true;
      }
    }
  }
  assert.strictEqual(hasDesktopNotify, false, 'stop:desktop-notify MUST be filtered out completely from merged configuration');
  console.log('✔ Test 3 Passed: Platform filter successfully excluded stop:desktop-notify.');

  // --- Test Case 4: Non-Destructive Ingestion of Source Hooks ---
  console.log('[Test 4] Verifying non-destructive ingestion of upstream ECC hooks...');
  const stopHooks = mergedData.hooks.Stop || [];
  const hasFormatTypecheck = stopHooks.some(h => h.id === 'stop:format-typecheck');
  assert.strictEqual(hasFormatTypecheck, true, 'stop:format-typecheck from upstream source MUST be ingested into Stop category');
  console.log('✔ Test 4 Passed: Upstream ECC hooks merged into target successfully.');

  cleanupTmpDir();
  console.log('\n[Test Suite] ALL 4 MERGE-HOOKS TESTS PASSED SUCCESSFULLY! 🎉');
}

try {
  runTests();
} catch (err) {
  console.error(`\n[Test Suite] TEST FAILURE: ${err.message}`);
  console.error(err.stack);
  cleanupTmpDir();
  process.exit(1);
}

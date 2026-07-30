/**
 * Standalone Non-Destructive Hooks Merger Utility (Antigravity agy-os)
 * 
 * Ingests upstream ECC hooks.json and merges into target .agents/hooks.json
 * while strictly preserving AGY-native hook entries (post:agy-observation-envelope, pre:agy-guardrail),
 * pinning pre:agy-guardrail at PreToolUse index 0,
 * filtering out platform-incompatible hooks (stop:desktop-notify),
 * and creating an atomic backup at .agents/hooks.json.bak prior to writing.
 * 
 * Follows AGENTS.md §4 naming conventions (-agy.js suffix).
 */

const fs = require('fs');
const path = require('path');

// AGY-native hooks to preserve
const DEFAULT_PRESERVE_IDS = [
  'post:agy-observation-envelope',
  'pre:agy-guardrail'
];

// Platform-incompatible hooks to exclude (Windows notification pop-ups)
const DEFAULT_EXCLUDE_IDS = [
  'stop:desktop-notify'
];

// Canonical AGY-native hook definitions (used as fallback/scaffold if missing)
const CANONICAL_AGY_HOOKS = {
  'pre:agy-guardrail': {
    matcher: '*',
    hooks: [
      {
        type: 'command',
        command: 'node .agents/hooks/scripts/pre-tool-guardrail-agy.js'
      }
    ],
    description: 'AGY pre-tool guardrail: inspect tool payloads for target repo READ-ONLY and backslash violations',
    id: 'pre:agy-guardrail'
  },
  'post:agy-observation-envelope': {
    matcher: '*',
    hooks: [
      {
        type: 'command',
        command: 'node .agents/hooks/scripts/observation-envelope-agy.js',
        timeout: 10
      }
    ],
    description: 'AGY observation envelope: standardize tool output with Error Recovery Contract',
    id: 'post:agy-observation-envelope'
  }
};

/**
 * Merge upstream ECC hooks into target hooks.json non-destructively.
 * 
 * @param {string} eccSourcePath - Path to upstream ECC hooks.json
 * @param {string} targetPath - Path to target .agents/hooks.json
 * @param {string} backupPath - Path to atomic backup .agents/hooks.json.bak
 * @param {Object} [options] - Optional override settings
 * @param {string[]} [options.preserveIds] - Array of hook IDs to preserve
 * @param {string[]} [options.excludeIds] - Array of hook IDs to filter out
 * @returns {Object} The merged hooks configuration object
 */
function mergeHooks(eccSourcePath, targetPath, backupPath, options = {}) {
  const rootDir = path.resolve(__dirname, '../../..').replace(/\\/g, '/');

  // Resolve default paths if not provided
  if (!eccSourcePath) {
    const primarySrc = `${rootDir}/ECC/hooks/hooks.json`;
    const fallbackSrc = `${rootDir}/ECC/hooks.json`;
    eccSourcePath = fs.existsSync(primarySrc) ? primarySrc : fallbackSrc;
  } else {
    eccSourcePath = path.resolve(eccSourcePath).replace(/\\/g, '/');
  }

  if (!targetPath) {
    targetPath = `${rootDir}/.agents/hooks.json`;
  } else {
    targetPath = path.resolve(targetPath).replace(/\\/g, '/');
  }

  if (!backupPath) {
    backupPath = `${targetPath}.bak`;
  } else {
    backupPath = path.resolve(backupPath).replace(/\\/g, '/');
  }

  const preserveIds = options.preserveIds || DEFAULT_PRESERVE_IDS;
  const excludeIds = options.excludeIds || DEFAULT_EXCLUDE_IDS;

  console.log(`[MergeHooks Engine] Merging hooks from: ${eccSourcePath}`);
  console.log(`[MergeHooks Engine] Target: ${targetPath}`);

  // Step 1: Create atomic backup if target file exists
  if (fs.existsSync(targetPath)) {
    try {
      const backupDir = path.dirname(backupPath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      fs.copyFileSync(targetPath, backupPath);
      console.log(`[MergeHooks Engine] Atomic backup created at: ${backupPath}`);
    } catch (err) {
      console.error(`[MergeHooks Engine] ERROR creating atomic backup: ${err.message}`);
      throw err;
    }
  } else {
    console.log(`[MergeHooks Engine] No existing target file found at ${targetPath}. Skipping backup.`);
  }

  // Step 2: Read target configuration if present
  let targetConfig = { $schema: 'https://json.schemastore.org/claude-code-settings.json', hooks: {} };
  if (fs.existsSync(targetPath)) {
    try {
      const rawTarget = fs.readFileSync(targetPath, 'utf8');
      targetConfig = JSON.parse(rawTarget);
    } catch (err) {
      console.warn(`[MergeHooks Engine] Warning: Failed to parse existing ${targetPath}, starting fresh: ${err.message}`);
    }
  }

  // Step 3: Read upstream source configuration if present
  let sourceConfig = { hooks: {} };
  if (fs.existsSync(eccSourcePath)) {
    try {
      const rawSource = fs.readFileSync(eccSourcePath, 'utf8');
      sourceConfig = JSON.parse(rawSource);
    } catch (err) {
      console.warn(`[MergeHooks Engine] Warning: Failed to parse upstream ${eccSourcePath}: ${err.message}`);
    }
  } else {
    console.warn(`[MergeHooks Engine] Warning: Upstream source file ${eccSourcePath} not found.`);
  }

  const mergedHooks = {};
  const targetHooksObj = targetConfig.hooks || {};
  const sourceHooksObj = sourceConfig.hooks || {};

  // Get all event categories from both target and source
  const allEvents = Array.from(new Set([
    ...Object.keys(targetHooksObj),
    ...Object.keys(sourceHooksObj)
  ]));

  // Ensure mandatory event categories exist if we need to scaffold AGY-native hooks
  if (!allEvents.includes('PreToolUse')) allEvents.push('PreToolUse');
  if (!allEvents.includes('PostToolUse')) allEvents.push('PostToolUse');

  for (const eventName of allEvents) {
    const targetEntries = targetHooksObj[eventName] || [];
    const sourceEntries = sourceHooksObj[eventName] || [];

    const mergedEntries = [];
    const seenIds = new Set();

    // Helper to check if an entry matches excludeIds
    const isExcluded = (entry) => {
      if (entry.id && excludeIds.includes(entry.id)) return true;
      return false;
    };

    // First pass: add entries from target (preserving AGY-native entries and target customizations)
    for (const entry of targetEntries) {
      if (isExcluded(entry)) continue;
      if (entry.id) {
        seenIds.add(entry.id);
      }
      mergedEntries.push(entry);
    }

    // Second pass: add entries from source if not already present or excluded
    for (const entry of sourceEntries) {
      if (isExcluded(entry)) continue;
      if (entry.id && seenIds.has(entry.id)) continue;
      if (entry.id) {
        seenIds.add(entry.id);
      }
      mergedEntries.push(entry);
    }

    // Scaffold AGY-native hooks if missing
    if (eventName === 'PreToolUse' && !seenIds.has('pre:agy-guardrail')) {
      mergedEntries.push(CANONICAL_AGY_HOOKS['pre:agy-guardrail']);
      seenIds.add('pre:agy-guardrail');
    }
    if (eventName === 'PostToolUse' && !seenIds.has('post:agy-observation-envelope')) {
      mergedEntries.push(CANONICAL_AGY_HOOKS['post:agy-observation-envelope']);
      seenIds.add('post:agy-observation-envelope');
    }

    // Filter out excluded IDs again just to be 100% sure
    const finalEntries = mergedEntries.filter(e => !isExcluded(e));

    // Special pinning for PreToolUse: pre:agy-guardrail MUST be at index 0
    if (eventName === 'PreToolUse') {
      const guardrailIdx = finalEntries.findIndex(e => e.id === 'pre:agy-guardrail');
      if (guardrailIdx > 0) {
        const [guardrailEntry] = finalEntries.splice(guardrailIdx, 1);
        finalEntries.unshift(guardrailEntry);
      }
    }

    mergedHooks[eventName] = finalEntries;
  }

  const outputConfig = {
    $schema: targetConfig.$schema || sourceConfig.$schema || 'https://json.schemastore.org/claude-code-settings.json',
    hooks: mergedHooks
  };

  // Step 4: Write merged configuration atomically
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(targetPath, JSON.stringify(outputConfig, null, 2), 'utf8');
  console.log(`[MergeHooks Engine] SUCCESS: Merged hooks written to ${targetPath}`);

  return outputConfig;
}

// CLI execution handling
if (require.main === module) {
  const args = process.argv.slice(2);
  const eccSource = args[0];
  const target = args[1];
  const backup = args[2];

  try {
    mergeHooks(eccSource, target, backup);
    console.log('[MergeHooks Engine] CLI Execution completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error(`[MergeHooks Engine] CLI Execution failed: ${err.message}`);
    process.exit(1);
  }
}

module.exports = {
  mergeHooks,
  DEFAULT_PRESERVE_IDS,
  DEFAULT_EXCLUDE_IDS
};

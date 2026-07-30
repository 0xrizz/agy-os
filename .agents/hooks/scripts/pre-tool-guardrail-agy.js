/**
 * AGY Guardrail Hook: PreToolUse Validation
 * Enforces:
 * 1. Target repository (d:/CLAUDE-PROJECT/website) READ-ONLY invariant per AGENTS.md Section 1.
 * 2. Strict forward-slash file path format per AGENTS.md Section 0.
 */

const fs = require('fs');

function readStdinSync() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch (err) {
    return '';
  }
}

function extractPaths(obj, paths = []) {
  if (!obj || typeof obj !== 'object') return paths;

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string') {
      const lKey = key.toLowerCase();
      if (
        lKey.includes('path') ||
        lKey.includes('file') ||
        lKey === 'target' ||
        lKey === 'targetfile' ||
        lKey === 'target_file'
      ) {
        paths.push(val);
      }
    } else if (typeof val === 'object' && val !== null) {
      extractPaths(val, paths);
    }
  }
  return paths;
}

function main() {
  const inputRaw = readStdinSync();
  if (!inputRaw || !inputRaw.trim()) {
    process.exit(0);
  }

  let payload;
  try {
    payload = JSON.parse(inputRaw);
  } catch (err) {
    process.exit(0);
  }

  const toolInput = payload.tool_input || payload.toolInput || {};
  const paths = extractPaths(toolInput);

  // Check 1: Check for Windows backslash ('\') in any path argument
  for (const p of paths) {
    if (p.includes('\\')) {
      process.stdout.write(
        "AGY Guardrail Violation: Windows backslashes ('\\') are strictly prohibited per AGENTS.md Section 0. All file paths must use forward slashes ('/').\n"
      );
      process.exit(2);
    }
  }

  // Check 2: Target repository READ-ONLY invariant (d:/CLAUDE-PROJECT/website)
  const targetPrefix = 'd:/claude-project/website';

  for (const p of paths) {
    const normalized = p.replace(/\\/g, '/').toLowerCase();
    if (
      normalized === targetPrefix ||
      normalized.startsWith(targetPrefix + '/')
    ) {
      process.stdout.write(
        "AGY Guardrail Violation: Target repository ('d:/CLAUDE-PROJECT/website') is READ-ONLY per AGENTS.md Section 1. All modifications must be produced as patch files saved in harness/patches/.\n"
      );
      process.exit(2);
    }
  }

  process.exit(0);
}

main();

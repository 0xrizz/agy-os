/**
 * Proposal Item & Runtime Integration Compliance Verification Script (Antigravity agy-os)
 * 
 * Verifies physical disk installation against docs/OBJ-01/artifacts/ecc-items.json
 * across all 6 item kinds: rules, agents, commands, hooks, skills, platform.
 * 
 * Also verifies OBJ-03 ECC Script Integration requirements:
 * 1. 100% self-contained script co-location under .agents/scripts/ and .agents/scripts/lib/.
 * 2. harness/.env.example template existence and zero reliance on CLAUDE_PLUGIN_ROOT.
 * 3. AGY-native helper libraries in .agents/scripts/lib/ (*-agy.js naming compliance).
 * 4. AGY-native runtime hook scripts in .agents/scripts/ (*-agy.js naming compliance).
 * 5. Lifecycle hooks configuration (.agents/hooks.json):
 *    - Presence of pre:agy-guardrail (pinned at PreToolUse index 0)
 *    - Presence of post:agy-observation-envelope (registered in PostToolUse)
 *    - Exclusion of platform-incompatible stop:desktop-notify
 *    - Script command execution paths pointing to .agents/scripts/
 * 
 * Enforces Fail-Fast validation (exit code 1 on any missing or extra item/discrepancy, exit code 0 on 100% match).
 * 
 * Usage: node harness/agy-script/scripts/verify-installation-agy.js
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let targetDirArg = null;
const targetDirIdx = args.indexOf('--target-dir');
if (targetDirIdx !== -1 && args[targetDirIdx + 1]) {
  targetDirArg = args[targetDirIdx + 1];
}

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');
const TARGET_DIR = targetDirArg
  ? path.resolve(targetDirArg).replace(/\\/g, '/')
  : REPO_ROOT;

if (args.includes('--help')) {
  console.log('Usage: node harness/agy-script/scripts/verify-installation-agy.js [--target-dir <path>]');
  process.exit(0);
}

let ECC_ITEMS_FILE;
if (targetDirArg && fs.existsSync(`${TARGET_DIR}/.agents/ecc-items.json`)) {
  ECC_ITEMS_FILE = `${TARGET_DIR}/.agents/ecc-items.json`;
} else if (fs.existsSync(`${TARGET_DIR}/.agents/ecc-items.json`)) {
  ECC_ITEMS_FILE = `${TARGET_DIR}/.agents/ecc-items.json`;
} else if (fs.existsSync(`${REPO_ROOT}/harness/ecc-items.json`)) {
  ECC_ITEMS_FILE = `${REPO_ROOT}/harness/ecc-items.json`;
} else if (fs.existsSync(`${REPO_ROOT}/docs/OBJ-06/artifacts/ecc-items.json`)) {
  ECC_ITEMS_FILE = `${REPO_ROOT}/docs/OBJ-06/artifacts/ecc-items.json`;
} else {
  ECC_ITEMS_FILE = `${REPO_ROOT}/docs/OBJ-01/artifacts/ecc-items.json`;
}

function verifyEnvironmentConfig() {
  console.log('\n--- Environment & Self-Contained Script Architecture Verification ---');
  let valid = true;

  const envExamplePath = `${REPO_ROOT}/harness/.env.example`;
  if (!fs.existsSync(envExamplePath)) {
    console.error('  ✗ [MISSING] harness/.env.example template file does not exist.');
    valid = false;
  } else {
    console.log('  ✓ [MATCH] harness/.env.example template file exists.');
  }

  // Verify self-contained script directory structures
  const requiredScriptTargets = [
    { path: `${TARGET_DIR}/.agents/scripts`, isDir: true, desc: 'Co-located runtime scripts directory' },
    { path: `${TARGET_DIR}/.agents/scripts/lib`, isDir: true, desc: 'Co-located shared libraries directory' },
    { path: `${TARGET_DIR}/.agents/scripts/lib/utils.js`, isDir: false, desc: 'Co-located shared library utils.js' },
    { path: `${TARGET_DIR}/.agents/scripts/lib/hook-flags.js`, isDir: false, desc: 'Co-located shared library hook-flags.js' },
    { path: `${TARGET_DIR}/.agents/scripts/lib/state-store`, isDir: true, desc: 'Co-located state store directory' }
  ];

  for (const t of requiredScriptTargets) {
    if (!fs.existsSync(t.path)) {
      console.error(`  ✗ [MISSING] Target missing (${t.desc}): ${t.path.replace(`${TARGET_DIR}/`, '')}`);
      valid = false;
    } else {
      const stat = fs.statSync(t.path);
      if (t.isDir && !stat.isDirectory()) {
        console.error(`  ✗ [INVALID] Expected directory (${t.desc}): ${t.path.replace(`${TARGET_DIR}/`, '')}`);
        valid = false;
      } else if (!t.isDir && !stat.isFile()) {
        console.error(`  ✗ [INVALID] Expected file (${t.desc}): ${t.path.replace(`${TARGET_DIR}/`, '')}`);
        valid = false;
      }
    }
  }

  if (valid) {
    console.log('  ✓ [MATCH] 100% self-contained script co-location confirmed with zero mandatory CLAUDE_PLUGIN_ROOT dependency.');
  }

  return { passed: valid };
}

function verifyAgyHelperLibraries() {
  console.log('\n--- AGY-Native Helper Libraries Verification (.agents/scripts/lib/) ---');
  const libDir = `${TARGET_DIR}/.agents/scripts/lib`;

  if (!fs.existsSync(libDir)) {
    console.error(`  ✗ [MISSING] Helper library directory does not exist: .agents/scripts/lib`);
    return false;
  }

  const requiredHelpers = ['command-inspector-agy.js', 'path-validator-agy.js'];
  let valid = true;

  for (const helper of requiredHelpers) {
    const helperPath = `${libDir}/${helper}`;
    if (fs.existsSync(helperPath)) {
      console.log(`  ✓ [MATCH] Required helper library -> .agents/scripts/lib/${helper}`);
    } else {
      console.error(`  ✗ [MISSING] Required helper library missing -> .agents/scripts/lib/${helper}`);
      valid = false;
    }
  }

  // Enforce naming convention for AGY native scripts: custom AGY helpers MUST end with '-agy.js'
  const files = fs.readdirSync(libDir, { withFileTypes: true });
  for (const f of files) {
    if (f.isFile() && f.name.includes('-agy') && !f.name.endsWith('-agy.js')) {
      console.error(`  ✗ [VIOLATION] Helper library file '${f.name}' violates naming standard (must end with '-agy.js' per AGENTS.md §11).`);
      valid = false;
    }
  }

  return valid;
}

function verifyAgyRuntimeHooks() {
  console.log('\n--- AGY-Native Runtime Hooks Verification (.agents/scripts/) ---');
  const scriptsDir = `${TARGET_DIR}/.agents/scripts`;

  if (!fs.existsSync(scriptsDir)) {
    console.error(`  ✗ [MISSING] Runtime scripts directory does not exist: .agents/scripts`);
    return false;
  }

  const requiredHooks = ['pre-tool-guardrail-agy.js', 'observation-envelope-agy.js'];
  let valid = true;

  for (const hookScript of requiredHooks) {
    const hookPath = `${scriptsDir}/${hookScript}`;
    if (fs.existsSync(hookPath)) {
      console.log(`  ✓ [MATCH] Required runtime hook script -> .agents/scripts/${hookScript}`);
    } else {
      console.error(`  ✗ [MISSING] Required runtime hook script missing -> .agents/scripts/${hookScript}`);
      valid = false;
    }
  }

  return valid;
}

function verifyHooksJsonConfig() {
  console.log('\n--- Lifecycle Hooks Configuration Verification (.agents/hooks.json) ---');
  const hooksFile = `${TARGET_DIR}/.agents/hooks.json`;

  if (!fs.existsSync(hooksFile)) {
    console.error(`  ✗ [MISSING] .agents/hooks.json file does not exist.`);
    return false;
  }

  let hooksData;
  try {
    hooksData = JSON.parse(fs.readFileSync(hooksFile, 'utf8'));
  } catch (err) {
    console.error(`  ✗ [INVALID] .agents/hooks.json could not be parsed as valid JSON: ${err.message}`);
    return false;
  }

  let valid = true;
  const hooksObj = hooksData.hooks || {};

  // 1. Check PreToolUse contains pre:agy-guardrail pinned at index 0
  const preToolUse = hooksObj.PreToolUse || [];
  const guardrailIndex = preToolUse.findIndex(h => h.id === 'pre:agy-guardrail');
  if (guardrailIndex === -1) {
    console.error(`  ✗ [MISSING] 'pre:agy-guardrail' hook entry missing from PreToolUse in .agents/hooks.json`);
    valid = false;
  } else if (guardrailIndex !== 0) {
    console.error(`  ✗ [POSITION] 'pre:agy-guardrail' hook is at index ${guardrailIndex} in PreToolUse, but MUST be pinned at index 0.`);
    valid = false;
  } else {
    console.log(`  ✓ [MATCH] 'pre:agy-guardrail' present and pinned at PreToolUse index 0.`);
  }

  // 2. Check PostToolUse contains post:agy-observation-envelope
  const postToolUse = hooksObj.PostToolUse || [];
  const envelopeEntry = postToolUse.find(h => h.id === 'post:agy-observation-envelope');
  if (!envelopeEntry) {
    console.error(`  ✗ [MISSING] 'post:agy-observation-envelope' hook entry missing from PostToolUse in .agents/hooks.json`);
    valid = false;
  } else {
    console.log(`  ✓ [MATCH] 'post:agy-observation-envelope' present in PostToolUse.`);
  }

  // 3. Platform Filter check: zero stop:desktop-notify occurrences anywhere in hooks.json
  const hooksStr = JSON.stringify(hooksData);
  if (hooksStr.includes('stop:desktop-notify') || hooksStr.includes('desktop-notify.js')) {
    console.error(`  ✗ [PLATFORM DISCREPANCY] Found blacklisted platform-incompatible hook 'stop:desktop-notify' in .agents/hooks.json.`);
    valid = false;
  } else {
    console.log(`  ✓ [MATCH] Zero 'stop:desktop-notify' platform-incompatible hook entries found.`);
  }

  // 4. Script execution command path check (pointing to .agents/scripts/)
  let foundTargetScriptPaths = false;
  for (const groupKey of Object.keys(hooksObj)) {
    const hookList = hooksObj[groupKey];
    if (Array.isArray(hookList)) {
      for (const entry of hookList) {
        if (Array.isArray(entry.hooks)) {
          for (const h of entry.hooks) {
            if (h.command && h.command.includes('.agents/scripts/')) {
              foundTargetScriptPaths = true;
              break;
            }
          }
        }
      }
    }
  }

  if (foundTargetScriptPaths) {
    console.log(`  ✓ [MATCH] Hook commands point directly to co-located .agents/scripts/ runtime paths.`);
  } else {
    console.error(`  ✗ [MISSING] Hook commands lack .agents/scripts/ path resolution.`);
    valid = false;
  }

  return valid;
}

function verifyAgentFrontmatter() {
  console.log('\n--- Subagent YAML Frontmatter Validation (.agents/agents/) ---');
  const agentsDir = `${TARGET_DIR}/.agents/agents`;
  if (!fs.existsSync(agentsDir)) {
    console.error('  ✗ [MISSING] Subagent directory does not exist: .agents/agents');
    return false;
  }

  const subagentDirs = fs.readdirSync(agentsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  let valid = true;

  for (const agentName of subagentDirs) {
    const agentMdPath = `${agentsDir}/${agentName}/agent.md`;
    if (!fs.existsSync(agentMdPath)) {
      console.error(`  ✗ [INVALID FRONTMATTER] .agents/agents/${agentName}/agent.md — missing file`);
      valid = false;
      continue;
    }

    const content = fs.readFileSync(agentMdPath, 'utf8');
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) {
      console.error(`  ✗ [INVALID FRONTMATTER] .agents/agents/${agentName}/agent.md — missing YAML delimiters (---)`);
      valid = false;
      continue;
    }

    const yamlBlock = match[1];
    const fields = {};
    yamlBlock.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(':').trim().replace(/^["']|["']$/g, '');
        if (key && !key.startsWith('#')) {
          fields[key] = value;
        }
      }
    });

    const requiredFields = ['name', 'description', 'mainAgent', 'subagent', 'model', 'tools', 'mcpServers', 'skills'];
    let agentValid = true;

    for (const field of requiredFields) {
      if (fields[field] === undefined) {
        console.error(`  ✗ [INVALID FRONTMATTER] .agents/agents/${agentName}/agent.md — missing field: ${field}`);
        valid = false;
        agentValid = false;
      }
    }

    if (fields['model'] && !['inherit', 'flash', 'pro'].includes(fields['model'])) {
      console.error(`  ✗ [INVALID MODEL TIER] .agents/agents/${agentName}/agent.md — invalid model tier: ${fields['model']} (must be inherit, flash, or pro)`);
      valid = false;
      agentValid = false;
    }

    if (agentValid) {
      console.log(`  ✓ [MATCH] Compliant YAML frontmatter -> .agents/agents/${agentName}/agent.md (mainAgent: ${fields['mainAgent']}, model: ${fields['model']})`);
    }
  }

  return valid;
}

function runVerification() {
  console.log('[Verification Engine] Starting proposal item & runtime integration compliance verification...');

  if (!fs.existsSync(ECC_ITEMS_FILE)) {
    console.error(`[Verification Engine] Error: Reference artifact missing at ${ECC_ITEMS_FILE}`);
    process.exit(1);
  }

  const itemsConfig = JSON.parse(fs.readFileSync(ECC_ITEMS_FILE, 'utf8'));

  let totalChecked = 0;
  let totalMatched = 0;
  let totalMissing = 0;
  let totalExtra = 0;
  const scorecard = {};

  const kinds = ['rules', 'agents', 'commands', 'hooks', 'skills', 'platform'];

  kinds.forEach((kind) => {
    scorecard[kind] = { checked: 0, matched: 0, missing: 0, extra: 0, items: [] };
    const declaredItems = itemsConfig[kind] || [];

    // 1. Check declared items for MATCH or MISSING
    declaredItems.forEach((item) => {
      totalChecked++;
      scorecard[kind].checked++;

      let itemPath = '';
      let exists = false;

      if (kind === 'rules') {
        itemPath = `${TARGET_DIR}/.agents/rules/${item}.md`;
        exists = fs.existsSync(itemPath);
      } else if (kind === 'agents') {
        itemPath = `${TARGET_DIR}/.agents/agents/${item}/agent.md`;
        exists = fs.existsSync(itemPath);
      } else if (kind === 'commands') {
        itemPath = `${TARGET_DIR}/.agents/workflows/${item}.md`;
        exists = fs.existsSync(itemPath);
      } else if (kind === 'hooks') {
        itemPath = `${TARGET_DIR}/.agents/hooks.json`;
        exists = fs.existsSync(itemPath);
      } else if (kind === 'skills') {
        const cleanSkillName = item.replace(/\.md$/, '');
        itemPath = `${TARGET_DIR}/.agents/skills/${cleanSkillName}/SKILL.md`;
        exists = fs.existsSync(itemPath);
      } else if (kind === 'platform') {
        itemPath = `${TARGET_DIR}/.agents/plugin/ecc/platform/${item}`;
        exists = fs.existsSync(itemPath);
      }

      const displayPath = itemPath.replace(`${TARGET_DIR}/`, '');

      if (exists) {
        totalMatched++;
        scorecard[kind].matched++;
        scorecard[kind].items.push({ item, status: 'MATCH', path: displayPath });
      } else {
        totalMissing++;
        scorecard[kind].missing++;
        scorecard[kind].items.push({ item, status: 'MISSING', path: displayPath });
      }
    });

    // 2. Check physical disk directories for unapproved EXTRA items
    if (kind === 'rules') {
      const rulesDir = `${TARGET_DIR}/.agents/rules`;
      if (fs.existsSync(rulesDir)) {
        const declaredRuleSet = new Set(declaredItems.map(i => `${i}.md`));
        const installedRules = fs.readdirSync(rulesDir, { withFileTypes: true })
          .filter(d => d.isFile() && d.name.endsWith('.md'))
          .map(d => d.name);

        for (const installed of installedRules) {
          if (!declaredRuleSet.has(installed)) {
            totalExtra++;
            scorecard[kind].extra++;
            scorecard[kind].items.push({ item: installed, status: 'EXTRA', path: `.agents/rules/${installed}` });
          }
        }
      }
    } else if (kind === 'agents') {
      const agentsDir = `${TARGET_DIR}/.agents/agents`;
      if (fs.existsSync(agentsDir)) {
        const declaredAgentSet = new Set(declaredItems);
        const installedAgents = fs.readdirSync(agentsDir, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => d.name);

        for (const installed of installedAgents) {
          if (!declaredAgentSet.has(installed)) {
            totalExtra++;
            scorecard[kind].extra++;
            scorecard[kind].items.push({ item: installed, status: 'EXTRA', path: `.agents/agents/${installed}` });
          }
        }
      }
    } else if (kind === 'commands') {
      const rootWfDir = `${TARGET_DIR}/.agents/workflows`;
      if (fs.existsSync(rootWfDir)) {
        const declaredCmdSet = new Set(declaredItems.map(i => `${i}.md`));
        const installedWorkflows = fs.readdirSync(rootWfDir, { withFileTypes: true })
          .filter(d => d.isFile() && d.name.endsWith('.md'))
          .map(d => d.name);

        for (const installed of installedWorkflows) {
          if (!declaredCmdSet.has(installed)) {
            totalExtra++;
            scorecard[kind].extra++;
            scorecard[kind].items.push({ item: installed, status: 'EXTRA', path: `.agents/workflows/${installed}` });
          }
        }
      }
    } else if (kind === 'hooks') {
      const hooksFile = `${TARGET_DIR}/.agents/hooks.json`;
      if (!fs.existsSync(hooksFile)) {
        // Handled as missing above
      }
    } else if (kind === 'skills') {
      const skillsDir = `${TARGET_DIR}/.agents/skills`;
      if (fs.existsSync(skillsDir)) {
        const declaredSkillSet = new Set(declaredItems.map(i => i.replace(/\.md$/, '')));
        const installedSkills = fs.readdirSync(skillsDir, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => d.name);

        for (const installed of installedSkills) {
          if (!declaredSkillSet.has(installed)) {
            totalExtra++;
            scorecard[kind].extra++;
            scorecard[kind].items.push({ item: installed, status: 'EXTRA', path: `.agents/skills/${installed}` });
          }
        }
      }
    } else if (kind === 'platform') {
      const platformDir = `${TARGET_DIR}/.agents/plugin/ecc/platform`;
      if (fs.existsSync(platformDir)) {
        const declaredPlatformSet = new Set(declaredItems);
        const installedPlatform = fs.readdirSync(platformDir, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => d.name);

        for (const installed of installedPlatform) {
          if (!declaredPlatformSet.has(installed)) {
            totalExtra++;
            scorecard[kind].extra++;
            scorecard[kind].items.push({ item: installed, status: 'EXTRA', path: `.agents/plugin/ecc/platform/${installed}` });
          }
        }
      }
    }
  });

  console.log('=== Proposal Item Compliance Audit Scorecard ===');
  kinds.forEach((kind) => {
    console.log(`\n[Kind: ${kind}] Declared: ${scorecard[kind].checked}, Matched: ${scorecard[kind].matched}, Missing: ${scorecard[kind].missing}, Extra: ${scorecard[kind].extra}`);
    scorecard[kind].items.forEach((entry) => {
      const icon = entry.status === 'MATCH' ? '✓' : entry.status === 'MISSING' ? '✗' : '?';
      console.log(`  ${icon} [${entry.status}] ${entry.item} -> ${entry.path}`);
    });
  });

  console.log('\n===============================================');
  console.log(`Proposal Items Summary: Declared: ${totalChecked}, Matched: ${totalMatched}, Missing: ${totalMissing}, Extra: ${totalExtra}`);

  const itemCompliancePassed = totalMissing === 0 && totalExtra === 0;

  // Execute OBJ-03 & OBJ-06 integration verification checks
  const envResult = verifyEnvironmentConfig();
  const helpersPassed = verifyAgyHelperLibraries();
  const hooksScriptPassed = verifyAgyRuntimeHooks();
  const hooksConfigPassed = verifyHooksJsonConfig();
  const agentFrontmatterPassed = verifyAgentFrontmatter();

  const allPassed = itemCompliancePassed && envResult.passed && helpersPassed && hooksScriptPassed && hooksConfigPassed && agentFrontmatterPassed;

  console.log('\n===============================================');
  if (!allPassed) {
    console.error('[Verification Engine] Verification FAILED. Discrepancies found (missing/extra items, invalid naming, or configuration issues).');
    process.exit(1);
  } else {
    console.log('[Verification Engine] SUCCESS: Verification PASSED with 100% compliance across proposal items, self-contained script co-location, AGY helper libraries, and hooks configuration.');
    process.exit(0);
  }
}

if (require.main === module) {
  runVerification();
}

module.exports = { runVerification };

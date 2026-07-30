/**
 * Proposal Item & Runtime Integration Compliance Verification Script (Antigravity agy-os)
 * 
 * Verifies physical disk installation against docs/OBJ-01/artifacts/ecc-items.json
 * across all 6 item kinds: rules, agents, commands, hooks, skills, platform.
 * 
 * Also verifies OBJ-03 ECC Script Integration requirements:
 * 1. Environment variable CLAUDE_PLUGIN_ROOT resolution and in-place ECC target validation.
 * 2. In-place isolation check (no physical copying of upstream ECC scripts into .agents/hooks/).
 * 3. AGY-native helper libraries in .agents/hooks/scripts/lib/ (*-agy.js naming compliance).
 * 4. AGY-native runtime hook scripts in .agents/hooks/scripts/ (*-agy.js naming compliance).
 * 5. Lifecycle hooks configuration (.agents/hooks.json):
 *    - Presence of pre:agy-guardrail (pinned at PreToolUse index 0)
 *    - Presence of post:agy-observation-envelope (registered in PostToolUse)
 *    - Exclusion of platform-incompatible stop:desktop-notify
 *    - CLAUDE_PLUGIN_ROOT dynamic resolution in hook command entries
 * 
 * Enforces Fail-Fast validation (exit code 1 on any missing or extra item/discrepancy, exit code 0 on 100% match).
 * 
 * Usage: node harness/agy-script/scripts/verify-installation-agy.js
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');
const ECC_ITEMS_FILE = `${REPO_ROOT}/docs/OBJ-01/artifacts/ecc-items.json`;

function loadEnvVars() {
  const envPaths = [`${REPO_ROOT}/.env`, `${REPO_ROOT}/harness/.env`].map(p => path.normalize(p).replace(/\\/g, '/'));
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const idx = trimmed.indexOf('=');
            const key = trimmed.substring(0, idx).trim();
            const val = trimmed.substring(idx + 1).trim();
            if (key && !process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch (e) {
        // ignore parse errors
      }
    }
  }
}

function verifyEnvironmentConfig() {
  console.log('\n--- Environment & CLAUDE_PLUGIN_ROOT Verification ---');
  loadEnvVars();

  let pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
  if (!pluginRoot || !pluginRoot.trim()) {
    console.error('  ✗ [MISSING] CLAUDE_PLUGIN_ROOT environment variable is UNSET.');
    console.error('    Resolution hint: Copy harness/.env.example to .env and set CLAUDE_PLUGIN_ROOT=d:/dev/agy-os/ECC per AGENTS.md §11.');
    return { passed: false, pluginRoot: null };
  }

  pluginRoot = path.resolve(pluginRoot.trim()).replace(/\\/g, '/');

  if (!fs.existsSync(pluginRoot)) {
    console.error(`  ✗ [INVALID] CLAUDE_PLUGIN_ROOT path does not exist on disk: ${pluginRoot}`);
    return { passed: false, pluginRoot };
  }

  // Verify in-place targets inside CLAUDE_PLUGIN_ROOT
  const requiredTargets = [
    { path: `${pluginRoot}/scripts/hooks`, isDir: true, desc: 'ECC hook scripts directory' },
    { path: `${pluginRoot}/scripts/lib/utils.js`, isDir: false, desc: 'Upstream ECC shared library utils.js' },
    { path: `${pluginRoot}/scripts/lib/hook-flags.js`, isDir: false, desc: 'Upstream ECC shared library hook-flags.js' },
    { path: `${pluginRoot}/scripts/lib/state-store`, isDir: true, desc: 'Upstream ECC state store directory' }
  ];

  let targetsValid = true;
  for (const t of requiredTargets) {
    if (!fs.existsSync(t.path)) {
      console.error(`  ✗ [MISSING] Target missing in CLAUDE_PLUGIN_ROOT (${t.desc}): ${t.path}`);
      targetsValid = false;
    } else {
      const stat = fs.statSync(t.path);
      if (t.isDir && !stat.isDirectory()) {
        console.error(`  ✗ [INVALID] Expected directory in CLAUDE_PLUGIN_ROOT (${t.desc}): ${t.path}`);
        targetsValid = false;
      } else if (!t.isDir && !stat.isFile()) {
        console.error(`  ✗ [INVALID] Expected file in CLAUDE_PLUGIN_ROOT (${t.desc}): ${t.path}`);
        targetsValid = false;
      }
    }
  }

  // Verification: Zero mirroring of upstream ECC libraries into .agents/hooks/ or .agents/hooks/lib/
  const mirroredFilesCheck = [
    `${REPO_ROOT}/.agents/hooks/lib/utils.js`,
    `${REPO_ROOT}/.agents/hooks/lib/hook-flags.js`,
    `${REPO_ROOT}/.agents/hooks/lib/state-store`,
    `${REPO_ROOT}/.agents/hooks/plugin-hook-bootstrap.js`
  ];

  for (const mf of mirroredFilesCheck) {
    if (fs.existsSync(mf)) {
      console.error(`  ✗ [VIOLATION] Found mirrored upstream ECC file in harness directory: ${mf.replace(`${REPO_ROOT}/`, '')}`);
      console.error('    Upstream ECC scripts MUST NOT be mirrored into .agents/hooks/. Reference in-place via CLAUDE_PLUGIN_ROOT (AGENTS.md §11).');
      targetsValid = false;
    }
  }

  if (targetsValid) {
    console.log(`  ✓ [MATCH] CLAUDE_PLUGIN_ROOT valid at ${pluginRoot} with zero upstream script mirroring.`);
  }

  return { passed: targetsValid, pluginRoot };
}

function verifyAgyHelperLibraries() {
  console.log('\n--- AGY-Native Helper Libraries Verification (.agents/hooks/scripts/lib/) ---');
  const libDir = `${REPO_ROOT}/.agents/hooks/scripts/lib`;

  if (!fs.existsSync(libDir)) {
    console.error(`  ✗ [MISSING] Helper library directory does not exist: .agents/hooks/scripts/lib`);
    return false;
  }

  const requiredHelpers = ['command-inspector-agy.js', 'path-validator-agy.js'];
  let valid = true;

  for (const helper of requiredHelpers) {
    const helperPath = `${libDir}/${helper}`;
    if (fs.existsSync(helperPath)) {
      console.log(`  ✓ [MATCH] Required helper library -> .agents/hooks/scripts/lib/${helper}`);
    } else {
      console.error(`  ✗ [MISSING] Required helper library missing -> .agents/hooks/scripts/lib/${helper}`);
      valid = false;
    }
  }

  // Enforce naming convention: all JS files in .agents/hooks/scripts/lib MUST end with '-agy.js' (AGENTS.md §11)
  const files = fs.readdirSync(libDir, { withFileTypes: true });
  for (const f of files) {
    if (f.isFile() && f.name.endsWith('.js')) {
      if (!f.name.endsWith('-agy.js')) {
        console.error(`  ✗ [VIOLATION] Helper library file '${f.name}' violates naming standard (must end with '-agy.js' per AGENTS.md §11).`);
        valid = false;
      }
    }
  }

  return valid;
}

function verifyAgyRuntimeHooks() {
  console.log('\n--- AGY-Native Runtime Hooks Verification (.agents/hooks/scripts/) ---');
  const scriptsDir = `${REPO_ROOT}/.agents/hooks/scripts`;

  if (!fs.existsSync(scriptsDir)) {
    console.error(`  ✗ [MISSING] Runtime hooks directory does not exist: .agents/hooks/scripts`);
    return false;
  }

  const requiredHooks = ['pre-tool-guardrail-agy.js', 'observation-envelope-agy.js'];
  let valid = true;

  for (const hookScript of requiredHooks) {
    const hookPath = `${scriptsDir}/${hookScript}`;
    if (fs.existsSync(hookPath)) {
      console.log(`  ✓ [MATCH] Required runtime hook script -> .agents/hooks/scripts/${hookScript}`);
    } else {
      console.error(`  ✗ [MISSING] Required runtime hook script missing -> .agents/hooks/scripts/${hookScript}`);
      valid = false;
    }
  }

  // Enforce naming convention: all JS files in .agents/hooks/scripts MUST end with '-agy.js' (AGENTS.md §11)
  const entries = fs.readdirSync(scriptsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.js')) {
      if (!entry.name.endsWith('-agy.js')) {
        console.error(`  ✗ [VIOLATION] Runtime hook script '${entry.name}' violates naming standard (must end with '-agy.js' per AGENTS.md §11).`);
        valid = false;
      }
    }
  }

  return valid;
}

function verifyHooksJsonConfig() {
  console.log('\n--- Lifecycle Hooks Configuration Verification (.agents/hooks.json) ---');
  const hooksFile = `${REPO_ROOT}/.agents/hooks.json`;

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
    console.error('    Windows-incompatible desktop notification hooks MUST be excluded per OBJ-03 requirements.');
    valid = false;
  } else {
    console.log(`  ✓ [MATCH] Zero 'stop:desktop-notify' platform-incompatible hook entries found.`);
  }

  // 4. CLAUDE_PLUGIN_ROOT dynamic resolution check in hook command entries
  let foundResolutionPattern = false;
  for (const groupKey of Object.keys(hooksObj)) {
    const hookList = hooksObj[groupKey];
    if (Array.isArray(hookList)) {
      for (const entry of hookList) {
        if (Array.isArray(entry.hooks)) {
          for (const h of entry.hooks) {
            if (h.command && (h.command.includes('CLAUDE_PLUGIN_ROOT') || h.command.includes('resolve-ecc-root'))) {
              foundResolutionPattern = true;
              break;
            }
          }
        }
      }
    }
  }

  if (foundResolutionPattern) {
    console.log(`  ✓ [MATCH] Lifecycle hook commands dynamically resolve CLAUDE_PLUGIN_ROOT.`);
  } else {
    console.error(`  ✗ [MISSING] Lifecycle hook commands lack dynamic CLAUDE_PLUGIN_ROOT resolution pattern.`);
    valid = false;
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
        itemPath = `${REPO_ROOT}/.agents/rules/${item}.md`;
        exists = fs.existsSync(itemPath);
      } else if (kind === 'agents') {
        itemPath = `${REPO_ROOT}/.agents/plugin/ecc/agents/${item}/agent.md`;
        exists = fs.existsSync(itemPath);
      } else if (kind === 'commands') {
        itemPath = `${REPO_ROOT}/.agents/workflows/${item}.md`;
        exists = fs.existsSync(itemPath);
      } else if (kind === 'hooks') {
        itemPath = `${REPO_ROOT}/.agents/hooks.json`;
        exists = fs.existsSync(itemPath);
      } else if (kind === 'skills') {
        const cleanSkillName = item.replace(/\.md$/, '');
        itemPath = `${REPO_ROOT}/.agents/skills/${cleanSkillName}/SKILL.md`;
        exists = fs.existsSync(itemPath);
      } else if (kind === 'platform') {
        itemPath = `${REPO_ROOT}/.agents/plugin/ecc/platform/${item}`;
        exists = fs.existsSync(itemPath);
      }

      const displayPath = itemPath.replace(`${REPO_ROOT}/`, '');

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
      const rulesDir = `${REPO_ROOT}/.agents/rules`;
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
      const agentsDir = `${REPO_ROOT}/.agents/plugin/ecc/agents`;
      if (fs.existsSync(agentsDir)) {
        const declaredAgentSet = new Set(declaredItems);
        const installedAgents = fs.readdirSync(agentsDir, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => d.name);

        for (const installed of installedAgents) {
          if (!declaredAgentSet.has(installed)) {
            totalExtra++;
            scorecard[kind].extra++;
            scorecard[kind].items.push({ item: installed, status: 'EXTRA', path: `.agents/plugin/ecc/agents/${installed}` });
          }
        }
      }
    } else if (kind === 'commands') {
      const rootWfDir = `${REPO_ROOT}/.agents/workflows`;
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
      const hooksFile = `${REPO_ROOT}/.agents/hooks.json`;
      if (!fs.existsSync(hooksFile)) {
        // Handled as missing above
      }
    } else if (kind === 'skills') {
      const skillsDir = `${REPO_ROOT}/.agents/skills`;
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
      const platformDir = `${REPO_ROOT}/.agents/plugin/ecc/platform`;
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

  // Execute OBJ-03 integration verification checks
  const envResult = verifyEnvironmentConfig();
  const helpersPassed = verifyAgyHelperLibraries();
  const hooksScriptPassed = verifyAgyRuntimeHooks();
  const hooksConfigPassed = verifyHooksJsonConfig();

  const allPassed = itemCompliancePassed && envResult.passed && helpersPassed && hooksScriptPassed && hooksConfigPassed;

  console.log('\n===============================================');
  if (!allPassed) {
    console.error('[Verification Engine] Verification FAILED. Discrepancies found (missing/extra items, invalid naming, or configuration issues).');
    process.exit(1);
  } else {
    console.log('[Verification Engine] SUCCESS: Verification PASSED with 100% compliance across proposal items, environment resolution, AGY helper libraries, and hooks configuration.');
    process.exit(0);
  }
}

if (require.main === module) {
  runVerification();
}

module.exports = { runVerification };


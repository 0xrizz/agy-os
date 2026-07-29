/**
 * Proposal Item Compliance Verification Script (Antigravity agy-os)
 * 
 * Verifies physical disk installation against docs/OBJ-01/artifacts/ecc-items.json
 * across all 6 item kinds: rules, agents, commands, hooks, skills, platform.
 * Target Layout:
 * - rules     -> .agents/rules/<name>.md (flat file)
 * - agents    -> .agents/plugin/ecc/agents/<name>/agent.md (32 items)
 * - commands  -> .agents/workflows/<name>.md (91 items: base + bridge workflows)
 * - hooks     -> .agents/hooks.json (single file)
 * - skills    -> .agents/skills/<skill-name>/SKILL.md (45 items)
 * - platform  -> .agents/plugin/ecc/platform/<item>
 * 
 * Enforces Fail-Fast validation (exit code 1 on any missing or extra item, exit code 0 on 100% match).
 * 
 * Usage: node harness/agy-script/scripts/verify-installation-agy.js
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');
const ECC_ITEMS_FILE = `${REPO_ROOT}/docs/OBJ-01/artifacts/ecc-items.json`;

function runVerification() {
  console.log('[Verification Engine] Starting proposal item compliance verification against ecc-items.json...');

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
  console.log(`Audit Summary: Declared: ${totalChecked}, Matched: ${totalMatched}, Missing: ${totalMissing}, Extra: ${totalExtra}`);

  if (totalMissing > 0 || totalExtra > 0) {
    console.error('\n[Verification Engine] Verification FAILED. Discrepancies found (missing or extra items).');
    process.exit(1);
  } else {
    console.log('\n[Verification Engine] SUCCESS: Verification PASSED with 100% physical item compliance across all 6 kinds.');
    process.exit(0);
  }
}

if (require.main === module) {
  runVerification();
}

module.exports = { runVerification };

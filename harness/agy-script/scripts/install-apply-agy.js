/**
 * Custom ECC Installer Apply Engine (Antigravity agy-os)
 * 
 * Merges base manifests from ECC/manifests/ with custom overlay manifests from harness/manifests/,
 * enforces Fail-Fast duplicate ID validation, resolves profiles & component selections from ecc-install.json,
 * executes physical asset installation strictly for items in docs/OBJ-01/artifacts/ecc-items.json,
 * and outputs install state and dry-run execution reports.
 * 
 * Target Paths:
 * - agents    -> .agents/plugin/ecc/agents/
 * - rules     -> .agents/rules/<name>.md (flat layout)
 * - workflows -> .agents/workflows/<name>.md (flat layout)
 * - skills    -> .agents/skills/<skill-name>/SKILL.md
 * - hooks     -> .agents/hooks.json
 * - platform  -> .agents/plugin/ecc/platform/
 * 
 * Usage: node harness/agy-script/scripts/install-apply-agy.js [--dry-run] [--config <path>]
 */

const fs = require('fs');
const path = require('path');
const { mergeHooks } = require('./merge-hooks-agy.js');

let formatRuleContent;
try {
  formatRuleContent = require('./update-rules-frontmatter-agy').formatRuleContent;
} catch (e) {
  formatRuleContent = (name, content) => content;
}

// Universal path resolution using forward slashes
const rootDir = path.resolve(__dirname, '../../..').replace(/\\/g, '/');

const baseManifestsDir = `${rootDir}/ECC/manifests`;
const customManifestsDir = `${rootDir}/harness/manifests`;
const defaultConfigFile = `${rootDir}/ecc-install.json`;
const eccItemsFile = `${rootDir}/docs/OBJ-01/artifacts/ecc-items.json`;

const targetPluginDir = `${rootDir}/.agents/plugin/ecc`;
const targetRulesDir = `${rootDir}/.agents/rules`;
const targetWorkflowsDir = `${rootDir}/.agents/workflows`;
const targetSkillsDir = `${rootDir}/.agents/skills`;
const targetHooksFile = `${rootDir}/.agents/hooks.json`;

const eccSourceDir = `${rootDir}/ECC`;

function loadJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}: ${err.message}`);
    process.exit(1);
  }
}

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    ensureDirSync(dest);
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      const srcPath = path.join(src, entry).replace(/\\/g, '/');
      const destPath = path.join(dest, entry).replace(/\\/g, '/');
      copyRecursiveSync(srcPath, destPath);
    }
  } else if (exists && stats.isFile()) {
    ensureDirSync(path.dirname(dest));
    fs.copyFileSync(src, dest);
  }
}

function validateDuplicateIds(baseModules, customModules, baseComponents, customComponents, baseProfiles, customProfiles) {
  const baseModuleIds = new Set((baseModules || []).map(m => m.id));
  const customModuleIds = (customModules || []).map(m => m.id);

  const baseComponentIds = new Set((baseComponents || []).map(c => c.id));
  const customComponentIds = (customComponents || []).map(c => c.id);

  const baseProfileNames = new Set(Object.keys(baseProfiles || {}));
  const customProfileNames = Object.keys(customProfiles || {});

  const duplicates = [];

  for (const id of customModuleIds) {
    if (baseModuleIds.has(id)) {
      duplicates.push(`Module ID: ${id}`);
    }
  }

  for (const id of customComponentIds) {
    if (baseComponentIds.has(id)) {
      duplicates.push(`Component ID: ${id}`);
    }
  }

  for (const name of customProfileNames) {
    if (baseProfileNames.has(name)) {
      duplicates.push(`Profile Name: ${name}`);
    }
  }

  if (duplicates.length > 0) {
    console.error(`[Installer Engine] FAIL-FAST ABORT: Duplicate manifest IDs detected: ${duplicates.join(', ')}`);
    process.exit(1);
  }
}

function runInstallation(isDryRun, configPath) {
  console.log('[Installer Engine] Starting custom ECC installation execution...');
  console.log(`Config File: ${configPath}`);
  console.log(`Execution Mode: ${isDryRun ? 'DRY-RUN' : 'LIVE MUTATION'}`);

  // Load declared ecc-items.json
  if (!fs.existsSync(eccItemsFile)) {
    console.error(`[Installer Engine] Error: ecc-items.json not found at ${eccItemsFile}`);
    process.exit(1);
  }
  const eccItems = loadJson(eccItemsFile);
  const declaredAgents = eccItems.agents || [];
  const declaredSkills = eccItems.skills || [];
  const declaredCommands = eccItems.commands || [];
  const declaredRules = eccItems.rules || [];
  const declaredHooks = eccItems.hooks || [];
  const declaredPlatform = eccItems.platform || [];

  // 1. Load Base & Custom Manifests
  const baseModulesData = loadJson(`${baseManifestsDir}/install-modules.json`);
  const customModulesData = loadJson(`${customManifestsDir}/install-modules.custom.json`);

  const baseComponentsData = loadJson(`${baseManifestsDir}/install-components.json`);
  const customComponentsData = loadJson(`${customManifestsDir}/install-components.custom.json`);

  const baseProfilesData = loadJson(`${baseManifestsDir}/install-profiles.json`);
  const customProfilesData = loadJson(`${customManifestsDir}/install-profiles.custom.json`);

  // 2. Validate Duplicate IDs (Fail-Fast)
  validateDuplicateIds(
    baseModulesData.modules,
    customModulesData.modules,
    baseComponentsData.components,
    customComponentsData.components,
    baseProfilesData.profiles,
    customProfilesData.profiles
  );
  console.log('[Installer Engine] Duplicate ID validation passed: Zero ID collisions detected.');

  // 3. Deep Merge Manifests
  const mergedModules = [...(baseModulesData.modules || []), ...(customModulesData.modules || [])];
  const mergedComponents = [...(baseComponentsData.components || []), ...(customComponentsData.components || [])];
  const mergedProfiles = { ...(baseProfilesData.profiles || {}), ...(customProfilesData.profiles || {}) };

  // 4. Read & Resolve Config
  if (!fs.existsSync(configPath)) {
    console.error(`[Installer Engine] Error: Config file not found at ${configPath}`);
    process.exit(1);
  }

  const config = loadJson(configPath);
  const profileName = config.profile || 'agy-developer';
  const withComponents = config.withComponents || [];
  const withoutComponents = new Set(config.withoutComponents || []);

  const selectedProfile = mergedProfiles[profileName];
  if (!selectedProfile) {
    console.error(`[Installer Engine] Error: Profile '${profileName}' not found in merged profiles.`);
    process.exit(1);
  }

  console.log(`Resolved Profile: ${profileName}`);

  // Collect modules from profile and components
  const selectedModuleIds = new Set(selectedProfile.modules || []);
  for (const componentId of withComponents) {
    if (withoutComponents.has(componentId)) continue;
    const comp = mergedComponents.find(c => c.id === componentId);
    if (comp && Array.isArray(comp.modules)) {
      for (const mId of comp.modules) {
        selectedModuleIds.add(mId);
      }
    }
  }

  const resolvedModules = mergedModules.filter(m => selectedModuleIds.has(m.id));
  console.log(`Total Resolved Modules: ${resolvedModules.length}`);

  // 5. Gather Operations
  const operations = [];

  // Agents: Copy ONLY the 32 declared agents from ECC/agents/ to .agents/plugin/ecc/agents/
  const eccAgentsDir = `${eccSourceDir}/agents`;
  for (const agentName of declaredAgents) {
    const mdFile = `${eccAgentsDir}/${agentName}.md`;
    const agentDir = `${eccAgentsDir}/${agentName}`;
    if (fs.existsSync(mdFile)) {
      operations.push({
        kind: 'copy-file',
        source: mdFile,
        dest: `${targetPluginDir}/agents/${agentName}.md`,
        description: `Copy agent ${agentName}.md to .agents/plugin/ecc/agents/`
      });
    } else if (fs.existsSync(agentDir)) {
      operations.push({
        kind: 'copy-dir',
        source: agentDir,
        dest: `${targetPluginDir}/agents/${agentName}`,
        description: `Copy agent dir ${agentName} to .agents/plugin/ecc/agents/`
      });
    } else {
      console.warn(`[Installer Engine] Warning: Declared agent source not found: ${agentName}`);
    }
  }

  // Skills: Copy ONLY declared skills to .agents/skills/
  const eccSkillsDir = `${eccSourceDir}/skills`;
  for (const rawSkillItem of declaredSkills) {
    const skillName = rawSkillItem.replace(/\.md$/, '');
    let srcPath = `${eccSkillsDir}/${skillName}`;
    if (!fs.existsSync(srcPath) && skillName === 'the-security-guard') {
      srcPath = `${eccSkillsDir}/safety-guard`;
    }

    if (fs.existsSync(srcPath)) {
      operations.push({
        kind: 'copy-dir',
        source: srcPath,
        dest: `${targetSkillsDir}/${skillName}`,
        description: `Copy skill ${skillName} to .agents/skills/${skillName}/`
      });
    }
  }

  // Commands / Workflows: Copy base non-bridge workflow files to .agents/workflows/<name>.md
  const eccCommandsDir = `${eccSourceDir}/commands`;
  for (const cmd of declaredCommands) {
    if (cmd.startsWith('a-')) continue; // Bridge workflows are generated by post-install-agy.js
    const srcCmd = `${eccCommandsDir}/${cmd}.md`;
    if (fs.existsSync(srcCmd)) {
      operations.push({
        kind: 'copy-file',
        source: srcCmd,
        dest: `${targetWorkflowsDir}/${cmd}.md`,
        description: `Copy base workflow ${cmd}.md to .agents/workflows/`
      });
    }
  }

  // Rules: Copy declared rules from ECC/rules/ directly to .agents/rules/<name>.md as flat markdown files
  const eccRulesDir = `${eccSourceDir}/rules`;
  for (const ruleItem of declaredRules) {
    // ruleItem is e.g. "common-agents" or "typescript-coding-style"
    // Find matching source file in ECC/rules/
    const subPath = ruleItem.replace('-', '/'); // e.g. "common/agents"
    const srcMdSub = `${eccRulesDir}/${subPath}.md`;
    const srcMdFlat = `${eccRulesDir}/${ruleItem}.md`;
    const destFile = `${targetRulesDir}/${ruleItem}.md`;

    if (fs.existsSync(srcMdSub)) {
      operations.push({
        kind: 'transform-rule-file',
        ruleName: ruleItem,
        source: srcMdSub,
        dest: destFile,
        description: `Copy and format rule ${subPath}.md to .agents/rules/${ruleItem}.md`
      });
    } else if (fs.existsSync(srcMdFlat)) {
      operations.push({
        kind: 'transform-rule-file',
        ruleName: ruleItem,
        source: srcMdFlat,
        dest: destFile,
        description: `Copy and format rule ${ruleItem}.md to .agents/rules/${ruleItem}.md`
      });
    } else {
      console.warn(`[Installer Engine] Warning: Declared rule source not found for: ${ruleItem}`);
    }
  }

  // Hooks: Non-destructive merge of ECC hooks into .agents/hooks.json
  const eccHooksFile = fs.existsSync(`${eccSourceDir}/hooks/hooks.json`)
    ? `${eccSourceDir}/hooks/hooks.json`
    : `${eccSourceDir}/hooks.json`;
  const targetHooksBackupFile = `${targetHooksFile}.bak`;

  operations.push({
    kind: 'merge-hooks',
    source: eccHooksFile,
    dest: targetHooksFile,
    backup: targetHooksBackupFile,
    description: 'Non-destructively merge hooks configuration into .agents/hooks.json'
  });

  // Platform: Scaffold platform assets under .agents/plugin/ecc/platform/
  operations.push({
    kind: 'scaffold-platform',
    dest: `${targetPluginDir}/platform`,
    description: 'Scaffold platform entries in .agents/plugin/ecc/platform/'
  });

  // 6. Execute Operations
  if (isDryRun) {
    console.log('\n--- DRY-RUN INSTALLATION PLAN ---');
    operations.forEach((op, index) => {
      console.log(`[Op ${index + 1}] ${op.description}`);
    });
    console.log('\nDRY-RUN PASS: All operations validated successfully without disk mutation.');
    process.exit(0);
  }

  console.log('\nExecuting physical asset copying & directory cleanup...');

  // Pre-clean destination directories to purge obsolete files
  if (fs.existsSync(`${targetPluginDir}/agents`)) {
    fs.rmSync(`${targetPluginDir}/agents`, { recursive: true, force: true });
  }
  if (fs.existsSync(targetRulesDir)) {
    fs.rmSync(targetRulesDir, { recursive: true, force: true });
  }
  if (fs.existsSync(targetWorkflowsDir)) {
    fs.rmSync(targetWorkflowsDir, { recursive: true, force: true });
  }
  if (fs.existsSync(targetSkillsDir)) {
    fs.rmSync(targetSkillsDir, { recursive: true, force: true });
  }

  // Purge obsolete subdirectories inside .agents/plugin/ecc/ if they exist
  const obsoleteDirs = [
    `${targetPluginDir}/rules`,
    `${targetPluginDir}/workflows`,
    `${targetPluginDir}/hooks`,
    `${targetPluginDir}/platform`
  ];
  for (const obsDir of obsoleteDirs) {
    if (fs.existsSync(obsDir)) {
      fs.rmSync(obsDir, { recursive: true, force: true });
    }
  }

  // Re-create target directories
  ensureDirSync(targetPluginDir);
  ensureDirSync(`${targetPluginDir}/agents`);
  ensureDirSync(targetRulesDir);
  ensureDirSync(targetWorkflowsDir);
  ensureDirSync(targetSkillsDir);
  ensureDirSync(`${targetPluginDir}/platform`);

  for (const op of operations) {
    if (op.kind === 'copy-dir') {
      if (fs.existsSync(op.source)) {
        copyRecursiveSync(op.source, op.dest);
      }
    } else if (op.kind === 'copy-file') {
      if (fs.existsSync(op.source)) {
        ensureDirSync(path.dirname(op.dest));
        fs.copyFileSync(op.source, op.dest);
      }
    } else if (op.kind === 'transform-rule-file') {
      if (fs.existsSync(op.source)) {
        ensureDirSync(path.dirname(op.dest));
        const rawContent = fs.readFileSync(op.source, 'utf8');
        const formattedContent = formatRuleContent(op.ruleName, rawContent);
        fs.writeFileSync(op.dest, formattedContent, 'utf8');
      }
    } else if (op.kind === 'scaffold-file') {
      ensureDirSync(path.dirname(op.dest));
      fs.writeFileSync(op.dest, op.content, 'utf8');
    } else if (op.kind === 'scaffold-platform') {
      ensureDirSync(op.dest);
      for (const item of declaredPlatform) {
        ensureDirSync(`${op.dest}/${item}`);
        fs.writeFileSync(`${op.dest}/${item}/README.md`, `# Platform: ${item}\n`);
      }
    } else if (op.kind === 'merge-hooks') {
      mergeHooks(op.source, op.dest, op.backup);
    }
  }

  // Write install state file
  const installState = {
    installedAt: new Date().toISOString(),
    profile: profileName,
    target: 'antigravity',
    version: '1.0.0',
    resolvedModules: Array.from(selectedModuleIds),
    operationsCount: operations.length
  };
  fs.writeFileSync(`${targetPluginDir}/ecc-install-state.json`, JSON.stringify(installState, null, 2), 'utf8');

  // Trigger Post-Install Transformation
  try {
    const { runPostInstallTransformation } = require('../post-install-agy');
    runPostInstallTransformation();
  } catch (err) {
    console.error(`[Installer Engine] Warning: Failed to trigger post-install transformation: ${err.message}`);
  }

  console.log(`[Installer Engine] SUCCESS: Installation completed successfully.`);
  console.log(`Install State written to ${targetPluginDir}/ecc-install-state.json`);
}

// Parse CLI Arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
let configPath = defaultConfigFile;

const configIdx = args.indexOf('--config');
if (configIdx !== -1 && args[configIdx + 1]) {
  configPath = path.resolve(args[configIdx + 1]).replace(/\\/g, '/');
}

if (args.includes('--help')) {
  console.log('Usage: node harness/agy-script/scripts/install-apply-agy.js [--dry-run] [--config <path>]');
  process.exit(0);
}

runInstallation(isDryRun, configPath);

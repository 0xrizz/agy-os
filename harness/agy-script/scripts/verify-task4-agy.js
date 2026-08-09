const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');
const workflowsDir = `${REPO_ROOT}/.agents/workflows`;
const skillsDir = `${REPO_ROOT}/.agents/skills`;
const scriptsDir = `${REPO_ROOT}/.agents/scripts`;
const itemsJsonPath = `${REPO_ROOT}/docs/OBJ-06/artifacts/ecc-items.json`;

console.log('=== Task 4 Verification Step (Sub-task 4.6) ===\n');

let valid = true;

// 1. Assert ZERO a-*.md files in .agents/workflows/
const workflowFiles = fs.readdirSync(workflowsDir);
const bridgeFiles = workflowFiles.filter(f => f.startsWith('a-') && f.endsWith('.md'));

if (bridgeFiles.length === 0) {
  console.log('✓ [PASS] Zero a-*.md bridge workflows found in .agents/workflows/');
} else {
  console.error(`✗ [FAIL] Found ${bridgeFiles.length} unexpected bridge workflows: ${bridgeFiles.join(', ')}`);
  valid = false;
}

// 2. Count remaining workflow files and confirm exactly 32 commands
const itemsJson = JSON.parse(fs.readFileSync(itemsJsonPath, 'utf8'));
const deletedCommands = new Set(['ecc-guide']);
const expectedCommands = new Set(itemsJson.commands.filter(c => !deletedCommands.has(c)));

const currentWorkflowNames = workflowFiles
  .filter(f => f.endsWith('.md'))
  .map(f => f.replace(/\.md$/, ''));

console.log(`Current workflow commands: ${currentWorkflowNames.length} (Expected: ${expectedCommands.size})`);

const missingWorkflows = [...expectedCommands].filter(c => !currentWorkflowNames.includes(c));
const extraWorkflows = currentWorkflowNames.filter(c => !expectedCommands.has(c));

if (missingWorkflows.length === 0 && extraWorkflows.length === 0 && currentWorkflowNames.length === 32) {
  console.log(`✓ [PASS] Exactly 32 workflow commands match active ecc-items.json commands 100%`);
} else {
  console.error(`✗ [FAIL] Workflow mismatch! Missing: [${missingWorkflows.join(', ')}], Extra: [${extraWorkflows.join(', ')}]`);
  valid = false;
}

// 3. Count remaining skill directories and compare against ecc-items.json "skills"
const expectedSkills = new Set(itemsJson.skills);
const currentSkillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

console.log(`Current skill directories: ${currentSkillDirs.length} (Expected: ${expectedSkills.size})`);

const missingSkills = [...expectedSkills].filter(s => !currentSkillDirs.includes(s));
const extraSkills = currentSkillDirs.filter(s => !expectedSkills.has(s));

if (missingSkills.length === 0 && extraSkills.length === 0 && currentSkillDirs.length === 42) {
  console.log(`✓ [PASS] Exactly 42 skill directories match ecc-items.json "skills" 100%`);
} else {
  console.error(`✗ [FAIL] Skill mismatch! Missing: [${missingSkills.join(', ')}], Extra: [${extraSkills.join(', ')}]`);
  valid = false;
}

// 4. Confirm pre-tool-guardrail-agy.js and observation-envelope-agy.js are intact
const requiredScripts = ['pre-tool-guardrail-agy.js', 'observation-envelope-agy.js'];
for (const scriptName of requiredScripts) {
  const scriptPath = `${scriptsDir}/${scriptName}`;
  if (fs.existsSync(scriptPath)) {
    console.log(`✓ [PASS] Runtime script intact: ${scriptName}`);
  } else {
    console.error(`✗ [FAIL] Required runtime script missing: ${scriptPath}`);
    valid = false;
  }
}

console.log('\n-----------------------------------------------');
if (valid) {
  console.log('✓ [VERIFICATION PASSED] Task 4 complete and 100% verified!');
  process.exit(0);
} else {
  console.error('✗ [VERIFICATION FAILED] Task 4 discrepancies detected!');
  process.exit(1);
}

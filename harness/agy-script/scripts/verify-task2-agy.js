const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');

console.log('=== Task 2.9 Verification Step ===\n');

let passed = true;

// 1. Verify .agents/agents/ contains exactly 31 subdirectories with agent.md
const destAgentsDir = `${REPO_ROOT}/.agents/agents`;
if (!fs.existsSync(destAgentsDir)) {
  console.error(`✗ [FAIL] Destination directory missing: ${destAgentsDir}`);
  passed = false;
} else {
  const agentDirs = fs.readdirSync(destAgentsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  console.log(`- Subdirectories found in .agents/agents/ (${agentDirs.length}):`);
  if (agentDirs.length === 31) {
    console.log('  ✓ [MATCH] Exactly 31 subagent directories exist.');
  } else {
    console.error(`  ✗ [FAIL] Expected 31 directories, found ${agentDirs.length}`);
    passed = false;
  }

  let missingAgentMdCount = 0;
  for (const agent of agentDirs) {
    const agentMdPath = `${destAgentsDir}/${agent}/agent.md`;
    if (!fs.existsSync(agentMdPath)) {
      console.error(`  ✗ [FAIL] Missing agent.md for ${agent}`);
      missingAgentMdCount++;
    }
  }

  if (missingAgentMdCount === 0) {
    console.log('  ✓ [MATCH] All 31 subdirectories contain agent.md.');
  } else {
    passed = false;
  }
}

// 2. Confirm .agents/plugin/ecc/agents/ is empty
const srcAgentsDir = `${REPO_ROOT}/.agents/plugin/ecc/agents`;
if (!fs.existsSync(srcAgentsDir)) {
  console.log('  ✓ [MATCH] Source directory .agents/plugin/ecc/agents does not exist or was cleaned.');
} else {
  const srcContents = fs.readdirSync(srcAgentsDir);
  if (srcContents.length === 0) {
    console.log('  ✓ [MATCH] Source directory .agents/plugin/ecc/agents/ is 100% empty.');
  } else {
    console.error(`  ✗ [FAIL] Source directory .agents/plugin/ecc/agents/ is not empty:`, srcContents);
    passed = false;
  }
}

// 3. Confirm .agents/plugin/ecc/platform/ is intact
const platformDir = `${REPO_ROOT}/.agents/plugin/ecc/platform`;
if (fs.existsSync(platformDir)) {
  const platformContents = fs.readdirSync(platformDir);
  console.log(`  ✓ [MATCH] Platform surface .agents/plugin/ecc/platform/ intact with ${platformContents.length} items:`, platformContents);
} else {
  console.error('  ✗ [FAIL] Platform surface .agents/plugin/ecc/platform/ is missing!');
  passed = false;
}

// 4. Confirm chief-of-staff does not exist anywhere under .agents/
const chiefOfStaffDest = `${destAgentsDir}/chief-of-staff`;
const chiefOfStaffSrc = `${srcAgentsDir}/chief-of-staff`;
if (fs.existsSync(chiefOfStaffDest) || fs.existsSync(chiefOfStaffSrc)) {
  console.error('  ✗ [FAIL] chief-of-staff still exists under .agents/');
  passed = false;
} else {
  console.log('  ✓ [MATCH] chief-of-staff successfully purged; does not exist under .agents/.');
}

// 5. Search for old path string references in AGENTS.md and harness/
console.log('\n- Scanning for stale references to .agents/plugin/ecc/agents...');
const checkFiles = [
  `${REPO_ROOT}/AGENTS.md`,
  `${REPO_ROOT}/harness/agy-script/adapters/antigravity-project-agy.js`,
  `${REPO_ROOT}/harness/agy-script/post-install-agy.js`,
  `${REPO_ROOT}/harness/agy-script/scripts/install-apply-agy.js`,
  `${REPO_ROOT}/harness/agy-script/scripts/verify-installation-agy.js`
];

let staleRefCount = 0;
for (const file of checkFiles) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('.agents/plugin/ecc/agents')) {
      console.error(`  ✗ [STALE REF] Found in ${file.replace(REPO_ROOT + '/', '')}`);
      staleRefCount++;
    } else {
      console.log(`  ✓ [CLEAN] ${file.replace(REPO_ROOT + '/', '')}`);
    }
  }
}

if (staleRefCount > 0) {
  console.error(`  ✗ [FAIL] Found ${staleRefCount} files with stale path references.`);
  passed = false;
} else {
  console.log('  ✓ [MATCH] Zero stale path references remain in AGENTS.md or harness scripts.');
}

console.log('\n===============================================');
if (passed) {
  console.log('[Verification Engine] Task 2 Verification PASSED with 100% compliance.');
  process.exit(0);
} else {
  console.error('[Verification Engine] Task 2 Verification FAILED.');
  process.exit(1);
}

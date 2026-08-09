const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');

const srcAgentsDir = `${REPO_ROOT}/.agents/plugin/ecc/agents`;
const destAgentsDir = `${REPO_ROOT}/.agents/agents`;
const platformDir = `${REPO_ROOT}/.agents/plugin/ecc/platform`;

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

console.log('=== Task 2.1 - 2.4: Subagent Path Relocation ===\n');

if (!fs.existsSync(srcAgentsDir)) {
  console.error(`[Relocation Error] Source directory missing: ${srcAgentsDir}`);
  process.exit(1);
}

const entries = fs.readdirSync(srcAgentsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

console.log(`Source agents found on disk (${entries.length}):`, entries);

const retainedAgents = entries.filter(name => name !== 'chief-of-staff');
console.log(`Retained agents to copy (${retainedAgents.length}):`, retainedAgents);

if (entries.includes('chief-of-staff')) {
  console.log('Confirmed chief-of-staff is excluded from copy list.');
}

// 2.1 Copy retained agents to .agents/agents/
ensureDirSync(destAgentsDir);
for (const agent of retainedAgents) {
  const src = `${srcAgentsDir}/${agent}`;
  const dest = `${destAgentsDir}/${agent}`;
  copyRecursiveSync(src, dest);
  console.log(`✓ Copied ${agent} -> .agents/agents/${agent}`);
}

// 2.2 Verify destination copy completeness before cleaning source
console.log('\n--- Verifying Destination .agents/agents/ ---');
const destEntries = fs.readdirSync(destAgentsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

console.log(`Destination subdirectories count: ${destEntries.length}`);
if (destEntries.length !== 31) {
  console.error(`[Relocation Error] Expected 31 destination agent directories, found ${destEntries.length}`);
  process.exit(1);
}

let missingAgentMd = 0;
for (const agent of destEntries) {
  const agentMd = `${destAgentsDir}/${agent}/agent.md`;
  if (!fs.existsSync(agentMd)) {
    console.error(`✗ Missing agent.md for ${agent} at ${agentMd}`);
    missingAgentMd++;
  }
}

if (missingAgentMd > 0) {
  console.error(`[Relocation Error] ${missingAgentMd} agents missing agent.md`);
  process.exit(1);
}

console.log('✓ All 31 destination agents verified intact with agent.md');

// 2.3 Delete chief-of-staff
console.log('\n--- Cleaning Up Source & chief-of-staff ---');
const chiefOfStaffPath = `${srcAgentsDir}/chief-of-staff`;
if (fs.existsSync(chiefOfStaffPath)) {
  fs.rmSync(chiefOfStaffPath, { recursive: true, force: true });
  console.log('✓ Deleted chief-of-staff from source directory.');
}

// 2.4 Empty .agents/plugin/ecc/agents/ contents while preserving platform
const remainingSrc = fs.readdirSync(srcAgentsDir);
for (const item of remainingSrc) {
  const itemPath = `${srcAgentsDir}/${item}`;
  fs.rmSync(itemPath, { recursive: true, force: true });
  console.log(`✓ Cleaned source item: .agents/plugin/ecc/agents/${item}`);
}

const finalSrcContents = fs.readdirSync(srcAgentsDir);
console.log(`Source .agents/plugin/ecc/agents/ remaining items: ${finalSrcContents.length}`);
if (finalSrcContents.length !== 0) {
  console.error('[Relocation Error] Source directory is not empty!');
  process.exit(1);
}

// Verify platform directory is intact
if (!fs.existsSync(platformDir)) {
  console.error('[Relocation Error] Platform directory missing!');
  process.exit(1);
}
const platformItems = fs.readdirSync(platformDir);
console.log(`✓ Platform directory .agents/plugin/ecc/platform/ intact with ${platformItems.length} items:`, platformItems);

console.log('\n=== Task 2.1 - 2.4 Relocation & Cleanup Completed Successfully ===');

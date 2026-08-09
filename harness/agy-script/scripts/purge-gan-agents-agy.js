const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');
const agentsDir = `${REPO_ROOT}/.agents/agents`;

const ganAgents = ['gan-evaluator', 'gan-generator', 'gan-planner'];

console.log('=== Purging GAN Agents from .agents/agents/ ===\n');

for (const agentName of ganAgents) {
  const dirPath = `${agentsDir}/${agentName}`;
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✓ [PURGED AGENT] ${agentName} -> ${dirPath}`);
  } else {
    console.log(`  [ALREADY PURGED] ${agentName}`);
  }
}

const remainingDirs = fs.readdirSync(agentsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

console.log(`\nRemaining agent count under .agents/agents/: ${remainingDirs.length} (Expected: 28)`);

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');
const agentsDir = `${REPO_ROOT}/.agents/agents`;

const agentDirs = fs.readdirSync(agentsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

console.log('=== Detailed Frontmatter Audit Across All 31 Agents ===\n');

agentDirs.forEach(agentName => {
  const filePath = `${agentsDir}/${agentName}/agent.md`;
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---([\s\S]*?)---/);
  console.log(`=== [${agentName}] ===`);
  if (!match) {
    console.log('  NO FRONTMATTER');
  } else {
    console.log(match[1].trim());
  }
  console.log('\n----------------------------------------');
});

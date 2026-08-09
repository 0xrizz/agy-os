const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');
const agentsDir = `${REPO_ROOT}/.agents/agents`;

const subdirs = fs.readdirSync(agentsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

for (const dir of subdirs) {
  const file = `${agentsDir}/${dir}/agent.md`;
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const match = content.match(/^---([\s\S]*?)---/);
    console.log(`=== ${dir} ===`);
    console.log(match ? match[1].trim() : 'NO FRONTMATTER');
    console.log('');
  }
}

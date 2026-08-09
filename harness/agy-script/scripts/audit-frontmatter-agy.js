const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');
const agentsDir = `${REPO_ROOT}/.agents/agents`;

console.log('=== Task 3 Audit: Agent YAML Frontmatter Inspection (v2) ===\n');

if (!fs.existsSync(agentsDir)) {
  console.error(`✗ Agent directory missing: ${agentsDir}`);
  process.exit(1);
}

const subdirs = fs.readdirSync(agentsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

console.log(`Found ${subdirs.length} agent directories under .agents/agents/\n`);

let compliantCount = 0;
let failedCount = 0;

subdirs.forEach(agentName => {
  const filePath = `${agentsDir}/${agentName}/agent.md`;
  if (!fs.existsSync(filePath)) {
    console.error(`✗ [MISSING FILE] ${filePath}`);
    failedCount++;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    console.error(`✗ [NO FRONTMATTER] ${filePath}`);
    failedCount++;
    return;
  }

  const yamlBlock = match[1];
  const fields = {};
  yamlBlock.split('\n').forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join(':').trim();
      if (key && !key.startsWith('#')) {
        fields[key] = val;
      }
    }
  });

  const required = ['name', 'description', 'mainAgent', 'subagent', 'model', 'tools', 'mcpServers', 'skills'];
  const missing = required.filter(f => fields[f] === undefined);

  let valid = missing.length === 0;
  if (fields.model && !['inherit', 'flash', 'pro'].includes(fields.model)) {
    valid = false;
    missing.push(`invalid_model_tier:${fields.model}`);
  }

  if (valid) {
    console.log(`✓ [COMPLIANT] .agents/agents/${agentName}/agent.md (mainAgent: ${fields.mainAgent}, model: "${fields.model}")`);
    compliantCount++;
  } else {
    console.error(`✗ [NON-COMPLIANT] .agents/agents/${agentName}/agent.md — Issues: ${missing.join(', ')}`);
    failedCount++;
  }
});

console.log(`\n--- Summary ---`);
console.log(`Total agents inspected: ${subdirs.length}`);
console.log(`Fully compliant: ${compliantCount}`);
console.log(`Non-compliant: ${failedCount}`);

if (failedCount > 0) {
  process.exit(1);
}

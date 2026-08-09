const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');
const agentsDir = `${REPO_ROOT}/.agents/agents`;

console.log('=== Standardizing Subagent YAML Frontmatter for Antigravity Compliance ===\n');

const subdirs = fs.readdirSync(agentsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

let updatedCount = 0;

for (const agentName of subdirs) {
  const agentMdPath = `${agentsDir}/${agentName}/agent.md`;
  if (!fs.existsSync(agentMdPath)) {
    console.error(`✗ Missing agent.md for ${agentName}`);
    continue;
  }

  let content = fs.readFileSync(agentMdPath, 'utf8');
  let match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  let rawYaml = match ? match[1] : '';
  let bodyContent = match ? content.substring(match[0].length) : content;

  // Parse existing fields
  const lines = rawYaml.split('\n');
  const existingFields = {};
  const extraLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join(':').trim();
      existingFields[key] = val;
    }
  }

  const name = existingFields['name'] || agentName;
  const description = existingFields['description'] || `Subagent specialized in ${agentName}.`;
  const mainAgent = 'false';
  const subagent = 'true';
  const model = existingFields['model'] || 'inherit';
  const tools = existingFields['tools'] || null;

  // Build standardized frontmatter
  let newYaml = '---\n';
  newYaml += `name: ${name}\n`;
  newYaml += `description: ${description}\n`;
  newYaml += `mainAgent: ${mainAgent}\n`;
  newYaml += `subagent: ${subagent}\n`;
  newYaml += `model: ${model}\n`;
  if (tools) {
    newYaml += `tools: ${tools}\n`;
  }

  // Preserve any additional custom keys (like color)
  for (const key of Object.keys(existingFields)) {
    if (!['name', 'description', 'mainAgent', 'subagent', 'model', 'tools'].includes(key)) {
      newYaml += `${key}: ${existingFields[key]}\n`;
    }
  }

  newYaml += '---';

  const newContent = `${newYaml}${bodyContent}`;
  fs.writeFileSync(agentMdPath, newContent, 'utf8');
  console.log(`✓ [STANDARDIZED] .agents/agents/${agentName}/agent.md`);
  updatedCount++;
}

console.log(`\nSuccessfully standardized ${updatedCount} agent.md files with full Antigravity Subagents Spec (mainAgent: false, subagent: true).`);

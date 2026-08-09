const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');
const agentsDir = `${REPO_ROOT}/.agents/agents`;

console.log('=== Task 3 Revision: Setting mainAgent: true, subagent: true, model: flash across ALL agents ===\n');

const subdirs = fs.readdirSync(agentsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

let updatedCount = 0;

for (const agentName of subdirs) {
  const filePath = `${agentsDir}/${agentName}/agent.md`;
  if (!fs.existsSync(filePath)) continue;

  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const bodyContent = match ? content.substring(match[0].length) : content;

  // Extract raw key-values
  const existingFields = {};
  if (match) {
    const lines = match[1].split('\n');
    for (const line of lines) {
      const parts = line.trim().split(':');
      if (parts.length >= 2) {
        const k = parts[0].trim();
        const v = parts.slice(1).join(':').trim();
        if (k && !k.startsWith('#')) {
          existingFields[k] = v;
        }
      }
    }
  }

  // Parse tools array
  let toolsList = [];
  if (existingFields['tools']) {
    if (existingFields['tools'].includes(',')) {
      toolsList = existingFields['tools'].split(',').map(t => t.trim()).filter(Boolean);
    } else if (existingFields['tools'].startsWith('[')) {
      toolsList = JSON.parse(existingFields['tools']);
    }
  }

  // Extract tools from raw yaml block if formatted as YAML list
  if (match && toolsList.length === 0) {
    const rawYaml = match[1];
    const toolsMatch = rawYaml.match(/tools:\s*\n((?:\s*-\s*.+\n?)+)/);
    if (toolsMatch) {
      toolsList = toolsMatch[1]
        .split('\n')
        .map(l => l.replace(/^\s*-\s*/, '').trim())
        .filter(Boolean);
    }
  }

  // Extract mcpServers list if formatted as YAML list
  let mcpList = [];
  if (match) {
    const rawYaml = match[1];
    const mcpMatch = rawYaml.match(/mcpServers:\s*\n((?:\s*-\s*.+\n?)+)/);
    if (mcpMatch) {
      mcpList = mcpMatch[1]
        .split('\n')
        .map(l => l.replace(/^\s*-\s*/, '').trim())
        .filter(Boolean);
    }
  }

  // Extract skills list if formatted as YAML list
  let skillsList = [];
  if (match) {
    const rawYaml = match[1];
    const skillsMatch = rawYaml.match(/skills:\s*\n((?:\s*-\s*.+\n?)+)/);
    if (skillsMatch) {
      skillsList = skillsMatch[1]
        .split('\n')
        .map(l => l.replace(/^\s*-\s*/, '').trim())
        .filter(Boolean);
    }
  }

  // User requirement: mainAgent: true, subagent: true, model: flash
  let yaml = '---\n';
  yaml += `name: ${existingFields['name'] || agentName}\n`;
  yaml += `description: ${existingFields['description'] || `Specialized agent for ${agentName}.`}\n`;
  yaml += `mainAgent: true\n`;
  yaml += `subagent: true\n`;
  yaml += `model: flash\n`;

  if (toolsList.length > 0) {
    yaml += 'tools:\n';
    toolsList.forEach(t => { yaml += `  - ${t}\n`; });
  } else {
    yaml += 'tools: []\n';
  }

  if (mcpList.length > 0) {
    yaml += 'mcpServers:\n';
    mcpList.forEach(m => { yaml += `  - ${m}\n`; });
  } else {
    yaml += 'mcpServers: []\n';
  }

  if (skillsList.length > 0) {
    yaml += 'skills:\n';
    skillsList.forEach(s => { yaml += `  - ${s}\n`; });
  } else {
    yaml += 'skills: []\n';
  }

  // Preserve any extra custom attributes like color
  for (const k of Object.keys(existingFields)) {
    if (!['name', 'description', 'mainAgent', 'subagent', 'model', 'tools', 'mcpServers', 'skills'].includes(k)) {
      yaml += `${k}: ${existingFields[k]}\n`;
    }
  }

  yaml += '---';

  fs.writeFileSync(filePath, `${yaml}${bodyContent}`, 'utf8');
  console.log(`✓ [UPDATED FRONTMATTER] .agents/agents/${agentName}/agent.md (mainAgent: true, subagent: true, model: flash)`);
  updatedCount++;
}

console.log(`\nSuccessfully updated ${updatedCount} agent.md files with mainAgent: true, subagent: true, model: flash.`);

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');
const agentsDir = `${REPO_ROOT}/.agents/agents`;

console.log('=== Task 3: Antigravity Subagents Frontmatter Schema Standardization (v2) ===\n');

// Specific configurations per ECC agent role
const mainAgentsSet = new Set([
  'architect',
  'planner',
  'code-reviewer',
  'security-reviewer',
  'tdd-guide',
  'build-error-resolver',
  'refactor-cleaner'
]);

const agentConfigMap = {
  'architect': {
    model: 'pro',
    mcpServers: [],
    skills: ['design-system', 'frontend-patterns']
  },
  'planner': {
    model: 'pro',
    mcpServers: [],
    skills: ['plan-orchestrate', 'search-first']
  },
  'code-reviewer': {
    model: 'pro',
    mcpServers: [],
    skills: ['git-workflow', 'error-handling']
  },
  'security-reviewer': {
    model: 'pro',
    mcpServers: [],
    skills: ['security-review', 'security-scan', 'security-bounty-hunter', 'safety-guard', 'gateguard']
  },
  'tdd-guide': {
    model: 'pro',
    mcpServers: [],
    skills: ['tdd-workflow', 'verification-loop']
  },
  'build-error-resolver': {
    model: 'pro',
    mcpServers: [],
    skills: ['error-handling', 'verification-loop']
  },
  'refactor-cleaner': {
    model: 'pro',
    mcpServers: [],
    skills: ['frontend-patterns']
  },
  'docs-lookup': {
    model: 'flash',
    mcpServers: ['context7'],
    skills: []
  },
  'doc-updater': {
    model: 'flash',
    mcpServers: [],
    skills: []
  },
  'comment-analyzer': {
    model: 'flash',
    mcpServers: [],
    skills: []
  },
  'database-reviewer': {
    model: 'pro',
    mcpServers: [],
    skills: ['postgres-patterns', 'prisma-patterns', 'database-migrations']
  },
  'react-reviewer': {
    model: 'pro',
    mcpServers: [],
    skills: ['react-patterns', 'react-performance', 'react-testing']
  },
  'react-build-resolver': {
    model: 'pro',
    mcpServers: [],
    skills: ['react-patterns', 'error-handling']
  },
  'typescript-reviewer': {
    model: 'pro',
    mcpServers: [],
    skills: ['frontend-patterns']
  },
  'e2e-runner': {
    model: 'pro',
    mcpServers: [],
    skills: ['e2e-testing', 'verification-loop']
  },
  'seo-specialist': {
    model: 'pro',
    mcpServers: [],
    skills: ['frontend-a11y']
  },
  'a11y-architect': {
    model: 'pro',
    mcpServers: [],
    skills: ['accessibility', 'frontend-a11y']
  },
  'performance-optimizer': {
    model: 'pro',
    mcpServers: [],
    skills: ['react-performance', 'motion-advanced']
  },
  'code-architect': {
    model: 'pro',
    mcpServers: [],
    skills: ['frontend-patterns', 'design-system']
  },
  'code-explorer': {
    model: 'pro',
    mcpServers: [],
    skills: ['search-first']
  },
  'code-simplifier': {
    model: 'pro',
    mcpServers: [],
    skills: []
  },
  'harness-optimizer': {
    model: 'pro',
    mcpServers: [],
    skills: ['workspace-surface-audit', 'token-budget-advisor']
  },
  'loop-operator': {
    model: 'pro',
    mcpServers: [],
    skills: ['agentic-engineering']
  },
  'agent-evaluator': {
    model: 'pro',
    mcpServers: [],
    skills: ['agent-eval']
  },
  'spec-miner': {
    model: 'pro',
    mcpServers: [],
    skills: []
  },
  'pr-test-analyzer': {
    model: 'pro',
    mcpServers: [],
    skills: ['verification-loop']
  },
  'silent-failure-hunter': {
    model: 'pro',
    mcpServers: [],
    skills: ['error-handling']
  },
  'type-design-analyzer': {
    model: 'pro',
    mcpServers: [],
    skills: []
  },
  'gan-evaluator': {
    model: 'pro',
    mcpServers: [],
    skills: ['verification-loop']
  },
  'gan-generator': {
    model: 'pro',
    mcpServers: [],
    skills: ['tdd-workflow']
  },
  'gan-planner': {
    model: 'pro',
    mcpServers: [],
    skills: ['frontend-design-direction']
  }
};

function parseToolsString(toolsRaw) {
  if (!toolsRaw) return [];
  if (Array.isArray(toolsRaw)) return toolsRaw;
  return toolsRaw.split(',').map(t => t.trim()).filter(Boolean);
}

const subdirs = fs.readdirSync(agentsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

let processedCount = 0;

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

  const isMain = mainAgentsSet.has(agentName);
  const cfg = agentConfigMap[agentName] || {};

  // Resolve Model Tier: inherit, flash, or pro
  let modelTier = cfg.model || 'pro';
  if (existingFields['model']) {
    const rawModel = existingFields['model'].toLowerCase();
    if (rawModel === 'haiku') modelTier = 'flash';
    else if (rawModel === 'sonnet' || rawModel === 'opus') modelTier = 'pro';
    else if (['inherit', 'flash', 'pro'].includes(rawModel)) modelTier = rawModel;
  }

  // Resolve Tools Array
  const toolsList = parseToolsString(existingFields['tools']);

  // Build compliant YAML frontmatter
  let yaml = '---\n';
  yaml += `name: ${existingFields['name'] || agentName}\n`;
  yaml += `description: ${existingFields['description'] || `Specialized agent for ${agentName}.`}\n`;
  yaml += `mainAgent: ${isMain ? 'true' : 'false'}\n`;
  yaml += `subagent: ${isMain ? 'false' : 'true'}\n`;
  yaml += `model: ${modelTier}\n`;

  // Tools formatted strictly as YAML Array
  if (toolsList.length > 0) {
    yaml += 'tools:\n';
    toolsList.forEach(t => {
      yaml += `  - ${t}\n`;
    });
  } else {
    yaml += 'tools: []\n';
  }

  // mcpServers formatted strictly as YAML Array
  const mcpList = cfg.mcpServers || [];
  if (mcpList.length > 0) {
    yaml += 'mcpServers:\n';
    mcpList.forEach(m => {
      yaml += `  - ${m}\n`;
    });
  } else {
    yaml += 'mcpServers: []\n';
  }

  // skills formatted strictly as YAML Array
  const skillsList = cfg.skills || [];
  if (skillsList.length > 0) {
    yaml += 'skills:\n';
    skillsList.forEach(s => {
      yaml += `  - ${s}\n`;
    });
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
  console.log(`✓ [STANDARDIZED] .agents/agents/${agentName}/agent.md (mainAgent: ${isMain}, model: ${modelTier}, tools: ${toolsList.length}, skills: ${skillsList.length})`);
  processedCount++;
}

console.log(`\nSuccessfully standardized ${processedCount} agent.md files to full Antigravity & ECC specification!`);
